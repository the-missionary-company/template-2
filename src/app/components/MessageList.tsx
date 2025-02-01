'use client'

import { Message } from 'ai'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

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
            <div className="markdown-body dark">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  table: ({...props}) => (
                    <div className="overflow-auto">
                      <table {...props} className="border-collapse border border-gray-600 my-4" />
                    </div>
                  ),
                  th: ({...props}) => (
                    <th {...props} className="border border-gray-600 px-4 py-2 bg-gray-800" />
                  ),
                  td: ({...props}) => (
                    <td {...props} className="border border-gray-600 px-4 py-2" />
                  ),
                  a: ({...props}) => (
                    <a {...props} className="text-blue-400 hover:text-blue-300 underline" />
                  ),
                  ul: ({...props}) => (
                    <ul {...props} className="list-disc pl-6 mb-4 space-y-2" />
                  ),
                  ol: ({...props}) => (
                    <ol {...props} className="list-decimal pl-6 mb-4 space-y-2" />
                  ),
                  code: ({inline, className, children, ...props}) => {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <div className="relative group">
                        <code
                          className={`${className} block overflow-x-auto p-4 bg-gray-900 rounded-md text-sm`}
                          {...props}
                        >
                          {children}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(String(children))}
                          className="absolute top-2 right-2 p-1 rounded bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy code"
                        >
                          📋
                        </button>
                      </div>
                    ) : (
                      <code className="bg-gray-900 px-1.5 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    )
                  },
                }}
                className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 