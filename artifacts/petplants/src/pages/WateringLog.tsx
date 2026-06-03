import React, { useState } from "react";
import { useGetDashboard, useLogWatering, getGetDashboardQueryKey, getGetPlantsQueryKey, getGetStatsQueryKey, getGetPlantHistoryQueryKey, getGetPlantQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import PlantEmoticon from "@/components/PlantEmoticon";
import Confetti from "@/components/Confetti";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function WateringLog() {
  const { data: dashboard, isLoading } = useGetDashboard();
  const logWatering = useLogWatering();
  const queryClient = useQueryClient();
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [toastData, setToastData] = useState<{ xp: number, levelUp: boolean } | null>(null);

  if (isLoading) {
    return <div className="p-4"><Skeleton className="h-64 w-full rounded-none" /></div>;
  }

  if (!dashboard) return null;

  const duePlants = dashboard.plants.filter(p => p.dueToday);

  const handleLog = (plantId: number, status: "watered" | "postponed") => {
    logWatering.mutate(
      { data: { plantId, status } },
      {
        onSuccess: (result) => {
          // Optimistically update lists
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetPlantsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetPlantHistoryQueryKey(plantId) });
          queryClient.invalidateQueries({ queryKey: getGetPlantQueryKey(plantId) });
          
          if (status === "watered") {
            setShowConfetti(true);
            setToastData({ xp: result.xpAwarded, levelUp: result.leveledUp });
            setTimeout(() => {
              setShowConfetti(false);
              setToastData(null);
            }, 3000);
          }
        }
      }
    );
  };

  return (
    <div className="p-4 space-y-6 relative overflow-hidden">
      {showConfetti && <Confetti />}
      
      {toastData && (
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center animate-bounce-in">
          <div className="bg-[#1a1a2e] border-2 border-[#ffcc00] px-6 py-3 font-heading text-[#ffcc00] shadow-[0_0_20px_#ffcc00]">
            +{toastData.xp} XP
          </div>
          {toastData.levelUp && (
            <div className="mt-4 font-heading text-2xl text-[#00ff87] drop-shadow-[0_0_10px_#00ff87]">
              LEVEL UP!
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <h1 className="font-heading text-lg">Watering Log</h1>
        <span className="font-sans text-xl text-[#556080]">{format(new Date(), "MMM d")}</span>
      </div>

      <div className="flex justify-between items-center pixel-card p-4 border-[#6bcbff]">
        <div className="font-sans text-xl">
          Streak: <span className="text-[#ffcc00]">{dashboard.stats.currentStreak} days</span>
        </div>
        <div className="font-heading text-[10px] text-[#556080]">
          BEST: {dashboard.stats.longestStreak}
        </div>
      </div>

      {duePlants.length === 0 ? (
        <div className="pixel-card p-8 text-center flex flex-col items-center">
          <PlantEmoticon style="leafy" state="resting" size={80} />
          <h2 className="font-heading text-[#00ff87] mt-6 mb-2 text-sm">ALL DONE!</h2>
          <p className="font-sans text-xl text-[#556080]">Your plants are happy for today.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {duePlants.map(plant => (
            <div key={plant.id} className="pixel-card p-4 flex items-center gap-4">
              <div className="bg-[#0d0d1a] p-2 border border-[#2a2a4a]">
                <PlantEmoticon style={plant.emoticonStyle} state={plant.state} size={48} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-xs truncate mb-1">{plant.name}</h3>
                <p className="font-sans text-sm text-[#556080] truncate">
                  {plant.waterAmount ? plant.waterAmount : "Needs water"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleLog(plant.id, "watered")}
                  disabled={logWatering.isPending}
                  className="pixel-button bg-[#0d0d1a] border-[#00ff87] text-[#00ff87] px-3 py-2 flex items-center justify-center whitespace-nowrap"
                >
                  <span className="font-heading text-[8px]">WATER</span>
                </button>
                <button 
                  onClick={() => handleLog(plant.id, "postponed")}
                  disabled={logWatering.isPending}
                  className="pixel-button bg-[#0d0d1a] border-[#556080] text-[#556080] px-3 py-1 flex items-center justify-center whitespace-nowrap hover:bg-[#556080] hover:text-[#0d0d1a]"
                >
                  <span className="font-heading text-[8px]">SKIP</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}