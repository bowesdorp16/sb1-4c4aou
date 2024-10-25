export interface UserProfile {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  goal: 'lean_bulk' | 'mass_gain' | 'strength' | null;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active' | null;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fats: number;
  tokens: number;
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  description: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  analysis: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  user_id: string;
  remarks: string;
  ai_response: string;
  created_at: string;
}

export interface TokenPurchase {
  id: string;
  user_id: string;
  amount: number;
  tokens: number;
  status: 'pending' | 'completed' | 'failed';
  payment_intent_id: string;
  created_at: string;
}