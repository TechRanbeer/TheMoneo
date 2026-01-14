import React, { useState } from 'react';
import { AppView } from '../types';
import { 
  TrendingUp, Activity, BarChart3, 
  BrainCircuit, Users, CheckCircle, 
  ArrowRight, Shield, ChevronDown, ChevronUp,
  Zap, PieChart, Coins
} from 'lucide-react';

interface LandingProps {
  setView: (view: AppView) => void;
}

const HeroVisual = () => (
  <div className="relative w-full max-w-lg mx-auto lg:max-w-none perspective-1000">
     {/* Abstract decorative blobs */}
     <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-600/30 rounded-full blur-[100px] animate-pulse"></div>
     <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse delay-700"></div>

     {/* Main Card */}
     <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl transform rotate-y-12 hover:rotate-0 transition-transform duration-700 ease-out">
        {/* Mock Header */}
        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
           <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
           </div>
           <div className="flex items-center gap-2">
              <div className="h-2 w-20 bg-slate-700 rounded-full"></div>
           </div>
        </div>
        
        {/* Mock Content */}
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                <div className="text-xs text-gray-400 mb-1">Total Savings</div>
                <div className="text-xl font-bold text-white">₹1.2L</div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" /> +12%
                </div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                <div className="text-xs text-gray-400 mb-1">Monthly Budget</div>
                <div className="text-xl font-bold text-white">₹45k</div>
                <div className="text-xs text-blue-400 mt-1">65% used</div>
            </div>
        </div>

        {/* Mock Chart Area */}
        <div className="flex gap-3 items-end h-32 mb-6 px-2">
           {[40, 70, 50, 90, 65, 85, 55].map((h, i) => (
               <div key={i} className="w-full bg-blue-500/20 rounded-t-sm relative group overflow-hidden">
                   <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-1000" 
                    style={{ height: `${h}%` }}
                   ></div>
               </div>
           ))}
        </div>

        {/* Mock List */}
        <div className="space-y-3">
           <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Coins className="w-4 h-4 text-emerald-500" />
                 </div>
                 <div className="space-y-1">
                    <div className="h-2 w-24 bg-slate-700 rounded-full"></div>
                    <div className="h-2 w-16 bg-slate-800 rounded-full"></div>
                 </div>
              </div>
              <div className="h-2 w-12 bg-emerald-500/50 rounded-full"></div>
           </div>
           <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                     <Zap className="w-4 h-4 text-red-500" />
                 </div>
                 <div className="space-y-1">
                    <div className="h-2 w-24 bg-slate-700 rounded-full"></div>
                    <div className="h-2 w-16 bg-slate-800 rounded-full"></div>
                 </div>
              </div>
              <div className="h-2 w-12 bg-red-500/50 rounded-full"></div>
           </div>
        </div>
     </div>
     
     {/* Floating Badge */}
     <div className="absolute -right-4 top-1/2 bg-slate-800 p-4 rounded-xl border border-white/10 shadow-xl z-20 animate-bounce" style={{ animationDuration: '3s' }}>
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30">
              <CheckCircle size={20} />
           </div>
           <div>
              <p className="text-xs text-gray-400">Savings Goal</p>
              <p className="text-sm font-bold text-white">On Track!</p>
           </div>
        </div>
     </div>
  </div>
);

const BentoCard: React.FC<{ 
    title: string; 
    desc: string; 
    icon: React.ReactNode; 
    className?: string;
    bgClass?: string;
}> = ({ title, desc, icon, className, bgClass }) => (
  <div className={`relative overflow-hidden p-8 rounded-3xl border border-white/10 group ${className} ${bgClass || 'bg-slate-800/50'}`}>
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 120 }) : null}
    </div>
    <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="mb-4 p-3 bg-white/10 w-fit rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            {icon}
        </div>
        <div>
            <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
            <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
  </div>
);

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/10 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
            >
                <span className="text-lg font-medium text-white">{question}</span>
                {isOpen ? <ChevronUp className="text-blue-500" /> : <ChevronDown className="text-gray-500" />}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                <p className="text-gray-400 leading-relaxed">{answer}</p>
            </div>
        </div>
    );
}

