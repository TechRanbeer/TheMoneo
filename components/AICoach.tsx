import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, User as UserIcon } from 'lucide-react';
import { ChatMessage } from '../types';
import { dataStore } from '../services/dataStore';
import { getFinancialAdvice } from '../services/geminiService';

const AICoach: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello. I am MONEO, your finance strategist. I have analyzed your current financial data. How may I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    try {
      // 1. Gather Context Data
      const [stats, subscriptions, userProfile] = await Promise.all([
        dataStore.getDashboardStats(),
        dataStore.getSubscriptions(),
        dataStore.getCurrentUser() // Using user basic info, profile is fetched within getDashboardStats usually, but we pass basic user here
      ]);

      // 2. Call Gemini Service
      const responseText = await getFinancialAdvice(text, {
        stats,
        subscriptions,
        userProfile
      });
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered an error retrieving your financial analysis. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="pt-24 pb-8 px-4 h-screen flex flex-col max-w-5xl mx-auto">
      <div className="flex-1 bg-brand-dark/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center space-x-3 bg-gradient-to-r from-slate-900 to-brand-dark">
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-lg shadow-lg shadow-blue-500/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white tracking-wide">AI Finance Coach</h3>
            <p className="text-xs text-blue-300 flex items-center font-medium mt-0.5">
              <Sparkles className="h-3 w-3 mr-1" /> Live Financial Context
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-900/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-blue-600 ml-2' : 'bg-slate-700 mr-2'}`}>
                    {msg.role === 'user' ? <UserIcon className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-cyan-300" />}
                </div>
                <div
                  className={`rounded-2xl px-5 py-3 text-sm md:text-base leading-relaxed shadow-md ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-800 border border-slate-700 text-gray-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start">
              <div className="h-8 w-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center mr-2">
                  <Bot className="h-4 w-4 text-cyan-300" />
              </div>
              <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700 shadow-md">
                <div className="flex space-x-1.5 items-center h-5">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-white/5 bg-slate-900/50 flex gap-2 overflow-x-auto">
          {["Analyze my spending", "Am I over budget?", "Review my subscriptions"].map(q => (
             <button key={q} onClick={() => handleSend(q)} className="whitespace-nowrap px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-sm text-blue-200 transition-colors">
               {q}
             </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-brand-dark/90 border-t border-white/10">
          <div className="relative group max-w-4xl mx-auto">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
              placeholder="Ask MONEO about your finances..."
              className="w-full bg-slate-900/80 text-white rounded-xl pl-4 pr-12 py-3.5 border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500 transition-all shadow-inner"
            />
            <button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim() || isThinking}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50 transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;