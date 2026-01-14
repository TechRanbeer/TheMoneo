import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Subscription } from '../types';
import { Plus, Calendar, Loader2, AlertCircle, CheckCircle2, XCircle, CreditCard, X } from 'lucide-react';

const PREDEFINED_SUBS = [
  { name: 'Netflix', icon: 'N', color: 'bg-red-600' },
  { name: 'Spotify', icon: 'S', color: 'bg-green-500' },
  { name: 'Amazon Prime', icon: 'A', color: 'bg-blue-400' },
  { name: 'Swiggy One', icon: 'Sw', color: 'bg-orange-500' },
  { name: 'Zomato Gold', icon: 'Z', color: 'bg-red-500' },
  { name: 'YouTube Premium', icon: 'Y', color: 'bg-red-600' },
];

const SubscriptionsView: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Popup States
  const [showContinuePopup, setShowContinuePopup] = useState(false);
  const [showReviewMessage, setShowReviewMessage] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    cost: '',
    billing_cycle: 'monthly' as 'monthly' | 'six_months' | 'yearly',
    customName: ''
  });

  const fetchSubs = async () => {
    try {
      const data = await api.get('/subscriptions');
      setSubscriptions(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error(err);
      setLoading(false);
      return [];
    }
  };

  useEffect(() => {
    const init = async () => {
      const data = await fetchSubs();
      // Check if there are active subscriptions to trigger the popup
      if (data.length > 0 && data.some((s: Subscription) => s.active)) {
        setShowContinuePopup(true);
      }
    };
    init();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = form.name === 'Custom' ? form.customName : form.name;
    if (!finalName || !form.cost) return;

    try {
      await api.post('/subscriptions', {
        name: finalName,
        cost: Number(form.cost),
        billing_cycle: form.billing_cycle
      });
      setIsAdding(false);
      setForm({ name: '', cost: '', billing_cycle: 'monthly', customName: '' });
      fetchSubs();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSub = async (id: number) => {
    try {
      await api.post('/subscriptions/toggle', { id });
      fetchSubs();
    } catch (err) {
      console.error(err);
    }
  };

  const totalMonthlyCost = subscriptions
    .filter(s => s.active)
    .reduce((acc, sub) => {
      let cost = sub.cost;
      if (sub.billing_cycle === 'six_months') cost /= 6;
      if (sub.billing_cycle === 'yearly') cost /= 12;
      return acc + cost;
    }, 0);

  // Popup Handlers
  const handleContinueYes = () => {
      setShowContinuePopup(false);
  };

  const handleContinueNo = () => {
      setShowContinuePopup(false);
      setShowReviewMessage(true);
  };

  return (
    <div className="pt-24 px-4 max-w-5xl mx-auto pb-12 relative">
      
      {/* Continue Subscription Popup */}
      {showContinuePopup && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
             <div className="bg-slate-900 rounded-2xl p-8 border border-white/10 max-w-md w-full shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                 
                 <div className="flex items-center mb-4 text-white">
                    <CreditCard className="w-8 h-8 mr-3 text-blue-400" />
                    <h3 className="text-2xl font-bold">Subscription Check</h3>
                 </div>
                 
                 <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                   Do you want to continue your active subscription(s) this month?
                 </p>
                 
                 <div className="grid grid-cols-2 gap-4">
                     <button 
                        onClick={handleContinueNo} 
                        className="flex items-center justify-center py-4 rounded-xl bg-slate-800 text-white border border-slate-700 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all font-medium text-lg"
                     >
                        <XCircle className="w-5 h-5 mr-2" /> No
                     </button>
                     <button 
                        onClick={handleContinueYes} 
                        className="flex items-center justify-center py-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold text-lg shadow-lg shadow-blue-900/20"
                     >
                        <CheckCircle2 className="w-5 h-5 mr-2" /> Yes
                     </button>
                 </div>
             </div>
         </div>
      )}

      {/* Review Modal */}
      {showReviewMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
           <div className="bg-slate-900/90 rounded-2xl p-8 border border-amber-500/30 max-w-md w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400">
                  <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Review Required</h3>
              <p className="text-gray-300 mb-8 text-lg">
                Please review your list below and cancel any unused subscriptions.
              </p>
              <button 
                onClick={() => setShowReviewMessage(false)}
                className="w-full py-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg transition-all shadow-lg shadow-amber-900/20"
              >
                Okay, I'll review
              </button>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center">
            Your Subscriptions
          </h2>
          <p className="text-gray-400 mt-2 text-lg">Manage recurring payments. These are automatically tracked as Essentials.</p>
        </div>
        <div className="bg-slate-800/80 backdrop-blur px-6 py-4 rounded-2xl border border-white/10 shadow-lg">
            <span className="text-sm text-gray-400 block mb-1">Total Monthly Impact</span>
            <span className="text-3xl font-bold text-white">₹{totalMonthlyCost.toFixed(0)}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* List Section */}
        <div className="md:col-span-2 space-y-4">
            {loading ? <div className="text-white text-lg">Loading...</div> : (
                subscriptions.length === 0 ? (
                    <div className="p-12 bg-slate-800/30 rounded-3xl border border-white/10 text-center text-gray-400 flex flex-col items-center">
                        <CreditCard className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg">No subscriptions added yet.</p>
                        <p className="text-sm opacity-60">Add your first one to start tracking.</p>
                    </div>
                ) : (
                    subscriptions.map(sub => (
                        <div key={sub.id} className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${sub.active ? 'bg-slate-800 border-white/10 hover:border-blue-500/30' : 'bg-slate-900 border-slate-800 opacity-60 grayscale'}`}>
                            <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg ${
                                    PREDEFINED_SUBS.find(p => p.name === sub.name)?.color || 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                }`}>
                                    {sub.name.substring(0, 1)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-xl">{sub.name}</h3>
                                    <p className="text-base text-gray-400 flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4" /> {sub.billing_cycle.replace('_', ' ')}
                                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                                        <span className="text-white font-medium">₹{sub.cost}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                                <div className="text-right">
                                     <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Monthly eq.</p>
                                     <p className="font-bold text-blue-400 text-lg">₹{(sub.billing_cycle === 'yearly' ? sub.cost/12 : sub.billing_cycle === 'six_months' ? sub.cost/6 : sub.cost).toFixed(0)}</p>
                                </div>
                                <button 
                                    onClick={() => toggleSub(sub.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${sub.active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                                >
                                    {sub.active ? 'Cancel Plan' : 'Reactivate'}
                                </button>
                            </div>
                        </div>
                    ))
                )
            )}
        </div>

        {/* Add New Section */}
        <div className="md:col-span-1">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl sticky top-24">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Add Subscription</h3>
                    {isAdding && (
                        <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-white">
                            <XCircle className="w-6 h-6" />
                        </button>
                    )}
                </div>
                
                {!isAdding ? (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="w-full py-4 border-2 border-dashed border-gray-700 rounded-2xl text-gray-400 hover:border-blue-500 hover:text-blue-400 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-3 text-lg font-medium"
                    >
                        <Plus className="w-6 h-6" /> Add New Service
                    </button>
                ) : (
                    <form onSubmit={handleAdd} className="space-y-6 animate-fade-in">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select Service</label>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {PREDEFINED_SUBS.map(s => (
                                    <button
                                        key={s.name}
                                        type="button"
                                        onClick={() => setForm({...form, name: s.name})}
                                        className={`p-3 rounded-xl text-xs font-bold border transition-all ${form.name === s.name ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-gray-400 hover:bg-slate-700'}`}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm({...form, name: 'Custom'})}
                                className={`w-full p-3 rounded-xl text-xs font-bold border transition-all ${form.name === 'Custom' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-gray-400 hover:bg-slate-700'}`}
                            >
                                Custom Service
                            </button>
                        </div>

                        {form.name === 'Custom' && (
                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 font-bold uppercase">Service Name</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="e.g. Adobe Creative Cloud"
                                    value={form.customName}
                                    onChange={e => setForm({...form, customName: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-base outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        )}

                        <div className="space-y-1">
                             <label className="text-xs text-gray-500 font-bold uppercase">Billing Cycle</label>
                             <select 
                                value={form.billing_cycle}
                                onChange={e => setForm({...form, billing_cycle: e.target.value as any})}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-base outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                             >
                                 <option value="monthly">Monthly</option>
                                 <option value="six_months">Every 6 Months</option>
                                 <option value="yearly">Yearly</option>
                             </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 font-bold uppercase">Cost (₹)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₹</span>
                                <input 
                                    type="number"
                                    required
                                    value={form.cost}
                                    onChange={e => setForm({...form, cost: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 pl-8 text-white text-base outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-base font-bold hover:shadow-lg hover:scale-[1.02] transition-all"
                        >
                            Save Subscription
                        </button>
                    </form>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsView;