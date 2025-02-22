import { NextResponse } from "next/server";
import { validateTelegramWebAppData } from "@/utils/telegramAuth";
import { supabase } from "@/utils/supabaseClient";

export async function POST(request: Request) {
  try {
    const { initData } = await request.json();

    // Validate Telegram init data
    const validationResult = validateTelegramWebAppData(initData);

    if (!validationResult.validatedData || !validationResult.user.id) {
      return NextResponse.json(
        { message: validationResult.message },
        { status: 401 }
      );
    }

    const telegramId = validationResult.user.id;
    const startParam = validationResult.startParam;
    const email = `telegram${telegramId}@telegram.com`;

    // Check if user already exists by email
    const { data: existingUser, error: signInError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    let user = existingUser;

    // If user does not exist, create new user
    if (!existingUser && !signInError) {
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email,
        password: "defaultPassword", // Supabase requires a password
        options: {
          data: {
            telegram_id: telegramId,
            first_name: validationResult.user.first_name,
            last_name: validationResult.user.last_name || "",
            username: validationResult.user.username || "",
            balance: 10000,
            referrals: 0,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      user = newUser.user;

      // Referral Logic
      if (startParam && startParam.length > 4) {
        const { data: referrerUser, error: referrerError } = await supabase
          .from("users")
          .select("*")
          .eq("id", startParam)
          .single();

        if (referrerUser && !referrerError) {
          await supabase
            .from("users")
            .update({
              balance: referrerUser.balance + 500,
              referrals: referrerUser.referrals + 1,
            })
            .eq("id", startParam);
        }
      }
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error in login route:", error);
    return NextResponse.json(
      { message: "Authentication failed", error: error },
      { status: 500 }
    );
  }
}
