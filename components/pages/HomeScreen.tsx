"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  Clock,
  Wallet,
  Gamepad2,
  Import,
  Trash,
  Users,
  Star,
  Terminal,
  ArrowRight,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { formatNumberWithCommas } from "@/lib/utils";
import Link from "next/link";
import { Address } from "@ton/core";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { Alert, AlertDescription } from "../ui/alert";

interface HomeScreenProps {
  firstName?: string;
  lastName?: string;
  userId?: number;
  username?: string;
  balance?: number;
  tonFree:any
}

export default function HomeScreen({
  firstName,
  lastName,
  userId,
  username,
  balance,
  tonFree
}: HomeScreenProps) {
  const [tonConnectUI] = useTonConnectUI();
  const [tonWalletAddress, setTonWalletAddress] = useState(null);

  const handleWalletConnection = useCallback(async (address: string) => {
    // Convert the address to UQ format (user-friendly bounceable)
    const parsedAddress = Address.parse(address);
    const bounceableAddress = parsedAddress.toString({
      urlSafe: true,
      bounceable: true, // This ensures it's in the bounceable format (UQ...)
      testOnly: false, // Ensure it's not a testnet address
    });

    setTonWalletAddress(bounceableAddress as any);
    console.log("Wallet connected successfully!", bounceableAddress); // Debugging

    // Update the user's document in Firestore with the wallet address
  }, []);

  const handleWalletDisconnection = useCallback(async () => {
    setTonWalletAddress(null);

    // Remove the walletAddress field from the user's document in Firestore
  }, []);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (tonConnectUI.account?.address) {
        handleWalletConnection(tonConnectUI.account.address);
      } else {
        handleWalletDisconnection();
      }
    };

    checkWalletConnection();

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        handleWalletConnection(wallet.account.address);
      } else {
        handleWalletDisconnection();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI, handleWalletConnection, handleWalletDisconnection]);

  const handleWalletAction = async () => {
    if (tonConnectUI.connected) {
      await tonConnectUI.disconnect();
    } else {
      await tonConnectUI.openModal();
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 h-screen pb-24 w-full">
      <Alert className="mb-4 bg-black/50 flex justify-between p-2 px-3 items-center">
        <AlertDescription>Check the footprint map.</AlertDescription>{" "}
        <Link href="/map" className="bg-blue-500 text-white rounded-full p-1">
          <ArrowRight />
        </Link>
      </Alert>
      <div className="flex flex-col justify-between h-full w-full items-center">
        <div className="">
          {tonWalletAddress ? (
            <Button className="flex items-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
              {formatAddress(tonWalletAddress)}
              <button
                onClick={handleWalletAction}
                className="bg-white/30 rounded-full p-2 -mr-2"
              >
                <Trash />
              </button>
            </Button>
          ) : (
            <Button
              onClick={handleWalletAction}
              className="rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          )}
        </div>
        <div className=" flex flex-col items-center">
          <img src="/semzlogo.png" alt="" className="h-56 w-56" />

          <div className="flex items-center  gap-1 mt-4">
            <h1 className="text-5xl font-semibold">
              {formatNumberWithCommas(balance ||  0)}
            </h1>
            <h3 className="text-white text-xl text-center">SEMZ</h3>
          </div>

          <div className="flex items-center  gap-1 mt-4">
            <img className="scale-up" src="/ton_image.webp" alt="" style={{width:"30px",height:"30px"}}/>
            <h1 className="text-xl font-semibold">
              {formatNumberWithCommas(tonFree ||  0)}
            </h1>
            <h3 className="text-white text-xl text-center">TON</h3>
          </div>

        </div>
        {/* <div className="border rounded-md flex items-center p-4 mb-2 gap-2 bg-black/20">
          <Wallet />
          <h1 className="text-center text-lg">1000 $SEMZ</h1>
        </div> */}
        <div className="gap-3 flex flex-col w-full">
        
        <Link href={"/game"} className="w-full">
            <Button
              className="rounded-full bg-gradient-to-r w-full from-blue-600 to-blue-700 text-white shadow-lg"
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Enter to game
            </Button>
        </Link>

          <Link href={"/invite"} className="w-full">
            <Button
              size={"lg"}
              variant={"outline"}
              className="flex items-center w-full bg-black/20"
            >
              <Users />
              Invite your frens & earn more
            </Button>
          </Link>
          <Link href={"/earn"} className="w-full">
            <Button
              size={"lg"}
              variant={"outline"}
              className="flex items-center w-full bg-black/20"
            >
              <Star /> Complete your tasks
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
