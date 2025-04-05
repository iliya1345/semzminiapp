// app/api/buySkin/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from "../supaBaseAdmin";

const supabase = createSupabaseAdmin();

export async function POST(request: Request) {
  try {
    const { userId, skin } = await request.json();
    // Validate input
    if (!userId || !skin || !skin.id || !skin.days || skin.price == null) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    // Fetch user balance to ensure sufficient funds
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }
    if (!userData || userData.balance < skin.price) {
      return NextResponse.json({ error: "Not enough balance" }, { status: 400 });
    }
    // Insert purchase record
    const { error: purchaseError } = await supabase
      .from('purchase')
      .insert([{ type: "skin", day: skin.days, purchase_id: skin.id, user_id: userId }]);
    if (purchaseError) {
      return NextResponse.json({ error: purchaseError.message }, { status: 500 });
    }
    // Update user's balance
    const newBalance = userData.balance - skin.price;
    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Skin purchased successfully", newBalance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
