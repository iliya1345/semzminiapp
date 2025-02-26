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
    if (tasks && !refetch) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, reward, url, icon, type");

      if (error) {
        throw new Error(error.message);
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
