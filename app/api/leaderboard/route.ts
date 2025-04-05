// app/api/leaderboard/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '../supaBaseAdmin';

const supabase = createSupabaseAdmin();


export async function GET() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, firstName, lastName, balance")
      .order("balance", { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
