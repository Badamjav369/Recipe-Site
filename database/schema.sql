CREATE DATABASE IF NOT EXISTS RecipeSite;
 
USE RecipeSite;
 
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    profile_image VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL
);
 
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);
 
CREATE TABLE IF NOT EXISTS regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);
 
CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    views INT DEFAULT 0,
    rating FLOAT DEFAULT 0,
    cook_time INT,
    servings_min INT,
    servings_max INT,
    calories INT,
    category_id INT,
    region_id INT,
    instructions TEXT,
    ingredients TEXT,
    extra_info TEXT,
    image_url VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    is_user_uploaded BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL
);
 
CREATE TABLE IF NOT EXISTS user_saved_recipes (
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Insert regions
INSERT INTO regions (name) VALUES 
('Монгол'),
('Япон'),
('Солонгос'),
('Итали'),
('Франц'),
('Хятад'),
('Америк'),
('Тайланд'),
('Энэтхэг'),
('Вьетнам')
ON DUPLICATE KEY UPDATE name=name;
 
-- Insert categories
INSERT INTO categories (name) VALUES 
('Өглөөний хоол'),
('Өдрийн хоол'),
('Оройн хоол'),
('7 хоногийн онцлох'),
('Хамгийн их үзэлттэй'),
('Хурдан хийгддэг'),
('Эрүүл хоол'),
('Салат'),
('Амттан'),
('Уух зүйл')
ON DUPLICATE KEY UPDATE name=name;
