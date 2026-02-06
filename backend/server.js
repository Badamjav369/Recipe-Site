const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// VALIDATION HELPERS
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateRecipe = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Жорын нэр шаардлагатай');
  }
  if (!data.type || data.type.trim().length === 0) {
    errors.push('Хоолны төрөл шаардлагатай');
  }
  if (!data.time || data.time < 1) {
    errors.push('Хугацаа 1-ээс их байх ёстой');
  }
  if (!data.portion || data.portion.trim().length === 0) {
    errors.push('Хүний тоо шаардлагатай');
  }
  
  return errors;
};

// AUTHENTICATION 
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен байхгүй байна' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Токен буруу байна' });
    }
    req.user = user; 
    next();
  });
};

// ROOT ROUTE
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});


app.get('/', (req, res) => {
  res.json({
    message: 'Recipe Site API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        login: 'POST /api/login',
        register: 'POST /api/register'
      },
      recipes: {
        getAll: 'GET /api/recipes',
        search: 'GET /api/recipes?search=name&type=type&maxTime=30',
        searchByIngredient: 'GET /api/recipes/search/ingredients?ingredient=name',
        getById: 'GET /api/recipes/:id',
        create: 'POST /api/recipes (auth required)',
        update: 'PUT /api/recipes/:id (auth required)',
        delete: 'DELETE /api/recipes/:id (auth required)',
        userRecipes: 'GET /api/recipes/user/:userId'
      },
      ratings: {
        rate: 'POST /api/recipes/:id/rate (auth required)',
        getRatings: 'GET /api/recipes/:id/ratings',
        deleteRating: 'DELETE /api/recipes/:id/rate (auth required)'
      },
      favorites: {
        add: 'POST /api/recipes/:id/favorite (auth required)',
        remove: 'DELETE /api/recipes/:id/favorite (auth required)',
        getAll: 'GET /api/favorites (auth required)'
      }
    },
    documentation: 'See API_DOCUMENTATION.md for detailed information'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});


