import { ExpenseCategory } from './types';

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Food]: '#10b981', // Emerald 500
  [ExpenseCategory.Transport]: '#3b82f6', // Blue 500
  [ExpenseCategory.Shopping]: '#f59e0b', // Amber 500
  [ExpenseCategory.Utilities]: '#6366f1', // Indigo 500
  [ExpenseCategory.Entertainment]: '#ec4899', // Pink 500
  [ExpenseCategory.Health]: '#ef4444', // Red 500
  [ExpenseCategory.Housing]: '#8b5cf6', // Violet 500
  [ExpenseCategory.Other]: '#64748b', // Slate 500
};

export const CATEGORIES = Object.values(ExpenseCategory);
