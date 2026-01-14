import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingDown, ArrowUpRight, ShieldCheck, Plus, TrendingUp, AlertTriangle, Lightbulb, X } from 'lucide-react';
import { AppView, DashboardStats, BudgetCategoryHealth } from '../types';
import { api } from '../services/api';

interface DashboardProps {
  user: any;
  setView: (view: AppView) => void;
}

// --- Emotional Intelligence Library ---
const EMOTIONAL_MESSAGES = {
  stress: [
    "I understand stress spending is really common. What's been weighing on your mind lately? 🌟",
    "Stress can definitely trigger spending. How about we find some free ways to relax together? 🧘‍♀️",
    "I get it - shopping can feel comforting in the moment. What else usually helps you feel better?"
  ],
  boredom: [
    "Boredom shopping got you? Let's brainstorm some free activities you might enjoy! 🎨",
    "I understand boredom can lead to spending. What hobbies used to make you happy?",
    "Boredom happens! How about we create a 'fun ideas' list for next time? 📝"
  ],
  sadness: [
    "I'm sorry you're feeling down. Shopping might feel good temporarily, but let's find lasting comfort. 💫",
    "It's okay to have tough days. What's one small thing that usually lifts your mood?",
    "I hear you. Sometimes we shop when we need emotional comfort. Want to talk about what's going on?"
  ],
  celebration: [
    "Celebratory spending! That's understandable. Was there something special happening? 🎉",
    "Yay for celebrations! How can we make future celebrations special without overspending?",
    "I love that you had something to celebrate! Let's find ways to honor achievements within budget."
  ],
  impulse: [
    "Impulse buys happen to everyone! What caught your eye in the moment? 👀",
    "I get it - sometimes things just call our name. How about we create a 24-hour rule for next time?",
    "Impulse spending is so common! What was the trigger - was it an ad, a store, or something else?"
  ]
};

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; sub?: string }> = ({ label, value, icon, sub }) => (
  <div className="bg-brand-dark/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex items-start justify-between hover:bg-white/5 transition-colors cursor-pointer group">
    <div>
      <p className="text-gray-400 text-sm font-medium">{label}</p>
      <h3 className="text-3xl font-bold text-white mt-2 font-sans">{value}</h3>
      {sub && <p className="text-emerald-400 text-sm mt-2 flex items-center font-medium"><ArrowUpRight className="h-4 w-4 mr-1" /> {sub}</p>}
    </div>
    <div className="p-3 bg-white/5 rounded-xl text-blue-400 group-hover:scale-110 transition-transform group-hover:bg-blue-500/20 group-hover:text-blue-300">
      {icon}
    </div>
  </div>
);

