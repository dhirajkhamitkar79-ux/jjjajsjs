import React, { useState, useRef } from 'react';
import { CATEGORIES } from '../constants';
import { ExpenseCategory } from '../types';
import { parseExpenseFromText, parseExpenseFromImage } from '../services/geminiService';
import { Plus, Mic, Image as ImageIcon, Type, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface AddExpenseProps {
    onAdd: (expenseData: any) => void;
}

type InputMode = 'manual' | 'text' | 'image';

export const AddExpense: React.FC<AddExpenseProps> = ({ onAdd }) => {
    const [mode, setMode] = useState<InputMode>('manual');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Manual Form State
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.Food);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');

    // NLP State
    const [nlpText, setNlpText] = useState('');

    // File Input Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setAmount('');
        setDescription('');
        setCategory(ExpenseCategory.Food);
        setDate(new Date().toISOString().split('T')[0]);
        setNlpText('');
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description) return;
        onAdd({
            amount: parseFloat(amount),
            category,
            date,
            description
        });
        resetForm();
    };

    const handleNlpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nlpText.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const result = await parseExpenseFromText(nlpText);
            onAdd({
                amount: result.amount,
                category: result.category,
                date: result.date || new Date().toISOString().split('T')[0],
                description: result.description
            });
            setNlpText('');
        } catch (err) {
            setError("Failed to parse text. Please try again or use manual entry.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);

        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64Data = base64String.split(',')[1];
                const mimeType = file.type;

                try {
                    const result = await parseExpenseFromImage(base64Data, mimeType);
                    onAdd({
                        amount: result.amount,
                        category: result.category,
                        date: result.date || new Date().toISOString().split('T')[0],
                        description: result.description
                    });
                    // Don't reset immediately so user sees it worked, maybe show toast?
                    // For now, just clearing input handled by logic flow
                } catch (apiError) {
                    setError("Failed to analyze receipt. Please try again.");
                } finally {
                    setIsLoading(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setError("Error reading file.");
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex border-b border-slate-100">
                <button
                    onClick={() => setMode('manual')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'manual' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Plus className="w-4 h-4" /> Manual
                </button>
                <button
                    onClick={() => setMode('text')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'text' ? 'text-purple-600 bg-purple-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Type className="w-4 h-4" /> AI Text
                </button>
                <button
                    onClick={() => setMode('image')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'image' ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <ImageIcon className="w-4 h-4" /> Receipt
                </button>
            </div>

            <div className="p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {mode === 'manual' && (
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <input
                                type="text"
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Lunch at Subway"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-400">₹</span>
                                    <input
                                        type="number"
                                        required
                                        min="0.01"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-7 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add Expense
                        </button>
                    </form>
                )}

                {mode === 'text' && (
                    <form onSubmit={handleNlpSubmit} className="space-y-4">
                         <div className="bg-purple-50 p-4 rounded-lg mb-4">
                            <p className="text-sm text-purple-800">
                                <strong className="font-semibold">Tip:</strong> Try typing something like "Spent ₹500 on lunch today" or "Uber ride for ₹250 on Friday". Gemini will extract the details for you.
                            </p>
                        </div>
                        <textarea
                            value={nlpText}
                            onChange={(e) => setNlpText(e.target.value)}
                            placeholder="Describe your expense..."
                            className="w-full h-32 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !nlpText.trim()}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type className="w-4 h-4" />}
                            {isLoading ? 'Analyzing...' : 'Process with Gemini'}
                        </button>
                    </form>
                )}

                {mode === 'image' && (
                    <div className="space-y-6 text-center">
                         <div className="bg-emerald-50 p-4 rounded-lg mb-4 text-left">
                            <p className="text-sm text-emerald-800">
                                <strong className="font-semibold">Tip:</strong> Upload a photo of a receipt. Gemini will analyze the merchant, date, and total amount automatically.
                            </p>
                        </div>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                        >
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <ImageIcon className="w-8 h-8" />
                            </div>
                            <p className="text-slate-600 font-medium">Click to upload receipt</p>
                            <p className="text-slate-400 text-sm mt-1">Supports JPG, PNG, WEBP</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        {isLoading && (
                            <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Scanning receipt...
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};