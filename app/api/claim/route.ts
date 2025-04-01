import { validateHash } from "@/utils/validateHash";
import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/utils/supaBase";
import { validateTelegramWebAppData } from "@/utils/telegramAuth";


// Define interface for task data
interface TaskData {
  type?: string;
  url?: string;
  reward: number;
}

export async function POST(req: Request) {

  const supabase = createSupabaseClient();
  supabase.auth.signInAnonymously()

  try {
    // Parse request body
    const { initData, taskId } = await req.json();

    const validationResult = validateTelegramWebAppData(initData);

    // Validate input
    if (!validationResult || !taskId) {
      return NextResponse.json(
        { error: "InitData and taskId are required" },
        { status: 400 }
      );
    }

    const userId = validationResult.user.id || "";

    console.log(validationResult.user.id)
    // Fetch user, task, and user-task in parallel
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

    // Handle errors
    if (userError) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (taskError) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if (userTask && userTask.task_id !== "telegram_name") return NextResponse.json({ error: "Task already claimed" }, { status: 400 });

    const taskData = task as TaskData;
    const { type, url, reward } = taskData;

    if (!reward) {
      return NextResponse.json(
        { error: "Invalid task configuration" },
        { status: 400 }
      );
    }

    // Telegram task handling
    if (type == "TG" || type == "Telegram") {
      if (!url) {
        return NextResponse.json(
          { error: "Channel link required for Telegram tasks" },
          { status: 400 }
        );
      }

      // Extract channel username and verify membership
      const channelUsername = url.replace("https://t.me/", "").replace("@", "").split("/")[0];
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

    // Referral task handling
    if (type == "Referral") {
      if(taskId === "telegram_name"){
        console.log(validationResult.user.first_name)
        if (validationResult.user.first_name != "$SEMZ" && validationResult.user.last_name != "$SEMZ") {
        
          return NextResponse.json(
            { error: `name does not set as $SEMZ, your name: ${validationResult.user.first_name}` },
            { status: 400 }
          );

        }else{

        const refs = user.referrals || 0;
        if (refs < Number(url)) {
          return NextResponse.json(
            { error: "Not enough referrals" },
            { status: 400 }
          );
        }

      }
    }
    }

    // Perform the transaction to update user's balance and create the user-task record
    const { error: transactionError } = await supabase
      .from("user_tasks")
      .insert([{ user_id: userId, task_id: taskId , reward }]);

    if (transactionError) {
      return NextResponse.json(
        { error: "Error claiming task", message: transactionError.message },
        { status: 500 }
      );
    }

    // Update the user's balance after the task is claimed
    const { error: updateError } = await supabase
      .from("users")
      .update({ balance: user.balance + reward })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: "Error updating user balance", message: updateError.message },
        { status: 500 }
      );
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

    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
