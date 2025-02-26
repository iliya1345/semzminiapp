"use client";
import { useUserContext } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "./supaBase";


const supabase = createSupabaseClient();


interface LeaderboardData {
  id: string;
  name: string;
  balance: number;
}

export const fetchLeaderboard = () => {
  const { leaderboardData, setLeaderboardData, userData } = useUserContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async (refetch?: string) => {
    if (leaderboardData && !refetch) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, firstName, lastName, balance")
        .order("balance", { ascending: false }) // Sort by balance in descending order
        .limit(100); // Limit to top 100 users

      if (error) {
        throw new Error(error.message);
      }

      const leaderboardData: LeaderboardData[] = data.map((user: any) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        balance: user.balance,
      }));

      setLeaderboardData(leaderboardData);
      return leaderboardData;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred while fetching leaderboard";

      setError(errorMessage);
      console.error("Error fetching leaderboard:", err);

      return [];
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch leaderboard when userId changes
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return {
    leaderboard: leaderboardData,
    loading,
    error,
    refetch: fetchLeaderboard,
  };
};
