import React from 'react';

export enum AppView {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  SUBSCRIPTIONS = 'SUBSCRIPTIONS',
  REFLECT = 'REFLECT',
  HISTORY = 'HISTORY',
  COACH = 'COACH'
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  onboarding_completed: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description?: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  name: string;
  cost: number;
  billing_cycle: 'monthly' | 'six_months' | 'yearly';
  active: boolean;
  provider_icon?: string; 
}

export interface ReflectionItem {
  id: number;
  user_id: number;
  name: string;
  cost: number;
  startTime: number;
  durationMinutes: number;
  endTime: number;
  status: 'pending' | 'purchased' | 'skipped';
}

export interface BudgetCategoryHealth {
  label: string;
  limit: number;
  spent: number;
  status: 'ok' | 'warning' | 'exceeded' | 'on_track' | 'behind';
  percent: number;
  color: string;
}

export interface BudgetHealth {
  essentials: BudgetCategoryHealth;
  lifestyle: BudgetCategoryHealth;
  savings: BudgetCategoryHealth;
  alerts: string[];
  investmentAdvice: string | null;
}

export interface DashboardStats {
  income: number;
  expense: number;
  savings: number;
  goal_progress?: string;
  spending_by_category: { name: string; value: number; color: string }[];
  budget_health: BudgetHealth;
}

export interface OnboardingData {
  monthly_income: number;
  primary_goal: string;
  financial_situation: string;
  investment_timeline: string;
  knowledge_emergency_fund: string;
  knowledge_credit_score: string;
  knowledge_score: number; // 0-2
}

export interface KPIProps {
  label: string;
  value: string;
  trend?: string;
  icon?: React.ReactNode;
}