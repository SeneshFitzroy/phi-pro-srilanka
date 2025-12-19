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