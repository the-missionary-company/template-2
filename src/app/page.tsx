'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import ChatInterface from '@/app/components/ChatInterface';
import ConversationHistory from '@/app/components/ConversationHistory';
import ProfileSection from '@/app/components/ProfileSection';
import LoginButton from '@/app/components/LoginButton';

export default function Home() {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <LoginButton />
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If not logged in, show login button
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="mb-8 text-3xl font-bold">Welcome to ThoughtPartner</h1>
        <LoginButton />
      </div>
    );
  }

  // Main app layout
  return (
    <div className="flex min-h-screen">
      {/* Left sidebar - Conversation History */}
      <div className="w-64 bg-gray-50 p-4 border-r">
        <ConversationHistory />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Profile section at top */}
        <div className="p-4 border-b">
          <ProfileSection />
        </div>

        {/* Chat interface */}
        <div className="flex-1 p-4">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
