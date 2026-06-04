import React, { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetPlant, useCreatePlant, useUpdatePlant, getGetPlantsQueryKey, getGetDashboardQueryKey, getGetPlantQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PlantEmoticon from "@/components/PlantEmoticon";
import { useToast } from "@/hooks/use-toast";
import type { EmoticonStyle } from "@workspace/api-client-react/src/generated/api.schemas";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.string().optional(),
  frequencyDays: z.coerce.number().min(1, "Must be at least 1 day"),
  waterAmount: z.string().optional(),
  notes: z.string().optional(),
  emoticonStyle: z.enum(["leafy", "succulent", "flower", "herb"] as const),
});

export default function PlantForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const isEditing = !!params.id && params.id !== "new";
  const plantId = isEditing ? parseInt(params.id!) : undefined;
  
  const { data: existingPlant, isLoading: isLoadingPlant } = useGetPlant(plantId!, { query: { enabled: isEditing, queryKey: getGetPlantQueryKey(plantId!) } });
  
  const createPlant = useCreatePlant();
  const updatePlant = useUpdatePlant();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      species: "",
      frequencyDays: 7,
      waterAmount: "",
      notes: "",
      emoticonStyle: "leafy",
    },
  });

  useEffect(() => {
    if (existingPlant) {
      form.reset({
        name: existingPlant.name,
        species: existingPlant.species || "",
        frequencyDays: existingPlant.frequencyDays,
        waterAmount: existingPlant.waterAmount || "",
        notes: existingPlant.notes || "",
        emoticonStyle: existingPlant.emoticonStyle,
      });
    }
  }, [existingPlant, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isEditing && plantId) {
      updatePlant.mutate(
        { id: plantId, data: values },
        {
          onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: getGetPlantsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetPlantQueryKey(plantId) });
            toast({ title: "Plant updated!" });
            setLocation(`/plants/${updated.id}`);
          },
        }
      );
    } else {
      createPlant.mutate(
        { data: values },
        {
          onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: getGetPlantsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
            toast({ title: "Plant created!", description: `+${result.xpAwarded} XP` });
            setLocation(`/plants/${result.plant.id}`);
          },
        }
      );
    }
  };

  const emoticonOptions: EmoticonStyle[] = ["leafy", "succulent", "flower", "herb"];

  if (isEditing && isLoadingPlant) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4 mt-2">
        <button onClick={() => window.history.back()} className="text-[#556080] hover:text-[#e8f4f8]">
          &larr; BACK
        </button>
        <h1 className="font-heading text-lg">{isEditing ? "Edit Plant" : "New Plant"}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="emoticonStyle"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-heading text-[10px] text-[#556080]">CHOOSE AVATAR</FormLabel>
                <FormControl>
                  <div className="flex justify-between gap-2">
                    {emoticonOptions.map(style => {
                      const selected = field.value === style;
                      return (
                        <div
                          key={style}
                          onClick={() => field.onChange(style)}
                          className="pixel-card flex-1 flex flex-col items-center justify-center p-2 cursor-pointer transition-all relative"
                          style={selected ? {
                            borderColor: "#00ff87",
                            boxShadow: "0 0 0 2px #00ff87, 0 0 12px #00ff87",
                            background: "#0d2e1f",
                          } : {}}
                        >
                          <PlantEmoticon style={style} state="happy" size={48} />
                          <span className="font-heading mt-1" style={{ fontSize: 7, color: selected ? "#00ff87" : "#556080" }}>
                            {style.toUpperCase()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage className="text-[#ff6b9d] font-sans" />
              </FormItem>
            )}
          />

          <div className="pixel-card p-4 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-heading text-[10px] text-[#556080]">NAME *</FormLabel>
                  <FormControl>
                    <Input {...field} className="pixel-input text-lg font-sans" placeholder="e.g. Fernie" />
                  </FormControl>
                  <FormMessage className="text-[#ff6b9d] font-sans text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="species"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-heading text-[10px] text-[#556080]">SPECIES</FormLabel>
                  <FormControl>
                    <Input {...field} className="pixel-input text-lg font-sans" placeholder="e.g. Boston Fern" />
                  </FormControl>
                  <FormMessage className="text-[#ff6b9d] font-sans text-sm" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequencyDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-heading text-[10px] text-[#556080]">WATER EVERY (DAYS) *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="pixel-input text-lg font-sans" />
                    </FormControl>
                    <FormMessage className="text-[#ff6b9d] font-sans text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="waterAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-heading text-[10px] text-[#556080]">AMOUNT</FormLabel>
                    <FormControl>
                      <Input {...field} className="pixel-input text-lg font-sans" placeholder="e.g. 1/2 cup" />
                    </FormControl>
                    <FormMessage className="text-[#ff6b9d] font-sans text-sm" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-heading text-[10px] text-[#556080]">NOTES</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="pixel-input text-lg font-sans min-h-[80px]" placeholder="Needs indirect light..." />
                  </FormControl>
                  <FormMessage className="text-[#ff6b9d] font-sans text-sm" />
                </FormItem>
              )}
            />
          </div>

          <button 
            type="submit" 
            disabled={createPlant.isPending || updatePlant.isPending}
            className="pixel-button w-full py-4 text-[#00ff87] bg-[#1a1a2e] flex justify-center items-center"
          >
            <span className="font-heading text-xs">
              {isEditing ? "SAVE CHANGES" : "PLANT IT!"}
            </span>
          </button>
        </form>
      </Form>
    </div>
  );
}