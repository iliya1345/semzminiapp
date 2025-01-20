import crypto from "crypto";

interface User {
  id?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  [key: string]: any;
}

type ValidationResult = { user: User | null; error: string | null };

export function validateHash(telegramInitData: string): ValidationResult {
  const BOT_TOKEN = process.env.BOT_TOKEN;

  if (!BOT_TOKEN) {
    return { user: null, error: "BOT_TOKEN is not set" };
  }

  const initData = new URLSearchParams(telegramInitData);
  const hash = initData.get("hash");

  if (!hash) {
    return { user: null, error: "Hash is missing from initData" };
  }

  initData.delete("hash");

  const dataCheckString = Array.from(initData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash !== hash) {
    return { user: null, error: "Hash validation failed" };
  }

  const userString = initData.get("user");

  if (!userString) {
    return { user: null, error: "User data is missing from initData" };
  }

  try {
    const user = JSON.parse(userString);
    return { user, error: null };
  } catch (err) {
    // Safely handle unknown error type
    const errorMessage =
      err instanceof Error
        ? `Error parsing user data: ${err.message}`
        : "Unknown error occurred during JSON parsing";
    return { user: null, error: errorMessage };
  }
}
