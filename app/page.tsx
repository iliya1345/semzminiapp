"use client";
import { useEffect } from "react";
import { loginWithTelegram } from "@/utils/auth";
import { getDocumentData } from "@/utils/firebaseUtils";
import HomeScreen from "@/components/pages/HomeScreen";
import LoadingScreen from "@/components/LoadingScreen";
import NavBar from "@/components/navbar";
import { useUserContext } from "@/context/UserContext";
import { getCollectionDocIds } from "@/utils/firebase";

interface UserData {
  referrals: number;
  lastName: string;
  id: number;
  firstName: string;
  balance: number;
  username: string;
}

export default function Home() {
  const { user, setUser, userData, setUserData } = useUserContext();

  const handleLogin = async () => {
    try {
      const name = await loginWithTelegram();

      if (name) {
        // Fetch document data from Firestore
        const data = await getDocumentData("users", name);

        if (!data) {
          throw new Error("User data not found");
        }

        let tasks: string[] | null = null;
        try {
          const fetchedTaskIds = await getCollectionDocIds(
            `users/${name}/tasks`
          );
          tasks = fetchedTaskIds.length > 0 ? fetchedTaskIds : null;
        } catch (tasksError) {
          console.error("Error fetching task IDs:", tasksError);
        }

        // Cast the fetched data to the UserData type
        const typedData = data as UserData;

        setUserData({ ...typedData, tasks });

        setUser({
          isLoggedIn: true,
          userId: name,
        });

        console.log("User data:", typedData);
      }
    } catch (error) {
      console.error("Login failed or data fetch error:", error);
    }
  };

  useEffect(() => {
    if (!user.isLoggedIn) {
      handleLogin();
    }
  }, [user.isLoggedIn]);

  if (!user.isLoggedIn) {
    return <LoadingScreen />;
  }

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
          {/* Nav Bar */}
          <NavBar page="Home" />
        </>
      ) : (
        <p>Failed to fetch user data.</p>
      )}
    </div>
  );
}
