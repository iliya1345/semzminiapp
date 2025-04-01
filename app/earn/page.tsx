"use client";
import NavBar from "@/components/navbar";
import TaskCard from "@/components/task-card";
import TaskCardName from "@/components/task-card-name";
import { Card, CardContent } from "@/components/ui/card";
import { useUserContext } from "@/context/UserContext";
import { fetchTasks } from "@/utils/fetchTasks";
import { ListCheck, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

function EarnPage() {
  const { tasks, loading, error } = fetchTasks();
  const { userData } = useUserContext();
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

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        Error: {error}
        <NavBar page="Earn" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
        <NavBar page="Earn" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen p-4 overflow-y-scroll pb-24">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-8 mt-4">
        <ListCheck className="h-12 w-12 text-yellow-400 mb-4" />
        <h1 className="text-3xl font-bold tracking-tight mb-2">Tasks</h1>
        <p className="text-muted-foreground">Complete tasks to earn more.</p>
      </div>

      {/* Countdown Timer */}
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

      {/* Task Cards */}
      <Card className="bg-card/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            {tasks?.filter((value) => value.id === "telegram_name").map((task) => (
              <TaskCardName key={task.id} task={task} />
            ))}
            {tasks?.filter((value) => value.id !== "telegram_name").map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </CardContent>
      </Card>

      <NavBar page="Earn" />
    </div>
  );
}

export default EarnPage;
