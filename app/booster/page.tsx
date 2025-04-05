"use client";

import dynamic from "next/dynamic";
import NavBar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { Loader2, Rocket } from "lucide-react";
import React, { useEffect, useState } from "react";
import { fetchWithAuth } from '@/lib/fetchWithAuth'

// Helper functions for time formatting
const getRemainingMinutes = (purchaseDate: string, days: number): number => {
  const purchaseTime = new Date(purchaseDate);
  const expirationTime = new Date(purchaseTime.getTime() + days * 24 * 60 * 60 * 1000);
  const now = new Date();
  return Math.floor((expirationTime.getTime() - now.getTime()) / 1000 / 60);
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

  // Fetch all skins from the backend API (booster table)
  const fetchAllSkins = async () => {
    try {
      const response = await fetchWithAuth("/api/getAllRows?tableName=booster");
      if (!response.ok) throw new Error("Failed to fetch skins");
      const data = await response.json();
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

  // Purchase skin function using backend API
  const BuyCoin = async (skin: any) => {
    setLoading(true);
    if (!userData) return;
    // Optionally check client-side balance first:
    if (userData.balance < skin.price) {
      alert("You don't have enough coins to buy this skin");
      setLoading(false);
      return;
    }
    try {
      // Call the backend endpoint to process the purchase
      const response = await fetchWithAuth("/api/buySkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.id,
          skin: { id: skin.id, days: skin.days, price: skin.price },
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "Error purchasing skin");
        setLoading(false);
        return;
      }
      alert("Skin purchased successfully!");

      // Refresh purchased skin data after buying (if needed)
      const purchedResponse = await fetchWithAuth(`/api/getPurchasedSkins?docId=${userData.id}`);
      const purchedSkins = await purchedResponse.json();

      setUserData((prevUserData) => {
        if (!prevUserData) return prevUserData;
        return {
          ...prevUserData,
          balance: result.newBalance,
          skin: purchedSkins,
        };
      });
    } catch (error) {
      console.error("Error during transaction:", error);
    }
    setLoading(false);
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
                        style={{ objectFit: "cover" }}
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
                          Active for:{" "}
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
                      style={{ objectFit: "cover" }}
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
