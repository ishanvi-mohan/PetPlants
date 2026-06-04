import React from "react";
import type { PlayerStats } from "@workspace/api-client-react/src/generated/api.schemas";
import PlantEmoticon from "./PlantEmoticon";

interface LevelBannerProps {
  stats: PlayerStats;
}

export default function LevelBanner({ stats }: LevelBannerProps) {
  const { currentLevel, levelTitle, totalXp, xpForCurrentLevel, xpToNextLevel } = stats;
  
  const xpIntoLevel = totalXp - xpForCurrentLevel;
  const xpNeededForLevel = xpToNextLevel ? xpToNextLevel - xpForCurrentLevel : 1;

  const progressPercent = xpToNextLevel
    ? Math.min(100, Math.max(0, (xpIntoLevel / xpNeededForLevel) * 100))
    : 100;

  return (
    <div className="pixel-card p-4 flex gap-4 items-center">
      <div className="bg-[#0d0d1a] p-2 rounded-sm border border-[#2a2a4a]">
        <PlantEmoticon style="leafy" state="happy" size={48} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-baseline mb-2">
          <h2 className="font-heading text-sm text-[#ffd166]">LVL {currentLevel}</h2>
          <span className="font-sans text-xl text-[#00ff87]">{levelTitle}</span>
        </div>
        <div className="h-4 bg-[#0d0d1a] border border-[#2a2a4a] relative w-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 bottom-0 bg-[#ffcc00] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-end mt-1">
          <span className="font-sans text-sm text-[#556080]">
            {totalXp} {xpToNextLevel ? `/ ${xpToNextLevel} XP` : "XP Maxed"}
          </span>
        </div>
      </div>
    </div>
  );
}