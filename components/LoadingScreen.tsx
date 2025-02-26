"use client";

import Image from "next/image";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-bounce flex flex-col items-center gap-2">
        <Image
          src="/semzlogo.png"
          alt="Tap Game Logo"
          width={200}
          height={200}
          className=""
        />
        <h1 className="text-5xl">SEMZ</h1>
      </div>
    </div>
  );
}
