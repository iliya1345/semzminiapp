import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from "../supaBaseAdmin";

const supabase = createSupabaseAdmin();

async function getAllRows(tableName: string) {
  try {
    const { data, error } = await supabase.from(tableName).select('*');

    if (error) {
      console.error('Error fetching document:', error);
      throw new Error(`Unable to fetch document: ${error.message}`);
    }
    return data;
  } catch (error: any) {
    console.error('Error fetching document:', error);
    throw new Error(`Unable to fetch document: ${error.message}`);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get('tableName');

  if (!tableName) {
    return NextResponse.json({ error: 'Missing tableName parameter' }, { status: 400 });
  }

  try {
    const data = await getAllRows(tableName);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
