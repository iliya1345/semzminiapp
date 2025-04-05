import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from "../supaBaseAdmin";

const supabase = createSupabaseAdmin();

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Fetch the current user's tonFree and referrals from the database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tonFree, referrals')
      .eq('id', userId)
      .single();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Ensure the user has valid referrals (or a valid value) before processing the claim
    if (!userData?.referrals) {
      return NextResponse.json({ error: 'No referrals available' }, { status: 400 });
    }

    // Calculate new tonFree value (TON per referral = 0.005)
    const currentTonFree = Number(userData.tonFree) || 0;
    const newTonFree = currentTonFree + Number(userData.referrals) * 0.005;

    // Update the user's tonFree balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ tonFree: newTonFree })
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'TON claimed successfully', newTonFree });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
