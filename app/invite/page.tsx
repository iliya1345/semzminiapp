"use client";
import NavBar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUserContext } from "@/context/UserContext";
import { formatText } from "@/lib/utils";
import WebApp from "@twa-dev/sdk";
import { Wallet, Users, Copy, Check, Share2 } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

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
      </div>

      {/* Nav Bar */}
      <NavBar page="Frens" />
    </div>
  );
}

export default ReferralPage;
