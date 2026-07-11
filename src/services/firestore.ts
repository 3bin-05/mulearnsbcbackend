import { 
  getFirestore,
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import app from './firebase';
import type { Event } from '../types/event';
import { calculateEventStatus } from '../utils/eventStatus';
import { getDirectImageLink } from '../utils/driveHelper';

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

const COLLECTION_NAME = 'events';

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
