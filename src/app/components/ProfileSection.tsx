'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import Image from 'next/image';

export default function ProfileSection() {
  const { user, signOut, loading } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {user.photoURL && (
          <div className="relative w-10 h-10">
            <Image
              src={user.photoURL}
              alt={user.displayName || 'Profile'}
              fill
              sizes="40px"
              className="rounded-full object-cover"
              priority
            />
          </div>
        )}
        <div>
          <p className="font-medium">{user.displayName}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
      <button
        onClick={signOut}
        disabled={loading}
        className={`px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  );
} 