const LandingPage: React.FC<LandingProps> = ({ setView }) => {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Text Content */}
            <div className="text-center lg:text-left relative z-10">
                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                    Your Money, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                        Intelligently Managed.
                    </span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    MONEO tracks, analyzes, and guides your financial journey. Stop guessing where your money goes and start building wealth with your personal AI coach.
                </p>

                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                    <button 
                        onClick={() => setView(AppView.REGISTER)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 flex items-center justify-center"
                    >
                        Start For Free <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                    <button 
                        onClick={() => setView(AppView.LOGIN)}
                        className="px-8 py-4 rounded-full text-lg font-bold text-white border border-white/10 hover:bg-white/5 transition-all"
                    >
                        Login
                    </button>
                </div>
            </div>

            {/* Visual Content */}
            <div className="relative mt-12 lg:mt-0">
                <HeroVisual />
            </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-blue-600/5 skew-y-3 transform origin-top-left -z-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">The "Where did it go?" Problem</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Most tracking apps are glorified spreadsheets. They tell you what you spent, but not how to save. 
            MONEO is different. It's proactive, personalized, and built for the Indian economy.
          </p>
          <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl">
            <span className="absolute top-4 left-6 text-6xl text-blue-800/20 font-serif">"</span>
            <p className="text-2xl font-light text-white italic relative z-10">
              It’s not about lack of money — it’s about lack of clarity.
            </p>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Everything you need to grow</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">A complete financial ecosystem designed to take you from spender to saver.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
            <BentoCard 
                className="md:col-span-2"
                bgClass="bg-gradient-to-br from-blue-900/40 to-slate-900"
                title="Agentic AI Coach" 
                desc="A 24/7 financial companion that analyzes your patterns and sends tailored tips, bill reminders, and progress nudges before you overspend."
                icon={<BrainCircuit size={32} />}
            />
            <BentoCard 
                title="Smart Budgeting" 
                desc="Automatically tracks expenses and sets smart budgets based on your income."
                icon={<PieChart size={32} />}
            />
            <BentoCard 
                title="Indian Context" 
                desc="Built for ₹. Understands UPI, FD, RD, and Indian market instruments."
                icon={<Coins size={32} />}
            />
            <BentoCard 
                className="md:col-span-2"
                bgClass="bg-gradient-to-bl from-cyan-900/20 to-slate-900"
                title="Interactive Learning" 
                desc="Don't just track, learn. Chat with the AI to understand investing basics, debt management, and how to build an emergency fund."
                icon={<Zap size={32} />}
            />
        </div>
      </section>

      {/* AI Flow Redesigned */}
      <section className="py-24 bg-slate-900 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                   <h2 className="text-3xl font-bold text-white mb-4">How MONEO Works</h2>
                   <p className="text-gray-400">Simple steps to financial freedom</p>
                </div>
                <div className="space-y-8">
                    {[
                        { step: '01', title: 'Input & Retrieval', desc: 'Securely link accounts or log data manually.' },
                        { step: '02', title: 'LLM Analysis', desc: 'AI detects patterns, trends, and anomalies.' },
                        { step: '03', title: 'Actionable Nudges', desc: 'Get alerts like "Budget warning: 80% used".' },
                        { step: '04', title: 'Visual Growth', desc: 'Watch your savings grow on the dashboard.' },
                    ].map((item) => (
                        <div key={item.step} className="flex group bg-slate-800/30 p-4 rounded-xl border border-white/5 hover:bg-slate-800 hover:border-blue-500/30 transition-all">
                            <div className="mr-6 flex-shrink-0">
                                <div className="w-12 h-12 rounded-full border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono text-lg font-bold bg-blue-900/10">
                                    {item.step}
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                                <p className="text-gray-400 text-sm">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
        <div className="space-y-2">
            <FAQItem 
                question="Is my financial data safe?" 
                answer="Absolutely. We use bank-grade encryption and never sell your personal data. The AI processes anonymized patterns to give advice."
            />
            <FAQItem 
                question="Can I use this for my business?" 
                answer="MONEO is primarily designed for personal finance (students, freelancers, salaried). Small business features are on our roadmap."
            />
             <FAQItem 
                question="Is the app free?" 
                answer="Yes! Core tracking and AI coaching features are completely free. We will introduce premium advanced analytics in the future."
            />
             <FAQItem 
                question="Does it support automatic bank syncing?" 
                answer="Currently, we support manual entry for maximum accuracy and privacy. We are piloting secure bank account aggregation soon."
            />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-12 text-center border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Take control of your wallet today.</h2>
                <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">Join the waitlist for the smartest finance tracker in India. It takes less than 2 minutes to set up.</p>
                <button 
                    onClick={() => setView(AppView.REGISTER)}
                    className="bg-white text-blue-900 hover:bg-gray-100 px-10 py-4 rounded-full text-lg font-bold shadow-xl transition-transform hover:scale-105"
                >
                    Get Started Now
                </button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark py-12 px-4 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-lg font-bold text-white">MONEO</span>
            </div>
            <p className="text-gray-500">© 2025 Team Hack n Snack. All rights reserved.</p>
          </div>
          <div className="flex space-x-6 text-gray-400">
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">Terms</a>
             <a href="#" className="hover:text-white transition-colors">Twitter</a>
             <a href="#" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;