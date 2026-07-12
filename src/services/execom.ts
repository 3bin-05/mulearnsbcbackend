import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firestore';
import type { ExeComMember } from '../types/execom';
import * as XLSX from 'xlsx';

// 1. Fetch current academic year ID (e.g. "2026-27")
export const fetchCurrentYear = async (): Promise<string | null> => {
  const currentDocRef = doc(db, 'execom', 'current');
  const snap = await getDoc(currentDocRef);
  if (snap.exists()) {
    return snap.data().year as string;
  }
  return null;
};

// 2. Fetch members for the current active year
export const fetchCurrentMembers = async (): Promise<ExeComMember[]> => {
  const currentYear = await fetchCurrentYear();
  if (!currentYear) return [];
  return fetchMembersByYear(currentYear);
};

// 3. Fetch members by specific year ID, sorted by displayOrder
export const fetchMembersByYear = async (yearId: string): Promise<ExeComMember[]> => {
  const colRef = collection(db, 'execom', yearId, 'members');
  const q = query(colRef, orderBy('displayOrder', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  } as ExeComMember));
};

// 4. Subscribe to real-time member updates for a specific year
export const subscribeToMembersByYear = (
  yearId: string,
  callback: (members: ExeComMember[]) => void
): (() => void) => {
  const colRef = collection(db, 'execom', yearId, 'members');
  const q = query(colRef, orderBy('displayOrder', 'asc'));
  return onSnapshot(q, (snap) => {
    const members = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    } as ExeComMember));
    callback(members);
  });
};

// 5. Create a new member in a specific year
export const createMember = async (
  yearId: string,
  member: Omit<ExeComMember, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const colRef = collection(db, 'execom', yearId, 'members');
  const docRef = await addDoc(colRef, {
    ...member,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

// 6. Update an existing member
export const updateMember = async (
  yearId: string,
  id: string,
  member: Partial<ExeComMember>
): Promise<void> => {
  const docRef = doc(db, 'execom', yearId, 'members', id);
  // Strip ID and timestamps to prevent overwrites
  const { id: _, createdAt: __, updatedAt: ___, ...data } = member as any;
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// 7. Delete a member
export const deleteMember = async (yearId: string, id: string): Promise<void> => {
  const docRef = doc(db, 'execom', yearId, 'members', id);
  await deleteDoc(docRef);
};

// 8. Fetch all archived/available academic years
export const fetchAllYears = async (): Promise<string[]> => {
  const snap = await getDocs(collection(db, 'execom'));
  const years = snap.docs
    .map((docSnap) => docSnap.id)
    .filter((id) => id !== 'current')
    .sort((a, b) => b.localeCompare(a)); // Sort descending (e.g. "2026-27", "2025-26")
  return years;
};

// 9. Batch publish a new ExeCom (creates new collection, inserts members, updates current config)
export const publishNewExeCom = async (
  yearId: string,
  members: Omit<ExeComMember, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<void> => {
  const batch = writeBatch(db);

  // Set the year document (acts as a registry placeholder)
  const yearMetadataDocRef = doc(db, 'execom', yearId);
  batch.set(yearMetadataDocRef, {
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  // Add members
  members.forEach((member) => {
    const memberDocRef = doc(collection(db, 'execom', yearId, 'members'));
    batch.set(memberDocRef, {
      ...member,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });

  // Update current pointer document
  const currentDocRef = doc(db, 'execom', 'current');
  batch.set(currentDocRef, { year: yearId }, { merge: true });

  await batch.commit();
};

// 10. Parse Excel file via backend API (Base64 POST JSON)
export const parseExcelFile = async (
  file: File
): Promise<{
  summary: { totalFound: number; validCount: number; errorCount: number; success: boolean };
  errors: { row: number; field: string; error: string; value: string }[];
  members: Omit<ExeComMember, 'id' | 'createdAt' | 'updatedAt'>[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = e.target?.result as string;
        const base64Data = result.split(',')[1];

        const response = await fetch('/api/parse-excel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filename: file.name,
            fileData: base64Data
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};

// 11. Export members list to an Excel file client-side
export const exportExcelFile = (yearId: string, members: ExeComMember[]): void => {
  const rows = members.map((m) => ({
    'Full Name': m.name,
    'MuLearn ID': m.mulearnId,
    'Position in ExeCom': m.roleTitle || m.position,
    'Branch': m.branch,
    'Year': m.year,
    'Phone Number': m.phone,
    'Email ID': m.email,
    'Date of Birth': m.dob,
    'Picture': m.imageUrl,
    'Bio': m.bio,
    'LinkedIn': m.socials?.linkedin || '',
    'GitHub': m.socials?.github || '',
    'Instagram': m.socials?.instagram || '',
    'Twitter': m.socials?.twitter || '',
    'Website': m.socials?.website || '',
    'Discord': m.socials?.discord || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ExeCom Members');
  XLSX.writeFile(workbook, `ExeCom_${yearId}_Members.xlsx`);
};
