import React, { useState } from 'react';
import { X, Calendar, Tag, FileText, IndianRupee } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'user_id'>) => void;
}

const CATEGORIES_EXPENSE = ['Food & Dining', 'Transportation', 'Utilities', 'Shopping', 'Health', 'Entertainment', 'Education', 'Other'];
const CATEGORIES_INCOME = ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other'];

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onAddTransaction }) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) return;

    onAddTransaction({
      type,
      amount: parseFloat(amount),
      category,
      date,
      description
    });
    
    // Reset and close
    setAmount('');
    setDescription('');
    setCategory('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-brand-dark border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-800/50">
          <h3 className="text-lg font-bold text-white">Add Transaction</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Type Toggle */}
          <div className="flex bg-slate-800 p-1 rounded-lg mb-4">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                type === 'expense' ? 'bg-red-500/20 text-red-400 shadow-sm' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                type === 'income' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Amount (INR)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IndianRupee className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-10 bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-4 w-4 text-gray-500" />
              </div>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full pl-10 bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer"
              >
                <option value="" disabled>Select a category</option>
                {(type === 'expense' ? CATEGORIES_EXPENSE : CATEGORIES_INCOME).map(cat => (
                  <option key={cat} value={cat} className="bg-slate-800 text-white">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full pl-10 bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Description (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full pl-10 bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. Dinner with friends"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20"
          >
            Add Transaction
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;