import React, { useState, useEffect } from 'react';
import { AppView, User, ReflectionItem } from './types';
import { api } from './services/api';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import TransactionsView from './components/TransactionsView';
import SubscriptionsView from './components/SubscriptionsView';
import HistoryView from './components/HistoryView';
import ReflectView from './components/ReflectView';
import AICoach from './components/AICoach';
import { dataStore } from './services/dataStore';
import { Brain, CheckCircle, XCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Global Reflection Popup State
  const [reflectionPopupItem, setReflectionPopupItem] = useState<ReflectionItem | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await dataStore.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          if (!currentUser.onboarding_completed) {
            setCurrentView(AppView.ONBOARDING);
          } else {
            setCurrentView(AppView.DASHBOARD);
          }
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // Global Timer for Reflection
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
        const items = dataStore.getReflections();
        const now = Date.now();
        // Find the first pending item that has expired
        const expired = items.find(i => i.status === 'pending' && now > i.endTime);
        
        if (expired) {
            setReflectionPopupItem(expired);
        }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [user, reflectionPopupItem]); // Re-run if user changes or if popup is already showing

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    if (!userData.onboarding_completed) {
      setCurrentView(AppView.ONBOARDING);
    } else {
      setCurrentView(AppView.DASHBOARD);
    }
  };

  const handleLogout = () => {
    dataStore.logout();
    setUser(null);
    setCurrentView(AppView.LANDING);
  };

  const handleReflectionDecision = (decision: 'purchased' | 'skipped') => {
      if (reflectionPopupItem) {
          dataStore.resolveReflection(reflectionPopupItem.id, decision);
          setReflectionPopupItem(null);
      }
  };

  if (checkingAuth) {
    return <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white">Loading MONEO...</div>;
  }

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-blue-500/30">
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isLoggedIn={!!user}
        onLogout={handleLogout}
      />
      
      {/* Global Reflection Popup */}
      {reflectionPopupItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"></div>
              <div className="relative bg-slate-900 border border-indigo-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl transform animate-slide-in-up">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Brain className="w-8 h-8 text-indigo-400" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white text-center mb-2">Reflection Complete</h2>
                  <p className="text-gray-300 text-center mb-8">
                      You waited for {reflectionPopupItem.durationMinutes} minutes. <br/>
                      Do you still want to buy <span className="text-indigo-400 font-bold">{reflectionPopupItem.name}</span> for ₹{reflectionPopupItem.cost}?
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleReflectionDecision('skipped')}
                        className="flex items-center justify-center py-4 rounded-xl bg-slate-800 text-gray-300 border border-slate-700 hover:bg-slate-700 transition-all font-medium"
                      >
                         <XCircle className="w-5 h-5 mr-2" /> No, Skip
                      </button>
                      <button 
                        onClick={() => handleReflectionDecision('purchased')}
                        className="flex items-center justify-center py-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-900/30"
                      >
                         <CheckCircle className="w-5 h-5 mr-2" /> Yes, Buy It
                      </button>
                  </div>
              </div>
          </div>
      )}
      
      <main className="relative z-10">
        {currentView === AppView.LANDING && (
          <LandingPage setView={setCurrentView} />
        )}
        
        {(currentView === AppView.LOGIN || currentView === AppView.REGISTER) && (
          <Auth view={currentView} setView={setCurrentView} onLoginSuccess={handleLoginSuccess} />
        )}

        {/* Protected Routes */}
        {user && (
          <>
            {currentView === AppView.ONBOARDING && (
              <Onboarding setView={setCurrentView} />
            )}
            
            {currentView === AppView.DASHBOARD && (
              <Dashboard user={user} setView={setCurrentView} />
            )}

            {currentView === AppView.TRANSACTIONS && (
               <TransactionsView />
            )}

            {currentView === AppView.SUBSCRIPTIONS && (
               <SubscriptionsView />
            )}

            {currentView === AppView.REFLECT && (
               <ReflectView />
            )}

            {currentView === AppView.HISTORY && (
               <HistoryView />
            )}

            {currentView === AppView.COACH && (
               <AICoach />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;