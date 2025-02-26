// src/app/AuthClientProvider.tsx
"use client";

import { UserProvider } from "@/context/UserContext";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

const manifestUrl = process.env.NEXT_PUBLIC_TON_MENIFEST_URL;

export default function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        {children}
      </TonConnectUIProvider>
    </UserProvider>
  );
}
