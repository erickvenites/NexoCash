export type ExpenseCategory =
  | 'alimentacao'
  | 'transporte'
  | 'lazer'
  | 'saude'
  | 'educacao'
  | 'moradia'
  | 'outros';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  household_id: string;
  created_by: string;
  receipt_url?: string;
  created_at: string;
}

export interface ExpenseFormData {
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

export interface Household {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface RecurringExpense {
  id: string;
  household_id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  day_of_month: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface BudgetGoal {
  id: string;
  household_id: string;
  category: ExpenseCategory;
  monthly_limit: number;
  created_at: string;
}