"use client";
import { useEffect } from "react";
import { loginWithTelegram } from "@/utils/auth";
import { getAllRows, getDocumentData, getPurchedSkins } from "@/utils/firebaseUtils";
import HomeScreen from "@/components/pages/HomeScreen";
import LoadingScreen from "@/components/LoadingScreen";
import NavBar from "@/components/navbar";
import { useUserContext } from "@/context/UserContext";

interface UserData {
  referrals: number;
  lastName: string;
  id: number;
  firstName: string;
  balance: number;
  username: string;
  tasks: string[] | null;
  users: number | null;
  skin: any;
  tonEarnDate:any;
  tonFree:any;

}

export default function Home() {
  const { user, setUser, userData, setUserData } = useUserContext();

  const fetchAdditionalUserData = async (
    userName: string
  ): Promise<Partial<UserData>> => {
    try {
      
      const usersCount = await getDocumentData("userCount", "0");
      const fetchedTaskIds = await getAllRows("tasks")
      const purchedSkins = await getPurchedSkins(userName)
      const tonEarnDate = await getDocumentData("app_data", "1");

      return {
        tasks: fetchedTaskIds.length > 0 ? fetchedTaskIds : null,
        users: usersCount,
        skin: purchedSkins,
        tonEarnDate: tonEarnDate
      };

    } catch (error) {
      console.error("Error fetching additional user data:", error);
      return {};
    }
  };

  const handleLogin = async () => {
    try {
      const userName = await loginWithTelegram();

      if (!userName) {
        console.log("there is no user")
        return
      };

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
            tonFree={userData.tonFree}
          />
          <NavBar page="Home" />
        </>
      ) : (
        <p>Failed to fetch user data.</p>
      )}
    </div>
  );
}
