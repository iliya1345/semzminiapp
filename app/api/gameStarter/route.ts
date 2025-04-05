import { createSupabaseAdmin } from "../supaBaseAdmin";

const supabase = createSupabaseAdmin();

export async function POST(req: any) {
  const { userId, updateDataBalance } =  await req.json();
  if (!userId || updateDataBalance === undefined) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }


  const newBalance = updateDataBalance;

  // Update balance
  const { error: updateError } = await supabase
    .from("users")
    .update({ balance: newBalance })
    .eq("id", userId);

    if (updateError) {
      return new Response(JSON.stringify({ error: "Failed to update balance" }), {
        status: 500,
      });
    }

  return new Response(JSON.stringify({ message: "Balance updated", newBalance }), {
    status: 200,
  });
}
