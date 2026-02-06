require('dotenv').config();
const db = require('./db');
const fs = require('fs').promises;
const path = require('path');

// Mapping for region names to IDs
const regionMap = {
  'Монгол хоол': 1,
  'Япон хоол': 2,
  'Солонгос хоол': 3,
  'Итали хоол': 4,
  'Франц хоол': 5,
  'Хятад хоол': 6,
  'Америк хоол': 7,
  'Тайланд хоол': 8,
  'Энэтхэг хоол': 9,
  'Вьетнам хоол': 10,
  'Европ хоол': 5 // Default to France for European
};

// Parse view count (10k -> 10000)
function parseViews(viewStr) {
  if (!viewStr) return 0;
  const num = parseFloat(viewStr);
  if (viewStr.includes('k')) return Math.floor(num * 1000);
  return Math.floor(num);
}

// Parse portion string (2-3 -> {min: 2, max: 3})
function parsePortions(portionStr) {
  if (!portionStr) return { min: 2, max: 4 };
  const parts = portionStr.split('-');
  return {
    min: parseInt(parts[0]) || 2,
    max: parseInt(parts[1]) || parseInt(parts[0]) || 4
  };
}

async function migrateRecipes() {
  try {
    console.log('📖 Reading recipe data...');
    
    // Read info.json
    const infoPath = path.join(__dirname, '../data/info.json');
    const infoData = JSON.parse(await fs.readFile(infoPath, 'utf8'));
    
    // Read recipes-details.json
    const detailsPath = path.join(__dirname, '../data/recipes-details.json');
    const detailsData = JSON.parse(await fs.readFile(detailsPath, 'utf8'));
    
    // Create a map of detailed recipes by ID
    const detailsMap = {};
    detailsData.forEach(recipe => {
      detailsMap[recipe.id] = recipe;
    });
    
    console.log(`Found ${infoData.length} recipes in info.json`);
    console.log(`Found ${detailsData.length} recipes in recipes-details.json`);
    
    // Get user_id 1 (badamjav) to assign all recipes to
    const userId = 1;
    
    let inserted = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const recipe of infoData) {
      try {
        // Check if recipe already exists by title
        const existing = await db.query(
          'SELECT id FROM recipes WHERE title = ?',
          [recipe.name]
        );
        
        if (existing && existing.length > 0) {
          console.log(`⏭️  Recipe "${recipe.name}" already exists, skipping...`);
          skipped++;
          continue;
        }
        
        // Get region_id from type - set to null if not found (region_id is nullable)
        const regionId = regionMap[recipe.type] || null;
        
        // Parse portions
        const portions = parsePortions(recipe.portion);
        
        // Parse views
        const views = parseViews(recipe.view);
        
        // Get detailed info if available
        const details = detailsMap[recipe.id];
        const ingredients = details?.ingredients 
          ? details.ingredients.join('\n') 
          : 'Орц материал нэмэгдээгүй';
        const instructions = details?.steps 
          ? details.steps.join('\n') 
          : 'Хийх арга нэмэгдээгүй';
        const extraInfo = details?.extra 
          ? details.extra.join('\n') 
          : '';
        
        // Insert recipe (let MySQL auto-increment the ID) - skip region_id to avoid foreign key issues
        const result = await db.query(
          `INSERT INTO recipes (
            user_id, title, views, rating, cook_time, 
            servings_min, servings_max, calories,
            ingredients, instructions, extra_info, image_url,
            status, is_user_uploaded, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            userId,
            recipe.name,
            views,
            recipe.rating || 0,
            recipe.time,
            portions.min,
            portions.max,
            recipe.cal || 0,
            ingredients,
            instructions,
            extraInfo,
            recipe.image,
            'approved', // Set as approved so they appear in listings
            false // Not user uploaded, these are seeded recipes
          ]
        );
        
        console.log(`✅ Inserted recipe: ${recipe.name}`);
        inserted++;
        
      } catch (error) {
        console.error(`❌ Error inserting recipe ${recipe.name}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 Migration complete!');
    console.log(`✅ Inserted: ${inserted}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateRecipes();
