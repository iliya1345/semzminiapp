import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '../supaBaseAdmin';

const supabase = createSupabaseAdmin();

const getRemainingMinutes = (purchaseDate: string, days: number): number => {
  const purchaseTime = new Date(purchaseDate);
  const expirationTime = new Date(purchaseTime.getTime() + days * 24 * 60 * 60 * 1000);
  const now = new Date();
  return Math.floor((expirationTime.getTime() - now.getTime()) / 1000 / 60);
};

async function getPurchedSkins(docId: string) {
  try {
    const { data, error } = await supabase
      .from('purchase')
      .select('*')
      .eq('user_id', docId)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      throw new Error(`Unable to fetch document: ${error.message}`);
    }

    if (data?.created_at && getRemainingMinutes(data.created_at, data.day) <= 0) {
      const { error: delError } = await supabase
        .from('purchase')
        .delete()
        .eq('user_id', docId);
      
      if (delError) {
        console.error('Error deleting expired purchase:', delError);
      }
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching document:', error);
    throw new Error(`Unable to fetch document: ${error.message}`);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const docId = searchParams.get('docId');

  if (!docId) {
    return NextResponse.json({ error: 'Missing docId parameter' }, { status: 400 });
  }

  try {
    const data = await getPurchedSkins(docId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
