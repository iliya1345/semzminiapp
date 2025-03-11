"use client";

import dynamic from "next/dynamic";
import NavBar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { getAllRows, getPurchedSkins } from "@/utils/firebaseUtils";
import { createSupabaseClient } from "@/utils/supaBase";
import { Loader2, Rocket } from "lucide-react";
import React, { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

// Only access WebApp.initData on the client
const initData = typeof window !== "undefined" ? WebApp.initData : null;

// Helper function to get game data from localStorage safely
const FREE_PLAY_LIMIT = 3;
const RESET_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours in ms
const getGameData = () => {
  if (typeof window === "undefined") {
    return { lastReset: Date.now(), dailyPlayCount: 0 };
  }
  const stored = localStorage.getItem("gameData");
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (Date.now() - data.lastReset >= RESET_INTERVAL_MS) {
        const newData = { lastReset: Date.now(), dailyPlayCount: 0 };
        localStorage.setItem("gameData", JSON.stringify(newData));
        return newData;
      }
      return data;
    } catch (error) {
      console.error("Error parsing gameData:", error);
      const newData = { lastReset: Date.now(), dailyPlayCount: 0 };
      localStorage.setItem("gameData", JSON.stringify(newData));
      return newData;
    }
  }
  const newData = { lastReset: Date.now(), dailyPlayCount: 0 };
  localStorage.setItem("gameData", JSON.stringify(newData));
  return newData;
};

// Helper function to format ms into hh:mm:ss
const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const getRemainingMinutes = (purchaseDate: string, days: number): number => {
  const purchaseTime = new Date(purchaseDate);
  const expirationTime = new Date(purchaseTime.getTime() + days * 24 * 60 * 60 * 1000);
  const now = new Date();
  const remainingTime = expirationTime.getTime() - now.getTime();
  const remainingMinutes = Math.floor(remainingTime / 1000 / 60);
  return remainingMinutes;
};

const formatRemainingTime = (remainingMinutes: number): string => {
  if (remainingMinutes > 60) {
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;
    return `${hours} hours and ${minutes} minutes`;
  }
  return `${remainingMinutes} minutes`;
};

