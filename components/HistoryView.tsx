import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Transaction } from '../types';

const HistoryView: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState('all'); // all, income, expense

  useEffect(() => {
    api.get('/transactions').then(setTransactions).catch(console.error);
  }, []);

  const filtered = transactions.filter(t => filter === 'all' || t.type === filter);

  return (
    <div className="pt-24 px-4 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Transaction History</h2>
        <div className="flex space-x-2">
           {['all', 'income', 'expense'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {f}
              </button>
           ))}
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-white/5">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{tx.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tx.type === 'income' ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{tx.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{tx.description || '-'}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${
                    tx.type === 'income' ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">No transactions found.</div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;