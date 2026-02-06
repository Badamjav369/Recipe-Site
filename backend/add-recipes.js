const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'StronP#45',
    database: 'RecipeSite'
  });

  const recipes = [
    {
      title: 'Цуйван',
      category_id: 12,
      ingredients: JSON.stringify(['гоймон', 'мах', 'төмс', 'лууван']),
      instructions: 'Гоймон хийж, мах, ногоо хийнэ',
      cook_time: 40,
      servings_min: 4,
      servings_max: 4,
      image_url: '/images/food-images/recipe1.jpg',
      status: 'approved'
    },
    {
      title: 'Банштай шөл',
      category_id: 17,
      ingredients: JSON.stringify(['банш', 'төмс', 'сонгино', 'лууван']),
      instructions: 'Банш хийж, ногоотой хамт чанана',
      cook_time: 35,
      servings_min: 4,
      servings_max: 4,
      image_url: '/images/food-images/recipe2.jpg',
      status: 'approved'
    },
    {
      title: 'Гуриль шөл',
      category_id: 17,
      ingredients: JSON.stringify(['гурил', 'мах', 'сонгино']),
      instructions: 'Гурил хийж, шөл чанана',
      cook_time: 25,
      servings_min: 4,
      servings_max: 4,
      image_url: '/images/food-images/recipe3.jpg',
      status: 'approved'
    },
    {
      title: 'Шарсан будаа',
      category_id: 12,
      ingredients: JSON.stringify(['будаа', 'мах', 'өндөг', 'ногоо']),
      instructions: 'Будаа болгоож, мах ногоотой хамт шарна',
      cook_time: 15,
      servings_min: 3,
      servings_max: 3,
      image_url: '/images/food-images/recipe4.jpg',
      status: 'approved'
    },
    {
      title: 'Бууз',
      category_id: 12,
      ingredients: JSON.stringify(['гурил', 'мах', 'сонгино']),
      instructions: 'Бууз хийж, уурлана',
      cook_time: 25,
      servings_min: 6,
      servings_max: 6,
      image_url: '/images/food-images/recipe5.jpg',
      status: 'approved'
    },
    {
      title: 'Хуушуур',
      category_id: 12,
      ingredients: JSON.stringify(['гурил', 'мах', 'сонгино']),
      instructions: 'Хуушуур хийж, шарна',
      cook_time: 20,
      servings_min: 5,
      servings_max: 5,
      image_url: '/images/food-images/recipe6.jpg',
      status: 'approved'
    },
    {
      title: 'Өглөөний хагасмал',
      category_id: 11,
      ingredients: JSON.stringify(['өндөг', 'талх', 'утсан мах']),
      instructions: 'Өндөг болгоож, талхтай хамт идэнэ',
      cook_time: 10,
      servings_min: 1,
      servings_max: 1,
      image_url: '/images/food-images/recipe7.jpg',
      status: 'approved'
    },
    {
      title: 'Кофе',
      category_id: 20,
      ingredients: JSON.stringify(['кофе', 'сүү', 'элсэн чихэр']),
      instructions: 'Кофе чанаж, сүү нэмнэ',
      cook_time: 5,
      servings_min: 1,
      servings_max: 1,
      image_url: '/images/food-images/recipe8.jpg',
      status: 'approved'
    },
    {
      title: 'Төмстэй шөл',
      category_id: 17,
      ingredients: JSON.stringify(['төмс', 'лууван', 'сонгино', 'мах']),
      instructions: 'Төмс хэрчиж, шөл чанана',
      cook_time: 30,
      servings_min: 4,
      servings_max: 4,
      image_url: '/images/food-images/recipe9.jpg',
      status: 'approved'
    },
    {
      title: 'Салад',
      category_id: 16,
      ingredients: JSON.stringify(['салат', 'улаан лооль', 'өндөг', 'майонез']),
      instructions: 'Ногоо хэрчиж, холино',
      cook_time: 0,
      servings_min: 3,
      servings_max: 3,
      image_url: '/images/food-images/recipe10.jpg',
      status: 'approved'
    },
    {
      title: 'Мантуу',
      category_id: 12,
      ingredients: JSON.stringify(['гурил', 'мах', 'сонгино', 'ус']),
      instructions: 'Мантуу хийж, уурлана',
      cook_time: 30,
      servings_min: 6,
      servings_max: 6,
      image_url: '/images/food-images/recipe11.jpg',
      status: 'approved'
    },
    {
      title: 'Хонины шөл',
      category_id: 17,
      ingredients: JSON.stringify(['хонины мах', 'төмс', 'лууван', 'сонгино']),
      instructions: 'Мах буцалгаж, шөл чанана',
      cook_time: 60,
      servings_min: 5,
      servings_max: 5,
      image_url: '/images/food-images/recipe12.jpg',
      status: 'approved'
    }
  ];

  for (const r of recipes) {
    await conn.execute(
      'INSERT INTO recipes (title, category_id, ingredients, instructions, cook_time, servings_min, servings_max, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [r.title, r.category_id, r.ingredients, r.instructions, r.cook_time, r.servings_min, r.servings_max, r.image_url, r.status]
    );
  }

  console.log('Added 12 recipes successfully!');

  const [result] = await conn.execute('SELECT COUNT(*) as count FROM recipes WHERE status="approved"');
  console.log('Total approved recipes:', result[0].count);

  const [catCounts] = await conn.execute(`
    SELECT c.name, COUNT(r.id) as count 
    FROM categories c 
    LEFT JOIN recipes r ON c.id = r.category_id AND r.status = 'approved'
    GROUP BY c.id, c.name 
    ORDER BY count DESC
  `);
  
  console.log('\nRecipes per category:');
  catCounts.forEach(cat => {
    console.log(`${cat.name}: ${cat.count}`);
  });

  await conn.end();
})();
