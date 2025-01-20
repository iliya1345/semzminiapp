import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

// Initialize Firestore (ensure Firebase app is already initialized elsewhere in your project)
const db = getFirestore();

export async function getDocumentData(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data(); // Returns the document data
    } else {
      console.warn("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    throw new Error(`Unable to fetch document: ${error}`);
  }
}

export const updateDocument = async (
  collectionName: string,
  docId: string,
  updatedData: Record<string, any>
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, updatedData);
    console.log(`Document ${docId} in ${collectionName} updated successfully.`);
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export async function incrementField(
  userId: string,
  field: string,
  amount: number
) {
  const docRef = doc(db, "users", userId);
  try {
    // Update the field atomically using FieldValue.increment
    await updateDoc(docRef, {
      [field]: increment(amount),
    });
    console.log(`${field} incremented by ${amount}`);
  } catch (error) {
    console.error("Error incrementing field:", error);
  }
}
