import React from "react";
import { Link, useLocation } from "wouter";
import { Home, List, Droplets } from "lucide-react";
import { useGarden } from "@/context/GardenContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { session } = useGarden();

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-[#0d0d1a] text-[#e8f4f8] pb-20">
      {session && (
        <div className="w-full max-w-[420px] flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center gap-2">
            <img src="/icon-192.png" alt="" className="w-5 h-5" style={{ imageRendering: "pixelated" }} />
            <span className="font-sans text-lg text-[#9ab8c0]">{session.gardenName}</span>
          </div>
          <span className="font-heading text-[8px] text-[#556080]">#{session.joinCode}</span>
        </div>
      )}
      <main className="w-full max-w-[420px] flex-1 flex flex-col">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/plants", icon: List, label: "Plants" },
    { href: "/log", icon: Droplets, label: "Log" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#1a1a2e] border-t border-[#2a2a4a] z-50">
      <div className="w-full max-w-[420px] mx-auto h-full flex justify-around items-center">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = location === href || (href !== "/" && location.startsWith(href));
          return (
            <Link key={href} href={href} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? "text-[#00ff87]" : "text-[#556080] hover:text-[#e8f4f8]"}`}>
              <Icon size={24} style={{ imageRendering: "pixelated" }} />
              <span className="font-heading text-[8px] uppercase tracking-tighter">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}