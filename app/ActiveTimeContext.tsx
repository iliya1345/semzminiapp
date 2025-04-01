"use client"
import React, { createContext, useContext, useEffect, useState } from "react";

interface ActiveTimeContextType {
  activeTime: number; // in seconds
}

const ActiveTimeContext = createContext<ActiveTimeContextType>({ activeTime: 0 });

export const ActiveTimeProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTime, setActiveTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTime((prev) => prev + 1);
    }, 1000); // update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <ActiveTimeContext.Provider value={{ activeTime }}>
      {children}
    </ActiveTimeContext.Provider>
  );
};

export const useActiveTime = () => useContext(ActiveTimeContext);
