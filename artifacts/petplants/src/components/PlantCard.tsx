import React from "react";
import { Link } from "wouter";
import type { Plant } from "@workspace/api-client-react/src/generated/api.schemas";
import PlantEmoticon from "./PlantEmoticon";
import HistoryBar from "./HistoryBar";
import { useGetPlantHistory } from "@workspace/api-client-react";
import { format, isToday, isPast } from "date-fns";

interface PlantCardProps {
  plant: Plant;
}

export default function PlantCard({ plant }: PlantCardProps) {
  const isDue = plant.dueToday;
  const isOverdue =
    plant.nextWaterDate &&
    isPast(new Date(plant.nextWaterDate)) &&
    !isToday(new Date(plant.nextWaterDate));

  const { data: history } = useGetPlantHistory(plant.id);

  return (
    <Link href={`/plants/${plant.id}`}>
      <div
        className={`pixel-card p-3 flex flex-col items-center gap-2 cursor-pointer hover:bg-[#20203a] transition-colors h-full ${
          isDue ? "border-[#00ff87]" : ""
        } ${isOverdue ? "border-[#ff6b9d]" : ""}`}
      >
        <div className="w-full flex justify-end mb-[-16px] z-10">
          {isDue && (
            <span className="bg-[#00ff87] text-[#0d0d1a] text-[10px] font-heading px-1 py-0.5">
              DUE
            </span>
          )}
          {isOverdue && !isDue && (
            <span className="bg-[#ff6b9d] text-[#0d0d1a] text-[10px] font-heading px-1 py-0.5">
              LATE
            </span>
          )}
        </div>

        <PlantEmoticon style={plant.emoticonStyle} state={plant.state} size={64} />

        <div className="text-center w-full">
          <h3
            className="font-heading text-[10px] text-[#e8f4f8] truncate"
            title={plant.name}
          >
            {plant.name}
          </h3>
          <p className="font-sans text-sm text-[#556080] truncate mt-1">
            {plant.nextWaterDate
              ? isDue
                ? "Water today!"
                : `Next: ${format(new Date(plant.nextWaterDate), "MMM d")}`
              : `Every ${plant.frequencyDays}d`}
          </p>
        </div>

        <div className="w-full mt-1">
          <HistoryBar entries={history ?? []} compact />
        </div>
      </div>
    </Link>
  );
}
