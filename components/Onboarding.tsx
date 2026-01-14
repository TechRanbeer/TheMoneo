import React, { useState } from 'react';
import { AppView } from '../types';
import { ChevronRight, ChevronLeft, Wallet, Target, TrendingUp, Clock, BookOpen, ShieldCheck, IndianRupee, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface OnboardingProps {
  setView: (view: AppView) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ setView }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 6;
  
  // State for all answers
  const [answers, setAnswers] = useState({
    monthly_income: '',
    primary_goal: '',
    financial_situation: '',
    investment_timeline: '',
    knowledge_emergency_fund: '',
    knowledge_credit_score: ''
  });

  const updateAnswer = (key: string, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const calculateScore = () => {
    let score = 0;
    if (answers.knowledge_emergency_fund === '3–6 months') score++;
    if (answers.knowledge_credit_score === 'Payment history') score++;
    return score;
  };

  const finishOnboarding = async () => {
    setLoading(true);
    try {
      const knowledgeScore = calculateScore();
      const res = await api.post('/onboarding', {
        ...answers,
        monthly_income: Number(answers.monthly_income),
        knowledge_score: knowledgeScore
      });
      
      if (res.success) {
         setView(AppView.DASHBOARD);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderOption = (label: string, field: string, value: string) => (
    <button
      onClick={() => {
        updateAnswer(field, label);
        // Auto advance after slight delay for better UX
        if (step < totalSteps) setTimeout(() => setStep(s => s + 1), 250);
      }}
      className={`w-full p-6 text-left rounded-xl border-2 transition-all duration-200 group flex items-center justify-between ${
        value === label 
          ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-900/20 transform scale-[1.02]' 
          : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-500 hover:shadow-lg'
      }`}
    >
      <span className={`text-xl font-medium ${value === label ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
        {label}
      </span>
      {value === label && <div className="w-4 h-4 bg-white rounded-full shadow-inner" />}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-4xl">
        {/* Progress Header */}
        <div className="mb-12">
            <div className="flex justify-between items-end mb-4">
                <span className="text-gray-400 font-medium tracking-wide text-sm uppercase">Step {step} of {totalSteps}</span>
                <span className="text-white font-bold text-xl">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full w-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ease-out rounded-full"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                ></div>
            </div>
        </div>

        {/* Content Card */}
        <div className="bg-brand-dark/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative min-h-[500px] flex flex-col">
            
            <div className="flex-1 flex flex-col justify-center animate-fade-in">
                
                {/* Step 1: Income */}
                {step === 1 && (
                    <div className="space-y-10">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                                <Wallet className="h-10 w-10" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Let's verify your income</h2>
                            <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
                                This acts as the baseline for your smart budget. We'll split this into 50% Needs, 30% Wants, and 20% Savings.
                            </p>
                        </div>
                        
                        <div className="max-w-md mx-auto w-full">
                            <label className="block text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">Monthly Income</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                    <IndianRupee className="h-8 w-8 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input
                                    type="number"
                                    autoFocus
                                    value={answers.monthly_income}
                                    onChange={(e) => updateAnswer('monthly_income', e.target.value)}
                                    className="w-full pl-16 bg-slate-900/80 border-2 border-slate-700 rounded-2xl py-6 text-4xl font-bold text-white focus:border-emerald-500 outline-none transition-all placeholder-gray-700 shadow-inner"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Goal */}
                {step === 2 && (
                    <div className="space-y-8">
                         <div className="flex items-center space-x-4 mb-2">
                             <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                                <Target className="h-8 w-8" />
                             </div>
                             <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white">Primary Goal</h2>
                                <p className="text-lg text-gray-400">What matters most to you right now?</p>
                             </div>
                         </div>
                         <div className="grid grid-cols-1 gap-4">
                            {['Building an emergency fund', 'Paying off existing debt', 'Saving for a major purchase', 'Growing wealth through long-term investing'].map(opt => renderOption(opt, 'primary_goal', answers.primary_goal))}
                         </div>
                    </div>
                )}

                {/* Step 3: Financial Situation */}
                {step === 3 && (
                    <div className="space-y-8">
                         <div className="flex items-center space-x-4 mb-2">
                             <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-400">
                                <TrendingUp className="h-8 w-8" />
                             </div>
                             <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white">Current Situation</h2>
                                <p className="text-lg text-gray-400">Be honest, this helps us tailor advice.</p>
                             </div>
                         </div>
                         <div className="grid grid-cols-1 gap-4">
                            {['I struggle to cover essential expenses', 'I live paycheck to paycheck', 'I manage to save a little most months', 'I can comfortably save and invest regularly'].map(opt => renderOption(opt, 'financial_situation', answers.financial_situation))}
                         </div>
                    </div>
                )}

                {/* Step 4: Timeline */}
                {step === 4 && (
                    <div className="space-y-8">
                         <div className="flex items-center space-x-4 mb-2">
                             <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                                <Clock className="h-8 w-8" />
                             </div>
                             <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white">Investment Horizon</h2>
                                <p className="text-lg text-gray-400">When do you need your money back?</p>
                             </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['Within 1 year', 'In about 1–3 years', 'In about 3–5 years', 'After 5 years or more'].map(opt => renderOption(opt, 'investment_timeline', answers.investment_timeline))}
                         </div>
                    </div>
                )}

                {/* Step 5: Knowledge 1 */}
                {step === 5 && (
                    <div className="space-y-8">
                         <div className="flex items-center space-x-4 mb-2">
                             <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                                <BookOpen className="h-8 w-8" />
                             </div>
                             <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white">Knowledge Check</h2>
                                <p className="text-lg text-gray-400">Question 1 of 2</p>
                             </div>
                         </div>
                         
                         <h3 className="text-2xl font-medium text-white leading-relaxed p-4 bg-slate-800/50 rounded-xl border border-white/5">
                            An emergency fund should ideally cover how many months of expenses?
                         </h3>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['1 month or less', '3–6 months', '6–12 months', 'More than 12 months'].map(opt => renderOption(opt, 'knowledge_emergency_fund', answers.knowledge_emergency_fund))}
                         </div>
                    </div>
                )}

                {/* Step 6: Knowledge 2 */}
                {step === 6 && (
                    <div className="space-y-8">
                         <div className="flex items-center space-x-4 mb-2">
                             <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center text-pink-400">
                                <ShieldCheck className="h-8 w-8" />
                             </div>
                             <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white">Knowledge Check</h2>
                                <p className="text-lg text-gray-400">Question 2 of 2</p>
                             </div>
                         </div>
                         
                         <h3 className="text-2xl font-medium text-white leading-relaxed p-4 bg-slate-800/50 rounded-xl border border-white/5">
                            What factor most strongly affects your credit score?
                         </h3>

                         <div className="grid grid-cols-1 gap-4">
                            {['Payment history', 'Number of credit cards', 'Types of credit accounts you have', 'Recent inquiries on credit'].map(opt => renderOption(opt, 'knowledge_credit_score', answers.knowledge_credit_score))}
                         </div>
                    </div>
                )}

            </div>

            {/* Navigation Footer */}
            <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
                <button 
                    onClick={prevStep} 
                    disabled={step === 1}
                    className="flex items-center px-6 py-3 text-lg font-medium text-gray-400 hover:text-white disabled:opacity-0 transition-colors"
                >
                    <ChevronLeft className="mr-2 h-5 w-5" /> Back
                </button>
                
                {step < totalSteps ? (
                    <button 
                        onClick={nextStep}
                        disabled={
                            (step === 1 && !answers.monthly_income) ||
                            (step === 2 && !answers.primary_goal) ||
                            (step === 3 && !answers.financial_situation) ||
                            (step === 4 && !answers.investment_timeline) ||
                            (step === 5 && !answers.knowledge_emergency_fund)
                        }
                        className="flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-gray-500 text-white rounded-xl text-lg font-bold transition-all shadow-lg shadow-blue-900/30"
                    >
                        Next Step <ChevronRight className="ml-2 h-5 w-5" />
                    </button>
                ) : (
                    <button 
                        onClick={finishOnboarding}
                        disabled={!answers.knowledge_credit_score || loading}
                        className="flex items-center px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xl font-bold transition-all shadow-xl shadow-emerald-900/30 transform hover:scale-105"
                    >
                        {loading ? <Loader2 className="animate-spin h-6 w-6 mr-2" /> : "Complete & Enter Dashboard"}
                    </button>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default Onboarding;