function SkinPage() {
  const [skins, setSkins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData, setUserData } = useUserContext();
  const supabase = createSupabaseClient();

  const fetchAllSkins = async () => {
    try {
      const data = await getAllRows("booster");
      setSkins(data || []);
    } catch (error) {
      console.error("Error fetching skins:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSkins();
  }, []);

  // Use safe defaults for dimensions if window is not defined yet
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  useEffect(() => {
    const handleResize = () =>
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Purchase skin function
  const BuyCoin = async (skin: any) => {
    setLoading(true)
    if (!userData) return;
    if (userData.balance < skin.price) {
      alert("You don't have enough coins to buy this skin");
      return;
    }
    try {
      // @ts-expect-error: Property 'count' might not exist on 'userData?.users'
      const { userDataPurchase, error: purchaseError } = await supabase
        .from("purchase")
        .insert([{ type: "skin", day: skin.days, purchase_id: skin.id, user_id: userData.id }])
        .select();

      if (purchaseError) {
        console.error("Error inserting purchase:", purchaseError);
        return;
      }
      // @ts-expect-error: Property 'count' might not exist on 'userData?.users'
      const updateDataBalance = parseInt(userData.balance) - skin.price;
      const { error: updateError } = await supabase
        .from("users")
        .update({ balance: updateDataBalance })
        .eq("id", userData.id)
        .single();

      if (updateError) {
        console.error("Error updating balance:", updateError);
        return;
      }
      alert("Skin purchased successfully!");
      const purchedSkins = await getPurchedSkins(userData.id.toString());
      setUserData((prevUserData) => {
        if (!prevUserData) return prevUserData;
        return {
          ...prevUserData,
          balance: updateDataBalance,
          skin: purchedSkins,
        };
      });
      console.log("Balance updated successfully:", updateDataBalance);
    } catch (error) {
      console.error("Error during transaction:", error);
    }
    setLoading(false)

  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
        <NavBar page="Leaders" />
      </div>
    );
  }

  const containerStyle =
    "container h-screen max-w-2xl mx-auto px-4 py-8 flex flex-col overflow-y-scroll pb-24";
  const headerStyle = "flex flex-col items-center mb-8";
  const titleStyle = "text-3xl font-bold tracking-tight mb-2";
  const subtitleStyle = "text-muted-foreground";

  return (
    <div className="h-screen">
      <div className={containerStyle}>
        <div className={headerStyle}>
          <Rocket className="h-12 w-12 text-yellow-400 mb-4" />
          <h1 className={titleStyle}>Booster</h1>
          <p className={subtitleStyle}></p>
        </div>

        <div>
          {userData && userData.skin && userData.skin.length !== 0 ? (
            skins.length > 0 ? (
              skins.map((skin, index) => (
                <div
                  key={index}
                  className={cn(
                    "group flex-col flex mt-2 items-center justify-between gap-4 rounded-lg bg-zinc-900 p-4 transition-colors"
                  )}
                >
                  <div className="flex items-center flex-col text-center gap-3">
                    <div className="flex h-14 w-14 aspect-square items-center justify-center">
                      <img
                        src={skin.image_url}
                        alt="SEMZ"
                        style={{objectFit:"cover"}}
                        className="h-14 w-14 rounded-sm aspect-square"
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-medium text-zinc-100">
                        {skin.name}{" "}
                        <span className="text-yellow-400">{skin.boost}X</span>{" "}
                        <span className="text-blue-400">{skin.days} days</span>
                      </h3>
                      <p className="text-xs text-zinc-400">{skin.description}</p>
                      {userData?.skin?.purchase_id === skin.id && (
                        <p className="text-sm text-yellow-400">
                          Active for :{" "}
                          {formatRemainingTime(
                            getRemainingMinutes(userData?.skin?.created_at, userData?.skin.day)
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <Button
                      variant="secondary"
                      disabled={true}
                      className={
                        userData?.skin?.purchase_id === skin.id
                          ? "bg-blue-800 w-full text-blue-100 hover:bg-blue-700"
                          : "bg-zinc-800 w-full text-zinc-100 hover:bg-zinc-700"
                      }
                    >
                      {userData?.skin?.purchase_id === skin.id
                        ? "active"
                        : `buy for ${skin.price}`}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div>No skins available</div>
            )
          ) : (
            skins.map((skin, index) => (
              <div
                key={index}
                className={cn(
                  "group flex-col flex mt-2 items-center justify-between gap-4 rounded-lg bg-zinc-900 p-4 transition-colors"
                )}
              >
                <div className="flex items-center flex-col text-center gap-3">
                  <div className="flex h-14 w-14 aspect-square items-center justify-center">
                      <img
                        src={skin.image_url}
                        alt="SEMZ"
                        style={{objectFit:"cover"}}
                        className="h-14 w-14 rounded-sm aspect-square"
                      />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium text-zinc-100">
                      {skin.name}{" "}
                      <span className="text-yellow-400">{skin.boost}X</span>{" "}
                      <span className="text-blue-400">{skin.days} days</span>
                    </h3>
                    <p className="text-xs text-zinc-400">{skin.description}</p>
                  </div>
                </div>
                <div className="flex items-center w-full gap-2">
                  <Button
                    onClick={() => BuyCoin(skin)}
                    variant="secondary"
                    className="bg-zinc-800 w-full text-zinc-100 hover:bg-zinc-700"
                  >
                    buy for {skin.price}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <NavBar page="Booster" />
    </div>
  );
}

// Disable SSR by exporting the component with dynamic import
export default dynamic(() => Promise.resolve(SkinPage), { ssr: false });
