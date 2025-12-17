import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentData,
  type QueryConstraint,
  type DocumentReference,
  addDoc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ============================================================================
// Generic Firestore CRUD operations
// ============================================================================

/**
 * Get a single document by ID
 */
export async function getDocument<T>(
  collectionName: string,
  docId: string,
): Promise<T | null> {
  const docRef = doc(db, collectionName, docId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as T;
}

/**