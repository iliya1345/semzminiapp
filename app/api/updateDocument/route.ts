import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '../supaBaseAdmin';

  const supabase = createSupabaseAdmin();

const updateDocument = async (
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
  } catch (error: any) {
    console.error('Error updating document:', error);
    throw new Error(`Error updating document: ${error}`);
  }
};

export async function PUT(req: Request) {
  try {
    const { tableName, docId, updatedData } = await req.json();

    // Check for missing fields
    if (!tableName || !docId || !updatedData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await updateDocument(tableName, docId, updatedData);

    return NextResponse.json({ message: 'Document updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Error updating document: ${error.message}` },
      { status: 500 }
    );
  }
}
