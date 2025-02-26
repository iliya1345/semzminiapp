import { NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const IMAGE_URL = "https://semzminiapp.vercel.app/welcome.png"; // Replace with your actual image URL

interface TelegramUpdate {
  update_id: number;
  message: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      first_name: string;
      username?: string;
      type: string;
    };
    date: number;
    text: string;
  };
}

export async function POST(request: Request) {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        { error: "Bot token not configured" },
        { status: 500 }
      );
    }

    const update: TelegramUpdate = await request.json();

    if (update.message?.text === "/start") {
      const chatId = update.message.chat.id;

      const welcomeMessage = `Every Click in Telegram Matters!
      
Collect SEMZ🫎 and convert to TON`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: "Open SEMZ",
              url: "https://t.me/SEMZ1BOT/run",
            },
          ],
          [
            {
              text: "Join Community",
              url: "https://t.me/semz_community",
            },
          ],
        ],
      };

      // send the image with captions
      const photoResponse = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            photo: IMAGE_URL,
            caption: welcomeMessage,
            parse_mode: "HTML",
            reply_markup: inlineKeyboard,
          }),
        }
      );

      if (!photoResponse.ok) {
        throw new Error("Failed to send Telegram photo message");
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
