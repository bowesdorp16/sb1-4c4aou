"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Scale,
  Brain,
  Trophy,
  Ruler,
  Weight,
  Calendar,
  Target
} from "lucide-react";
import { WeeklyProgressGraph } from "@/components/dashboard/weekly-progress-graph";
import { supabase } from "@/lib/supabase";
import type { Meal, UserProfile } from "@/types/database";

export default function Dashboard() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch meals
      const { data: mealsData } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .gte("date", new Date(new Date().setDate(new Date().getDate() - 7)).toISOString())
        .order("date", { ascending: false });

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (mealsData) setMeals(mealsData);
      if (profileData) setProfile(profileData);
    }

    fetchData();
  }, []);

  const goalLabels = {
    lean_bulk: "Lean Bulk",
    mass_gain: "Mass Gain",
    strength: "Strength Focus"
  };

  const activityLabels = {
    sedentary: "Sedentary",
    light: "Light Activity",
    moderate: "Moderate Activity",
    very_active: "Very Active",
    extra_active: "Extra Active"
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Welcome to BulkBlitz</h1>
        <p className="text-muted-foreground">Track your nutrition, hit your macros, and maximize your gains</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Weight className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-black tracking-tight">WEIGHT</p>
                <p className="text-2xl font-black tracking-tight">{profile?.weight}kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Ruler className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-black tracking-tight">HEIGHT</p>
                <p className="text-2xl font-black tracking-tight">{profile?.height}cm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-black tracking-tight">AGE</p>
                <p className="text-2xl font-black tracking-tight">{profile?.age} years</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-black tracking-tight">GOAL</p>
                <p className="text-2xl font-black tracking-tight">
                  {profile?.goal ? goalLabels[profile.goal] : "Not Set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Graph */}
      <WeeklyProgressGraph meals={meals} />
      
      {/* Action Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="sci-fi-card p-6 space-y-4 border-primary/50">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-full bg-primary/10">
              <Scale className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter">LOG YOUR MEALS</h2>
              <p className="text-muted-foreground">Track every meal to ensure you're hitting your caloric surplus and protein goals</p>
            </div>
          </div>
          <Button asChild className="w-full hover-lift">
            <Link href="/dashboard/meals">Add New Meal</Link>
          </Button>
        </div>

        <div className="sci-fi-card p-6 space-y-4 border-primary/50">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-full bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter">GET EXPERT ANALYSIS</h2>
              <p className="text-muted-foreground">Receive personalized insights on your nutrition and recommendations for optimal muscle growth</p>
            </div>
          </div>
          <Button asChild className="w-full hover-lift">
            <Link href="/dashboard/consultation">Get Analysis</Link>
          </Button>
        </div>

        <div className="sci-fi-card p-6 space-y-4 border-primary/50">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-full bg-primary/10">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter">UPDATE GOALS</h2>
              <p className="text-muted-foreground">Adjust your targets as you progress and ensure your nutrition aligns with your muscle-building goals</p>
            </div>
          </div>
          <Button asChild className="w-full hover-lift">
            <Link href="/dashboard/profile">Adjust Goals</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}