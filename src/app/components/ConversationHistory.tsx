'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

type Conversation = {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  timestamp: Date;
  model: string;
};

export default function ConversationHistory() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create a reference to the user's conversations collection
      const conversationsRef = collection(db, `users/${user.uid}/conversations`);
      const q = query(conversationsRef, orderBy('timestamp', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const convos = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              timestamp: data.timestamp instanceof Timestamp 
                ? data.timestamp.toDate() 
                : new Date(),
              messages: data.messages || [],
            } as Conversation;
          });
          setConversations(convos);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching conversations:', err);
          setError('Failed to load conversations. Please try again later.');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up conversations listener:', err);
      setError('Failed to load conversations. Please try again later.');
      setLoading(false);
    }
  }, [user, db]);

  const getPreview = (messages: Conversation['messages']) => {
    if (!messages || messages.length === 0) return 'No messages';
    
    const firstMessages = messages.slice(0, 2);
    const preview = firstMessages
      .map((msg) => msg.content.slice(0, 50))
      .join(' ... ');
    return preview.length > 100 ? preview.slice(0, 100) + '...' : preview;
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Past Conversations</h2>
      <div className="space-y-2">
        {conversations.length === 0 ? (
          <p className="text-gray-500 text-sm">No conversations yet</p>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedId(conversation.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedId === conversation.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'hover:bg-gray-50 border-transparent'
              } border`}
            >
              <div className="text-sm text-gray-500">
                {format(conversation.timestamp, 'MMM d, yyyy h:mm a')}
              </div>
              <div className="text-sm mt-1">{getPreview(conversation.messages)}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
} 