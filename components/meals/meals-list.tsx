"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import type { Meal } from "@/types/database";

interface MealsListProps {
  meals: Meal[];
  isLoading: boolean;
  onMealArchived: () => void;
}

export function MealsList({ meals, isLoading, onMealArchived }: MealsListProps) {
  const { toast } = useToast();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  async function archiveMeal(id: string) {
    try {
      const { error } = await supabase
        .from("meals")
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meal archived successfully",
      });

      onMealArchived();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive meal",
      });
    }
  }

  if (isLoading) {
    return <div className="text-lg font-black tracking-tight">Loading meals...</div>;
  }

  if (meals.length === 0) {
    return (
      <Card className="border-primary/50">
        <CardContent className="p-8 text-center">
          <p className="text-lg font-black tracking-tight text-muted-foreground">
            NO MEALS RECORDED YET. START TRACKING YOUR GAINS!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {meals.map((meal) => (
          <Card key={meal.id} className="hover-lift border-primary/50">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-black tracking-tight">{meal.name}</CardTitle>
                  <CardDescription className="font-medium">
                    {format(new Date(meal.date), "PPP")}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSelectedMeal(meal)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Archive Meal</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to archive this meal? You can still access it in your meal history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => archiveMeal(meal.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Archive
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-medium">{meal.description}</p>
              <div className="mt-2 text-sm space-y-1">
                <div className="font-black tracking-tight">{meal.calories} KCAL</div>
                <div className="font-black tracking-tight">PROTEIN: {meal.protein}G</div>
                <div className="font-black tracking-tight">CARBS: {meal.carbs}G</div>
                <div className="font-black tracking-tight">FATS: {meal.fats}G</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-black tracking-tight">{selectedMeal?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-black tracking-tight mb-2">DATE</h3>
              <p>{selectedMeal && format(new Date(selectedMeal.date), "PPP")}</p>
            </div>
            <div>
              <h3 className="font-black tracking-tight mb-2">DESCRIPTION</h3>
              <p>{selectedMeal?.description}</p>
            </div>
            <div>
              <h3 className="font-black tracking-tight mb-2">NUTRITIONAL INFO</h3>
              <div className="space-y-1">
                <p>CALORIES: {selectedMeal?.calories} KCAL</p>
                <p>PROTEIN: {selectedMeal?.protein}G</p>
                <p>CARBS: {selectedMeal?.carbs}G</p>
                <p>FATS: {selectedMeal?.fats}G</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}