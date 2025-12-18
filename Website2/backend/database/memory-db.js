// In-memory database for testing when MongoDB is not available
const fs = require('fs');
const path = require('path');

class MemoryDatabase {
  constructor() {
    this.data = {
      users: [],
      products: [],
      orders: []
    };
    this.dataFile = path.join(__dirname, 'memory-data.json');
    this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const fileData = fs.readFileSync(this.dataFile, 'utf8');
        this.data = JSON.parse(fileData);
        console.log('📁 Loaded data from memory database');
      }
    } catch (error) {
      console.log('📁 Creating new memory database');
    }
  }

  saveData() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving memory database:', error);
    }
  }

  // User operations
  createUser(userData) {
    const user = {
      _id: this.generateId(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  findUserByEmail(email) {
    return this.data.users.find(user => user.email === email);
  }

  findUserById(id) {
    return this.data.users.find(user => user._id === id);
  }

  // Product operations
  createProduct(productData) {
    const product = {
      _id: this.generateId(),
      ...productData,
      is_active: true,
      views: 0,
      sold_quantity: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.products.push(product);
    this.saveData();
    return product;
  }

  findProducts(filter = {}) {
    let products = this.data.products.filter(product => {
      if (filter.is_active !== undefined && product.is_active !== filter.is_active) return false;
      if (filter.seller_id && product.seller_id !== filter.seller_id) return false;
      if (filter.category && product.category !== filter.category) return false;
      return true;
    });

    // Sort by creation date (newest first)
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return products;
  }

  findProductById(id) {
    return this.data.products.find(product => product._id === id);
  }

  updateProduct(id, updates) {
    const productIndex = this.data.products.findIndex(product => product._id === id);
    if (productIndex !== -1) {
      this.data.products[productIndex] = {
        ...this.data.products[productIndex],
        ...updates,
        updatedAt: new Date()
      };
      this.saveData();
      return this.data.products[productIndex];
    }
    return null;
  }

  deleteProduct(id) {
    const productIndex = this.data.products.findIndex(product => product._id === id);
    if (productIndex !== -1) {
      this.data.products[productIndex].is_active = false;
      this.saveData();
      return true;
    }
    return false;
  }

  // Order operations
  createOrder(orderData) {
    const order = {
      _id: this.generateId(),
      order_id: this.generateOrderId(),
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.orders.push(order);
    this.saveData();
    return order;
  }

  findOrders(filter = {}) {
    let orders = this.data.orders.filter(order => {
      if (filter.buyer_id && order.buyer_id !== filter.buyer_id) return false;
      if (filter.order_status && order.order_status !== filter.order_status) return false;
      return true;
    });

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return orders;
  }

  findOrderById(id) {
    return this.data.orders.find(order => order._id === id || order.order_id === id);
  }

  // Utility methods
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  generateOrderId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ECO${timestamp.slice(-6)}${random}`;
  }

  // Stats
  getStats() {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    return {
      users: this.data.users.length,
      products: this.data.products.length,
      orders: this.data.orders.length,
      activeProducts: this.data.products.filter(p => p.is_active).length,
      expiringSoon: this.data.products.filter(p => 
        p.is_active && 
        new Date(p.expiry_date) >= now && 
        new Date(p.expiry_date) <= threeDaysFromNow
      ).length
    };
  }

  // Initialize with sample data
  initializeSampleData() {
    // Clear existing data
    this.data = { users: [], products: [], orders: [] };

    // Create sample users
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'buyer@example.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6UP9Dv/u2O', // password123
        role: 'buyer',
        mobile_number: '+1234567890',
        delivery_address: '123 Main Street, Anytown, AT 12345'
      },
      {
        name: 'Jane Smith',
        email: 'seller@example.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6UP9Dv/u2O', // password123
        role: 'seller',
        mobile_number: '+1987654321',
        business_name: 'Fresh Foods Market',
        business_address: '456 Business Ave, Commerce City, CC 67890',
        business_license: 'BL123456789'
      }
    ];

    const createdUsers = sampleUsers.map(userData => this.createUser(userData));
    const seller = createdUsers.find(user => user.role === 'seller');

    // Create sample products
    const sampleProducts = [
      {
        name: 'Fresh Organic Milk',
        description: 'Farm-fresh organic milk, perfect for your morning coffee or cereal.',
        category: 'Normal',
        original_price: 4.99,
        discounted_price: 2.49,
        quantity: 25,
        expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
        seller_id: seller._id,
        seller_name: seller.business_name
      },
      {
        name: 'Whole Wheat Bread',
        description: 'Freshly baked whole wheat bread, soft and nutritious.',
        category: 'Normal',
        original_price: 3.99,
        discounted_price: 1.99,
        quantity: 15,
        expiry_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
        seller_id: seller._id,
        seller_name: seller.business_name
      },
      {
        name: 'Organic Bananas',
        description: 'Sweet and ripe organic bananas, perfect for smoothies or snacking.',
        category: 'Seasonal',
        original_price: 2.99,
        discounted_price: 1.49,
        quantity: 50,
        expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
        seller_id: seller._id,
        seller_name: seller.business_name
      },
      {
        name: 'Greek Yogurt',
        description: 'Creamy Greek yogurt with probiotics, great for breakfast.',
        category: 'Normal',
        original_price: 6.99,
        discounted_price: 3.49,
        quantity: 20,
        expiry_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        seller_id: seller._id,
        seller_name: seller.business_name
      }
    ];

    sampleProducts.forEach(productData => this.createProduct(productData));

    console.log('✅ Sample data initialized in memory database');
    console.log(`   👥 Users: ${this.data.users.length}`);
    console.log(`   📦 Products: ${this.data.products.length}`);
    console.log('   🔐 Test accounts: buyer@example.com / seller@example.com (password: password123)');
  }
}

module.exports = MemoryDatabase;