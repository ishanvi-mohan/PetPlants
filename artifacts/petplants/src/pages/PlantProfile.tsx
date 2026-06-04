import React from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetPlant, useGetPlantHistory, useDeletePlant, getGetPlantsQueryKey, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import PlantEmoticon from "@/components/PlantEmoticon";
import HistoryBar from "@/components/HistoryBar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Edit2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function PlantProfile() {
  const { id } = useParams();
  const plantId = parseInt(id!);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: plant, isLoading: isLoadingPlant } = useGetPlant(plantId, { query: { enabled: !!plantId } });
  const { data: history, isLoading: isLoadingHistory } = useGetPlantHistory(plantId, { query: { enabled: !!plantId } });
  const deletePlant = useDeletePlant();

  if (isLoadingPlant) {
    return <div className="p-4"><Skeleton className="h-64 w-full rounded-none" /></div>;
  }

  if (!plant) return <div className="p-4">Plant not found</div>;

  const handleDelete = () => {
    deletePlant.mutate({ id: plantId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPlantsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        toast({ title: "Plant deleted" });
        setLocation("/plants");
      }
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mt-2">
        <button onClick={() => window.history.back()} className="text-[#556080] hover:text-[#e8f4f8]">
          &larr; BACK
        </button>
        <div className="flex gap-2">
          <Link href={`/plants/${plant.id}/edit`}>
            <button className="pixel-button bg-[#1a1a2e] text-[#6bcbff] border-[#6bcbff] p-2">
              <Edit2 size={16} />
            </button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="pixel-button bg-[#1a1a2e] text-[#ff6b9d] border-[#ff6b9d] p-2">
                <Trash2 size={16} />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-none">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-heading text-[#ff6b9d] text-sm">Compost Plant?</AlertDialogTitle>
                <AlertDialogDescription className="font-sans text-[#e8f4f8] text-lg">
                  This action cannot be undone. All XP earned from this plant will be kept.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-none font-sans text-lg">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="rounded-none font-sans text-lg bg-[#ff6b9d] text-[#0d0d1a] hover:bg-[#ff6b9d]/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex flex-col items-center py-8">
        <PlantEmoticon style={plant.emoticonStyle} state={plant.state} size={128} />
        <h1 className="font-heading text-xl mt-6">{plant.name}</h1>
        {plant.species && <p className="font-sans text-xl text-[#6bcbff] mt-2">{plant.species}</p>}
        
        <div className="mt-4 inline-flex items-center gap-2 bg-[#1a1a2e] px-4 py-2 border border-[#2a2a4a]">
          <span className="font-heading text-[10px] text-[#ffcc00]">TOTAL XP</span>
          <span className="font-sans text-2xl text-[#ffcc00]">{plant.totalXp}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="pixel-card p-4">
          <h3 className="font-heading text-[10px] text-[#556080] mb-2">WATERING</h3>
          <p className="font-sans text-2xl text-[#00ff87]">Every {plant.frequencyDays} days</p>
          {plant.waterAmount && <p className="font-sans text-[#e8f4f8] mt-1">{plant.waterAmount}</p>}
        </div>
        <div className="pixel-card p-4">
          <h3 className="font-heading text-[10px] text-[#556080] mb-2">NEXT DUE</h3>
          <p className="font-sans text-2xl text-[#e8f4f8]">
            {plant.nextWaterDate ? format(new Date(plant.nextWaterDate), "MMM d, yyyy") : "Unknown"}
          </p>
          {plant.dueToday && <p className="font-sans text-[#ff6b9d] mt-1">Due today!</p>}
        </div>
      </div>

      <div className="pixel-card p-4">
        <h3 className="font-heading text-[10px] text-[#556080] mb-4">10-DAY HISTORY</h3>
        {isLoadingHistory ? (
          <Skeleton className="h-12 w-full rounded-none" />
        ) : (
          <HistoryBar entries={history} compact={false} />
        )}
      </div>

      {plant.location && (
        <div className="pixel-card p-4 flex items-center gap-3">
          <div className="text-[#6bcbff]" style={{ fontSize: 20 }}>⌂</div>
          <div>
            <h3 className="font-heading text-[10px] text-[#556080] mb-1">LOCATION</h3>
            <p className="font-sans text-lg text-[#e8f4f8]">{plant.location}</p>
          </div>
        </div>
      )}

      {plant.notes && (
        <div className="pixel-card p-4">
          <h3 className="font-heading text-[10px] text-[#556080] mb-2">NOTES</h3>
          <p className="font-sans text-lg whitespace-pre-wrap">{plant.notes}</p>
        </div>
      )}
      
      <div className="h-8"></div>
    </div>
  );
}