"use client";
import NavBar from "@/components/navbar";
import TaskCard from "@/components/task-card";
import TaskCardName from "@/components/task-card-name";
import { Card, CardContent } from "@/components/ui/card";
import { fetchTasks } from "@/utils/fetchTasks";
import { ListCheck, Loader2, Users2 } from "lucide-react";
import React from "react";

function EarnPage() {
  const { tasks, loading, error } = fetchTasks();
  
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
      <Card className="bg-card/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            {tasks?.filter((value)=> value.id === "telegram_name").map((task) => (
              <TaskCardName key={task.id} task={task} />
            ))}
            {tasks?.filter((value)=> value.id !== "telegram_name").map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </CardContent>
      </Card>
      <NavBar page="Earn" />
    </div>
  );
  return <div>EarnPage</div>;
}

export default EarnPage;
