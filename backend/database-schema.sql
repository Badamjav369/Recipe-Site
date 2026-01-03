CREATE DATABASE IF NOT EXISTS recipe_db;
USE recipe_db;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    username VARCHAR(100)
);

CREATE TABLE recipes (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(255),
    type VARCHAR(100),
    time INT,
    portion VARCHAR(50),
    calories INT,
    image_url VARCHAR(500)
);

INSERT INTO users (email, password_hash, username) VALUES
('test@gmail.com', '$2b$10$K3qO8rP9mN4lH6tY2wX5S.eF7gD8cJ9bA3mK6nL2pQ5rT4vW8xY1a', 'Test');

INSERT INTO recipes (user_id, name, type, time, portion, calories, image_url) VALUES
(1, 'Пицца', 'Итали хоол', 20, '2-3', 300, 'images/pizza.jpg');


-- ============================================
-- UPDATED DATABASE SCHEMA
-- ============================================

-- Add new columns to recipes table
ALTER TABLE recipes 
ADD COLUMN ingredients TEXT,
ADD COLUMN steps TEXT,
ADD COLUMN extra TEXT;

-- OR use the normalized approach with separate tables:

-- Table for recipe ingredients
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    ingredient_text VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE
);

-- Table for recipe steps/instructions
CREATE TABLE IF NOT EXISTS recipe_steps (
    step_id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    step_text TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE
);

-- Table for extra tips/information
CREATE TABLE IF NOT EXISTS recipe_extras (
    extra_id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    extra_text TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE
);

-- Add foreign key constraint if not already added
ALTER TABLE recipes 
ADD CONSTRAINT fk_user_recipe 
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- ============================================
-- CRUD QUERIES WITH RELATED TABLES
-- ============================================

-- CREATE: Insert recipe with ingredients and steps
-- Step 1: Insert main recipe
INSERT INTO recipes (user_id, name, type, time, portion, calories, image_url) 
VALUES (1, 'Шөл', 'Монгол хоол', 30, '4', 200, 'images/soup.jpg');

-- Step 2: Get the inserted recipe_id (use LAST_INSERT_ID() in MySQL)
SET @recipe_id = LAST_INSERT_ID();

-- Step 3: Insert ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_text, sort_order) VALUES
(@recipe_id, 'Төмс 3 ширхэг', 1),
(@recipe_id, 'Сонгино 1 ширхэг', 2),
(@recipe_id, 'Мах 200гр', 3);

-- Step 4: Insert steps
INSERT INTO recipe_steps (recipe_id, step_text, sort_order) VALUES
(@recipe_id, 'Төмсөө хальслаж, усанд хийнэ', 1),
(@recipe_id, 'Махаа нэмж чанана', 2),
(@recipe_id, 'Давс, перецээр амтална', 3);

-- Step 5: Insert extra tips
INSERT INTO recipe_extras (recipe_id, extra_text, sort_order) VALUES
(@recipe_id, 'Шинэ ногоо хэрэглэвэл илүү амттай', 1);


-- READ: Get recipe with all related data
SELECT 
    r.*,
    u.username,
    u.email,
    GROUP_CONCAT(DISTINCT ri.ingredient_text ORDER BY ri.sort_order SEPARATOR '|||') as ingredients,
    GROUP_CONCAT(DISTINCT rs.step_text ORDER BY rs.sort_order SEPARATOR '|||') as steps,
    GROUP_CONCAT(DISTINCT re.extra_text ORDER BY re.sort_order SEPARATOR '|||') as extras
FROM recipes r
LEFT JOIN users u ON r.user_id = u.user_id
LEFT JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
LEFT JOIN recipe_steps rs ON r.recipe_id = rs.recipe_id
LEFT JOIN recipe_extras re ON r.recipe_id = re.recipe_id
WHERE r.recipe_id = 1
GROUP BY r.recipe_id;

-- READ: Get all recipes with basic info only
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
JOIN users u ON r.user_id = u.user_id;

-- READ: Get user's recipes
SELECT r.*, u.username
FROM recipes r
JOIN users u ON r.user_id = u.user_id
WHERE r.user_id = 1;


-- UPDATE: Update recipe and its related data
-- Step 1: Update main recipe
UPDATE recipes 
SET name = 'Шөл Updated',
    type = 'Монгол хоол',
    time = 35,
    portion = '5',
    calories = 220
WHERE recipe_id = 1 AND user_id = 1;

-- Step 2: Delete old ingredients/steps/extras
DELETE FROM recipe_ingredients WHERE recipe_id = 1;
DELETE FROM recipe_steps WHERE recipe_id = 1;
DELETE FROM recipe_extras WHERE recipe_id = 1;

-- Step 3: Insert new ingredients/steps/extras (same as CREATE)


-- DELETE: Delete recipe (CASCADE will automatically delete related data)
DELETE FROM recipes 
WHERE recipe_id = 1 AND user_id = 1;

-- DELETE: Verify user owns the recipe before deleting
DELETE FROM recipes 
WHERE recipe_id = 1 
AND user_id = (SELECT user_id FROM users WHERE user_id = 1);