export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO 8601 format: YYYY-MM-DD
  createdAt: number;
}

export enum ExpenseCategory {
  Food = 'Food',
  Transport = 'Transport',
  Shopping = 'Shopping',
  Utilities = 'Utilities',
  Entertainment = 'Entertainment',
  Health = 'Health',
  Housing = 'Housing',
  Other = 'Other'
}

export interface DailySummary {
  date: string;
  total: number;
}

export interface CategorySummary {
  name: string;
  value: number;
  color: string;
}