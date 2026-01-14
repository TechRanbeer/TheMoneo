import React, { useState, useEffect } from 'react';
import { Brain, IndianRupee, Clock, Info, HelpCircle, X, ShoppingCart, ThumbsUp, Timer } from 'lucide-react';
import { dataStore } from '../services/dataStore';
import { ReflectionItem } from '../types';

const ReflectView: React.FC = () => {
  const [items, setItems] = useState<ReflectionItem[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Form State
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [duration, setDuration] = useState('15'); // default 15 minutes
  const [customDuration, setCustomDuration] = useState('');

  useEffect(() => {
    // Load active reflections
    const loadItems = () => {
      const active = dataStore.getReflections().filter(i => i.status === 'pending');
      setItems(active);
    };
    loadItems();

    // Timer Interval
    const interval = setInterval(() => {
      setNow(Date.now());
      // Reload items to catch any that might have been resolved externally (by global popup)
      // or to just re-render countdowns
      loadItems();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cost) return;
    
    let minutes = parseInt(duration);
    if (duration === 'custom') {
        minutes = parseInt(customDuration);
    }

    if (isNaN(minutes) || minutes <= 0) return;

    try {
        await dataStore.addReflection({
            name,
            cost: Number(cost),
            durationMinutes: minutes
        });
        
        // Reset form
        setName('');
        setCost('');
        setDuration('15');
        setCustomDuration('');
        
        // Refresh list
        const active = dataStore.getReflections().filter(i => i.status === 'pending');
        setItems(active);
    } catch (e) {
        console.error(e);
    }
  };

  const getRemainingTime = (endTime: number) => {
      const diff = endTime - now;
      if (diff <= 0) return "Ready for decision";
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pt-24 px-4 max-w-5xl mx-auto pb-12 relative">
      
      {/* Header Container */}
      <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                  <Brain className="w-8 h-8 text-indigo-400" />
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Reflect</h1>
          </div>
          <button 
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-600 text-indigo-300 font-medium transition-colors"
          >
              <HelpCircle className="w-4 h-4" /> Know how to use me
          </button>
      </div>

      {/* Info Modal */}
      {showInfo && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInfo(false)}></div>
              <div className="relative bg-slate-900 border border-indigo-500/30 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
                  <button 
                    onClick={() => setShowInfo(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  >
                      <X className="w-5 h-5" />
                  </button>
                  
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Brain className="w-6 h-6 mr-3 text-indigo-400"/> Why use Reflect?
                  </h3>
                  
                  <div className="space-y-4">
                      <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold shrink-0">1</div>
                          <p className="text-gray-300">Add an item you want to buy, its price, and a wait time (e.g., 30 mins, 24 hours).</p>
                      </div>
                      <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold shrink-0">2</div>
                          <p className="text-gray-300">Let the timer run. This "cooling-off" period reduces emotional impulse spending.</p>
                      </div>
                      <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold shrink-0">3</div>
                          <p className="text-gray-300">When time is up, you'll get a popup to decide calmly: Buy it or Skip it.</p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6">Start a new reflection</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">I want to buy...</label>
                      <div className="relative">
                          <ShoppingCart className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                          <input 
                              type="text" 
                              required
                              placeholder="e.g. Wireless Headphones"
                              value={name}
                              onChange={e => setName(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">It costs...</label>
                      <div className="relative">
                          <IndianRupee className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                          <input 
                              type="number" 
                              required
                              placeholder="0.00"
                              value={cost}
                              onChange={e => setCost(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">I will wait for...</label>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                          {['15', '30', '60', '1440'].map(mins => (
                              <button
                                key={mins}
                                type="button"
                                onClick={() => { setDuration(mins); setCustomDuration(''); }}
                                className={`py-3 rounded-xl border font-medium transition-all ${duration === mins ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-gray-400 hover:bg-slate-700'}`}
                              >
                                  {parseInt(mins) >= 60 ? `${parseInt(mins)/60} Hour${parseInt(mins)/60 > 1 ? 's' : ''}` : `${mins} Mins`}
                              </button>
                          ))}
                      </div>
                      
                      <button
                         type="button"
                         onClick={() => setDuration('custom')}
                         className={`w-full py-2 text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 ${duration === 'custom' ? 'text-indigo-400 font-bold' : ''}`}
                      >
                          <Clock className="w-4 h-4" /> Use custom time
                      </button>

                      {duration === 'custom' && (
                          <div className="mt-3">
                             <input 
                                type="number"
                                placeholder="Enter minutes"
                                value={customDuration}
                                onChange={e => setCustomDuration(e.target.value)}
                                className="w-full bg-slate-800 border border-indigo-500 rounded-xl py-3 px-4 text-white focus:outline-none"
                             />
                          </div>
                      )}
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-900/30 transition-transform hover:scale-[1.02]"
                  >
                      Start Reflect Timer
                  </button>
              </form>
          </div>

          {/* List Section */}
          <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Timer className="w-5 h-5 text-indigo-400"/> Reflecting...
              </h2>
              
              {items.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center bg-slate-800/30 rounded-3xl border border-white/5 border-dashed">
                      <Brain className="w-12 h-12 text-slate-600 mb-4" />
                      <p className="text-gray-400">No active reflections.</p>
                      <p className="text-sm text-gray-600">Add an item to start cooling off.</p>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {items.map(item => (
                          <div key={item.id} className="bg-slate-800/80 border border-white/10 rounded-2xl p-5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                              <div>
                                  <h3 className="font-bold text-white text-lg">{item.name}</h3>
                                  <p className="text-gray-400 text-sm">₹{item.cost}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Time Remaining</p>
                                  <p className="text-2xl font-mono text-indigo-400 font-bold">
                                      {getRemainingTime(item.endTime)}
                                  </p>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>

      </div>
    </div>
  );
};

export default ReflectView;