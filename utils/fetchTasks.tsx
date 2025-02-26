"use client";
import { useState, useEffect } from "react";
import { useUserContext } from "@/context/UserContext";
import { createSupabaseClient } from "./supaBase";

const supabase = createSupabaseClient();

interface Task {
  id: string;
  title: string;
  reward: number;
  url: string;
  icon?: string;
  isClaimed: boolean;
  type: string | null;
}

export const fetchTasks = () => {
  const { tasks, setTasks, userData } = useUserContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async (refetch?: string) => {
    if (tasks && !refetch && userData && userData.id ) {
      return;
    }



    setLoading(true);
    setError(null);

    try {
      // Fetch tasks from the 'tasks' table
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*'); // Adjust query to match your table schema

      if (tasksError) {
        throw tasksError;
      }

      // Fetch user tasks from the 'user_tasks' table (i.e., tasks already claimed by the user)
      const { data: userTasksData, error: userTasksError } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', userData?.id); // Assuming you want to filter by user ID

      if (userTasksError) {
        throw userTasksError;
      }

      const userTasks: Task[] = tasksData.map((task: any) => ({
        id: task.id,
        title: task.title,
        reward: task.reward,
        url: task.url,
        icon: task.icon || null,
        isClaimed: userTasksData.some((userTask: any) => userTask.task_id === task.id),
        type: task.type || null,
      }));

      setTasks(userTasks);
      return userTasks;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred while fetching tasks";

      setError(errorMessage);
      console.error("Error fetching tasks:", err);

      return [];
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch tasks when userData changes
  useEffect(() => {
    fetchTasks();
  }, [userData]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
  };
};
