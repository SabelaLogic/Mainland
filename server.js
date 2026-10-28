const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new Database(path.join(__dirname, 'data', 'maitland.db'));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact TEXT UNIQUE,
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_contact TEXT,
    hostess TEXT,
    slot TEXT,
    price TEXT,
    paystack_ref TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    body TEXT,
    hours TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Login / access
app.post('/api/login', (req, res) => {
  const { contact } = req.body;
  if (!contact) return res.status(400).json({ error: 'Contact required' });
  const type = contact.includes('@') ? 'email' : 'phone';
  try {
    db.prepare('INSERT OR IGNORE INTO users (contact, type) VALUES (?, ?)').run(contact, type);
    res.json({ ok: true, contact, type });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Booking
app.post('/api/booking', (req, res) => {
  const { user_contact, hostess, slot, price, paystack_ref } = req.body;
  db.prepare('INSERT INTO bookings (user_contact, hostess, slot, price, paystack_ref) VALUES (?, ?, ?, ?, ?)')
    .run(user_contact || '', hostess || '', slot || '', price || '', paystack_ref || '');
  res.json({ ok: true });
});

// Hostess application
app.post('/api/apply', (req, res) => {
  const { name, body, hours, message } = req.body;
  if (!name || !message) return res.status(400).json({ error: 'Name and message required' });
  db.prepare('INSERT INTO applications (name, body, hours, message) VALUES (?, ?, ?, ?)')
    .run(name, body || '', hours || '', message);
  res.json({ ok: true });
});

// Simple admin view
app.get('/api/admin', (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY id DESC LIMIT 50').all();
  const bookings = db.prepare('SELECT * FROM bookings ORDER BY id DESC LIMIT 50').all();
  const apps = db.prepare('SELECT * FROM applications ORDER BY id DESC LIMIT 50').all();
  res.json({ users, bookings, apps });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Maitland backend running on port', PORT));
