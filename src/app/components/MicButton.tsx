'use client'

import { useState, useEffect, useRef } from 'react'
import { useDeepgram } from '@/lib/contexts/DeepgramContext'
import { motion } from 'framer-motion'

const MAX_RECORDING_TIME = 600 // seconds

// Helper function to format seconds into mm:ss
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

type MicButtonProps = {
  onTranscript: (text: string) => void
  isListening: boolean
  setIsListening: (isListening: boolean) => void
}

export function MicButton({ onTranscript, isListening, setIsListening }: MicButtonProps) {
  const { connectToDeepgram, disconnectFromDeepgram } = useDeepgram()
  const [recordingTime, setRecordingTime] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isListening) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_RECORDING_TIME) {
            handleStopRecording()
            return 0
          }
          return prev + 1
        })
      }, 1000)
    } else {
      setRecordingTime(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isListening])

  const handleStartRecording = async () => {
    try {
      chunksRef.current = []
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.start()
      setIsListening(true)
      setRecordingTime(0)
      await connectToDeepgram()
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const handleStopRecording = async () => {
    try {
      // First disconnect from Deepgram WebSocket in all cases
      await disconnectFromDeepgram()

      if (isTranscribing) {
        // Stop media tracks first
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop())
        
        // Then handle the abort controller
        if (abortControllerRef.current?.signal && !abortControllerRef.current.signal.aborted) {
          try {
            abortControllerRef.current.abort('User cancelled')
          } catch (e) {
            console.log('Abort controller already aborted')
          }
        }
        abortControllerRef.current = null
        
        // Finally update states
        setIsTranscribing(false)
        setIsListening(false)
        chunksRef.current = []
        return
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        const mediaRecorder = mediaRecorderRef.current
        
        // Update states first
        setIsListening(false)
        setRecordingTime(0)
        
        // Then stop recording
        mediaRecorder.stop()

        // Create a promise to handle the ondataavailable and onstop events
        const processRecording = new Promise<void>((resolve) => {
          let dataAvailable = false
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunksRef.current.push(event.data)
              dataAvailable = true
            }
          }

          mediaRecorder.onstop = async () => {
            try {
              if (!dataAvailable) {
                console.log('No audio data available')
                mediaRecorder.stream.getTracks().forEach(track => track.stop())
                chunksRef.current = []
                resolve()
                return
              }

              const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' })
              setIsTranscribing(true)

              // Create new AbortController for this transcription request
              const controller = new AbortController()
              abortControllerRef.current = controller

              try {
                // Convert blob to base64
                const base64Audio = await new Promise<string>((resolve) => {
                  const reader = new FileReader()
                  reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1]
                    resolve(base64)
                  }
                  reader.readAsDataURL(audioBlob)
                })

                // Only proceed if the controller hasn't been aborted
                if (!controller.signal.aborted) {
                  const response = await fetch('/api/deepgram/transcribe-audio', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      audio: base64Audio,
                    }),
                    signal: controller.signal,
                  })

                  if (!response.ok) throw new Error('Transcription failed')

                  const data = await response.json()
                  if (data.text && data.text.trim()) {
                    onTranscript(data.text)
                  }
                }
              } catch (error) {
                if ((error as Error).name === 'AbortError') {
                  console.log('Transcription cancelled by user')
                } else {
                  throw error
                }
              }
            } catch (error) {
              console.error('Transcription error:', error)
            } finally {
              // Cleanup in specific order
              mediaRecorder.stream.getTracks().forEach(track => track.stop())
              chunksRef.current = []
              abortControllerRef.current = null
              setIsTranscribing(false)
              resolve()
            }
          }
        })

        // Wait for the recording processing to complete
        await processRecording
      }
    } catch (error) {
      console.error('Error stopping recording:', error)
      // Cleanup everything in case of error
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop())
      chunksRef.current = []
      abortControllerRef.current = null
      setIsTranscribing(false)
      setIsListening(false)
    }
  }

  return (
    <button
      onClick={isListening ? handleStopRecording : handleStartRecording}
      disabled={false}
      className={`p-2 rounded-full transition-colors relative ${
        isTranscribing 
          ? 'bg-yellow-600 hover:bg-yellow-700' 
          : isListening 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      }`}
      title={
        isTranscribing 
          ? 'Cancel transcription' 
          : isListening 
            ? `Stop recording (${formatTime(MAX_RECORDING_TIME - recordingTime)} left)` 
            : 'Start recording'
      }
    >
      <div className="relative w-6 h-6">
        {isTranscribing ? (
          // Loading spinner
          <motion.div 
            className="w-6 h-6 border-2 border-white rounded-full border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          // Microphone icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
            />
          </svg>
        )}
        {/* Animated recording indicator */}
        {isListening && !isTranscribing && (
          <>
            <motion.span 
              className="absolute top-0 right-0 w-2 h-2"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </motion.span>
            {/* Recording time indicator */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
              {formatTime(MAX_RECORDING_TIME - recordingTime)}
            </div>
          </>
        )}
      </div>
    </button>
  )
} 