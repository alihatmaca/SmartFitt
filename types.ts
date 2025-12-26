export enum Screen {
  DASHBOARD = 'DASHBOARD',
  TRACKER = 'TRACKER',
  KNOWLEDGE_HUB = 'KNOWLEDGE_HUB',
  AI_COACH = 'AI_COACH',
  PROFILE = 'PROFILE',
  SUBSCRIPTION = 'SUBSCRIPTION'
}

export interface WorkoutLog {
  id: string;
  date: string;
  exercise: string;
  weight: number;
  reps: number;
  rpe?: number;
}

export interface UserProfile {
  name: string;
  level: string; // e.g., "Intermediate Lifter"
  goal: string; // e.g., "Hypertrophy"
  subscription: string;
}

export interface Article {
  id: string;
  title: string;
  authors: string;
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}