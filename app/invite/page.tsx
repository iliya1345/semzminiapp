"use client";
import NavBar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUserContext } from "@/context/UserContext";
import { formatText } from "@/lib/utils";
import WebApp from "@twa-dev/sdk";
import { Check, Copy, Share2, Users, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function ReferralPage() {
  const { userData } = useUserContext();
  const [copied, setCopied] = useState(false);
  const referralUrl = `${process.env.NEXT_PUBLIC_TELEGRAM_MINIAPP_URL}?startapp=${userData?.id}`;

  const handleShare = () => {
    const textToShare = "Collect SEMZ🫎 and convert to TON";
    const tgShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      referralUrl
    )}&text=${encodeURIComponent(textToShare)}`;

    if (typeof window !== "undefined") {
      WebApp.openTelegramLink(tgShareUrl);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

    const [timeLeft, setTimeLeft] = useState({
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  
    useEffect(() => {
      if (userData?.tonEarnDate?.value) {
        const targetDate = new Date(userData.tonEarnDate.value);
        
        const updateCountdown = () => {
          const now = new Date();
          // @ts-expect-error: Property 'count' might fdsfdnot exist on userData?.users
          const diff = targetDate - now;
  
          if (diff <= 0) {
            setTimeLeft({ months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
            return;
          }
  
          const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
          const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
          setTimeLeft({ months, days, hours, minutes, seconds });
        };
  
        const intervalId = setInterval(updateCountdown, 1000);
  
        return () => clearInterval(intervalId); // Clean up on component unmount
      }
    }, [userData]);

  return (
    <div>
      <div className="max-w-md mx-auto p-6 ">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card className="bg-black border-white/10 shadow-md bg-opacity-20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-white/50">Total Referrals</span>
              </div>
              <h3 className="font-semibold font-mono">
                {userData?.referrals || 0}
              </h3>
            </CardContent>
          </Card>

          <Card className="bg-black border-white/10 shadow-md bg-opacity-20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-white/50">Earnings</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <span className="font-mono font-semibold">
                    {(userData?.referrals &&
                      (userData?.referrals * 500).toFixed()) ||
                      0}{" "}
                    SEMZ
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code */}
        <Card className="bg-black border-white/10 shadow-md bg-opacity-20 mb-4">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm text-muted-foreground mb-2">
              Your Referral Code
            </h3>
            <div className="flex gap-2">
              <div className="flex w-full items-center text-sm bg-white/10 p-3 h-12  rounded-lg font-mono">
                {formatText(referralUrl, 25)}
              </div>
              <Button variant="outline" className="h-12" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500 animate-in zoom-in duration-300" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg mb-6"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Invite a Friend
        </Button>

        <Link href={"/ton-earn"}>
        <Card className="bg-card/50 mb-2">
          <CardContent className="p-6 flex-col flex justify-center items-center">
            <Image width={90} height={90} src={"/ton_image.webp"} alt={"ton"} />
            <h1 className="text-xl font-bold tracking-tight mb-2">TON FREE</h1>
            <p className="text-sm text-muted-foreground">Time left to earn more TON:</p>
            <div className="text-sm text-center mt-1 font-semibold">
              {timeLeft.months} months {timeLeft.days} days {timeLeft.hours} hours {timeLeft.minutes} minutes {timeLeft.seconds} seconds
            </div>
          </CardContent>
        </Card>
      </Link>
      </div>
      {/* Countdown Timer */}

      {/* Nav Bar */}
      <NavBar page="Friends" />
    </div>
  );
}

export default ReferralPage;
