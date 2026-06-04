import React from "react";
import type { HistoryEntry } from "@workspace/api-client-react/src/generated/api.schemas";
import { format, subDays } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HistoryBarProps {
  entries?: HistoryEntry[];
  compact?: boolean;
}

export default function HistoryBar({ entries = [], compact = true }: HistoryBarProps) {
  const height = compact ? 32 : 48;
  const width = 8;
  
  // Generate last 10 days
  const today = new Date();
  const days = Array.from({ length: 10 }).map((_, i) => {
    const d = subDays(today, 9 - i);
    const dateStr = format(d, "yyyy-MM-dd");
    const entry = entries.find(e => e.date === dateStr);
    
    return {
      date: d,
      dateStr,
      entry,
      isToday: i === 9
    };
  });

  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case "watered": return "#00ff87";
      case "missed": return "#ffd166";
      default: return "#2a2a4a";
    }
  };

  const getStatusLabel = (status?: string | null) => {
    switch (status) {
      case "watered": return "Watered";
      case "missed": return "Missed";
      case "postponed": return "Postponed";
      default: return "No Data";
    }
  };

  return (
    <div className="flex gap-1 justify-between w-full">
      {days.map((day, i) => (
        <Tooltip key={day.dateStr}>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <div 
                className="transition-colors"
                style={{ 
                  width, 
                  height, 
                  backgroundColor: getStatusColor(day.entry?.status),
                  boxShadow: day.isToday ? "0 0 6px #00ff87" : "none"
                }}
              />
              <span className="font-sans text-[10px] text-[#556080]">
                {format(day.date, "eeeeee")}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-[#1a1a2e] border-[#2a2a4a] text-[#e8f4f8] font-sans">
            <p className="font-bold">{format(day.date, "MMM d, yyyy")}</p>
            <p className="text-sm">{getStatusLabel(day.entry?.status)}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}