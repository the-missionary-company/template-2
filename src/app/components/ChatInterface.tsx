import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Model = 'claude-3-sonnet' | 'claude-3-haiku';

export default function ChatInterface() {
  const { user } = useAuth();
  const [model, setModel] = useState<Model>('claude-3-sonnet');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/anthropic/chat',
    body: {
      model,
    },
    onFinish: async (message) => {
      if (!user || !db) return;
      
      try {
        // Save the conversation to Firestore
        const conversationsRef = collection(db, `users/${user.uid}/conversations`);
        await addDoc(conversationsRef, {
          messages: [...messages, message],
          model,
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto p-4">
      {/* Model selector */}
      <div className="mb-4">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value as Model)}
          className="p-2 rounded border bg-white dark:bg-gray-800"
        >
          <option value="claude-3-5-sonnet-latest">Claude 3 Sonnet</option>
          <option value="claude-3-5-haiku-latest">Claude 3 Haiku</option>
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-100 dark:bg-blue-900 ml-auto'
                : 'bg-gray-100 dark:bg-gray-800'
            } max-w-[80%]`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 p-2 rounded border bg-white dark:bg-gray-800"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
} 