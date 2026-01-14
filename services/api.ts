import { dataStore } from './dataStore';

// Adapter to keep the existing component code working while switching to local storage
export const api = {
  get: async (endpoint: string) => {
    try {
      if (endpoint === '/auth/me') {
        const user = await dataStore.getCurrentUser();
        return { user };
      }
      if (endpoint === '/dashboard') {
        return await dataStore.getDashboardStats();
      }
      if (endpoint === '/transactions') {
        return await dataStore.getTransactions();
      }
      if (endpoint === '/subscriptions') {
        return await dataStore.getSubscriptions();
      }
      if (endpoint.startsWith('/summary')) {
        const urlParams = new URLSearchParams(endpoint.split('?')[1]);
        const period = urlParams.get('period') || 'this_month';
        return await dataStore.getSummary(period);
      }
      throw new Error(`Unknown endpoint: ${endpoint}`);
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message || "An unknown error occurred");
    }
  },

  post: async (endpoint: string, body: any) => {
    try {
      if (endpoint === '/auth/login') {
        return await dataStore.login(body);
      }
      if (endpoint === '/auth/register') {
        return await dataStore.register(body);
      }
      if (endpoint === '/onboarding') {
        return await dataStore.saveOnboarding(body);
      }
      if (endpoint === '/transactions') {
        return await dataStore.addTransaction(body);
      }
      if (endpoint === '/subscriptions') {
        return await dataStore.addSubscription(body);
      }
      if (endpoint === '/subscriptions/toggle') {
        return await dataStore.toggleSubscription(body.id);
      }
      // Mock Coach is handled in component, but if needed:
      if (endpoint === '/coach') {
        return { text: "I'm a local demo bot. Please update AICoach.tsx to use local logic." }; 
      }
      throw new Error(`Unknown endpoint: ${endpoint}`);
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message || "An unknown error occurred");
    }
  }
};