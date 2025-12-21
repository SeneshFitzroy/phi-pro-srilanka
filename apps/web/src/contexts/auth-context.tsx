'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile, AuthState } from '@phi-pro/shared';
import { UserRole, AccountStatus, Language } from '@phi-pro/shared';

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchUserProfile(firebaseUser: FirebaseUser): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data() as UserProfile;
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { ...data, id: firebaseUser.uid, uid: firebaseUser.uid };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

async function createUserProfile(
  firebaseUser: FirebaseUser,
  displayName: string,
  role: UserRole,
): Promise<UserProfile> {
  const now = new Date().toISOString();
  const profile: UserProfile = {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName,
    role,
    status: role === UserRole.PUBLIC ? AccountStatus.ACTIVE : AccountStatus.PENDING_APPROVAL,
    preferredLanguage: Language.EN,
    domains: [],
    createdAt: now,
    updatedAt: now,
    createdBy: firebaseUser.uid,
    lastLoginAt: now,
  };
  await setDoc(doc(db, 'users', firebaseUser.uid), profile);
  return profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          let profile = await fetchUserProfile(firebaseUser);
          if (!profile) {
            profile = await createUserProfile(
              firebaseUser,
              firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              UserRole.PHI,
            );
          }
          setState({
            user: profile,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
        } catch {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: 'Failed to load user profile',
          });
        }
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      let friendly = message;
      if (message.includes('user-not-found') || message.includes('wrong-password') || message.includes('invalid-credential')) {
        friendly = 'Invalid email or password';
      } else if (message.includes('too-many-requests')) {
        friendly = 'Too many attempts. Please try again later.';
      }
      setState((prev) => ({ ...prev, error: friendly, isLoading: false }));
      throw new Error(friendly);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(cred.user, name, role);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      let friendly = message;
      if (message.includes('email-already-in-use')) {
        friendly = 'This email is already registered';
      } else if (message.includes('weak-password')) {
        friendly = 'Password must be at least 6 characters';
      }
      setState((prev) => ({ ...prev, error: friendly, isLoading: false }));
      throw new Error(friendly);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setState({ user: null, isLoading: false, isAuthenticated: false, error: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setState((prev) => ({ ...prev, error: message }));
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!state.user) throw new Error('Not authenticated');
    await updateDoc(doc(db, 'users', state.user.uid), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...data } : null,
    }));
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{ ...state, signIn, signUp, signOut, resetPassword, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
