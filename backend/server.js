const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Токен байхгүй байна' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Токен буруу байна' });
    }
    req.user = user; // { userId: ... }
    next();
  });
};

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Буруу имэйл эсвэл нууц үг' });
    }
    
    const valid = await bcrypt.compare(password, users[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Буруу имэйл эсвэл нууц үг' });
    }
    
    const token = jwt.sign({ userId: users[0].user_id }, process.env.JWT_SECRET);
    res.json({ 
      token, 
      userId: users[0].user_id, 
      email: users[0].email,
      username: users[0].username 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // Check if user exists
    const existingUsers = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Энэ имэйл аль хэдийн бүртгэлтэй байна' });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Insert user
    const result = await db.query(
      'INSERT INTO users (email, password_hash, username) VALUES (?, ?, ?)',
      [email, password_hash, username]
    );
    
    const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET);
    res.status(201).json({ 
      token, 
      userId: result.insertId, 
      email,
      username 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

// ============================================
// RECIPE ROUTES - CREATE
// ============================================
app.post('/api/recipes', authenticateToken, async (req, res) => {
  try {
    const { name, type, time, portion, calories, image_url, ingredients, steps, extras } = req.body;
    const userId = req.user.userId;

    // Insert main recipe
    const recipeResult = await db.query(
      'INSERT INTO recipes (user_id, name, type, time, portion, calories, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, name, type, time, portion, calories, image_url || '']
    );

    const recipeId = recipeResult.insertId;

    // Insert ingredients
    if (ingredients && ingredients.length > 0) {
      for (let i = 0; i < ingredients.length; i++) {
        await db.query(
          'INSERT INTO recipe_ingredients (recipe_id, ingredient_text, sort_order) VALUES (?, ?, ?)',
          [recipeId, ingredients[i], i + 1]
        );
      }
    }

    // Insert steps
    if (steps && steps.length > 0) {
      for (let i = 0; i < steps.length; i++) {
        await db.query(
          'INSERT INTO recipe_steps (recipe_id, step_text, sort_order) VALUES (?, ?, ?)',
          [recipeId, steps[i], i + 1]
        );
      }
    }

    // Insert extras
    if (extras && extras.length > 0) {
      for (let i = 0; i < extras.length; i++) {
        await db.query(
          'INSERT INTO recipe_extras (recipe_id, extra_text, sort_order) VALUES (?, ?, ?)',
          [recipeId, extras[i], i + 1]
        );
      }
    }

    res.status(201).json({ 
      message: 'Жор амжилттай нэмэгдлээ',
      recipeId 
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

// ============================================
// RECIPE ROUTES - READ
// ============================================

// Get all recipes (basic info)
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await db.query(`
      SELECT 
        r.recipe_id,
        r.name,
        r.type,
        r.time,
        r.portion,
        r.calories,
        r.image_url,
        u.username,
        u.user_id
      FROM recipes r
      JOIN users u ON r.user_id = u.user_id
      ORDER BY r.recipe_id DESC
    `);
    res.json(recipes);
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

// Get single recipe with full details
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipeId = req.params.id;

    // Get main recipe info
    const recipes = await db.query(`
      SELECT r.*, u.username, u.email
      FROM recipes r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.recipe_id = ?
    `, [recipeId]);

    if (recipes.length === 0) {
      return res.status(404).json({ error: 'Жор олдсонгүй' });
    }

    const recipe = recipes[0];

    // Get ingredients
    const ingredients = await db.query(`
      SELECT ingredient_text
      FROM recipe_ingredients
      WHERE recipe_id = ?
      ORDER BY sort_order
    `, [recipeId]);

    // Get steps
    const steps = await db.query(`
      SELECT step_text
      FROM recipe_steps
      WHERE recipe_id = ?
      ORDER BY sort_order
    `, [recipeId]);

    // Get extras
    const extras = await db.query(`
      SELECT extra_text
      FROM recipe_extras
      WHERE recipe_id = ?
      ORDER BY sort_order
    `, [recipeId]);

    // Combine all data
    recipe.ingredients = ingredients.map(i => i.ingredient_text);
    recipe.steps = steps.map(s => s.step_text);
    recipe.extras = extras.map(e => e.extra_text);

    res.json(recipe);
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

// Get user's own recipes
app.get('/api/recipes/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const recipes = await db.query(`
      SELECT 
        r.recipe_id,
        r.name,
        r.type,
        r.time,
        r.portion,
        r.calories,
        r.image_url,
        u.username
      FROM recipes r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.user_id = ?
      ORDER BY r.recipe_id DESC
    `, [userId]);
    
    res.json(recipes);
  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

// ============================================
// RECIPE ROUTES - UPDATE
// ============================================
app.put('/api/recipes/:id', authenticateToken, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.userId;
    const { name, type, time, portion, calories, image_url, ingredients, steps, extras } = req.body;

    // Check if recipe belongs to user
    const recipes = await db.query(
      'SELECT * FROM recipes WHERE recipe_id = ? AND user_id = ?',
      [recipeId, userId]
    );

    if (recipes.length === 0) {
      return res.status(403).json({ error: 'Та энэ жорыг засах эрхгүй байна' });
    }

    // Update main recipe
    await db.query(
      'UPDATE recipes SET name = ?, type = ?, time = ?, portion = ?, calories = ?, image_url = ? WHERE recipe_id = ?',
      [name, type, time, portion, calories, image_url || '', recipeId]
    );

    // Delete old related data
    await db.query('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [recipeId]);
    await db.query('DELETE FROM recipe_steps WHERE recipe_id = ?', [recipeId]);
    await db.query('DELETE FROM recipe_extras WHERE recipe_id = ?', [recipeId]);

    // Insert new ingredients
    if (ingredients && ingredients.length > 0) {
      for (let i = 0; i < ingredients.length; i++) {
        await db.query(
          'INSERT INTO recipe_ingredients (recipe_id, ingredient_text, sort_order) VALUES (?, ?, ?)',
          [recipeId, ingredients[i], i + 1]
        );
      }
    }

    // Insert new steps
    if (steps && steps.length > 0) {
      for (let i = 0; i < steps.length; i++) {
        await db.query(
          'INSERT INTO recipe_steps (recipe_id, step_text, sort_order) VALUES (?, ?, ?)',
          [recipeId, steps[i], i + 1]
        );
      }
    }

    // Insert new extras
    if (extras && extras.length > 0) {
      for (let i = 0; i < extras.length; i++) {
        await db.query(
          'INSERT INTO recipe_extras (recipe_id, extra_text, sort_order) VALUES (?, ?, ?)',
          [recipeId, extras[i], i + 1]
        );
      }
    }

    res.json({ message: 'Жор амжилттай шинэчлэгдлээ' });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

// ============================================
// RECIPE ROUTES - DELETE
// ============================================
app.delete('/api/recipes/:id', authenticateToken, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.userId;

    // Check if recipe belongs to user
    const recipes = await db.query(
      'SELECT * FROM recipes WHERE recipe_id = ? AND user_id = ?',
      [recipeId, userId]
    );

    if (recipes.length === 0) {
      return res.status(403).json({ error: 'Та энэ жорыг устгах эрхгүй байна' });
    }

    // Delete recipe (CASCADE will delete related data automatically)
    await db.query('DELETE FROM recipes WHERE recipe_id = ?', [recipeId]);

    res.json({ message: 'Жор амжилттай устгагдлаа' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

// ============================================
// START SERVER
// ============================================
app.listen(3000, async () => {
  try {
    await db.pool.getConnection();
    console.log('✅ Server: http://localhost:3000');
  } catch (err) {
    console.error('❌ DB error:', err.message);
  }
});