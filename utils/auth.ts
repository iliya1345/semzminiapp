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
        const initData = WebApp.initData
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
