import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import app from './firebase';

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// Upload an event artwork image and return its public download URL
export const uploadEventImage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

export default storage;
