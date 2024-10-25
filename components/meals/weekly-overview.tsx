"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { Meal } from "@/types/database";

interface WeeklyOverviewProps {
  meals: Meal[];
}

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealCount: number;
}

interface DailyTarget {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export function WeeklyOverview({ meals }: WeeklyOverviewProps) {
  const [dailyTarget, setDailyTarget] = useState<DailyTarget | null>(null);

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
        setDailyTarget({
          calories: data.target_calories,
          protein: data.target_protein,
          carbs: data.target_carbs,
          fats: data.target_fats
        });
      }
    }

    fetchTargets();
  }, []);

  function calculateProgress(current: number, target: number): number {
    if (!target) return 0;
    const progress = (current / target) * 100;
    return Math.min(progress, 100);
  }

  function getProgressColor(progress: number): string {
    if (progress < 70) return "bg-red-500/20";
    if (progress < 90) return "bg-yellow-500/20";
    if (progress <= 110) return "bg-green-500/20";
    return "bg-red-500/20";
  }

  function getTextColor(progress: number): string {
    if (progress < 70) return "text-red-500";
    if (progress < 90) return "text-yellow-500";
    if (progress <= 110) return "text-green-500";
    return "text-red-500";
  }

  if (!dailyTarget) return null;

  // Get the current week's date range
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start from Monday
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start, end });

  // Calculate totals for each day
  const dailyTotals = weekDays.map(day => {
    const dayMeals = meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return (
        mealDate.getDate() === day.getDate() &&
        mealDate.getMonth() === day.getMonth() &&
        mealDate.getFullYear() === day.getFullYear()
      );
    });

    return {
      date: day,
      totals: dayMeals.reduce((acc, meal) => ({
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
      })
    };
  });

  return (
    <div className="space-y-8">
      {/* Weekly Overview */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="font-black tracking-tighter">WEEKLY OVERVIEW</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {dailyTotals.map(({ date, totals }) => {
              const calorieProgress = calculateProgress(totals.calories, dailyTarget.calories);
              const proteinProgress = calculateProgress(totals.protein, dailyTarget.protein);
              const carbsProgress = calculateProgress(totals.carbs, dailyTarget.carbs);
              const fatsProgress = calculateProgress(totals.fats, dailyTarget.fats);

              return (
                <div 
                  key={date.toISOString()}
                  className={cn(
                    "p-3 border border-primary/50",
                    isToday(date) && "ring-2 ring-primary"
                  )}
                >
                  <div className="text-sm font-black tracking-tighter mb-2">
                    {format(date, "EEE").toUpperCase()}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>CALORIES</span>
                        <span className={getTextColor(calorieProgress)}>
                          {totals.calories}/{dailyTarget.calories}
                        </span>
                      </div>
                      <Progress value={calorieProgress} className="h-1" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>PROTEIN</span>
                        <span className={getTextColor(proteinProgress)}>
                          {totals.protein.toFixed(1)}/{dailyTarget.protein}g
                        </span>
                      </div>
                      <Progress value={proteinProgress} className="h-1" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>CARBS</span>
                        <span className={getTextColor(carbsProgress)}>
                          {totals.carbs.toFixed(1)}/{dailyTarget.carbs}g
                        </span>
                      </div>
                      <Progress value={carbsProgress} className="h-1" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>FATS</span>
                        <span className={getTextColor(fatsProgress)}>
                          {totals.fats.toFixed(1)}/{dailyTarget.fats}g
                        </span>
                      </div>
                      <Progress value={fatsProgress} className="h-1" />
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground mt-2">
                    {totals.mealCount} meals
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Progress */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="font-black tracking-tighter">TODAY'S PROGRESS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-black tracking-tight">CALORIES</span>
                <span className="text-sm text-muted-foreground">
                  {dailyTotals.find(d => isToday(d.date))?.totals.calories || 0} / {dailyTarget.calories} kcal
                </span>
              </div>
              <Progress 
                value={calculateProgress(
                  dailyTotals.find(d => isToday(d.date))?.totals.calories || 0,
                  dailyTarget.calories
                )} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-black tracking-tight">PROTEIN</span>
                <span className="text-sm text-muted-foreground">
                  {(dailyTotals.find(d => isToday(d.date))?.totals.protein || 0).toFixed(1)} / {dailyTarget.protein} g
                </span>
              </div>
              <Progress 
                value={calculateProgress(
                  dailyTotals.find(d => isToday(d.date))?.totals.protein || 0,
                  dailyTarget.protein
                )} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-black tracking-tight">CARBS</span>
                <span className="text-sm text-muted-foreground">
                  {(dailyTotals.find(d => isToday(d.date))?.totals.carbs || 0).toFixed(1)} / {dailyTarget.carbs} g
                </span>
              </div>
              <Progress 
                value={calculateProgress(
                  dailyTotals.find(d => isToday(d.date))?.totals.carbs || 0,
                  dailyTarget.carbs
                )} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-black tracking-tight">FATS</span>
                <span className="text-sm text-muted-foreground">
                  {(dailyTotals.find(d => isToday(d.date))?.totals.fats || 0).toFixed(1)} / {dailyTarget.fats} g
                </span>
              </div>
              <Progress 
                value={calculateProgress(
                  dailyTotals.find(d => isToday(d.date))?.totals.fats || 0,
                  dailyTarget.fats
                )} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}