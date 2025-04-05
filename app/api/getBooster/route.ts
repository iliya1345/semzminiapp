import { createSupabaseAdmin } from "../supaBaseAdmin";

export async function POST(req:any) {
  const { userId, purchaseId } = await req.json();

  if (!userId || !purchaseId) {
    return new Response(JSON.stringify({ error: "Missing userId or purchaseId" }), {
      status: 400,
    });
  }

  const supabase = createSupabaseAdmin();

  try {
    const { data: booster, error } = await supabase
      .from("booster")
      .select("*")
      .eq("id", purchaseId)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: "Error loading booster data" }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(booster), { status: 200 });
  } catch (err) {
    console.error("Error fetching booster data:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
