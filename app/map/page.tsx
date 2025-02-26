"use client";
import React from "react";
import { BackButton } from "@twa-dev/sdk/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Map() {
  return (
    <div className="flex flex-col items-center p-6 h-screen w-full justify-between">
      <div className="w-full">
        <p className="font-medium text-muted-foreground text-start ">
          Footprint Map
        </p>
        <p className="text-start  text-2xl leading-6">
          NEW TRAILS <br /> ARE COMING...
        </p>
      </div>
      <div className="px-10">
        <img src="/map.png" alt="Footprint Map" />
      </div>
      <Link href={"/"} className="w-full">
        <Button className="bg-blue-500 text-white font-medium w-full hover:bg-blue-500">
          Got it
        </Button>
      </Link>
      {typeof window !== "undefined" && <BackButton />}
    </div>
  );
}

export default Map;
