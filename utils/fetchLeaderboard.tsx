"use client";
import { useUserContext } from "@/context/UserContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useState, useEffect } from "react";

interface LeaderboardData {
  id: string;
  name: string;
  balance: number;
}

export const fetchLeaderboard = () => {
  const { leaderboardData, setLeaderboardData } = useUserContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboardData = async (refetch?: string) => {
    // If data exists and no explicit refetch is required, do nothing.
    if (leaderboardData && !refetch) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call your backend API endpoint
      const response = await fetchWithAuth("/api/leaderboard");
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard data");
      }
      const data = await response.json();

      // Map the data to the expected format
      const formattedLeaderboard: LeaderboardData[] = data.map((user: any) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        balance: user.balance,
      }));

      setLeaderboardData(formattedLeaderboard);
      return formattedLeaderboard;
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

  // Automatically fetch leaderboard when the component mounts
  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  return {
    leaderboard: leaderboardData,
    loading,
    error,
    refetch: fetchLeaderboardData,
  };
};
