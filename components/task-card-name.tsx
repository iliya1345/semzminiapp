"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";
import { useUserContext } from "@/context/UserContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    reward: number;
    url: string;
    icon?: string;
    isClaimed: boolean;
    type: string | null;
    hasAnimation : boolean;
  };
}

const CLAIM_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default function TaskCardName({ task }: TaskCardProps) {
  const [status, setStatus] = useState<"go" | "countdown" | "claim">("go");
  const { setUserData, setTasks } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [WebApp, setWebApp] = useState<any>(null);

  // Helper: Format seconds to hh:mm:ss
  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  // Function to start the countdown based on last claim time in localStorage
  const startCountdown = () => {
    const lastClaimStr = localStorage.getItem(`lastClaim_${task.id}`);
    if (lastClaimStr) {
      const lastClaim = Number(lastClaimStr);
      const now = Date.now();
      const diff = now - lastClaim;
      if (diff < CLAIM_INTERVAL) {
        const remaining = Math.ceil((CLAIM_INTERVAL - diff) / 1000);
        setCountdown(remaining);
        setStatus("countdown");
      } else {
        setStatus("go");
        setCountdown(0);
      }
    }
  };

  // Check for any existing claim time on mount
  useEffect(() => {
    startCountdown();

    // Dynamically import WebApp only on the client side
    import("@twa-dev/sdk").then((module) => {
      setWebApp(module.default);
    });

    // Setup an interval that ticks every second to update the countdown timer.
    const interval = setInterval(() => {
      const lastClaimStr = localStorage.getItem(`lastClaim_${task.id}`);
      if (lastClaimStr) {
        const lastClaim = Number(lastClaimStr);
        const now = Date.now();
        const diff = now - lastClaim;
        if (diff < CLAIM_INTERVAL) {
          setCountdown(Math.ceil((CLAIM_INTERVAL - diff) / 1000));
        } else {
          setStatus("go");
          setCountdown(0);
          clearInterval(interval);
        }
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [task.id]);

  async function claimTask() {
    // Prevent additional claims if still in cooldown
    if (status === "countdown") return;

    setIsLoading(true);
    try {
      const response = await fetchWithAuth("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData: typeof window !== "undefined"
            ? WebApp?.initData
            : new URLSearchParams([
                [
                  "user",
                  JSON.stringify({
                    id: 123321,
                    first_name: "sems",
                    last_name: "sems",
                    username: "rogue",
                    language_code: "en",
                    is_premium: true,
                    allows_write_to_pm: true,
                  }),
                ],
                ["hash", "89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31"],
                ["auth_date", "1716922846"],
                ["start_param", "debug"],
                ["chat_type", "sender"],
                ["chat_instance", "8428209589180549439"],
                ["signature", "6fbdaab833d39f54518bd5c3eb3f511d035e68cb"],
              ]).toString(),
          taskId: task.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to claim task");
      }

      if (data.success) {
        localStorage.setItem(`lastClaim_${task.id}`, Date.now().toString());

        // Update tasks context
        setStatus("countdown");

        setTasks((prev) => {
          if (!prev) return prev;
          return prev.map((t) =>
            t.id === task.id ? { ...t, isClaimed: true } : t
          );
        });
        // Update user balance in context
        setUserData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            balance: prev.balance + Number(data.reward),
          };
        });

        // Use the dynamically imported WebApp if available
        if (WebApp) {
          WebApp.showAlert(`Claimed ${data.reward} SEMZ successfully!`);
        }

        // Start the countdown timer after claim
        setTimeout(() => {
          startCountdown();
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error claiming task:", error);
      if (WebApp) {
        WebApp.showAlert(error.message || "Failed to claim rewards");
      }
    } finally {
      setIsLoading(false);
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
            className={task.hasAnimation ? "h-8 w-8 rounded-sm scale-up" : "h-8 w-8 rounded-sm"}
          />
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-zinc-100">{task.title}</h3>
          <p className="text-xs text-zinc-400">+{task.reward} SEMZ</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          disabled={isLoading || status === "countdown"}
          onClick={claimTask}
          variant="secondary"
          className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : status === "countdown" ? (
            formatCountdown(countdown) === "00:00:00" ? (
              <Check className="animate-pulse" />
            ) : (
              formatCountdown(countdown)
            )
          ) : (
            "Claim"
          )}
        </Button>
      </div>
    </div>
  );
}
