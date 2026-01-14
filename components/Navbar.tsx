import React from 'react';
import { TrendingUp, Menu, X, LayoutDashboard, PlusCircle, CreditCard, History, Bot, LogOut, Brain } from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, isLoggedIn, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleNav = (view: AppView) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => handleNav(view)}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        currentView === view 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-300 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </button>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/90 backdrop-blur-md border-b border-brand-glassBorder">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => !isLoggedIn && handleNav(AppView.LANDING)}>
            <div className="bg-gradient-to-tr from-blue-500 to-cyan-400 p-2 rounded-lg mr-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">MONEO</span>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              {isLoggedIn ? (
                <>
                  <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
                  <NavItem view={AppView.TRANSACTIONS} icon={PlusCircle} label="Transactions" />
                  <NavItem view={AppView.SUBSCRIPTIONS} icon={CreditCard} label="Subscriptions" />
                  <NavItem view={AppView.REFLECT} icon={Brain} label="Reflect" />
                  <NavItem view={AppView.HISTORY} icon={History} label="History" />
                  <NavItem view={AppView.COACH} icon={Bot} label="AI Coach" />
                  <div className="h-6 w-px bg-gray-700 mx-2"></div>
                  <button 
                    onClick={onLogout} 
                    className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-1" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleNav(AppView.LOGIN)} className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Login
                  </button>
                  <button 
                    onClick={() => handleNav(AppView.REGISTER)} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-blue-500/30"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-brand-dark border-b border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isLoggedIn ? (
               <>
                  <button onClick={() => handleNav(AppView.DASHBOARD)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Dashboard</button>
                  <button onClick={() => handleNav(AppView.TRANSACTIONS)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Transactions</button>
                  <button onClick={() => handleNav(AppView.SUBSCRIPTIONS)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Subscriptions</button>
                  <button onClick={() => handleNav(AppView.REFLECT)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Reflect</button>
                  <button onClick={() => handleNav(AppView.HISTORY)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">History</button>
                  <button onClick={() => handleNav(AppView.COACH)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">AI Coach</button>
                  <button onClick={onLogout} className="text-red-400 hover:text-red-300 block px-3 py-2 rounded-md text-base font-medium w-full text-left">Logout</button>
               </>
            ) : (
              <>
                <button onClick={() => handleNav(AppView.LOGIN)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">
                  Login
                </button>
                <button onClick={() => handleNav(AppView.REGISTER)} className="text-white bg-blue-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left">
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;