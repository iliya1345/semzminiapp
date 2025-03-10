"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface UserState {
  isLoggedIn: boolean;
  userId: string | null;
}

interface Task {
  id: string;
  title: string;
  reward: number;
  url: string;
  isClaimed: boolean;
  icon?: string;
  type: string | null;
}

interface UserData {
  referrals: number;
  lastName: string;
  id: number;
  firstName: string;
  balance: number;
  username: string;
  tasks: string[] | null;
  users: number | null;
  skin :any;
}

interface LeaderboardData {
  id: string;
  name: string;
  balance: number;
}

interface UserContextProps {
  user: UserState;
  setUser: React.Dispatch<React.SetStateAction<UserState>>;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  leaderboardData: LeaderboardData[] | null;
  setLeaderboardData: React.Dispatch<
    React.SetStateAction<LeaderboardData[] | null>
  >;
  tasks: Task[] | null;
  setTasks: React.Dispatch<React.SetStateAction<Task[] | null>>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserState>({
    isLoggedIn: false,
    userId: null,
  });

  const [userData, setUserData] = useState<UserData | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<
    LeaderboardData[] | null
  >(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        userData,
        setUserData,
        leaderboardData,
        setLeaderboardData,
        tasks,
        setTasks,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
