"use client";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useState, useEffect } from "react";
import { useUserContext } from "@/context/UserContext";

interface Task {
  id: string;
  title: string;
  reward: number;
  url: string;
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
      const tasksRef = collection(db, `tasks`);
      const snapshot = await getDocs(tasksRef);

      const userTasks: Task[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;

        return {
          id: doc.id,
          title: data.title,
          reward: data.reward,
          url: data.url,
          isClaimed: userData?.tasks?.includes(doc.id) || false,
          type: data.type || null,
        };
      });

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
