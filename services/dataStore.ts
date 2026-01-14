import { User, Transaction, OnboardingData, DashboardStats, Subscription, BudgetHealth, ReflectionItem } from '../types';

// Keys for localStorage
const KEYS = {
  USERS: 'moneo_users',
  PROFILES: 'moneo_profiles',
  TRANSACTIONS: 'moneo_transactions',
  SUBSCRIPTIONS: 'moneo_subscriptions',
  REFLECTIONS: 'moneo_reflections',
  SESSION: 'moneo_session'
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Category Mapping Constants
const CAT_ESSENTIALS = ['Rent', 'Food', 'Travel', 'Utilities', 'Education', 'Health', 'Essentials'];
const CAT_LIFESTYLE = ['Shopping', 'Entertainment', 'Subscriptions', 'Other', 'Lifestyle'];

export const dataStore = {
  // --- Auth ---
  register: async (userData: any) => {
    await delay(800);
    const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    
    // Check if email exists
    if (users.find((u: User) => u.email === userData.email)) {
      throw new Error("Email already registered");
    }

    const newUser = {
      id: Date.now(),
      ...userData,
      onboarding_completed: false
    };

    users.push(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    
    // Auto-login (create session)
    localStorage.setItem(KEYS.SESSION, JSON.stringify(newUser.id));
    return { user: newUser, token: 'mock-jwt-token' };
  },

  login: async (creds: any) => {
    await delay(800);
    const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const user = users.find((u: any) => u.email === creds.email && u.password === creds.password);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    localStorage.setItem(KEYS.SESSION, JSON.stringify(user.id));
    return { user, token: 'mock-jwt-token' };
  },

  logout: async () => {
    await delay(200);
    localStorage.removeItem(KEYS.SESSION);
  },

  getCurrentUser: async () => {
    await delay(300);
    const sessionId = JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null');
    if (!sessionId) return null;

    const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const user = users.find((u: User) => u.id === sessionId);
    return user || null;
  },

  getCurrentUserProfile: async () => {
    const userId = JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null');
    if (!userId) return null;
    const profiles = JSON.parse(localStorage.getItem(KEYS.PROFILES) || '{}');
    return profiles[userId] || null;
  },

  updateIncome: async (income: number) => {
    const userId = JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null');
    if (!userId) throw new Error("Not authenticated");
    const profiles = JSON.parse(localStorage.getItem(KEYS.PROFILES) || '{}');
    if (profiles[userId]) {
        profiles[userId].monthly_income = income;
        localStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));
    }
    return profiles[userId];
  },

  // --- Onboarding ---
  saveOnboarding: async (data: OnboardingData) => {
    await delay(800);
    const userId = JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null');
    if (!userId) throw new Error("Not authenticated");

    // Save Profile
    const profiles = JSON.parse(localStorage.getItem(KEYS.PROFILES) || '{}');
    profiles[userId] = data;
    localStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));

    // Update User Status
    const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const userIndex = users.findIndex((u: User) => u.id === userId);
    if (userIndex > -1) {
      users[userIndex].onboarding_completed = true;
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }

    return { success: true };
  },

  // --- Subscriptions ---
  getSubscriptions: async () => {
    await delay(400);
    const userId = JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null');
    if (!userId) throw new Error("Not authenticated");
    const allSubs = JSON.parse(localStorage.getItem(KEYS.SUBSCRIPTIONS) || '[]');
    return allSubs.filter((s: Subscription) => s.user_id === userId);
  },

  addSubscription: async (subData: any) => {
    await delay(400);
    const userId = JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null');
    if (!userId) throw new Error("Not authenticated");

    const allSubs = JSON.parse(localStorage.getItem(KEYS.SUBSCRIPTIONS) || '[]');
    const newSub: Subscription = {
        id: Date.now(),
        user_id: userId,
        active: true,
        ...subData
    };
    allSubs.push(newSub);
    localStorage.setItem(KEYS.SUBSCRIPTIONS, JSON.stringify(allSubs));
    
    // Immediately log first expense
    await dataStore.syncSubscriptionTransactions(userId);
    
    return newSub;
  },

  toggleSubscription: async (id: number) => {
      await delay(200);
      const allSubs = JSON.parse(localStorage.getItem(KEYS.SUBSCRIPTIONS) || '[]');
      const index = allSubs.findIndex((s: Subscription) => s.id === id);
      
      if (index > -1) {
          const sub = allSubs[index];
          // Toggle status
          sub.active = !sub.active;
          localStorage.setItem(KEYS.SUBSCRIPTIONS, JSON.stringify(allSubs));
          
          const userId = sub.user_id;
          
          if (!sub.active) {
              // CANCELLATION LOGIC:
              // Find the transaction for the CURRENT month for this subscription and remove it
              const allTx = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
              const now = new Date();
              const currentMonthStr = now.toISOString().slice(0, 7); // YYYY-MM
              
              // Find matching transaction
              const txIndex = allTx.findIndex((t: any) => 
                  t.user_id === userId && 
                  t.category === 'Subscriptions' &&
                  t.description === `Subscription: ${sub.name}` &&
                  t.date.startsWith(currentMonthStr)
              );
              
              if (txIndex > -1) {
                  // Remove the transaction (Refund/Reverse financial impact)
                  allTx.splice(txIndex, 1);
                  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(allTx));
              }
          } else {
              // REACTIVATION LOGIC:
              // Immediately sync to add the transaction back if it's missing for this month
              await dataStore.syncSubscriptionTransactions(userId);
          }

          return sub;
      }
      throw new Error("Subscription not found");
  },

  // --- Reflection / Mindful Spending ---
  addReflection: async (item: { name: string; cost: number; durationMinutes: number }) => {
    const userId = JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null');
    if (!userId) throw new Error("Not authenticated");

    const reflections = JSON.parse(localStorage.getItem(KEYS.REFLECTIONS) || '[]');
    const now = Date.now();
    const newItem: ReflectionItem = {
      id: now,
      user_id: userId,
      name: item.name,
      cost: item.cost,
      startTime: now,
      durationMinutes: item.durationMinutes,
      endTime: now + (item.durationMinutes * 60 * 1000),
      status: 'pending'
    };
    
    reflections.push(newItem);
    localStorage.setItem(KEYS.REFLECTIONS, JSON.stringify(reflections));
    return newItem;
  },

  getReflections: () => {
    const userId = JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null');
    if (!userId) return [];
    
    const reflections = JSON.parse(localStorage.getItem(KEYS.REFLECTIONS) || '[]');
    // Return items for user
    return reflections.filter((r: ReflectionItem) => r.user_id === userId);
  },

  resolveReflection: (id: number, decision: 'purchased' | 'skipped') => {
    const reflections = JSON.parse(localStorage.getItem(KEYS.REFLECTIONS) || '[]');
    const index = reflections.findIndex((r: ReflectionItem) => r.id === id);
    if (index > -1) {
      reflections[index].status = decision;
      localStorage.setItem(KEYS.REFLECTIONS, JSON.stringify(reflections));
    }
  },

  // --- Transactions ---
  // Helper to ensure active subscriptions have a transaction record for the current month
  syncSubscriptionTransactions: async (userId: number) => {
    const allTx = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
    const allSubs = JSON.parse(localStorage.getItem(KEYS.SUBSCRIPTIONS) || '[]');
    
    const userSubs = allSubs.filter((s: Subscription) => s.user_id === userId && s.active);
    const now = new Date();
    const currentMonthStr = now.toISOString().slice(0, 7); // YYYY-MM
    
    let added = false;

    userSubs.forEach((sub: Subscription) => {
        // Check if transaction exists for this month
        const txExists = allTx.some((t: any) => 
            t.user_id === userId && 
            t.category === 'Subscriptions' &&
            t.description === `Subscription: ${sub.name}` &&
            t.date.startsWith(currentMonthStr)
        );

        if (!txExists) {
            // Determine a date (e.g., today)
            const d = new Date();
            const dateStr = d.toISOString().split('T')[0];
            
            // Assume monthly billing for budget impact for now
            // Or calculate portion based on cycle. Prompt says "appropriate monthly amount".
            let chargeAmount = sub.cost;
            if (sub.billing_cycle === 'six_months') chargeAmount = sub.cost / 6;
            if (sub.billing_cycle === 'yearly') chargeAmount = sub.cost / 12;

            const newTx = {
                id: Date.now() + Math.random(),
                user_id: userId,
                type: 'expense',
                amount: Math.round(chargeAmount),
                category: 'Subscriptions',
                date: dateStr,
                description: `Subscription: ${sub.name}`
            };
            allTx.push(newTx);
            added = true;
        }
    });

    if (added) {
        localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(allTx));
    }
  },

  addTransaction: async (txData: any) => {
    await delay(500);
    const userId = JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null');
    if (!userId) throw new Error("Not authenticated");

    const transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
    const newTx = {
      id: Date.now(),
      user_id: userId,
      ...txData
    };
    transactions.push(newTx);
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return newTx;
  },

  getTransactions: async () => {
    await delay(400);
    const userId = JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null');
    if (!userId) throw new Error("Not authenticated");

    // Sync subscriptions before returning
    await dataStore.syncSubscriptionTransactions(userId);

    const allTx = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
    // Filter by user and sort by date desc
    return allTx
      .filter((t: any) => t.user_id === userId)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // --- Dashboard Stats with Intelligent Budgeting ---
  getDashboardStats: async () => {
    await delay(600);
    const userId = JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null');
    if (!userId) throw new Error("Not authenticated");

    // Sync subscriptions first to ensure dashboard reflects them
    await dataStore.syncSubscriptionTransactions(userId);

    const allTx = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
    const profiles = JSON.parse(localStorage.getItem(KEYS.PROFILES) || '{}');
    const profile = profiles[userId] || {};
    
    const userTx = allTx.filter((t: any) => t.user_id === userId);

    // Current Month Filter
    const now = new Date();
    const currentMonthTx = userTx.filter((t: any) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    // 1. Determine Income (Single Source of Truth: Quiz Income)
    const baseIncome = profile.monthly_income || 0;

    // 2. Map Expenses to Buckets
    let spentEssentials = 0;
    let spentLifestyle = 0;
    const categoryMap: Record<string, number> = {};

    currentMonthTx.filter((t: any) => t.type === 'expense').forEach((t: any) => {
        const cat = t.category;
        categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;

        if (CAT_ESSENTIALS.includes(cat)) {
            spentEssentials += t.amount;
        } else {
            // Default to Lifestyle (Shopping, Subscriptions, Other, etc.)
            spentLifestyle += t.amount;
        }
    });

    // 4. Calculate Limits (50-30-20 Rule)
    const limitEssentials = baseIncome * 0.50;
    const limitLifestyle = baseIncome * 0.30;
    const goalSavings = baseIncome * 0.20;

    // 5. Calculate Total Spent and Net Savings
    const totalSpent = spentEssentials + spentLifestyle;
    const netSavings = baseIncome - totalSpent; 

    // 6. Status Helpers
    const getStatus = (spent: number, limit: number, isSavings = false) => {
        if (isSavings) {
             return spent >= limit ? 'on_track' : 'behind';
        }
        if (spent > limit) return 'exceeded';
        if (spent > limit * 0.85) return 'warning';
        return 'ok';
    };

    const budget_health: BudgetHealth = {
        essentials: {
            label: 'Essentials (50%)',
            limit: limitEssentials,
            spent: spentEssentials,
            status: getStatus(spentEssentials, limitEssentials),
            percent: Math.min((spentEssentials / limitEssentials) * 100, 100),
            color: spentEssentials > limitEssentials ? '#ef4444' : (spentEssentials > limitEssentials * 0.85 ? '#f59e0b' : '#3b82f6')
        },
        lifestyle: {
            label: 'Lifestyle (30%)',
            limit: limitLifestyle,
            spent: spentLifestyle,
            status: getStatus(spentLifestyle, limitLifestyle),
            percent: Math.min((spentLifestyle / limitLifestyle) * 100, 100),
            color: spentLifestyle > limitLifestyle ? '#ef4444' : (spentLifestyle > limitLifestyle * 0.85 ? '#f59e0b' : '#06b6d4')
        },
        savings: {
            label: 'Savings Goal (20%)',
            limit: goalSavings,
            spent: netSavings,
            status: getStatus(netSavings, goalSavings, true),
            percent: Math.max(0, Math.min((netSavings / goalSavings) * 100, 100)), 
            color: netSavings >= goalSavings ? '#10b981' : '#f59e0b'
        },
        alerts: [],
        investmentAdvice: null
    };

    // 7. Generate Alerts
    if (spentEssentials > limitEssentials) {
        budget_health.alerts.push(`Essentials exceeded by ₹${(spentEssentials - limitEssentials).toFixed(0)}. This is eating into your savings.`);
    }
    if (spentLifestyle > limitLifestyle) {
        budget_health.alerts.push(`Lifestyle overspent by ₹${(spentLifestyle - limitLifestyle).toFixed(0)}. Reduce shopping or subscriptions.`);
    }
    if (netSavings < goalSavings) {
        const deficit = goalSavings - netSavings;
        budget_health.alerts.push(`You are ₹${deficit.toFixed(0)} behind your savings goal of ₹${goalSavings.toFixed(0)}.`);
    }

    // 8. Investment Advice Milestones
    if (netSavings > 2000) {
        budget_health.investmentAdvice = "Excellent savings! With ₹2000+, consider diversifying into Index Funds or a small SIP.";
    } else if (netSavings > 1500) {
         budget_health.investmentAdvice = "You have over ₹1500 saved but not invested. Don't let inflation eat it—look into liquid funds.";
    } else if (netSavings > 1000) {
         budget_health.investmentAdvice = "Great milestone! You crossed ₹1000. Keep this as your emergency buffer.";
    } else if (netSavings > 500) {
         budget_health.investmentAdvice = "Good start! You have ₹500+. Aim for ₹1000 next.";
    } else if (netSavings > 100) {
         budget_health.investmentAdvice = "Every journey starts small. You've saved your first ₹100.";
    }

    // 9. Formatting for Dashboard
    const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];
    const spending_by_category = Object.entries(categoryMap).map(([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length]
    }));

    const displayIncome = baseIncome;
    const displayExpense = totalSpent;
    let goal_progress = `Target: ₹${goalSavings.toFixed(0)}`;

    return {
      income: displayIncome,
      expense: displayExpense,
      savings: netSavings,
      goal_progress,
      spending_by_category,
      budget_health
    };
  },

  getSummary: async (period: string) => {
     await delay(500);
    const userId = JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null');
    // Sync subs first
    await dataStore.syncSubscriptionTransactions(userId);
    
    const allTx = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
    let userTx = allTx.filter((t: any) => t.user_id === userId);
    
    const now = new Date();
    
    if (period === 'this_month') {
        userTx = userTx.filter((t: any) => {
            const d = new Date(t.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
    } else if (period === 'last_month') {
        userTx = userTx.filter((t: any) => {
            const d = new Date(t.date);
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
        });
    }

    const income = userTx.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0);
    const expense = userTx.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0);
    
    const catStats: Record<string, any> = {};
    userTx.filter((t: any) => t.type === 'expense').forEach((t: any) => {
        if (!catStats[t.category]) catStats[t.category] = { category: t.category, total: 0, count: 0 };
        catStats[t.category].total += t.amount;
        catStats[t.category].count += 1;
    });

    return {
        income,
        expense,
        tx_count: userTx.length,
        breakdown: Object.values(catStats).sort((a: any, b: any) => b.total - a.total)
    };
  }
};