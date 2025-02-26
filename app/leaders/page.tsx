"use client";
import NavBar from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { useUserContext } from "@/context/UserContext";
import { formatNumberWithCommas } from "@/lib/utils";
import { fetchLeaderboard } from "@/utils/fetchLeaderboard";
import { Loader2, Medal, Trophy } from "lucide-react";
import React from "react";

function Leaders() {
  const { userData } = useUserContext();
  const { leaderboard, error, loading } = fetchLeaderboard();
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        Error: {error}
        <NavBar page="Leaders" />
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
        <NavBar page="Leaders" />
      </div>
    );
  }
  return (
    <div className="h-screen ">
      <div className="container h-screen max-w-2xl mx-auto px-4 py-8 flex flex-col overflow-y-scroll pb-24">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <Trophy className="h-12 w-12 text-yellow-400 mb-4" />
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            {
            //@ts-ignore
            userData?.users?.count ? formatNumberWithCommas(userData.users.count) : 0
            } users
          </p>
        </div>

        {/* Leaderboard Section */}
        <Card className="bg-card/50">
          <CardContent className="p-6">
            <div className="space-y-4">
              {leaderboard?.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  {/* Rank Medal */}
                  <div className="flex items-center justify-center w-8">
                    {index < 3 ? (
                      <Medal
                        className={`h-6 w-6 ${
                          index === 0
                            ? "text-yellow-400"
                            : index === 1
                            ? "text-gray-400"
                            : "text-amber-600"
                        }`}
                      />
                    ) : (
                      <span className="text-muted-foreground font-medium">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-secondary-foreground">
                      {user.name[0].toUpperCase()}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatNumberWithCommas(user.balance)} SEMZ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <NavBar page="Leaders" />
    </div>
  );
}

export default Leaders;
