"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useUserContext } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { useActiveTime } from "../ActiveTimeContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const TEN_MINUTES_IN_SECONDS = 600;
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// Dynamically import BackButton to ensure it's only rendered on the client
const BackButton = dynamic(
  () => import("@twa-dev/sdk/react").then((mod) => mod.BackButton),
  { ssr: false }
);

function TonEarnPage() {
  const { userData, setUserData } = useUserContext();
  const { activeTime } = useActiveTime(); // Global active time in seconds

  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [cooldownTime, setCooldownTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Countdown for TON claim availability (based on userData.tonEarnDate)
  useEffect(() => {
    if (userData?.tonEarnDate?.value) {
      const targetDate = new Date(userData.tonEarnDate.value);

      const updateCountdown = () => {
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();

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
      return () => clearInterval(intervalId);
    }
  }, [userData]);

  // Check for cooldown timer update every second
  useEffect(() => {
    const cooldownInterval = setInterval(() => {
      const lastClaim = localStorage.getItem("lastScoreClaim");
      if (lastClaim) {
        const lastClaimTime = new Date(lastClaim).getTime();
        const now = Date.now();
        const remaining = lastClaimTime + COOLDOWN_MS - now;
        setCooldownTime(remaining > 0 ? remaining : 0);
      } else {
        setCooldownTime(0);
      }
    }, 1000);

    return () => clearInterval(cooldownInterval);
  }, []);

  const formatTime = (milliseconds:any) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const AddScore = async () => {
    // Check if user has been active for at least 10 minutes
    if (activeTime < TEN_MINUTES_IN_SECONDS) {
      const remainingActive = TEN_MINUTES_IN_SECONDS - activeTime;
      setErrorMessage(`You need to be active for ${Math.ceil(remainingActive / 60)} more minutes to claim TON.`);
      return;
    }

    // Check for 24h cooldown
    const lastClaim = localStorage.getItem("lastScoreClaim");
    if (lastClaim) {
      const lastClaimTime = new Date(lastClaim).getTime();
      const now = Date.now();
      if (now - lastClaimTime < COOLDOWN_MS) {
        const remaining = lastClaimTime + COOLDOWN_MS - now;
        setErrorMessage(`You can claim TON again in ${formatTime(remaining)}.`);
        return;
      }
    }

    setErrorMessage(""); // Clear error message

    // Call backend API to process TON claim
    if (userData?.id) {
      try {
        const response = await fetchWithAuth("/api/claimTon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userData.id }),
        });
        const result = await response.json();

        if (!response.ok) {
          setErrorMessage(result.error || "Error claiming TON.");
          return;
        }

        // Update userData with the new TON free balance
        setUserData((prev) =>
          prev ? { ...prev, tonFree: result.newTonFree } : prev
        );

        // Set the cooldown by storing the current timestamp in localStorage
        localStorage.setItem("lastScoreClaim", new Date().toISOString());
        alert("TON claimed successfully!");
      } catch (error:any) {
          setErrorMessage(error?.message);
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-screen p-4 overflow-y-scroll pb-24">
      <Card className="bg-card/50 mb-2">
        <CardContent className="p-6 flex-col flex justify-center items-center">
          <Image width={90} height={90} src={"/ton_image.webp"} alt={"ton"} />
          <h1 className="text-xl font-bold tracking-tight mb-2">TON FREE</h1>
          <p className="text-sm text-muted-foreground">Time left to earn more TON:</p>
          <div className="text-sm text-center mt-1 font-semibold">
            {timeLeft.months} months {timeLeft.days} days {timeLeft.hours} hours{" "}
            {timeLeft.minutes} minutes {timeLeft.seconds} seconds
          </div>
          <p className="text-sm text-center my-1 font-semibold">
            Ton Per day : {userData && userData.referrals * 0.005}
          </p>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <Button
            onClick={AddScore}
            className="rounded-full mb-4 mt-4 bg-gradient-to-r w-full from-blue-600 to-blue-700 text-white shadow-lg"
          >
            Claim TON
          </Button>
          <p>
            Active time: {Math.floor(activeTime / 60)} minutes {activeTime % 60} seconds
          </p>
          {cooldownTime > 0 && (
            <p>Next claim available in: {formatTime(cooldownTime)}</p>
          )}
          <p className="text-center text-muted-foreground mt-4">
            You will receive <strong>0.005 TON</strong> for each referral.
            <br />
            For example, if someone has <strong>1,000 referrals</strong>, they will earn{" "}
            <strong>5 TON daily</strong>.
            <br />
            ✅ <strong>Only active users</strong> are counted—each referred user must spend at least{" "}
            <strong>10 minutes daily</strong> in the bot to be considered valid.
            <br />
            ⚠️ <strong>Fake users will not be counted!</strong>
            <br />
            Only the <strong>active referrals</strong> you have added will be included.
          </p>
        </CardContent>
      </Card>
      <BackButton />
    </div>
  );
}

export default TonEarnPage;
