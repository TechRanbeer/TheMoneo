import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Transaction } from '../types';
import { Calendar, Tag, FileText, IndianRupee, Plus, Loader2, Save } from 'lucide-react';
import { dataStore } from '../services/dataStore';

const CATEGORIES_ESSENTIALS = ['Rent', 'Food', 'Travel', 'Utilities', 'Education', 'Health'];
const CATEGORIES_LIFESTYLE = ['Shopping', 'Entertainment', 'Other'];

const TransactionsView: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Income State
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [updatingIncome, setUpdatingIncome] = useState(false);

  // Expense Form State
  const [form, setForm] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txs, userProfile] = await Promise.all([
          api.get('/transactions'),
          dataStore.getCurrentUserProfile() // Use direct dataStore for simplicity in this demo environment
      ]);
      setTransactions(txs);
      if (userProfile) {
          setMonthlyIncome(userProfile.monthly_income);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateIncome = async () => {
      setUpdatingIncome(true);
      try {
          await dataStore.updateIncome(Number(monthlyIncome));
          // Refresh to ensure budget stats elsewhere update if we had a reactive store
      } catch (e) {
          console.error(e);
      } finally {
          setUpdatingIncome(false);
      }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newTx = await api.post('/transactions', {
        type: 'expense',
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        description: form.description
      });
      
      // Reset form and refresh list
      setForm({
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      fetchData();
    } catch (err) {
      alert("Failed to add transaction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
          
          {/* Left Column: Income Management */}
          <div className="bg-brand-dark/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl h-fit">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center">
                  <IndianRupee className="w-5 h-5 mr-2 text-emerald-400"/> Monthly Income
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                  This is your base for the 50-30-20 budget rule. Keep it updated.
              </p>
              
              <div className="flex items-center space-x-4 mb-4">
                  <div className="relative flex-1">
                     <span className="absolute left-4 top-3.5 text-gray-500 font-bold">₹</span>
                     <input 
                        type="number" 
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-8 text-white font-bold text-lg focus:border-emerald-500 outline-none"
                     />
                  </div>
                  <button 
                    onClick={handleUpdateIncome}
                    disabled={updatingIncome}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center"
                  >
                     {updatingIncome ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
                  </button>
              </div>
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <h4 className="text-emerald-400 font-bold text-sm mb-2">Budget Breakdown</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-900/50 p-2 rounded">
                          <p className="text-xs text-gray-400">Essentials (50%)</p>
                          <p className="text-white font-bold">₹{(monthlyIncome * 0.5).toFixed(0)}</p>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded">
                          <p className="text-xs text-gray-400">Lifestyle (30%)</p>
                          <p className="text-white font-bold">₹{(monthlyIncome * 0.3).toFixed(0)}</p>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded">
                          <p className="text-xs text-gray-400">Savings (20%)</p>
                          <p className="text-white font-bold">₹{(monthlyIncome * 0.2).toFixed(0)}</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* Right Column: Add Expense */}
          <div className="bg-brand-dark/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-red-400"/> Add Expense
            </h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Amount</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IndianRupee className="h-4 w-4 text-gray-500" />
                            </div>
                            <input 
                                type="number" 
                                required min="1" 
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                className="block w-full pl-10 bg-slate-800 border border-slate-700 rounded-lg py-2.5 text-white focus:ring-blue-500 outline-none" 
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                         <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
                         <input 
                            type="date" 
                            required
                            value={form.date}
                            onChange={e => setForm({ ...form, date: e.target.value })}
                            className="block w-full px-3 bg-slate-800 border border-slate-700 rounded-lg py-2.5 text-white focus:ring-blue-500 outline-none" 
                         />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                    <select 
                        required
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}
                        className="block w-full px-3 bg-slate-800 border border-slate-700 rounded-lg py-2.5 text-white focus:ring-blue-500 outline-none appearance-none" 
                    >
                        <option value="" disabled>Select Category</option>
                        <optgroup label="Essentials (50%)">
                            {CATEGORIES_ESSENTIALS.map(c => <option key={c} value={c}>{c}</option>)}
                        </optgroup>
                        <optgroup label="Lifestyle (30%)">
                            {CATEGORIES_LIFESTYLE.map(c => <option key={c} value={c}>{c}</option>)}
                        </optgroup>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                    <input 
                        type="text" 
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        className="block w-full px-3 bg-slate-800 border border-slate-700 rounded-lg py-2.5 text-white focus:ring-blue-500 outline-none" 
                        placeholder="e.g. Dinner at Social"
                    />
                </div>

                <button disabled={submitting} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 transition-colors">
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto"/> : "Log Expense"}
                </button>
            </form>
          </div>
      </div>

      {/* Recent Transactions List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white/5 rounded-xl border border-white/5">
             No transactions found. Start logging your expenses!
          </div>
        ) : (
          <div className="space-y-3">
             {transactions.map(tx => (
               <div key={tx.id} className="bg-slate-800/50 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-slate-800 transition-colors">
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold mr-4 ${
                      tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.category[0]}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{tx.description || tx.category}</h4>
                      <p className="text-sm text-gray-400">{tx.date} • {tx.category}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                     {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                  </span>
               </div>
             ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default TransactionsView;