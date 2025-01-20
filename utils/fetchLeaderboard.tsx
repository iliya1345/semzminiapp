"use client";
import { useUserContext } from "@/context/UserContext";
import { db } from "@/utils/firebase";
import {
  collection,
  getDocs,
  DocumentData,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
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
      const leaderboardQuery = query(
        collection(db, "users"),
        orderBy("balance", "desc"),
        limit(100)
      );

      const snapshot = await getDocs(leaderboardQuery);

      const leaderboardData: LeaderboardData[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;

        return {
          id: doc.id,
          name: data.firstName + " " + data.lastName,
          balance: data.balance,
        };
      });

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
