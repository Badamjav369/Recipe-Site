require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcrypt');

async function createTestUsers() {
  try {
    console.log('🔐 Creating test users...\n');
    
    // Check if users already exist
    const existingUsers = await db.query('SELECT email FROM users');
    
    // User 1: badamjav
    const user1Email = 'badamjav@gmail.com';
    const user1Password = '123457';
    const user1Hash = await bcrypt.hash(user1Password, 10);
    
    const existing1 = existingUsers.find(u => u.email === user1Email);
    if (!existing1) {
      await db.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        ['badamjav', user1Email, user1Hash]
      );
      console.log(`✅ Created user: ${user1Email}`);
    } else {
      await db.query(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [user1Hash, user1Email]
      );
      console.log(`🔄 Updated password for: ${user1Email}`);
    }
    
    // User 2: yalguun
    const user2Email = 'yalguun@gmail.com';
    const user2Password = '123456';
    const user2Hash = await bcrypt.hash(user2Password, 10);
    
    const existing2 = existingUsers.find(u => u.email === user2Email);
    if (!existing2) {
      await db.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        ['yalguun', user2Email, user2Hash]
      );
      console.log(`✅ Created user: ${user2Email}`);
    } else {
      await db.query(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [user2Hash, user2Email]
      );
      console.log(`🔄 Updated password for: ${user2Email}`);
    }
    
    console.log('\n✅ Test users ready!');
    console.log('\nLogin credentials:');
    console.log('1. Email: badamjav@gmail.com | Password: 123457');
    console.log('2. Email: yalguun@gmail.com | Password: 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestUsers();
