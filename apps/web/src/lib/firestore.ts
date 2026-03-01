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
  addDoc,
  onSnapshot,
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Create or overwrite a document with specific ID
 */
export async function setDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: T,
): Promise<void> {
  await setDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Partial update of a document
 */
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>,
): Promise<void> {
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a document
 */
export async function removeDocument(
  collectionName: string,
  docId: string,
): Promise<void> {
  await deleteDoc(doc(db, collectionName, docId));
}

/**
 * Listen for real-time updates to a document
 */
export function subscribeToDocument<T>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void,
): () => void {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as T);
    } else {
      callback(null);
    }
  });
}

/**
 * Listen for real-time updates to a collection query
 */
export function subscribeToCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void,
): () => void {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
    callback(items);
  });
}

// Re-export query helpers for convenience
export { where, orderBy, limit, startAfter, collection, doc, query };
