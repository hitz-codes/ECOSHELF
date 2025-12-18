const mongoose = require('mongoose');
require('dotenv').config();

// Database connection utility
class DatabaseManager {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomart';
      
      console.log('🔄 Attempting to connect to MongoDB...');
      console.log(`📍 URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials in logs
      
      this.connection = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      });

      console.log('✅ Successfully connected to MongoDB');
      console.log(`📊 Database: ${this.connection.connection.name}`);
      console.log(`🌐 Host: ${this.connection.connection.host}:${this.connection.connection.port}`);
      
      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Troubleshooting tips:');
        console.log('   1. Make sure MongoDB is running locally, or');
        console.log('   2. Use MongoDB Atlas (cloud) - see setup instructions');
        console.log('   3. Check your MONGODB_URI in .env file');
      }
      
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }

  async checkConnection() {
    try {
      const state = mongoose.connection.readyState;
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      console.log(`📡 MongoDB connection state: ${states[state]}`);
      
      if (state === 1) {
        // Test the connection with a simple operation
        await mongoose.connection.db.admin().ping();
        console.log('✅ MongoDB connection is healthy');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ MongoDB connection check failed:', error.message);
      return false;
    }
  }

  async createIndexes() {
    try {
      console.log('🔍 Creating database indexes...');
      
      // User indexes
      await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true });
      
      // Product indexes
      await mongoose.connection.collection('products').createIndex({ category: 1, is_active: 1 });
      await mongoose.connection.collection('products').createIndex({ expiry_date: 1, is_active: 1 });
      await mongoose.connection.collection('products').createIndex({ seller_id: 1 });
      await mongoose.connection.collection('products').createIndex({ createdAt: -1 });
      
      // Order indexes
      await mongoose.connection.collection('orders').createIndex({ buyer_id: 1, createdAt: -1 });
      await mongoose.connection.collection('orders').createIndex({ order_status: 1 });
      await mongoose.connection.collection('orders').createIndex({ order_id: 1 }, { unique: true });
      
      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.error('❌ Failed to create indexes:', error.message);
    }
  }

  async getStats() {
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
      console.error('❌ Failed to get database stats:', error.message);
      return null;
    }
  }
}

module.exports = DatabaseManager;