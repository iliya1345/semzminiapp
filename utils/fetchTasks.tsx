"use client";
import { useState, useEffect } from "react";
import { useUserContext } from "@/context/UserContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export const fetchTasks = () => {
  const { tasks, setTasks, userData } = useUserContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasksFromBackend = async (refetch?: string) => {
    // If tasks are already loaded and no refetch is requested, exit early.
    if (tasks && !refetch && userData && userData.id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the backend API endpoint, passing the user ID as a query parameter
      const response = await fetchWithAuth(`/api/tasks?userId=${userData?.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data);
      return data;
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

  // Automatically fetch tasks when userData becomes available or changes.
  useEffect(() => {
    if (userData && userData.id) {
      fetchTasksFromBackend();
    }
  }, [userData]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasksFromBackend,
  };
};
