#!/usr/bin/env node

const DatabaseManager = require('../database/mongodb-setup');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupDatabase() {
  console.log('🚀 EcoMart Database Setup Wizard\n');
  
  try {
    // Check if .env file exists
    if (!process.env.MONGODB_URI && !process.env.JWT_SECRET) {
      console.log('⚠️  No .env file found or missing required variables');
      console.log('📝 Please create a .env file with the following variables:');
      console.log('   MONGODB_URI=mongodb://localhost:27017/ecomart');
      console.log('   JWT_SECRET=your_super_secret_jwt_key_here');
      console.log('   PORT=5000');
      console.log('   NODE_ENV=development\n');
      
      const createEnv = await askQuestion('Would you like me to create a basic .env file? (y/n): ');
      
      if (createEnv.toLowerCase() === 'y') {
        const fs = require('fs');
        const crypto = require('crypto');
        
        const envContent = `# Database
MONGODB_URI=mongodb://localhost:27017/ecomart
# For MongoDB Atlas, replace with your connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecomart

# JWT Secret (auto-generated)
JWT_SECRET=${crypto.randomBytes(64).toString('hex')}

# Server
PORT=5000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
`;
        
        fs.writeFileSync('.env', envContent);
        console.log('✅ Created .env file with default settings');
        
        // Reload environment variables
        require('dotenv').config();
      }
    }

    // Initialize database manager
    const dbManager = new DatabaseManager();
    
    console.log('\n1️⃣ Testing database connection...');
    await dbManager.connect();
    
    const isHealthy = await dbManager.checkConnection();
    if (!isHealthy) {
      throw new Error('Database connection is not healthy');
    }
    
    console.log('\n2️⃣ Creating database indexes...');
    await dbManager.createIndexes();
    
    console.log('\n3️⃣ Checking existing data...');
    const stats = await dbManager.getStats();
    
    if (stats) {
      console.log(`   👥 Users: ${stats.users}`);
      console.log(`   📦 Products: ${stats.products}`);
      console.log(`   🛒 Orders: ${stats.orders}`);
      console.log(`   ✅ Active Products: ${stats.activeProducts}`);
      console.log(`   ⏰ Expiring Soon: ${stats.expiringSoon}`);
    }
    
    if (stats && stats.users > 0) {
      console.log('\n⚠️  Database already contains data');
      const reinitialize = await askQuestion('Do you want to reinitialize with sample data? This will DELETE all existing data! (y/n): ');
      
      if (reinitialize.toLowerCase() !== 'y') {
        console.log('✅ Database setup completed (no changes made)');
        await dbManager.disconnect();
        rl.close();
        return;
      }
    }
    
    console.log('\n4️⃣ Initializing with sample data...');
    await dbManager.disconnect();
    
    // Run the initialization script
    const { spawn } = require('child_process');
    const initProcess = spawn('node', ['database/init-db.js'], { stdio: 'inherit' });
    
    initProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n🎉 Database setup completed successfully!');
        console.log('\n🔗 Next steps:');
        console.log('   1. Start the backend server: npm run dev');
        console.log('   2. Open the frontend in your browser');
        console.log('   3. Test login with: buyer@example.com / password123');
      } else {
        console.log('\n❌ Database initialization failed');
      }
      rl.close();
    });
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 MongoDB Connection Issues:');
      console.log('   Option 1 - Install MongoDB locally:');
      console.log('     • Windows: Download from https://www.mongodb.com/try/download/community');
      console.log('     • Mac: brew install mongodb-community');
      console.log('     • Linux: sudo apt-get install mongodb');
      console.log('');
      console.log('   Option 2 - Use MongoDB Atlas (Cloud):');
      console.log('     • Sign up at https://www.mongodb.com/atlas');
      console.log('     • Create a free cluster');
      console.log('     • Get connection string and update MONGODB_URI in .env');
    }
    
    rl.close();
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Setup cancelled by user');
  rl.close();
  process.exit(0);
});

setupDatabase();