import React from 'react';
import { Expense } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { Trash2, Calendar } from 'lucide-react';

interface ExpenseListProps {
    expenses: Expense[];
    onDelete: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
    // Sort by date descending
    const sortedExpenses = [...expenses].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt
    );

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (expenses.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No expenses yet</h3>
                <p className="text-slate-500 mt-1">Add a new expense to get started</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">Recent Transactions</h3>
                <span className="text-sm text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {expenses.length} total
                </span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto no-scrollbar">
                {sortedExpenses.map((expense) => (
                    <div key={expense.id} className="p-4 hover:bg-slate-50 transition-colors group flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                                style={{ backgroundColor: CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS] }}
                            >
                                {expense.category.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">{expense.description}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                    <span>{formatDate(expense.date)}</span>
                                    <span>•</span>
                                    <span>{expense.category}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-slate-900">
                                -{formatCurrency(expense.amount)}
                            </span>
                            <button 
                                onClick={() => onDelete(expense.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete expense"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};