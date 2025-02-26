import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import WebApp from "@twa-dev/sdk";
import { Check, Loader2 } from "lucide-react";
import { useUserContext } from "@/context/UserContext";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    reward: number;
    url: string;
    icon?: string;
    isClaimed: boolean;
    type: string | null;
  };
}

export default function TaskCard({ task }: TaskCardProps) {
  const [status, setStatus] = useState<"go" | "countdown" | "claim">("go");
  const { setUserData, setTasks } = useUserContext();
  const [countdown, setCountdown] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "countdown" && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setStatus("claim");
    }
    return () => clearTimeout(timer);
  }, [countdown, status]);

  const handleGoClick = () => {
    if (
      task.url &&
      task.url.includes("https://t.me") &&
      typeof window !== "undefined"
    ) {
      WebApp.openTelegramLink(task.url);
      setStatus("countdown");
    } else {
      window.open(task.url, "_blank");
      setStatus("countdown");
    }
  };

  async function claimTask() {
    if (typeof window !== "undefined") {
      setIsLoading(true);
      // Get initData from WebApp
      try {
        const response = await fetch("/api/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            initData: WebApp.initData || new URLSearchParams([
              ['user', JSON.stringify({
                id: 123321,
                first_name: 'Andrew',
                last_name: 'Rogue',
                username: 'rogue',
                language_code: 'en',
                is_premium: true,
                allows_write_to_pm: true,
              })],
              ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
              ['auth_date', '1716922846'],
              ['start_param', 'debug'],
              ['chat_type', 'sender'],
              ['chat_instance', '8428209589180549439'],
              ['signature', '6fbdaab833d39f54518bd5c3eb3f511d035e68cb'],
            ]).toString()
      
      ,
            taskId: task.id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to claim task");
        }

        if (data.success) {
          setTasks((prev) => {
            if (!prev) return prev; // Ensure `prev` exists

            // Map over the tasks, updating the `isClaimed` property for the matching task
            return prev.map((t) =>
              t.id === task.id ? { ...t, isClaimed: true } : t
            );
          });
          setUserData((prev) => {
            if (!prev) return prev; // Ensure `prev` exists

            // Map over the tasks, updating the `isClaimed` property for the matching task
            return {
              ...prev,
              balance: prev.balance + Number(data.reward),
            };
          });

          WebApp.showAlert(`Claimed ${data.reward} SEMZ successfully!`);
          setStatus("claim");
        }
      } catch (error: any) {
        console.error("Error claiming task:", error);
        WebApp.showAlert(error.message || "Failed to claim rewards");
      } finally {
        setIsLoading(false);
      }
    }
  }

  const getIconSrc = () => {
    if (task.url.includes("x.com")) return "/x.png";
    if (task.url.includes("t.me") && !task.icon) return "/tg.png";
    if (task.url.includes("linkedin.com") && !task.icon) return "/linkdin.png";
    if (task.url.includes("instagram.com")) return "/ig.png";
    if (task.url.includes("facebook.com")) return "/fb.png";
    return task.icon || "/ape.png";
  };

  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-4 rounded-lg bg-zinc-900 p-4 transition-colors"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center">
          <img
            src={getIconSrc()}
            height={50}
            width={50}
            alt="SEMZ"
            className="h-8 w-8 rounded-sm"
          />
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-zinc-100">{task.title}</h3>
          <p className="text-xs text-zinc-400">+{task.reward} SEMZ</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status === "countdown" && (
          <span className="text-sm text-zinc-400">{countdown}s</span>
        )}
        <Button
          disabled={
            task.isClaimed ||
            isLoading ||
            (status !== "go" && status !== "claim")
          }
          onClick={() =>
            task.type === "Referral"
              ? claimTask()
              : status === "go"
              ? handleGoClick()
              : claimTask()
          }
          variant="secondary"
          className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : task.isClaimed ? (
            <Check className="animate-pulse" />
          ) : task.type === "Referral" ? (
            "Check"
          ) : status === "go" ? (
            "Go"
          ) : status === "claim" ? (
            "Claim"
          ) : (
            <Loader2 className="animate-spin" />
          )}
        </Button>
      </div>
    </div>
  );
}
