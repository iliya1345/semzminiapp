import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '../supaBaseAdmin';

const supabase = createSupabaseAdmin();

export async function GET(request: Request) {
  // Parse query parameters from the URL
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get('tableName');
  const docId = searchParams.get('docId');

  if (!tableName || !docId) {
    return NextResponse.json(
      { error: 'Missing tableName or docId' },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', docId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
