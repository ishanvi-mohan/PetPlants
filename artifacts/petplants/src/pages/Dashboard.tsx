import React from "react";
import { useGetDashboard } from "@workspace/api-client-react";
import LevelBanner from "@/components/LevelBanner";
import PlantCard from "@/components/PlantCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Droplets } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <Skeleton className="h-28 w-full rounded-none" />
        <Skeleton className="h-12 w-full rounded-none" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-36 w-full rounded-none" />
          <Skeleton className="h-36 w-full rounded-none" />
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  // Sort plants: due today first, then overdue, then others
  const sortedPlants = [...dashboard.plants].sort((a, b) => {
    if (a.dueToday && !b.dueToday) return -1;
    if (!a.dueToday && b.dueToday) return 1;
    return 0;
  });

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mt-2">
        <h1 className="font-heading text-lg">Dashboard</h1>
      </div>

      <LevelBanner stats={dashboard.stats} />

      <div className="pixel-card p-4 flex items-center justify-between border-l-4 border-l-[#00ff87]">
        <div>
          <h3 className="font-sans text-xl text-[#00ff87]">Today's Tasks</h3>
          <p className="font-sans text-[#e8f4f8]">
            {dashboard.summary.plantsDueCount === 0 
              ? "All plants watered!" 
              : `${dashboard.summary.plantsDueCount} plants need water`}
          </p>
        </div>
        {dashboard.summary.plantsDueCount > 0 && (
          <Link href="/log">
            <button className="pixel-button bg-[#0d0d1a] px-3 py-2 flex items-center gap-2">
              <Droplets size={16} />
              <span className="font-heading text-[10px]">WATER</span>
            </button>
          </Link>
        )}
      </div>

      <div>
        <h2 className="font-heading text-sm text-[#556080] mb-4">Your Garden</h2>
        {sortedPlants.length === 0 ? (
          <div className="pixel-card p-8 text-center border-dashed">
            <p className="font-sans text-xl mb-4 text-[#556080]">Your garden is empty.</p>
            <Link href="/plants/new">
              <button className="pixel-button px-4 py-2 text-[#00ff87]">
                <span className="font-heading text-[10px]">+ ADD PLANT</span>
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {sortedPlants.map(plant => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}