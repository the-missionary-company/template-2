'use client'

import { Message } from 'ai'
import ReactMarkdown from 'react-markdown'

type MessageListProps = {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto space-y-6 mb-4 p-4 border border-gray-700 rounded-lg bg-gray-800 min-h-[400px]">
      {messages.length === 0 && (
        <div className="text-center text-gray-400">
          No messages yet. Start a conversation!
        </div>
      )}
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`p-4 rounded-lg max-w-[85%] ${
              message.role === 'user'
                ? 'bg-blue-900 text-blue-100'
                : 'bg-gray-700 text-gray-100'
            }`}
          >
            <ReactMarkdown 
              className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded-md"
              components={{
                // Customize heading styles
                h1: ({node, ...props}) => <h1 {...props} className="text-2xl font-bold mb-4 mt-6" />,
                h2: ({node, ...props}) => <h2 {...props} className="text-xl font-bold mb-3 mt-5" />,
                h3: ({node, ...props}) => <h3 {...props} className="text-lg font-bold mb-2 mt-4" />,
                // Style lists
                ul: ({node, ...props}) => <ul {...props} className="list-disc pl-4 mb-4 space-y-2" />,
                ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-4 mb-4 space-y-2" />,
                // Style paragraphs
                p: ({node, ...props}) => <p {...props} className="mb-4 last:mb-0" />,
                // Style code blocks
                code: ({node, inline, ...props}) => 
                  inline ? (
                    <code {...props} className="bg-gray-800 px-1.5 py-0.5 rounded text-sm" />
                  ) : (
                    <code {...props} className="block bg-gray-800 p-4 rounded-md text-sm overflow-x-auto" />
                  ),
                // Style blockquotes
                blockquote: ({node, ...props}) => (
                  <blockquote {...props} className="border-l-4 border-gray-500 pl-4 italic my-4" />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  )
} 