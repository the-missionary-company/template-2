'use client'

import { useChat } from 'ai/react'
import { useState, useEffect } from 'react'
import { MessageList } from './MessageList'
import { InputField } from './InputField'
import { ModelSelector } from './ModelSelector'

export function ChatInterface() {
  const [error, setError] = useState<string | null>(null)
  
  const [model, setModel] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aiModel') || 'claude-sonnet'
    }
    return 'claude-sonnet'
  })

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, error: chatError } = useChat({
    api: '/api/chat',
    body: { model },
    onError: (error) => {
      setError(error.message)
    }
  })

  useEffect(() => {
    localStorage.setItem('aiModel', model)
    setError(null)
  }, [model])

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4 bg-gray-900">
      <h1 className="text-2xl font-bold mb-4 text-center text-white">AI Chat</h1>
      {error && (
        <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      <ModelSelector model={model} setModel={setModel} />
      <MessageList messages={messages} />
      <InputField 
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={(e) => {
          setError(null)
          handleSubmit(e)
        }}
        isLoading={isLoading}
        stop={stop}
      />
    </div>
  )
} 