const BudgetBar: React.FC<{ data: BudgetCategoryHealth }> = ({ data }) => (
    <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
            <div>
                <span className="text-white font-medium text-base">{data.label}</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${data.status === 'ok' || data.status === 'on_track' ? 'bg-emerald-500/20 text-emerald-400' : data.status === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                    {data.status.replace('_', ' ')}
                </span>
            </div>
            <div className="text-right">
                <span className="text-gray-300 font-bold text-sm">₹{data.spent.toLocaleString()}</span>
                <span className="text-gray-500 text-xs"> / ₹{data.limit.toLocaleString()}</span>
            </div>
        </div>
        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
                className="h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${data.percent}%`, backgroundColor: data.color }}
            >
                 <div className="absolute top-0 left-0 bottom-0 right-0 bg-white/10 w-full animate-[shimmer_2s_infinite]"></div>
            </div>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ user, setView }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Emotional Support State
  const [emotionalMessage, setEmotionalMessage] = useState<string | null>(null);
  const [showEmotionalModal, setShowEmotionalModal] = useState(false);
  const lastMessageRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/dashboard');
        setStats(data);
        determineEmotionalSupport(data.budget_health);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const determineEmotionalSupport = (health: DashboardStats['budget_health']) => {
      let category: keyof typeof EMOTIONAL_MESSAGES | null = null;

      // Priority Logic: Essentials (Stress) > Lifestyle (Impulse/Boredom/Celebration) > Savings (Sadness)
      if (health.essentials.status === 'exceeded') {
          category = 'stress';
      } else if (health.lifestyle.status === 'exceeded') {
          // Randomize for lifestyle triggers
          const randomTypes: (keyof typeof EMOTIONAL_MESSAGES)[] = ['impulse', 'boredom', 'celebration'];
          category = randomTypes[Math.floor(Math.random() * randomTypes.length)];
      } else if (health.savings.status === 'behind') {
          category = 'sadness';
      }

      if (category) {
          const messages = EMOTIONAL_MESSAGES[category];
          let newMessage = messages[Math.floor(Math.random() * messages.length)];
          
          // Avoid back-to-back repetition
          if (newMessage === lastMessageRef.current && messages.length > 1) {
              const otherMessages = messages.filter(m => m !== newMessage);
              newMessage = otherMessages[Math.floor(Math.random() * otherMessages.length)];
          }

          setEmotionalMessage(newMessage);
          lastMessageRef.current = newMessage;
          setShowEmotionalModal(true);
      }
  };

  const handleLetsTalk = () => {
    setShowEmotionalModal(false);
    setView(AppView.COACH);
  };

  if (loading) return <div className="pt-24 text-center text-white">Loading dashboard...</div>;
  if (!stats) return <div className="pt-24 text-center text-red-400">Failed to load data.</div>;

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto relative">
      
      {/* Emotional Support Modal (Mindful Spending Popup) */}
      {showEmotionalModal && emotionalMessage && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
              {/* Opaque Background Overlay */}
              <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={() => setShowEmotionalModal(false)}
              ></div>
              
              {/* Modal Card - Light Blue Glass, Compact */}
              <div className="relative bg-sky-500/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 max-w-sm w-full shadow-2xl transform transition-all animate-slide-in-down">
                  <button 
                    onClick={() => setShowEmotionalModal(false)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                  >
                      <X className="w-4 h-4" />
                  </button>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10">
                       <p className="text-lg text-white font-medium leading-relaxed text-center">
                           "{emotionalMessage}"
                       </p>
                  </div>

                  <button 
                    onClick={handleLetsTalk}
                    className="w-full py-3 bg-white text-sky-900 rounded-xl font-bold text-base hover:bg-sky-50 hover:scale-[1.02] transition-all shadow-lg"
                  >
                      Let's talk
                  </button>
              </div>
          </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-2xl p-6 mb-8 border border-indigo-700/50 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="mb-2 md:mb-0">
            <h2 className="text-3xl font-bold text-white">Welcome back, {user.first_name}! 👋</h2>
            <p className="text-blue-100 mt-1 text-lg">
              Your financial health is looking {stats.budget_health.savings.status === 'on_track' ? 'good' : 'average'} today.
            </p>
          </div>
          <div className="flex space-x-3">
             <button 
                onClick={() => setView(AppView.TRANSACTIONS)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-lg flex items-center text-base"
              >
                <Plus className="h-5 w-5 mr-2" /> Add Transaction
              </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KPI Cards Row */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard 
              label="Net Savings" 
              value={`₹${stats.savings.toLocaleString()}`} 
              icon={<Wallet className="h-7 w-7" />} 
            />
            <StatCard 
              label="Total Spent" 
              value={`₹${stats.expense.toLocaleString()}`} 
              icon={<TrendingDown className="h-7 w-7" />} 
            />
            <StatCard 
              label="Total Income" 
              value={`₹${stats.income.toLocaleString()}`} 
              icon={<TrendingUp className="h-7 w-7" />} 
            />
        </div>

        {/* Row 2: Split View */}
        
        {/* Left: Spending Analysis (Smaller) */}
        <div className="lg:col-span-1 bg-brand-dark/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6 h-fit">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingDown className="w-5 h-5 mr-2 text-blue-400"/> Spending Analysis
            </h3>
            <div className="h-[220px] w-full relative mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.spending_by_category.length > 0 ? stats.spending_by_category : [{ name: 'No Expenses', value: 1, color: '#334155' }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.spending_by_category.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: number) => `₹${value.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="text-xs text-gray-400">Total</span>
                  <p className="text-xl font-bold text-white">₹{stats.expense.toLocaleString()}</p>
                </div>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {stats.spending_by_category.length > 0 ? stats.spending_by_category.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: entry.color }}></div>
                      <span className="text-gray-300 text-sm">{entry.name}</span>
                    </div>
                    <span className="text-white font-medium text-sm">₹{entry.value.toLocaleString()}</span>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center text-sm italic">No data yet.</p>
                )}
            </div>
        </div>

        {/* Right: Intelligent Budget Tracker (Larger) */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-brand-dark/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-semibold text-white flex items-center">
                        <ShieldCheck className="w-6 h-6 mr-2 text-emerald-400"/> 
                        Intelligent Budget Tracker (50-30-20)
                    </h3>
                    <span className="text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">Auto-adjusts to Income</span>
                </div>

                <div className="space-y-8">
                    <BudgetBar data={stats.budget_health.essentials} />
                    <BudgetBar data={stats.budget_health.lifestyle} />
                    <BudgetBar data={stats.budget_health.savings} />
                </div>

                {/* Alerts & Suggestions Area */}
                <div className="mt-10 grid md:grid-cols-2 gap-6">
                    {stats.budget_health.alerts.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                            <h4 className="text-red-400 font-bold text-lg mb-3 flex items-center"><AlertTriangle className="w-5 h-5 mr-2"/> Action Required</h4>
                            <ul className="space-y-3">
                                {stats.budget_health.alerts.map((alert, i) => (
                                    <li key={i} className="text-sm md:text-base text-red-200 leading-relaxed flex items-start">
                                        <span className="mr-2">•</span> {alert}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {stats.budget_health.investmentAdvice ? (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 col-span-2 md:col-span-1">
                            <h4 className="text-blue-400 font-bold text-lg mb-3 flex items-center"><Lightbulb className="w-5 h-5 mr-2"/> Smart Suggestion</h4>
                            <p className="text-sm md:text-base text-blue-200 leading-relaxed font-medium">
                                {stats.budget_health.investmentAdvice}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 col-span-2 md:col-span-1 flex items-center justify-center">
                            <p className="text-emerald-400 text-lg font-medium">Your budget is balanced perfectly!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;