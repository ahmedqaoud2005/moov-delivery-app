import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database
const db = new Database("app.db");

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    name TEXT,
    role TEXT,
    balance REAL DEFAULT 0,
    transfer_code TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    amount REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
  );
`);

function generateTransferCode(role: string) {
  if (role === 'admin') return 'b1m0v1';
  
  // Pattern: [letter][number][letter][number][letter][number]
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  
  let code = '';
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return code;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get current user profile (Mocking auth for now, using email from query or header)
  app.get("/api/user/profile", (req, res) => {
    const email = req.query.email as string || 'user@gmail.com';
    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    
    if (!user) {
      // Create a default user if not exists (for demo purposes)
      const role = email === 'admin@app.com' ? 'admin' : 'user';
      const code = generateTransferCode(role);
      db.prepare("INSERT INTO users (email, name, role, balance, transfer_code) VALUES (?, ?, ?, ?, ?)")
        .run(email, 'Demo User', role, 100.0, code);
      user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    }
    
    res.json(user);
  });

  // Transfer Money
  app.post("/api/wallet/transfer", (req, res) => {
    const { senderEmail, targetCode, amount } = req.body;
    
    if (!senderEmail || !targetCode || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid transfer data" });
    }

    const sender = db.prepare("SELECT * FROM users WHERE email = ?").get(senderEmail) as any;
    const receiver = db.prepare("SELECT * FROM users WHERE transfer_code = ?").get(targetCode) as any;

    if (!sender) return res.status(404).json({ error: "Sender not found" });
    if (!receiver) return res.status(404).json({ error: "Receiver not found" });
    if (sender.id === receiver.id) return res.status(400).json({ error: "Cannot transfer to yourself" });
    if (sender.balance < amount) return res.status(400).json({ error: "Insufficient balance" });

    const transfer = db.transaction(() => {
      db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(amount, sender.id);
      db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(amount, receiver.id);
      db.prepare("INSERT INTO transactions (sender_id, receiver_id, amount) VALUES (?, ?, ?)")
        .run(sender.id, receiver.id, amount);
    });

    try {
      transfer();
      res.json({ success: true, newBalance: sender.balance - amount });
    } catch (err) {
      res.status(500).json({ error: "Transfer failed" });
    }
  });

  // Top up (Simulation)
  app.post("/api/wallet/topup", (req, res) => {
    const { email, amount } = req.body;
    if (!email || !amount || amount <= 0) return res.status(400).json({ error: "Invalid data" });

    db.prepare("UPDATE users SET balance = balance + ? WHERE email = ?").run(amount, email);
    const user = db.prepare("SELECT balance FROM users WHERE email = ?").get(email) as any;
    res.json({ success: true, newBalance: user.balance });
  });

  // OAuth URL generation
  app.get("/api/auth/google/url", (req, res) => {
    const baseUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const redirectUri = `${baseUrl}/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || 'MOCK_GOOGLE_ID',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    });
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  });

  // OAuth Callbacks
  app.get("/auth/google/callback", (req, res) => {
    // In a real app, exchange code for tokens here
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                provider: 'google',
                user: { name: 'Google User', email: 'user@gmail.com' }
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. Closing window...</p>
        </body>
      </html>
    `);
  });

  // Broadcast Notification Endpoint
  app.post("/api/notifications/broadcast", (req, res) => {
    const { message } = req.body;
    // In a real app, send FCM here
    console.log("Broadcasting notification:", message);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
