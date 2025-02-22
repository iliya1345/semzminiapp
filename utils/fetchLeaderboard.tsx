"use client";
import { useUserContext } from "@/context/UserContext";
import { supabase } from "@/utils/supabaseClient"; // Supabase client import
import { useState, useEffect } from "react";

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
      // Fetch leaderboard data from Supabase
      const { data, error } = await supabase
        .from("users") // Supabase table "users"
        .select("id, firstName, lastName, balance") // Select required fields
        .order("balance", { ascending: false }) // Order by balance in descending order
        .limit(100); // Limit to 100 results

      if (error) {
        throw error;
      }

      const leaderboardData: LeaderboardData[] = data.map((user) => ({
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
