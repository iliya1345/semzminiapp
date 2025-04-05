import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '../supaBaseAdmin';

const supabase = createSupabaseAdmin();

export async function GET(request: Request) {
  // Extract the userId from the query parameters
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
  }

  try {
    // Fetch all tasks from the "tasks" table
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (tasksError) {
      throw new Error(tasksError.message);
    }

    // Fetch tasks already claimed by the user from the "user_tasks" table
    const { data: userTasksData, error: userTasksError } = await supabase
      .from('user_tasks')
      .select('*')
      .eq('user_id', userId);

    if (userTasksError) {
      throw new Error(userTasksError.message);
    }

    // Map the tasks and determine whether they are claimed by the user
    const tasks = tasksData.map((task: any) => ({
      id: task.id,
      title: task.title,
      reward: task.reward,
      url: task.url,
      icon: task.icon || null,
      isClaimed: userTasksData.some((userTask: any) => userTask.task_id === task.id),
      type: task.type || null,
      date: task.date || null,
      hasAnimation: task.hasAnimation,
    }));

    return NextResponse.json(tasks);
  } catch (err: any) {
    console.error("Error fetching tasks:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
