// Firebase Initialization
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { collection, getDocs, getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADZjq2SdblFasq6uNG2vS4hGI1cv6K_wU",
  authDomain: "semz-d4252.firebaseapp.com",
  projectId: "semz-d4252",
  storageBucket: "semz-d4252.firebasestorage.app",
  messagingSenderId: "16009594074",
  appId: "1:16009594074:web:0d8a0f1b79c55cd6cb11e3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default app;

export const getCollectionDocIds = async (path: string): Promise<string[]> => {
  try {
    const collectionRef = collection(db, path);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map((doc) => doc.id);
  } catch (error) {
    console.error("Error fetching collection document IDs:", error);
    throw error;
  }
};
