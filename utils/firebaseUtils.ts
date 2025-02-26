
// Initialize Supabase client (ensure Supabase URL and key are properly set)

import { createSupabaseClient } from "./supaBase";
const supabase = createSupabaseClient();

export async function getAllRows(
  tableName: string,
) {

  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')

    if (error) {
      console.error('Error fetching document:', error);
      throw new Error(`Unable to fetch document: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw new Error(`Unable to fetch document: ${error}`);
  }
}

// Fetch data from Supabase
export async function getDocumentData(
  tableName: string,
  docId: string
) {

  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', docId)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      throw new Error(`Unable to fetch document: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw new Error(`Unable to fetch document: ${error}`);
  }
}

// Update document in Supabase
export const updateDocument = async (
  tableName: string,
  docId: string,
  updatedData: Record<string, any>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .update(updatedData)
      .eq('id', docId);

    if (error) {
      console.error('Error updating document:', error);
      throw new Error(`Error updating document: ${error.message}`);
    }

    console.log(`Document ${docId} in ${tableName} updated successfully.`);
  } catch (error) {
    console.error('Error updating document:', error);
    throw new Error(`Error updating document: ${error}`);
  }
};

// Increment field in Supabase
export async function incrementField(
  userId: string,
  field: string,
  amount: number
) {
  try {
    const { error } = await supabase
      .from('users')
      // @ts-expect-error: Property 'count' might not exist on 'userData?.users'
      .update({ [field]: supabase.raw(`${field} + ?`, [amount]) })
      .eq('id', userId);

    if (error) {
      console.error('Error incrementing field:', error);
      throw new Error(`Error incrementing field: ${error.message}`);
    }

    console.log(`${field} incremented by ${amount}`);
  } catch (error) {
    console.error('Error incrementing field:', error);
    throw new Error(`Error incrementing field: ${error}`);
  }
}
