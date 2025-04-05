"use client";
import WebApp from "@twa-dev/sdk";
import { createSupabaseClient } from "./supaBase";

/**
 * Logs in a user with Telegram and returns their display name.
 *
 * @returns The display name of the authenticated user.
 */

async function loginOrSignup(email: string, password: string) {
  const supabase = createSupabaseClient();

  try {
    // Attempt to sign in the user
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginData?.user) {
      console.log('User logged in:', loginData.user);
      return {
        success: true,
        message: 'User logged in successfully',
        user: loginData.user,
      };
    }

    // If login fails, delay before attempting signup to help prevent too many requests
    if (loginError) {
      // Delay signup by 2 seconds (adjust as necessary)

      const { data: signupData, error: signupError } = await supabase.auth.signUp({ email, password });

      if (signupError) {
        console.error('Signup error:', signupError.message);
        return {
          success: false,
          message: signupError.message,
        };
      }

      console.log('User signed up:', signupData.user);
      return {
        success: true,
        message: 'User signed up successfully',
        user: signupData.user,
      };
    } else {
      console.error('Login error:', loginError);
      return {
        success: false,
        message: loginError || 'An error occurred during login',
      };
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    return {
      success: false,
      message: 'An unexpected error occurred',
    };
  }
}


export async function loginWithTelegram(): Promise<string | null> {

  
  
  return new Promise(async (resolve, reject) => {
    // Detect Android devices

    // If it's an Android device or user is not authenticated, log in again
    try {
      
      console.log("Attempting to sign in...");
      if (typeof window !== "undefined") {
        const initData = WebApp.initData || new URLSearchParams([
          ['user', JSON.stringify({
            id: 123321,
            first_name: 'sems',
            last_name: 'sems',
            username: 'rogue',
            language_code: 'en',
            is_premium: true,
            allows_write_to_pm: true,
          })],
          ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
          ['auth_date', '1716922846'],
          ['start_param', 'debug'],
          ['chat_type', 'sender'],
          ['chat_instance', '8428209589180549439'],
          ['signature', '6fbdaab833d39f54518bd5c3eb3f511d035e68cb'],
        ]).toString()
        if (!initData) {
          throw new Error("Telegram WebApp init data is missing.");
        }

        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });

        if (!response.ok) {
          const { message } = await response.json();
          throw new Error(`Login failed: ${message}`);
        }

        const { token } = await response.json();
        if (!token) {
          throw new Error("No token received from the server.");
        }

        const currentUser = token;

        if (currentUser) {
          const email = `telegram${currentUser}@telegram.com`;
          const password = String(currentUser);
  
          const resualt = await loginOrSignup(email, password)
          if(!resualt.success){
            return
          }
          resolve(currentUser); // Return displayName if available
        } else {
          reject("No user information available after sign-in.");
        }
      } else {
        reject("Not running in a browser environment.");
      }
    } catch (error) {
      console.error("Error during login process:", error);
      reject(error);
    }
  });
}



