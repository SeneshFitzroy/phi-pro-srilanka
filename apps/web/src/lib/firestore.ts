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
 * Get documents from a collection with optional filters
 */
export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
): Promise<T[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

/**
 * Create a document with auto-generated ID
 */
export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: T,
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,