import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const SummaryView: React.FC = () => {
  const [period, setPeriod] = useState('this_month');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get(`/summary?period=${period}`).then(setData).catch(console.error);
  }, [period]);

  if (!data) return <div className="pt-24 text-center text-white">Loading summary...</div>;

  return (
    <div className="pt-24 px-4 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Financial Summary</h2>
        <select 
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 outline-none"
        >
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-slate-800 p-6 rounded-xl border border-white/5">
            <p className="text-gray-400 text-sm">Total Income</p>
            <p className="text-2xl font-bold text-emerald-400">₹{data.income.toLocaleString()}</p>
         </div>
         <div className="bg-slate-800 p-6 rounded-xl border border-white/5">
            <p className="text-gray-400 text-sm">Total Expenses</p>
            <p className="text-2xl font-bold text-white">₹{data.expense.toLocaleString()}</p>
         </div>
         <div className="bg-slate-800 p-6 rounded-xl border border-white/5">
            <p className="text-gray-400 text-sm">Net Savings</p>
            <p className={`text-2xl font-bold ${data.income - data.expense >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
               ₹{(data.income - data.expense).toLocaleString()}
            </p>
         </div>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/10">
         <h3 className="text-lg font-bold text-white mb-6">Spending by Category</h3>
         
         <div className="grid md:grid-cols-2 gap-8">
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.breakdown} layout="vertical">
                     <XAxis type="number" hide />
                     <YAxis dataKey="category" type="category" width={100} tick={{fill: '#94a3b8'}} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                     />
                     <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-white/5">
               <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-slate-900">
                     <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tx Count</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                     </tr>
                  </thead>
                  <tbody className="bg-slate-800/30 divide-y divide-white/5">
                     {data.breakdown.map((row: any) => (
                        <tr key={row.category}>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{row.category}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{row.count}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right">₹{row.total.toLocaleString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SummaryView;