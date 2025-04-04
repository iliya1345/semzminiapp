import { NextResponse } from "next/server";
import { validateTelegramWebAppData } from "@/utils/telegramAuth";
import { createSupabaseAdmin } from "../supaBaseAdmin";



async function checkOrCreateUser(email:string, password:string) {
  const supabase = createSupabaseAdmin();

  // List users to find a match. (In a production scenario, consider more efficient methods.)
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
    return null;
  }
  
  // Check if a user with the given email exists.
  const existingUser = users.find((user:any) => user.email === email);
  
  if (existingUser) {
    console.log('User exists:', existingUser);
    return existingUser;
  }
  
    // Create a new user if not found.
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,  // Set to true if you want to bypass email confirmation.
    });
    
    if (createError) {
      console.error('Error creating user:', createError);
      return null;
    }
    
    console.log('New user created:', newUser);
    return newUser;
  
}

export async function POST(request: Request) {
  const supabase = createSupabaseAdmin();

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
    console.log("Referer ID", startParam);

    //await checkOrCreateUser(email,telegramId)

    // Initialize Supabase client

    // Custom claims for Supabase (Supabase doesn't support custom claims in the same way as Firebase)
    const customClaims = {
      telegramId: telegramId,
    };

    // Get or create Supabase user
    let supabaseUser;
    const { data: existingUser, error: getUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', telegramId)
      .single();

      console.log(getUserError)
    console.log("data", existingUser)
    

    if (getUserError || !existingUser) {
      

      // Save user details in Supabase table
      const { error: saveUserError } = await supabase
        .from('users')
        .insert({
          id: telegramId,
          firstName: validationResult.user.first_name,
          lastName: validationResult.user.last_name || "",
          username: validationResult.user.username || "",
          balance: 10000,
          referrals: 0,
        });
        // Fetch the user count where id is "0"
        const { data: userCount, error: fetchError } = await supabase
        .from('userCount')
        .select('*')
        .eq('id', "0")
        .single();

        if (fetchError) {
          console.error('Error fetching user count:', fetchError);
          } else {
          // Update the count field of the fetched user count
          const { error: updateError } = await supabase
            .from('userCount')
            .update({ count: parseInt(userCount.count) + 1 })
            .eq('id', "0");

          if (updateError) {
            console.error('Error updating user count:', updateError);
          } else {
            console.log('User count updated successfully');
          }
        }
          

      if (saveUserError) {
        return NextResponse.json({ message: "Failed to save user data" }, { status: 500 });
      }

      // Referral logic
      if (startParam && startParam.length > 4) {
        const { data: referrerUser, error: referrerError } = await supabase
          .from('users')
          .select('*')
          .eq('id', startParam)
          .single();

        if (referrerUser && !referrerError) {
          const { error: updateReferrerError } = await supabase
            .from('users')
            .update({
              balance: referrerUser.balance + 500,
              referrals: referrerUser.referrals + 1,
            })
            .eq('id', startParam);

          if (updateReferrerError) {
            return NextResponse.json({ message: "Failed to update referrer data" }, { status: 500 });
          }
        }
      }
    } else {
      supabaseUser = existingUser;
    }




    return NextResponse.json({ "login": "login successfully" , token : telegramId},{status:200});
  } catch (error) {
    console.error("Error in login route:", error);
    return NextResponse.json({ message: "Authentication failed" }, { status: 500 });
  }
}
