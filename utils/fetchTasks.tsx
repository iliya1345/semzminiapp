"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient"; // Make sure supabaseClient is properly initialized
import { useUserContext } from "@/context/UserContext";

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
    if (tasks && !refetch) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("tasks") // Assuming the table name is "tasks"
        .select("*");

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const userTasks: Task[] = data.map((task: any) => ({
        id: task.id,
        title: task.title,
        reward: task.reward,
        url: task.url,
        icon: task.icon || null,
        isClaimed: userData?.tasks?.includes(task.id) || false,
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

  // Automatically fetch tasks when userId changes
  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
  };
};
