"use client";
import WebApp from "@twa-dev/sdk";
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  User,
} from "firebase/auth";
import app from "./firebase";

const auth = getAuth(app);

/**
 * Logs in a user with Telegram and returns their display name.
 *
 * @returns The display name of the authenticated user.
 */
export async function loginWithTelegram(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    // Check if the user is already authenticated
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User is already signed in:", user.displayName);
        resolve(user.displayName || null); // Return displayName if available
      } else {
        console.log("No user is signed in. Attempting to sign in...");
        if (typeof window !== "undefined") {
          try {
            const initData = WebApp.initData;
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

            await signInWithCustomToken(auth, token);
            const currentUser = auth.currentUser;

            if (currentUser) {
              console.log("Successfully logged in!");
              resolve(currentUser.displayName || null); // Return displayName if available
            } else {
              reject("No user information available after sign-in.");
            }
          } catch (error) {
            console.error("Error during login process:", error);
            reject(error);
          }
        } else {
          reject("Not running in a browser environment.");
        }
      }
    });
  });
}
