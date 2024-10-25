"use client";

import { useState, useEffect } from "react";
import { startOfWeek, eachDayOfInterval, format, isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { Meal } from "@/types/database";

interface WeeklyProgressGraphProps {
  meals: Meal[];
}

interface WeeklyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealCount: number;
}

interface WeeklyTarget {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export function WeeklyProgressGraph({ meals }: WeeklyProgressGraphProps) {
  const [weeklyTarget, setWeeklyTarget] = useState<WeeklyTarget | null>(null);

  useEffect(() => {
    async function fetchTargets() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('target_calories, target_protein, target_carbs, target_fats')
        .eq('id', user.id)
        .single();

      if (data) {
        // Multiply daily targets by 7 for weekly targets
        setWeeklyTarget({
          calories: (data.target_calories || 0) * 7,
          protein: (data.target_protein || 0) * 7,
          carbs: (data.target_carbs || 0) * 7,
          fats: (data.target_fats || 0) * 7
        });
      }
    }

    fetchTargets();
  }, []);

  if (!weeklyTarget) return null;

  // Get current week's dates
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start,
    end: new Date(),
  });

  // Calculate weekly totals
  const weeklyTotals = meals.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    fats: acc.fats + (meal.fats || 0),
    mealCount: acc.mealCount + 1
  }), {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    mealCount: 0
  });

  const calculateProgress = (current: number, target: number): number => {
    if (!target) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (progress: number): string => {
    if (progress < 70) return "text-red-500";
    if (progress < 90) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="font-black tracking-tighter">THIS WEEK'S PROGRESS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-black tracking-tight">CALORIES</span>
              <span className={cn(
                "text-sm",
                getProgressColor(calculateProgress(weeklyTotals.calories, weeklyTarget.calories))
              )}>
                {weeklyTotals.calories} / {weeklyTarget.calories} kcal
              </span>
            </div>
            <Progress 
              value={calculateProgress(weeklyTotals.calories, weeklyTarget.calories)} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-black tracking-tight">PROTEIN</span>
              <span className={cn(
                "text-sm",
                getProgressColor(calculateProgress(weeklyTotals.protein, weeklyTarget.protein))
              )}>
                {weeklyTotals.protein.toFixed(1)} / {weeklyTarget.protein} g
              </span>
            </div>
            <Progress 
              value={calculateProgress(weeklyTotals.protein, weeklyTarget.protein)} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-black tracking-tight">CARBS</span>
              <span className={cn(
                "text-sm",
                getProgressColor(calculateProgress(weeklyTotals.carbs, weeklyTarget.carbs))
              )}>
                {weeklyTotals.carbs.toFixed(1)} / {weeklyTarget.carbs} g
              </span>
            </div>
            <Progress 
              value={calculateProgress(weeklyTotals.carbs, weeklyTarget.carbs)} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-black tracking-tight">FATS</span>
              <span className={cn(
                "text-sm",
                getProgressColor(calculateProgress(weeklyTotals.fats, weeklyTarget.fats))
              )}>
                {weeklyTotals.fats.toFixed(1)} / {weeklyTarget.fats} g
              </span>
            </div>
            <Progress 
              value={calculateProgress(weeklyTotals.fats, weeklyTarget.fats)} 
              className="h-2"
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center">
          Total meals this week: {weeklyTotals.mealCount}
        </div>
      </CardContent>
    </Card>
  );
}