import { db } from "@/utils/firebaseAdmin";
import { validateHash } from "@/utils/validateHash";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

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

    // Get references
    const userRef = db.collection("users").doc(userId);
    const taskRef = db.collection("tasks").doc(taskId);
    const userTaskRef = db
      .collection("users")
      .doc(userId)
      .collection("tasks")
      .doc(taskId);

    // Get user, task, and userTask data in parallel
    const [userDoc, taskDoc, userTaskDoc] = await Promise.all([
      userRef.get(),
      taskRef.get(),
      userTaskRef.get(),
    ]);

    // Check if user exists
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if task exists
    if (!taskDoc.exists) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user has already completed this task
    if (userTaskDoc.exists) {
      return NextResponse.json(
        { error: "Task already claimed" },
        { status: 400 }
      );
    }

    const taskData = taskDoc.data() as TaskData;
    const { reward } = taskData;

    if (!reward) {
      return NextResponse.json(
        { error: "Invalid task configuration" },
        { status: 400 }
      );
    }

    // Create batch to update both documents atomically
    const batch = db.batch();

    // Update user's points
    batch.update(userRef, {
      balance: FieldValue.increment(reward),
    });

    // Create task completion record
    batch.set(userTaskRef, {
      completedAt: FieldValue.serverTimestamp(),
      reward: reward,
    });

    // Commit the batch
    await batch.commit();

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
