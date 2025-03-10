"use client"

import NavBar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { getAllRows, getPurchedSkins } from "@/utils/firebaseUtils";
import { createSupabaseClient } from "@/utils/supaBase";
import { Loader2 } from "lucide-react";
import React, { use, useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { Rocket } from "lucide-react";

function SkinPage() {
  const [skins, setSkins] = useState<any[]>([]); // Store the fetched skins
  const [loading, setLoading] = useState(true);  // Loading state
  const initData = WebApp.initData
  const { user, setUser, userData, setUserData } = useUserContext();
  const supabase = createSupabaseClient();


  const fetchAllSkins = async () => {
    try {
      const data = await getAllRows("booster"); // Fetch data
      console.log(data)
      setSkins(data || []); // Store the result in state
    } catch (error) {
      console.error("Error fetching skins:", error);
    } finally {
      setLoading(false); // Stop loading once data is fetched
    }
  };

  useEffect(()=>{console.log("skinnn",userData?.skin)},[userData])

  useEffect(() => {
    fetchAllSkins(); // Call fetchAllSkins when component mounts
  }, []);

  const BuyCoin = async (skin: any) => {
    if (!userData) {
      return;
    }
  
    if (userData?.balance < skin.price) {
      alert("You don't have enough coins to buy this skin");
      return;
    } else {
      try {
                  {/* @ts-expect-error: Property 'count' might not exist ddon 'userData?.users' */}
        const { userDataPurchase ,error: purchaseError } = await supabase
          .from("purchase")
          .insert([{ type: "skin", day: skin.days, purchase_id: skin.id, user_id: userData.id }])
          .select();
  
        if (purchaseError) {
          console.error("Error inserting purchase:", purchaseError);
          return;
        }
        {/* @ts-expect-error: Property 'count' might not exddist on 'userData?.users' */}
        const updateDataBalance = parseInt(userData?.balance - skin.price )
        // Update user's balance in 'users' table
        const { error: updateError } = await supabase
          .from("users")
          .update({ balance: updateDataBalance })
          .eq("id", userData.id)
          .single();
  
        if (updateError) {
          console.error("Error updating balance:", updateError);
          return;
        }
        alert("skin purched successfully !")
        const purchedSkins = await getPurchedSkins(userData.id.toString())
        // Update the userData state in context with the new balance
        setUserData((prevUserData) => {
          if (!prevUserData) return prevUserData;
          return {
            ...prevUserData,
            balance: updateDataBalance,
            skin:purchedSkins
          };
        });
  
        console.log("Balance updated successfully:", updateDataBalance);
      } catch (error) {
        console.error("Error during transaction:", error);
      }
    }
  };
  
  useEffect(()=>{console.log(userData)},[userData])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
        <NavBar page="Leaders" />
      </div>
    );
  }


  const getRemainingMinutes = (purchaseDate: string, days: number): number => {
    const purchaseTime = new Date(purchaseDate);
    const expirationTime = new Date(purchaseTime.getTime() + days * 24 * 60 * 60 * 1000); // Add days
    const now = new Date();
    const remainingTime = expirationTime.getTime() - now.getTime(); // Time difference in milliseconds
    const remainingMinutes = Math.floor(remainingTime / 1000 / 60); // Convert to minutes
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

  return (
    <div className="h-screen">
      <div className="container h-screen max-w-2xl mx-auto px-4 py-8 flex flex-col overflow-y-scroll pb-24">
        <div className="flex flex-col items-center mb-8">
          <Rocket className="h-12 w-12 text-yellow-400 mb-4" />
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Booster
          </h1>
          <p className="text-muted-foreground">
          </p>
        </div>

        <div>
          {userData && userData.skin && userData.skin.length !== 0 ?
            skins.length > 0 ? (
              skins.map((skin,index) => (
                <div
                key={index}
                className={cn(
                  "group flex mt-2 items-center justify-between gap-4 rounded-lg bg-zinc-900 p-4 transition-colors"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center">
                    <img
                      src={skin.image_url}
                      alt="SEMZ"
                      className="h-14 w-14 rounded-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                  <h3 className="text-sm font-medium text-zinc-100">{skin.name} <span className="text-yellow-400"> {skin.boost}X   </span> <span className="text-blue-400">{skin.days}days</span> </h3>
                    <p className="text-xs text-zinc-400">{skin.description} </p>
                    {userData?.skin?.purchase_id === skin.id && <p className="text-sm text-yellow-400">Active for : {userData?.skin?.purchase_id === skin.id && formatRemainingTime(getRemainingMinutes(userData?.skin?.created_at,userData?.skin.day))}</p> }

                  </div>
                </div>
                <div className="flex items-center gap-2">

                  <Button
                    onClick={() => BuyCoin(skin)}
                    variant="secondary"
                    disabled={true}
                    className={userData?.skin?.purchase_id === skin.id ? "bg-blue-800 text-blue-100 hover:bg-blue-700" : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"}
                    
                  >
                    {userData?.skin?.purchase_id === skin.id ? "active " : `buy for ${skin.price}`}
                    
                  </Button>
                </div>
              </div>
              ))
            ) : (
              <div>No skins available</div> // Fallback if no skins found
            )

            :
            skins.map((skin,index) => (
              <div
              key={index}
              className={cn(
                "group flex mt-2 items-center justify-between gap-4 rounded-lg bg-zinc-900 p-4 transition-colors"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center">
                  <img
                    src={skin.image_url}
                    alt="SEMZ"
                    className="h-14 w-14 rounded-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-medium text-zinc-100">{skin.name} <span className="text-yellow-400"> {skin.boost}X   </span> <span className="text-blue-400">{skin.days}days</span> </h3>
                  <p className="text-xs text-zinc-400">{skin.description} </p>

                </div>
              </div>
              <div className="flex items-center gap-2">
                {status === "countdown" && (
                  <span className="text-sm text-zinc-400">{skin.days}s</span>
                )}
                <Button
                  onClick={() => BuyCoin(skin)}
                  variant="secondary"
                  className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                >
                buy for {skin.price}
                  
                </Button>
              </div>
            </div>
            ))
          
          
          }
        </div>
      </div>
      <NavBar page="Booster" />
    </div>
  );
}

export default SkinPage;
