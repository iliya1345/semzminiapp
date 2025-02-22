"use client";
import WebApp from "@twa-dev/sdk";
import { supabase } from "./supabaseClient"; // Ensure this is the initialized supabase client

function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

/**
 * Logs in a user with Telegram and returns their display name.
 *
 * @returns The display name of the authenticated user.
 */
export async function loginWithTelegram(): Promise<string | null> {
  return new Promise(async (resolve, reject) => {
    const androidDevice = isAndroid();

    // For non-Android devices: Check if the user is already authenticated
    if (!androidDevice) {
      const { data: session } = await supabase.auth.getSession();
      // @ts-ignore
      const user = session?.user;

      if (user) {
        console.log("User is already signed in:", user);
        resolve(user.user_metadata?.name || null); // Use 'user_metadata' to access profile info
        return;
      }
    }

    // If it's an Android device or user is not authenticated, log in again
    try {
      console.log("Attempting to sign in...");
      if (typeof window !== "undefined") {
        const initData = WebApp.initData;
        if (!initData) {
          throw new Error("Telegram WebApp init data is missing.");
        }

        // Send initData to your API to verify Telegram login and get a token
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

        // Sign in with the token using Supabase
        // @ts-ignore
        const { data, error } = await supabase.auth.signInWithIdToken({ token });

        if (error) {
          throw new Error(`Sign-in error: ${error.message}`);
        }

        const currentUser = data?.user;
        if (currentUser) {
          console.log("Successfully logged in!");
          resolve(currentUser.user_metadata?.name || null); // Return displayName if available
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
