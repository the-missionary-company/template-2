import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { audio } = await req.json()
    
    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(audio, 'base64')

    const response = await fetch('https://api.deepgram.com/v1/listen?model=whisper-medium&language=en', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/wav',
      },
      body: audioBuffer,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Deepgram API error:', errorText)
      throw new Error(`Deepgram API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({ 
      text: data.results?.channels[0]?.alternatives[0]?.transcript || '' 
    })

  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
} 