/* AUTHENTICATION ROUTES */
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Имэйл болон нууц үг шаардлагатай' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Имэйл хаяг буруу байна' });
    }
    
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Буруу имэйл эсвэл нууц үг' });
    }
    
    const valid = await bcrypt.compare(password, users[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Буруу имэйл эсвэл нууц үг' });
    }
    
    const token = jwt.sign({ userId: users[0].id }, process.env.JWT_SECRET);
    res.json({ 
      token, 
      userId: users[0].id, 
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
    
    // Validation
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Бүх талбар шаардлагатай' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Имэйл хаяг буруу байна' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Нууц үг 6-аас дээш тэмдэгт байх ёстой' });
    }
    
    if (username.length < 3) {
      return res.status(400).json({ error: 'Хэрэглэгчийн нэр 3-аас дээш тэмдэгт байх ёстой' });
    }
    
    /* email бүртгэлтэй эсэхийг шалгах */
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

/* RECIPE ROUTES - CREATE */
app.post('/api/recipes', authenticateToken, async (req, res) => {
  try {
    const { title, category_id, region_id, cook_time, servings_min, servings_max, calories, image_url, ingredients, instructions, extra_info } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!title || !cook_time) {
      return res.status(400).json({ error: 'Жорын нэр болон хугацаа шаардлагатай' });
    }

    // Insert recipe using RecipeSite schema
    const recipeResult = await db.query(
      `INSERT INTO recipes (user_id, title, category_id, region_id, cook_time, servings_min, servings_max, calories, image_url, ingredients, instructions, extra_info, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId, 
        title, 
        category_id || null, 
        region_id || null, 
        cook_time, 
        servings_min || 1, 
        servings_max || 1, 
        calories || null, 
        image_url || '', 
        ingredients || '', 
        instructions || '', 
        extra_info || ''
      ]
    );

    const recipeId = recipeResult.insertId;

    res.status(201).json({ 
      message: 'Жор амжилттай нэмэгдлээ',
      recipeId 
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

// RECIPE ROUTES - READ

// бүх жорыг үндсэн мэдээллээр авах
app.get('/api/recipes', async (req, res) => {
  try {
    const { status, category, region, limit } = req.query;
    let sql = `
      SELECT 
        r.id,
        r.title,
        r.cook_time,
        r.servings_min,
        r.servings_max,
        r.calories,
        r.image_url,
        r.views,
        r.rating,
        r.status,
        u.username,
        u.id as user_id,
        c.name as category_name,
        reg.name as region_name
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN regions reg ON r.region_id = reg.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }
    
    if (category) {
      sql += ' AND c.name = ?';
      params.push(category);
    }
    
    if (region) {
      sql += ' AND reg.name = ?';
      params.push(region);
    }
    
    sql += ' ORDER BY r.id DESC';
    
    if (limit) {
      const limitNum = parseInt(limit);
      sql += ` LIMIT ${limitNum}`;
    }
    
    const recipes = await db.query(sql, params);
    res.json(recipes);
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

// нэг жорыг бүх холбоотой мэдээллээр авах
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipeId = req.params.id;

    // жорын үндсэн мэдээллээр авах
    const recipes = await db.query(`
      SELECT r.*, u.username, u.email
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [recipeId]);

    if (recipes.length === 0) {
      return res.status(404).json({ error: 'Жор олдсонгүй' });
    }

    const recipe = recipes[0];

    // RecipeSite schema stores ingredients, instructions, and extra_info as TEXT in recipes table
    // No need to query separate tables
    res.json(recipe);
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

// хэрэглэгчийн жорыг авах
app.get('/api/recipes/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const recipes = await db.query(`
      SELECT 
        r.id,
        r.title,
        r.cook_time,
        r.servings_min,
        r.servings_max,
        r.calories,
        r.image_url,
        r.views,
        r.rating,
        r.status,
        u.username,
        c.name as category_name
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.user_id = ?
      ORDER BY r.id DESC
    `, [userId]);
    
    res.json(recipes);
  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});


// RECIPE ROUTES - UPDATE
app.put('/api/recipes/:id', authenticateToken, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.userId;
    const { title, category_id, region_id, cook_time, servings_min, servings_max, calories, image_url, ingredients, instructions, extra_info } = req.body;

    // жор хэрэглэгчийнх эсэхийг шалгах
    const recipes = await db.query(
      'SELECT * FROM recipes WHERE id = ? AND user_id = ?',
      [recipeId, userId]
    );

    if (recipes.length === 0) {
      return res.status(403).json({ error: 'Та энэ жорыг засах эрхгүй байна' });
    }

    // Update recipe using RecipeSite schema
    await db.query(
      `UPDATE recipes SET 
        title = ?, 
        category_id = ?, 
        region_id = ?, 
        cook_time = ?, 
        servings_min = ?, 
        servings_max = ?, 
        calories = ?, 
        image_url = ?, 
        ingredients = ?, 
        instructions = ?, 
        extra_info = ? 
      WHERE id = ?`,
      [title, category_id, region_id, cook_time, servings_min, servings_max, calories, image_url || '', ingredients || '', instructions || '', extra_info || '', recipeId]
    );

    res.json({ message: 'Жор амжилттай шинэчлэгдлээ' });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});


// RECIPE ROUTES - DELETE
app.delete('/api/recipes/:id', authenticateToken, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.userId;

    // жор хэрэглэгчийнх эсэхийг шалгах
    const recipes = await db.query(
      'SELECT * FROM recipes WHERE id = ? AND user_id = ?',
      [recipeId, userId]
    );

    if (recipes.length === 0) {
      return res.status(403).json({ error: 'Та энэ жорыг устгах эрхгүй байна' });
    }

    //жорын бүх холбоотой мэдээллийг устгах
    await db.query('DELETE FROM recipes WHERE id = ?', [recipeId]);

    res.json({ message: 'Жор амжилттай устгагдлаа' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

// CATEGORIES AND REGIONS ENDPOINTS
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

app.get('/api/regions', async (req, res) => {
  try {
    const regions = await db.query('SELECT * FROM regions ORDER BY name');
    res.json(regions);
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

// SAVED RECIPES ENDPOINTS
app.post('/api/recipes/:id/save', authenticateToken, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.userId;

    // Check if recipe exists
    const recipe = await db.query('SELECT id FROM recipes WHERE id = ?', [recipeId]);
    if (recipe.length === 0) {
      return res.status(404).json({ error: 'Жор олдсонгүй' });
    }

    await db.query(
      'INSERT INTO user_saved_recipes (user_id, recipe_id) VALUES (?, ?)',
      [userId, recipeId]
    );

    res.json({ message: 'Жор хадгалагдлаа' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Жор аль хэдийн хадгалагдсан байна' });
    }
    console.error('Save recipe error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

app.delete('/api/recipes/:id/save', authenticateToken, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.userId;

    await db.query(
      'DELETE FROM user_saved_recipes WHERE user_id = ? AND recipe_id = ?',
      [userId, recipeId]
    );

    res.json({ message: 'Жор устгагдлаа' });
  } catch (error) {
    console.error('Unsave recipe error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

// Rate recipe endpoint
app.post('/api/recipes/:id/rate', authenticateToken, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.userId;
    const { rating } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: '1-5 хүртэлх үнэлгээ оруулна уу' });
    }

    // Check if recipe exists
    const recipe = await db.query('SELECT id, rating FROM recipes WHERE id = ?', [recipeId]);
    if (recipe.length === 0) {
      return res.status(404).json({ error: 'Жор олдсонгүй' });
    }

    // For now, just update the recipe's average rating
    // In a real app, you'd want a separate ratings table to track individual user ratings
    const currentRating = recipe[0].rating || 0;
    const newRating = currentRating === 0 ? rating : (currentRating + rating) / 2;

    await db.query(
      'UPDATE recipes SET rating = ? WHERE id = ?',
      [newRating, recipeId]
    );

    res.json({ 
      message: 'Үнэлгээ амжилттай хадгалагдлаа',
      rating: newRating 
    });
  } catch (error) {
    console.error('Rate recipe error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

app.get('/api/saved-recipes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const recipes = await db.query(`
      SELECT 
        r.id,
        r.title,
        r.cook_time,
        r.servings_min,
        r.servings_max,
        r.calories,
        r.image_url,
        r.views,
        r.rating,
        r.status,
        u.username,
        c.name as category_name,
        usr.saved_at
      FROM user_saved_recipes usr
      JOIN recipes r ON usr.recipe_id = r.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE usr.user_id = ?
      ORDER BY usr.saved_at DESC
    `, [userId]);

    res.json(recipes);
  } catch (error) {
    console.error('Get saved recipes error:', error);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

// ERROR HANDLER MIDDLEWARE - Must be at the end
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Энэ мэдээлэл аль хэдийн бүртгэлтэй байна' });
  }
  
  res.status(500).json({ error: 'Серверийн алдаа гарлаа' });
});

//сервер эхлүүлэх
app.listen(3000, async () => {
  try {
    await db.pool.getConnection();
    console.log('✅ Server: http://localhost:3000');
  } catch (err) {
    console.error('❌ DB error:', err.message);
  }
});