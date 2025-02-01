"use client";

import React, { createContext, useEffect, useState } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  Auth,
  User,
  AuthError,
  NextOrObserver,
  ErrorFn
} from "firebase/auth";
import { auth as firebaseAuth } from "../firebase/firebase";

// Type assertion for auth
const auth = firebaseAuth as Auth | null;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if auth is initialized
    if (!auth) {
      console.error('Firebase Authentication is not initialized');
      setError('Authentication service is not available');
      setLoading(false);
      return;
    }

    try {
      console.log('Setting up auth state listener...');
      const unsubscribe = auth.onAuthStateChanged(
        ((user: User | null) => {
          console.log('Auth state changed:', user ? 'User logged in' : 'No user');
          setUser(user);
          setLoading(false);
          setError(null);
        }) as NextOrObserver<User>,
        ((error: Error) => {
          console.error("Auth state change error:", error);
          setError('Authentication error occurred');
          setLoading(false);
        }) as ErrorFn
      );

      return () => {
        console.log('Cleaning up auth state listener...');
        unsubscribe();
      };
    } catch (error) {
      console.error("Auth initialization error:", error);
      setError('Failed to initialize authentication');
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      setError('Authentication service is not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    if (!auth) {
      setError('Authentication service is not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
