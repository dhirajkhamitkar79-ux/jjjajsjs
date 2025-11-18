import React, { useMemo } from 'react';
import { Expense, CategorySummary } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';

interface DashboardProps {
    expenses: Expense[];
}

export const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
    const totalSpent = useMemo(() => 
        expenses.reduce((sum, item) => sum + item.amount, 0), 
        [expenses]
    );

    const categoryData: CategorySummary[] = useMemo(() => {
        const map = new Map<string, number>();
        expenses.forEach(e => {
            map.set(e.category, (map.get(e.category) || 0) + e.amount);
        });
        return Array.from(map.entries()).map(([name, value]) => ({
            name,
            value,
            color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || '#cbd5e1'
        })).sort((a, b) => b.value - a.value);
    }, [expenses]);

    const dailyData = useMemo(() => {
        const map = new Map<string, number>();
        // Get last 7 days including today
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            map.set(dateStr, 0);
        }
        
        expenses.forEach(e => {
             if (map.has(e.date)) {
                 map.set(e.date, (map.get(e.date) || 0) + e.amount);
             }
        });

        return Array.from(map.entries()).map(([date, total]) => ({
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            total
        }));
    }, [expenses]);

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    return (
        <div className="space-y-6">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <DollarSign className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-xs font-medium text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">Total Spent</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">{formatCurrency(totalSpent)}</h2>
                    <p className="text-sm text-slate-400 mt-1">Lifetime expenses</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                         <div className="p-2 bg-blue-50 rounded-lg">
                            <CreditCard className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Transactions</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">{expenses.length}</h2>
                    <p className="text-sm text-slate-500 mt-1">Total records tracked</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                         <div className="p-2 bg-purple-50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-purple-500" />
                        </div>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Avg. Transaction</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">
                        {formatCurrency(expenses.length ? totalSpent / expenses.length : 0)}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Per recorded expense</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Spending by Category</h3>
                    <div className="h-64 w-full relative">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                                No data available yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Weekly Trend Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Last 7 Days Activity</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    formatter={(value: number) => [formatCurrency(value), 'Spent']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};