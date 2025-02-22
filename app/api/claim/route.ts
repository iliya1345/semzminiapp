import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabaseClient"; // Ensure supabase is initialized
import { validateHash } from "@/utils/validateHash";

// Define interface for task data
interface TaskData {
  type?: string;
  url?: string;
  reward: number;
}

export async function POST(req: Request) {
  try {
    // Parse request body
    const { initData, taskId } = await req.json();

    // Validate input
    if (!initData || !taskId) {
      return NextResponse.json(
        { error: "InitData and taskId are required" },
        { status: 400 }
      );
    }

    // Verify the init data hash
    const validationResult = validateHash(initData);

    if (validationResult.error) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 403 }
      );
    }

    const userId = validationResult.user?.id?.toString() || "";

    // Fetch user, task, and userTask data using Supabase
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    const { data: userTask, error: userTaskError } = await supabase
      .from("user_tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("task_id", taskId)
      .single();

    // Check if user exists
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if task exists
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user has already completed this task
    if (userTask) {
      return NextResponse.json(
        { error: "Task already claimed" },
        { status: 400 }
      );
    }

    const taskData = task as TaskData;
    const { type, url, reward } = taskData;

    if (!reward) {
      return NextResponse.json(
        { error: "Invalid task configuration" },
        { status: 400 }
      );
    }

    // Check if it's a Telegram task
    if (type == "TG" || type == "Telegram") {
      if (!url) {
        return NextResponse.json(
          { error: "Channel link required for Telegram tasks" },
          { status: 400 }
        );
      }

      const channelUsername = url
        .replace("https://t.me/", "")
        .replace("@", "")
        .split("/")[0];

      // Get chat information from Telegram API
      const chatInfoResponse = await fetch(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChat?chat_id=@${channelUsername}`
      );
      const chatInfo = await chatInfoResponse.json();

      if (!chatInfo.ok) {
        return NextResponse.json(
          { error: "Invalid channel or group" },
          { status: 400 }
        );
      }

      // Check user membership
      const memberResponse = await fetch(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember?chat_id=${chatInfo.result.id}&user_id=${userId}`
      );
      const memberInfo = await memberResponse.json();

      if (!memberInfo.ok) {
        return NextResponse.json(
          { error: "Failed to verify membership" },
          { status: 400 }
        );
      }

      const status = memberInfo.result.status;
      const isMember = ["creator", "administrator", "member"].includes(status);

      if (!isMember) {
        return NextResponse.json(
          { error: "You must join the channel/group to claim rewards." },
          { status: 400 }
        );
      }
    }

    // Check if it's a referral task
    if (type == "Referral") {
      const refs = user.referrals || 0;
      if (refs < Number(url)) {
        return NextResponse.json(
          { error: "Not enough referrals" },
          { status: 400 }
        );
      }
    }

    // Update user balance and insert task completion record
    const { error: updateError } = await supabase.from("users").update({
      balance: user.balance + reward,
    }).eq("id", userId);

    const { error: taskErrorInsert } = await supabase.from("user_tasks").insert({
      user_id: userId,
      task_id: taskId,
      completed_at: new Date().toISOString(),
      reward: reward,
    });

    if (updateError || taskErrorInsert) {
      throw new Error(updateError?.message || taskErrorInsert?.message);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Task completed successfully",
      reward: reward,
      taskId,
    });
  } catch (error) {
    console.error("Task verification error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Internal server error",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Unknown error occurred during task verification" },
      { status: 500 }
    );
  }
}
