import { 
  getFirestore,
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import app from './firebase';
import type { Event } from '../types/event';
import { calculateEventStatus } from '../utils/eventStatus';
import { getDirectImageLink } from '../utils/driveHelper';

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

const COLLECTION_NAME = 'events';

// ─────────────────────────────────────────────
// Login History
// ─────────────────────────────────────────────

export interface LoginHistoryEntry {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  signedInAt: Date;
}

/** Called every time a user successfully signs in — logs the session */
export const logSignIn = async (user: User): Promise<void> => {
  try {
    await addDoc(collection(db, 'loginHistory'), {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      photoURL: user.photoURL ?? '',
      signedInAt: serverTimestamp(),
    });
  } catch (err) {
    // Non-critical — don't block the login flow
    console.warn('Failed to log sign-in:', err);
  }
};

/** Fetch all login history entries (admin-only) sorted newest first */
export const getLoginHistory = async (): Promise<LoginHistoryEntry[]> => {
  const q = query(collection(db, 'loginHistory'), orderBy('signedInAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      uid: data.uid ?? '',
      email: data.email ?? '',
      displayName: data.displayName ?? '',
      photoURL: data.photoURL ?? '',
      signedInAt: data.signedInAt?.toDate?.() ?? new Date(),
    };
  });
};

// ─────────────────────────────────────────────
// Admin Management
// ─────────────────────────────────────────────

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin';
  addedAt: Date;
  addedBy: string;
}

/** Fetch all admin users from the admins collection */
export const getAdmins = async (): Promise<AdminUser[]> => {
  const snap = await getDocs(collection(db, 'admins'));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      email: data.email ?? '',
      displayName: data.displayName ?? '',
      photoURL: data.photoURL ?? '',
      role: 'admin' as const,
      addedAt: data.addedAt?.toDate?.() ?? new Date(),
      addedBy: data.addedBy ?? '',
    };
  });
};

/** Grant admin role to a user by their UID */
export const addAdmin = async (
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  addedByUid: string,
): Promise<void> => {
  await setDoc(doc(db, 'admins', uid), {
    email,
    displayName,
    photoURL,
    role: 'admin',
    addedAt: serverTimestamp(),
    addedBy: addedByUid,
  });
};

/** Revoke admin role by deleting the admins document */
export const removeAdmin = async (uid: string): Promise<void> => {
  await deleteDoc(doc(db, 'admins', uid));
};

/** Look up a user from loginHistory by their email (to find their UID) */
export const findUserByEmail = async (
  email: string,
): Promise<{ uid: string; displayName: string; photoURL: string } | null> => {
  const q = query(collection(db, 'loginHistory'), orderBy('signedInAt', 'desc'));
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    const data = d.data();
    if ((data.email ?? '').toLowerCase() === email.toLowerCase()) {
      return {
        uid: data.uid ?? '',
        displayName: data.displayName ?? '',
        photoURL: data.photoURL ?? '',
      };
    }
  }
  return null;
};

// ─────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────

// Map raw Firestore document data to our Event model interface
const mapDocToEvent = (snapshot: QueryDocumentSnapshot<DocumentData>): Event => {
  const data = snapshot.data();
  const eventWithoutStatus = {
    id: snapshot.id,
    title: data.title || '',
    shortDescription: data.shortDescription || '',
    description: data.description || '',
    speaker: data.speaker || '',
    category: data.category || '',
    eventType: data.eventType || 'workshop',
    venue: data.venue || '',
    mode: data.mode || 'online',
    registrationOpenDate: data.registrationOpenDate,
    registrationCloseDate: data.registrationCloseDate,
    startDate: data.startDate || undefined,
    endDate: data.endDate || undefined,
    registrationLink: data.registrationLink,
    maxParticipants: data.maxParticipants,
    certificateAvailable: !!data.certificateAvailable,
    cardImage: getDirectImageLink(data.cardImage) || undefined,
    wideImage: getDirectImageLink(data.wideImage) || undefined,
    participantsCount: data.participantsCount,
    highlights: data.highlights,
    recordingLink: data.recordingLink,
    driveLink: data.driveLink,
    gallery: data.gallery ? (data.gallery as string[]).map(getDirectImageLink) : undefined,
  };

  return {
    ...eventWithoutStatus,
    status: calculateEventStatus(eventWithoutStatus),
  };
};

// Create a new event document in events collection
// Firestore does not accept `undefined` field values — strip them at the service layer
const stripUndefined = (obj: Record<string, any>): Record<string, any> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

export const createEvent = async (event: Omit<Event, 'id' | 'status'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), stripUndefined(event as Record<string, any>));
  return docRef.id;
};

// Update an existing event document by ID
export const updateEvent = async (id: string, event: Partial<Event>): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, stripUndefined(event as Record<string, any>) as DocumentData);
};

// Delete an event document by ID
export const deleteEvent = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

// Read a single event document by ID
export const getEvent = async (id: string): Promise<Event | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return mapDocToEvent(docSnap);
  }
  return null;
};

// Read all event documents
export const getEvents = async (): Promise<Event[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map(mapDocToEvent);
};

// Subscribe to real-time events collection sorted by start date
export const subscribeToEvents = (callback: (events: Event[]) => void): () => void => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('startDate', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const events = querySnapshot.docs.map(mapDocToEvent);
    callback(events);
  });
};

export default db;
