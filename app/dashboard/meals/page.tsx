"use client";

import { useState, useEffect } from "react";
import { Plus, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { AddMealDialog } from "@/components/meals/add-meal-dialog";
import { ScanMealDialog } from "@/components/meals/scan-meal-dialog";
import { MealsList } from "@/components/meals/meals-list";
import { WeeklyOverview } from "@/components/meals/weekly-overview";
import type { Meal } from "@/types/database";

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scannedMealData, setScannedMealData] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMeals();
  }, []);

  async function fetchMeals() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("date", { ascending: false });

      if (error) throw error;
      setMeals(data || []);
    } catch (error) {
      console.error('Error fetching meals:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load meals. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleScanComplete = (analysis: any) => {
    setScannedMealData(analysis);
    setIsScanDialogOpen(false);
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tighter">TRACK YOUR GAINS</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsScanDialogOpen(true)}
            className="hover-lift"
          >
            <Camera className="mr-2 h-4 w-4" />
            Scan Meal
          </Button>
          <Button 
            onClick={() => {
              setScannedMealData(null);
              setIsAddDialogOpen(true);
            }}
            className="hover-lift"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Meal
          </Button>
        </div>
      </div>

      <WeeklyOverview meals={meals} />

      <Separator className="my-8" />

      <div className="space-y-4">
        <h2 className="text-2xl font-black tracking-tighter">MEAL LOG</h2>
        <MealsList 
          meals={meals} 
          isLoading={isLoading} 
          onMealArchived={fetchMeals} 
        />
      </div>

      <AddMealDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onMealAdded={fetchMeals}
        initialValues={scannedMealData}
      />

      <ScanMealDialog
        open={isScanDialogOpen}
        onOpenChange={setIsScanDialogOpen}
        onScanComplete={handleScanComplete}
      />
    </div>
  );
}