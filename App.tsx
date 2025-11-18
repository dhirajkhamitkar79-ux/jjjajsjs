import React, { useState, useEffect } from 'react';
import { Expense } from './types';
import { Dashboard } from './components/Dashboard';
import { AddExpense } from './components/AddExpense';
import { ExpenseList } from './components/ExpenseList';
import { Wallet } from 'lucide-react';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('gemini-expenses');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gemini-expenses', JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (data: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg text-white shadow-md">
                <Wallet className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              Gemini Smart Spend
            </h1>
          </div>
          <div className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full hidden sm:block">
              Powered by Google Gemini 2.5
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Dashboard (2/3 width on large screens) */}
          <div className="lg:col-span-2 space-y-8">
            <Dashboard expenses={expenses} />
            <div className="hidden lg:block">
               <ExpenseList expenses={expenses} onDelete={deleteExpense} />
            </div>
          </div>

          {/* Right Column: Add Form & Mobile List (1/3 width on large screens) */}
          <div className="lg:col-span-1 space-y-8">
            <div className="sticky top-24">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    Add Transaction
                </h2>
                <AddExpense onAdd={addExpense} />
                
                {/* Show list here on mobile only */}
                <div className="lg:hidden mt-8">
                   <ExpenseList expenses={expenses} onDelete={deleteExpense} />
                </div>

                {/* Info Card */}
                <div className="mt-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-2">AI Insights</h3>
                    <p className="text-indigo-100 text-sm leading-relaxed">
                        Use the "AI Text" tab to describe expenses naturally, or "Receipt" to scan images. 
                        Gemini 2.5 Flash automatically categorizes your spending habits.
                    </p>
                </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;