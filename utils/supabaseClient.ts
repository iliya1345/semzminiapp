// Supabase Initialization
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get all document IDs from a table (collection equivalent)
export const getCollectionDocIds = async (table: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase.from(table).select('id');
    if (error) {
      console.error('Error fetching document IDs:', error);
      throw error;
    }
    return data.map((item: any) => item.id);
  } catch (error) {
    console.error('Error fetching document IDs:', error);
    throw error;
  }
};

// Function to get specific document value (equivalent to Firebase doc fields)
export async function getDocumentValue(
  tableName: string,
  documentId: string,
  fieldName: string
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(fieldName)
      .eq('id', documentId)
      .single(); // Fetch a single document by ID

    if (error) {
      console.error('Error fetching document:', error);
      return null;
    }
    // @ts-ignore
    return data ? data[fieldName] : null;
  } catch (error) {
    console.error('Error getting document value:', error);
    return null;
  }
}
