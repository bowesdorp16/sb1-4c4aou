"use client";

import { useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMealAdded: () => void;
  initialValues?: {
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

interface FormData {
  name: string;
  description: string;
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export function AddMealDialog({
  open,
  onOpenChange,
  onMealAdded,
  initialValues
}: AddMealDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>({
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      date: new Date(),
      calories: initialValues?.calories || 0,
      protein: initialValues?.protein || 0,
      carbs: initialValues?.carbs || 0,
      fats: initialValues?.fats || 0,
    },
  });

  const analyzeMeal = async (description: string) => {
    if (!description.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) throw new Error("Failed to analyze meal");

      const analysis = await response.json();
      
      // Update form with analyzed values
      form.setValue("name", analysis.name);
      form.setValue("calories", analysis.calories);
      form.setValue("protein", analysis.protein);
      form.setValue("carbs", analysis.carbs);
      form.setValue("fats", analysis.fats);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Failed to analyze meal. You can enter values manually.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  async function onSubmit(data: FormData) {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("meals").insert({
        user_id: user.id,
        name: data.name,
        description: data.description,
        date: format(data.date, "yyyy-MM-dd"),
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fats: data.fats,
        active: true,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meal added successfully",
      });

      form.reset();
      onOpenChange(false);
      onMealAdded();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add meal",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-black tracking-tight">ADD NEW MEAL</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meal name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Enter meal description and ingredients"
                        {...field}
                        onBlur={(e) => {
                          field.onBlur();
                          analyzeMeal(e.target.value);
                        }}
                      />
                      {isAnalyzing && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing meal...
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbs (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fats (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Meal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}