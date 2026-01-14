import React, { useState } from 'react';
import { AppView } from '../types';
import { ArrowRight, Lock, Mail, User as UserIcon, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface AuthProps {
  view: AppView.LOGIN | AppView.REGISTER;
  setView: (view: AppView) => void;
  onLoginSuccess: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ view, setView, onLoginSuccess }) => {
  const isLogin = view === AppView.LOGIN;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (!isLogin && formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const res = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
        // Success
        localStorage.setItem('moneo_token', 'mock-session'); // signal app we are logged in
        onLoginSuccess(res.user);

      } else {
        // REGISTER
        const res = await api.post('/auth/register', {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password
        });
        // Success
        localStorage.setItem('moneo_token', 'mock-session');
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      // CRITICAL: Always reset loading state
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-brand-dark/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-white">
            {isLogin ? 'Welcome Back' : 'Join MONEO'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to track your budget in <span className="text-blue-400 font-bold">₹</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center text-red-200 text-sm animate-pulse">
            <AlertCircle className="h-4 w-4 mr-2" /> {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="firstName"
                    type="text"
                    required
                    onChange={handleChange}
                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800/50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="First Name"
                  />
                </div>
                 <div className="relative">
                  <input
                    name="lastName"
                    type="text"
                    required
                    onChange={handleChange}
                    className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800/50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Last Name"
                  />
                </div>
              </div>
            )}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                name="email"
                type="email"
                required
                onChange={handleChange}
                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800/50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                name="password"
                type="password"
                required
                onChange={handleChange}
                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800/50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
              />
            </div>
             {!isLogin && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  onChange={handleChange}
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800/50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm Password"
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all shadow-lg shadow-blue-500/30"
            >
              {loading ? (
                <span className="flex items-center">Processing...</span>
              ) : (
                <span className="flex items-center">
                  {isLogin ? 'Login' : 'Create an account'}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setView(isLogin ? AppView.REGISTER : AppView.LOGIN)}
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;