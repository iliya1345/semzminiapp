import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client (ensure environment variables are set)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Define a generic interface for document data.
 * You can refine this if you know the exact structure of your documents.
 */
interface Document {
  id: string;
  [key: string]: any;
}

/**
 * Fetch document data from a specific table by its ID.
 */
export async function getDocumentData(
  tableName: string,
  docId: string
): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", docId)
      .single();

    if (error) {
      console.error("Error fetching document:", error);
      throw new Error(`Unable to fetch document: ${error.message}`);
    }

    return data || null;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
}

/**
 * Update a specific document (row) in the table with new data.
 */
export async function updateDocument(
  tableName: string,
  docId: string,
  updatedData: Record<string, any>
): Promise<void> {
  try {
    const { error } = await supabase
      .from(tableName)
      .update(updatedData)
      .eq("id", docId);

    if (error) {
      console.error("Error updating document:", error);
      throw error;
    }

    console.log(`Document ${docId} in ${tableName} updated successfully.`);
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
}

/**
 * Increment a numeric field atomically in a specific document (row).
 */
export async function incrementField(
  tableName: string,
  userId: string,
  field: string,
  amount: number
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(field)
      .eq("id", userId)
      .single();

    if (error || !data) {
      throw new Error(`Unable to find document for user ID: ${userId}`);
    }

    // Ensure that the field is a number and increment it
    // @ts-ignore
    const currentValue = data[field] as number;
    const newValue = (currentValue || 0) + amount;

    const { error: updateError } = await supabase
      .from(tableName)
      .update({ [field]: newValue })
      .eq("id", userId);

    if (updateError) {
      console.error("Error incrementing field:", updateError);
      throw updateError;
    }

    console.log(`${field} incremented by ${amount}`);
  } catch (error) {
    console.error("Error incrementing field:", error);
    throw error;
  }
}
