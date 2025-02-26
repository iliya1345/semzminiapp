"use client";
import WebApp from "@twa-dev/sdk";



/**
 * Logs in a user with Telegram and returns their display name.
 *
 * @returns The display name of the authenticated user.
 */
export async function loginWithTelegram(): Promise<string | null> {
  return new Promise(async (resolve, reject) => {
    // Detect Android devices

    // If it's an Android device or user is not authenticated, log in again
    try {
      console.log("Attempting to sign in...");
      if (typeof window !== "undefined") {
        const initData = WebApp.initData || new URLSearchParams([
          ['user', JSON.stringify({
            id: 99281932,
            first_name: 'Andrew',
            last_name: 'Rogue',
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
        ]).toString();
  

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
          console.log("Successfully logged in!");
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
