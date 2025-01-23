"use client";
import { useEffect } from "react";
import { loginWithTelegram } from "@/utils/auth";
import { getDocumentData } from "@/utils/firebaseUtils";
import HomeScreen from "@/components/pages/HomeScreen";
import LoadingScreen from "@/components/LoadingScreen";
import NavBar from "@/components/navbar";
import { useUserContext } from "@/context/UserContext";
import { getCollectionDocIds, getDocumentValue } from "@/utils/firebase";

interface UserData {
  referrals: number;
  lastName: string;
  id: number;
  firstName: string;
  balance: number;
  username: string;
  tasks: string[] | null;
  users: number | null;
}

export default function Home() {
  const { user, setUser, userData, setUserData } = useUserContext();

  const fetchAdditionalUserData = async (
    userName: string
  ): Promise<Partial<UserData>> => {
    try {
      const usersCount = await getDocumentValue("userCount", "0", "count");
      const fetchedTaskIds = await getCollectionDocIds(
        `users/${userName}/tasks`
      );
      console.log("fetchedTaskIds", usersCount);

      return {
        tasks: fetchedTaskIds.length > 0 ? fetchedTaskIds : null,
        users: usersCount,
      };
    } catch (error) {
      console.error("Error fetching additional user data:", error);
      return {};
    }
  };

  const handleLogin = async () => {
    try {
      const userName = await loginWithTelegram();
      if (!userName) return;

      const userData = await getDocumentData("users", userName);
      if (!userData) throw new Error("User data not found");

      const additionalData = await fetchAdditionalUserData(userName);

      const completeUserData = {
        ...(userData as UserData),
        ...additionalData,
      };

      setUserData(completeUserData);
      setUser({ isLoggedIn: true, userId: userName });
    } catch (error) {
      console.error("Login or data fetch error:", error);
    }
  };

  useEffect(() => {
    if (!user.isLoggedIn) {
      handleLogin();
    }
  }, [user.isLoggedIn]);

  if (!user.isLoggedIn) return <LoadingScreen />;

  return (
    <div>
      {userData ? (
        <>
          <HomeScreen
            userId={userData.id}
            firstName={userData.firstName}
            lastName={userData.lastName || ""}
            username={userData.username || ""}
            balance={userData.balance}
          />
          <NavBar page="Home" />
        </>
      ) : (
        <p>Failed to fetch user data.</p>
      )}
    </div>
  );
}
