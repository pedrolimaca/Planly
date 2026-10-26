// Planly Type Definitions

// ============================================================
// Core Types
// ============================================================

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type EventCategory = 'personal' | 'work' | 'health' | 'study' | 'spiritual' | 'fitness' | 'finance' | 'food' | 'other';
export type FinanceType = 'income' | 'expense';
export type FinanceStatus = 'pending' | 'paid' | 'received' | 'overdue';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
export type ReminderStatus = 'active' | 'snoozed' | 'completed' | 'dismissed';
export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'supper' | 'custom';
export type Theme = 'light' | 'dark';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  timezone: string;
  date_format: string;
  first_day_of_week: number;
  day_start_hour: number;
  day_end_hour: number;
  theme: Theme;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Tasks
// ============================================================

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: EventCategory;
  priority: Priority;
  status: TaskStatus;
  due_date?: string;
  due_time?: string;
  start_date?: string;
  estimated_minutes?: number;
  actual_minutes?: number;
  tags: string[];
  recurrence?: RecurrenceType;
  recurrence_config?: Record<string, unknown>;
  parent_task_id?: string;
  notes?: string;
  order_index: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  order_index: number;
  created_at: string;
}

// ============================================================
// Events / Calendar
// ============================================================

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: EventCategory;
  start_date: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  all_day: boolean;
  location?: string;
  priority: Priority;
  recurrence?: RecurrenceType;
  recurrence_config?: Record<string, unknown>;
  color?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Reminders
// ============================================================

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  message?: string;
  category: EventCategory;
  date: string;
  time: string;
  priority: Priority;
  status: ReminderStatus;
  advance_minutes?: number;
  recurrence?: RecurrenceType;
  recurrence_config?: Record<string, unknown>;
  related_type?: 'task' | 'event' | 'finance' | 'habit';
  related_id?: string;
  snoozed_until?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Finance
// ============================================================

export interface FinanceEntry {
  id: string;
  user_id: string;
  description: string;
  type: FinanceType;
  category: string;
  amount: number;
  date: string;
  due_date?: string;
  status: FinanceStatus;
  payment_method?: string;
  recurrence?: RecurrenceType;
  recurrence_config?: Record<string, unknown>;
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  month: string; // YYYY-MM
  amount: number;
  created_at: string;
}

export const FINANCE_CATEGORIES = [
  'Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Academia',
  'Educação', 'Assinaturas', 'Lazer', 'Igreja e doações',
  'Compras pessoais', 'Salário e renda', 'Outros'
] as const;

export const PAYMENT_METHODS = [
  'Dinheiro', 'Cartão de crédito', 'Cartão de débito', 'PIX',
  'Transferência', 'Boleto', 'Outro'
] as const;

// ============================================================
// Habits
// ============================================================

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: EventCategory;
  frequency: 'daily' | 'weekly' | 'custom';
  days_of_week?: number[];
  target_time?: string;
  daily_goal?: number;
  weekly_goal?: number;
  start_date: string;
  end_date?: string;
  color?: string;
  icon?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  value?: number;
  notes?: string;
  created_at: string;
}

// ============================================================
// Gym / Fitness
// ============================================================

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  muscle_groups: string[];
  exercises: WorkoutExercise[];
  duration_minutes?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  rest_seconds?: number;
  notes?: string;
  order_index: number;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_id?: string;
  date: string;
  duration_minutes?: number;
  notes?: string;
  exercises: WorkoutLogExercise[];
  created_at: string;
}

export interface WorkoutLogExercise {
  exercise_name: string;
  sets_completed: number;
  reps_completed: string;
  weight_used?: number;
}

// ============================================================
// Health
// ============================================================

export interface HealthRecord {
  id: string;
  user_id: string;
  type: 'appointment' | 'exam' | 'medication' | 'vaccine' | 'sleep' | 'water' | 'note';
  title: string;
  description?: string;
  date: string;
  time?: string;
  doctor?: string;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  private_notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Nutrition
// ============================================================

export interface Meal {
  id: string;
  user_id: string;
  type: MealType;
  custom_name?: string;
  date: string;
  time?: string;
  foods: MealFood[];
  completed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MealFood {
  name: string;
  quantity?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

// ============================================================
// Spiritual
// ============================================================

export interface SpiritualActivity {
  id: string;
  user_id: string;
  type: 'prayer' | 'reading' | 'rosary' | 'adoration' | 'meditation' | 'mass' | 'confession' | 'journal' | 'intention' | 'other';
  title: string;
  description?: string;
  date: string;
  time?: string;
  duration_minutes?: number;
  bible_reference?: string;
  completed: boolean;
  private: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Studies & Work
// ============================================================

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'study' | 'work' | 'personal';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: Priority;
  start_date?: string;
  due_date?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Goals
// ============================================================

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  area: string;
  priority: Priority;
  status: GoalStatus;
  due_date?: string;
  motivation?: string;
  progress: number;
  progress_type: 'manual' | 'tasks';
  milestones: GoalMilestone[];
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  order_index: number;
}

export const GOAL_AREAS = [
  'Carreira', 'Estudos', 'Finanças', 'Saúde', 'Espiritualidade',
  'Desenvolvimento pessoal', 'Relacionamentos', 'Projetos pessoais',
  'Viagens', 'Outros'
] as const;

// ============================================================
// Notes
// ============================================================

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category?: EventCategory;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Notifications
// ============================================================

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  related_type?: string;
  related_id?: string;
  created_at: string;
}

// ============================================================
// Toast
// ============================================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// ============================================================
// Quick Create
// ============================================================

export type QuickCreateType = 'task' | 'event' | 'reminder' | 'finance' | 'habit' | 'goal' | 'note';
