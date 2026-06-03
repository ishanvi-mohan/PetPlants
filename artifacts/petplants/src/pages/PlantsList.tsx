import React from "react";
import { useGetPlants } from "@workspace/api-client-react";
import PlantCard from "@/components/PlantCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function PlantsList() {
  const { data: plants, isLoading } = useGetPlants();

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mt-2">
        <h1 className="font-heading text-lg">My Plants</h1>
        <Link href="/plants/new">
          <button className="pixel-button px-3 py-2 text-[#00ff87]">
            <span className="font-heading text-[10px]">+ NEW</span>
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-36 w-full rounded-none" />
          <Skeleton className="h-36 w-full rounded-none" />
          <Skeleton className="h-36 w-full rounded-none" />
          <Skeleton className="h-36 w-full rounded-none" />
        </div>
      ) : plants && plants.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {plants.map(plant => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      ) : (
        <div className="pixel-card p-8 text-center border-dashed mt-8">
          <p className="font-sans text-xl mb-4 text-[#556080]">No plants yet.</p>
          <Link href="/plants/new">
            <button className="pixel-button px-4 py-2 text-[#00ff87]">
              <span className="font-heading text-[10px]">ADD YOUR FIRST PLANT</span>
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}