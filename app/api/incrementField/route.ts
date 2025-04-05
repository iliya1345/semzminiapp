import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '../supaBaseAdmin';

const supabase = createSupabaseAdmin();

async function incrementField(userId: string, field: string, amount: number) {
  try {
    const { error } = await supabase
      .from('users')
      //@ts-expect-error sdadsadsa
      .update({ [field]: supabase.raw(`${field} + ?`, [amount]) })
      .eq('id', userId);

    if (error) {
      console.error('Error incrementing field:', error);
      throw new Error(`Error incrementing field: ${error.message}`);
    }

    console.log(`${field} incremented by ${amount}`);
  } catch (error: any) {
    console.error('Error incrementing field:', error);
    throw new Error(`Error incrementing field: ${error.message}`);
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, field, amount } = await request.json();

    if (!userId || !field || amount == null) {
      return NextResponse.json(
        { error: 'Missing userId, field, or amount' },
        { status: 400 }
      );
    }

    await incrementField(userId, field, amount);
    return NextResponse.json({ message: `${field} incremented by ${amount}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
