const mongoose = require('mongoose');
const MemoryDatabase = require('./memory-db');

class HybridDatabase {
  constructor() {
    this.useMemory = false;
    this.memoryDb = null;
    this.mongoConnected = false;
  }

  async initialize() {
    try {
      // Try MongoDB first
      console.log('🔄 Attempting MongoDB connection...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomart', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5 second timeout
      });
      
      console.log('✅ Connected to MongoDB');
      this.mongoConnected = true;
      this.useMemory = false;
      
      return 'mongodb';
    } catch (error) {
      console.log('⚠️  MongoDB connection failed, falling back to memory database');
      console.log(`   Error: ${error.message}`);
      
      // Fall back to memory database
      this.memoryDb = new MemoryDatabase();
      this.memoryDb.initializeSampleData();
      this.useMemory = true;
      this.mongoConnected = false;
      
      console.log('✅ Memory database initialized');
      return 'memory';
    }
  }

  isUsingMemory() {
    return this.useMemory;
  }

  isMongoConnected() {
    return this.mongoConnected;
  }

  getMemoryDb() {
    return this.memoryDb;
  }

  async getStats() {
    if (this.useMemory) {
      return this.memoryDb.getStats();
    } else {
      // MongoDB stats
      try {
        const db = mongoose.connection.db;
        const userCount = await db.collection('users').countDocuments();
        const productCount = await db.collection('products').countDocuments();
        const orderCount = await db.collection('orders').countDocuments();
        
        const activeProducts = await db.collection('products').countDocuments({ is_active: true });
        const expiringSoon = await db.collection('products').countDocuments({
          is_active: true,
          expiry_date: { 
            $gte: new Date(),
            $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) 
          }
        });
        
        return {
          users: userCount,
          products: productCount,
          orders: orderCount,
          activeProducts,
          expiringSoon
        };
      } catch (error) {
        console.error('Error getting MongoDB stats:', error);
        return null;
      }
    }
  }
}

module.exports = HybridDatabase;