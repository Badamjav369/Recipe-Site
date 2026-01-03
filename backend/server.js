const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (users.length === 0) return res.status(401).json({ error: 'Буруу' });
  const valid = await bcrypt.compare(password, users[0].password_hash);
  if (!valid) return res.status(401).json({ error: 'Буруу' });
  const token = jwt.sign({ userId: users[0].user_id }, process.env.JWT_SECRET);
  res.json({ token, userId: users[0].user_id, email: users[0].email });
});

app.get('/api/recipes', async (req, res) => {
  const recipes = await db.query('SELECT * FROM recipes');
  res.json(recipes);
});

app.listen(3000, async () => {
  try {
    await db.pool.getConnection();
    console.log('✅ Server: http://localhost:3000');
  } catch (err) {
    console.error('❌ DB error:', err.message);
  }
});