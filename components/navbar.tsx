import React from "react";
import { Home, Users, Rocket, Trophy, ListCheck } from "lucide-react";
import Link from "next/link";

const NavBar = ({ page }: { page: string }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#181818] shadow-md border-t border-white/5 z-50">
      <div className="flex justify-around items-center py-2 max-w-md mx-auto">
        {[
          { icon: Home, label: "Home", path: "/" },
          { icon: Trophy, label: "Leaders", path: "/leaders" },
          { icon: Rocket, label: "Booster", path: "/booster" },
          { icon: Users, label: "Frens", path: "/invite" },
          { icon: ListCheck, label: "Earn", path: "/earn" },

        ].map(({ icon: Icon, label, path }) => (
          <Link
            href={path}
            key={label}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg text-blue-500 transition ${
              label === page ? " shadow-md" : " opacity-60"
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default NavBar;
