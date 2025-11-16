import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Quiz = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  created_by: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Question = {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: string;
  order_number: number;
  created_at: string;
};

export type Option = {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_number: number;
};

export type QuizAttempt = {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  time_taken: number;
};

export type UserAnswer = {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
};
