require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'moneo_secret_key_change_me';
const GOOGLE_API_KEY = process.env.API_KEY || '';

app.use(cors());
app.use(express.json());

// --- Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---

// Register
app.post('/api/auth/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  
  try {
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)').run(first_name, last_name, email, hashedPassword);
    
    const user = { id: result.lastInsertRowid, email, first_name, last_name, onboarding_completed: false };
    const token = jwt.sign(user, JWT_SECRET);
    
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    const tokenPayload = { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, onboarding_completed: Boolean(user.onboarding_completed) };
    const token = jwt.sign(tokenPayload, JWT_SECRET);
    
    res.json({ token, user: tokenPayload });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  // Refresh user data from DB to get latest status
  const user = db.prepare('SELECT id, first_name, last_name, email, onboarding_completed FROM users WHERE id = ?').get(req.user.id);
  if (user) {
    user.onboarding_completed = Boolean(user.onboarding_completed);
    res.json({ user });
  } else {
    res.sendStatus(404);
  }
});

// --- Onboarding Routes ---
app.post('/api/onboarding', authenticateToken, (req, res) => {
  const { spending_habit, top_expense_category, monthly_income, monthly_savings_goal, track_yearly, main_goal } = req.body;
  const userId = req.user.id;

  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_profiles (user_id, spending_habit, top_expense_category, monthly_income, monthly_savings_goal, track_yearly, main_goal)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(userId, spending_habit, top_expense_category, monthly_income, monthly_savings_goal, track_yearly ? 1 : 0, main_goal);

    db.prepare('UPDATE users SET onboarding_completed = 1 WHERE id = ?').run(userId);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Dashboard Routes ---
app.get('/api/dashboard', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  try {
    // Totals for this month
    const totals = db.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions 
      WHERE user_id = ? AND date >= ? AND date <= ?
    `).get(userId, startOfMonth, endOfMonth);

    const income = totals.income || 0;
    const expense = totals.expense || 0;
    const savings = income - expense;

    // Get Profile for goals
    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId);
    let goal_progress = '';
    if (profile) {
      goal_progress = `Target: ₹${profile.monthly_savings_goal}/mo. Current: ₹${savings}`;
    }

    // Category breakdown (All time or this month? Let's do this month for dashboard)
    const categories = db.prepare(`
      SELECT category as name, SUM(amount) as value
      FROM transactions
      WHERE user_id = ? AND type = 'expense' AND date >= ? AND date <= ?
      GROUP BY category
    `).all(userId, startOfMonth, endOfMonth);

    // Add colors (helper function ideally, doing simpler here)
    const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];
    const formattedCategories = categories.map((c, i) => ({
      ...c,
      color: COLORS[i % COLORS.length]
    }));

    res.json({
      income,
      expense,
      savings,
      goal_progress,
      spending_by_category: formattedCategories
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Transaction Routes ---
app.get('/api/transactions', authenticateToken, (req, res) => {
  const userId = req.user.id;
  try {
    const txs = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT 50').all(userId);
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', authenticateToken, (req, res) => {
  const { type, amount, category, date, description } = req.body;
  const userId = req.user.id;
  
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  try {
    const result = db.prepare('INSERT INTO transactions (user_id, type, amount, category, date, description) VALUES (?, ?, ?, ?, ?, ?)').run(userId, type, amount, category, date, description);
    res.json({ id: result.lastInsertRowid, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Summary Routes ---
app.get('/api/summary', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { period } = req.query; // 'this_month', 'last_month', 'all'
  
  let dateFilter = '';
  const params = [userId];
  const now = new Date();

  if (period === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    dateFilter = 'AND date >= ?';
    params.push(start);
  } else if (period === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
    dateFilter = 'AND date >= ? AND date <= ?';
    params.push(start, end);
  }

  try {
    const totals = db.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
        COUNT(*) as count
      FROM transactions WHERE user_id = ? ${dateFilter}
    `).get(...params);

    const categories = db.prepare(`
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM transactions 
      WHERE user_id = ? AND type = 'expense' ${dateFilter}
      GROUP BY category ORDER BY total DESC
    `).all(...params);

    res.json({
      income: totals.income || 0,
      expense: totals.expense || 0,
      tx_count: totals.count,
      breakdown: categories
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AI Coach Route ---
app.post('/api/coach', authenticateToken, async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;
  
  // Get recent context
  const summary = db.prepare(`
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM transactions WHERE user_id = ?
  `).get(userId);

  const contextPrompt = `
    User Context:
    Total Income: ₹${summary.income}
    Total Expense: ₹${summary.expense}
    Net Savings: ₹${summary.income - summary.expense}
    
    User Query: ${message}
  `;
  
  if (!GOOGLE_API_KEY) {
    return res.json({ text: "I am ready to help, but my API key is not configured on the server. (Context: You have saved ₹" + (summary.income - summary.expense) + " so far)." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: model,
      contents: contextPrompt,
      config: {
        systemInstruction: "You are MONEO, an AI finance coach for India. Be concise, helpful, and use INR (₹). Use the provided user context to give personalized advice.",
      }
    });
    
    res.json({ text: response.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reach AI service." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
