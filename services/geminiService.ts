import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DashboardStats, Subscription, User } from "../types";

// Initialize the API client
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

interface FinancialContext {
  stats: DashboardStats;
  subscriptions: Subscription[];
  userProfile: any;
}

export const getFinancialAdvice = async (
  prompt: string, 
  context: FinancialContext
): Promise<string> => {
  if (!apiKey) {
    return "System Notice: API Key is missing. I cannot access my financial brain without it.";
  }

  try {
    const model = 'gemini-2.5-flash';
    
    // 1. Analyze Context for Stress/Tone Adaptation
    const { stats, subscriptions, userProfile } = context;
    
    const essentialsStatus = stats.budget_health.essentials.status;
    const lifestyleStatus = stats.budget_health.lifestyle.status;
    const savingsStatus = stats.budget_health.savings.status;

    const isOverBudget = essentialsStatus === 'exceeded' || lifestyleStatus === 'exceeded';
    const isBehindSavings = savingsStatus === 'behind';
    const isStressed = isOverBudget || isBehindSavings;

    // 2. Construct Data Summary for the AI
    const financialDataSummary = JSON.stringify({
      user: {
        name: userProfile?.first_name || 'User',
        monthly_income: stats.income,
        total_spent_this_month: stats.expense,
        net_savings: stats.savings,
        savings_goal_target: stats.budget_health.savings.limit
      },
      budget_health: {
        essentials: {
          spent: stats.budget_health.essentials.spent,
          limit: stats.budget_health.essentials.limit,
          status: essentialsStatus
        },
        lifestyle: {
          spent: stats.budget_health.lifestyle.spent,
          limit: stats.budget_health.lifestyle.limit,
          status: lifestyleStatus
        },
        savings: {
          actual: stats.budget_health.savings.spent,
          target: stats.budget_health.savings.limit,
          status: savingsStatus
        }
      },
      active_subscriptions: subscriptions.filter(s => s.active).map(s => ({
        name: s.name,
        cost: s.cost,
        cycle: s.billing_cycle
      })),
      spending_breakdown: stats.spending_by_category.map(c => `${c.name}: ${c.value}`)
    });

    // 3. Define Persona and Instructions
    const toneInstruction = isStressed
      ? "The user is currently facing financial stress (over budget or behind on savings). Adopt a slightly softer, more polite, and empathetic tone. Acknowledge the difficulty, but remain composed and professional. Do not be overly pitying."
      : "The user is on track. Maintain a clear, cool, and structured professional tone.";

    const SYSTEM_INSTRUCTION = `
    You are MONEO, a super competent, cool, and formal personal finance coach.
    
    CORE BEHAVIOR:
    1. Answer the user's question directly and precisely.
    2. Use the provided FINANCIAL DATA to give specific, calculated answers (e.g., "You have spent ₹5,000 on lifestyle," not "You spent a lot").
    3. If data is missing for a specific query, state clearly what is unknown. Do not guess.
    4. Provide actionable financial coaching based on the 50-30-20 rule.
    5. CRITICAL: Keep your initial response CONCISE. Give the direct answer or summary first. Do not provide a long detailed explanation unless the user explicitly asks for details.

    STYLE CONSTRAINTS:
    - DO NOT use emojis. Ever.
    - No exaggerated enthusiasm or casual slang.
    - Be concise and professional.
    - Currency: Indian Rupee (₹).

    TONE ADAPTATION:
    ${toneInstruction}

    FINANCIAL DATA:
    ${financialDataSummary}
    `;

    // 4. Call Gemini
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Slightly lower for more structured responses
      }
    });

    return response.text || "I processed your request, but I have no response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I am currently unable to access the financial network. Please try again later.";
  }
};