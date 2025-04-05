import { createSupabaseAdmin } from "../supaBaseAdmin";

export async function POST(req:any) {
  const { userId, coinCount, profit } = await req.json();

  if (!userId || coinCount === undefined || profit === undefined) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  const supabase = createSupabaseAdmin();

  try {
    // Fetch current balance
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single();

    if (fetchError || !userData) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const newBalance = userData.balance + coinCount + profit;

    // Update the user's balance
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
  } catch (err) {
    console.error("Error updating balance:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
