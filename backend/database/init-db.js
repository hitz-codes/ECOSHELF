const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Sample data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'buyer@example.com',
    password: 'password123',
    role: 'buyer',
    mobile_number: '+1234567890',
    delivery_address: '123 Main Street, Anytown, AT 12345'
  },
  {
    name: 'Jane Smith',
    email: 'seller@example.com',
    password: 'password123',
    role: 'seller',
    mobile_number: '+1987654321',
    business_name: 'Fresh Foods Market',
    business_address: '456 Business Ave, Commerce City, CC 67890',
    business_license: 'BL123456789'
  },
  {
    name: 'Mike Johnson',
    email: 'seller2@example.com',
    password: 'password123',
    role: 'seller',
    mobile_number: '+1555666777',
    business_name: 'Organic Farm Co',
    business_address: '789 Farm Road, Green Valley, GV 11111',
    business_license: 'BL987654321'
  }
];

const sampleProducts = [
  {
    name: 'Fresh Organic Milk',
    description: 'Farm-fresh organic milk, perfect for your morning coffee or cereal.',
    category: 'Normal',
    original_price: 4.99,
    discounted_price: 2.49,
    quantity: 25,
    expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
    seller_name: 'Fresh Foods Market'
  },
  {
    name: 'Whole Wheat Bread',
    description: 'Freshly baked whole wheat bread, soft and nutritious.',
    category: 'Normal',
    original_price: 3.99,
    discounted_price: 1.99,
    quantity: 15,
    expiry_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    seller_name: 'Fresh Foods Market'
  },
  {
    name: 'Organic Bananas',
    description: 'Sweet and ripe organic bananas, perfect for smoothies or snacking.',
    category: 'Seasonal',
    original_price: 2.99,
    discounted_price: 1.49,
    quantity: 50,
    expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
    seller_name: 'Organic Farm Co'
  },
  {
    name: 'Fresh Strawberries',
    description: 'Juicy red strawberries, perfect for desserts or eating fresh.',
    category: 'Seasonal',
    original_price: 5.99,
    discounted_price: 2.99,
    quantity: 30,
    expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400',
    seller_name: 'Organic Farm Co'
  },
  {
    name: 'Greek Yogurt',
    description: 'Creamy Greek yogurt with probiotics, great for breakfast.',
    category: 'Normal',
    original_price: 6.99,
    discounted_price: 3.49,
    quantity: 20,
    expiry_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    seller_name: 'Fresh Foods Market'
  },
  {
    name: 'Organic Apples',
    description: 'Crisp and sweet organic apples, perfect for snacking.',
    category: 'Seasonal',
    original_price: 4.99,
    discounted_price: 2.99,
    quantity: 40,
    expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    seller_name: 'Organic Farm Co'
  },
  {
    name: 'Cheese Slices',
    description: 'Premium cheese slices, perfect for sandwiches and burgers.',
    category: 'Normal',
    original_price: 7.99,
    discounted_price: 3.99,
    quantity: 18,
    expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    image_url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
    seller_name: 'Fresh Foods Market'
  },
  {
    name: 'Organic Carrots',
    description: 'Fresh organic carrots, great for cooking or juicing.',
    category: 'Seasonal',
    original_price: 3.49,
    discounted_price: 1.74,
    quantity: 35,
    expiry_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
    image_url: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400',
    seller_name: 'Organic Farm Co'
  }
];

async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomart', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users
    console.log('👥 Creating sample users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`   ✅ Created ${user.role}: ${user.email}`);
    }

    // Get seller IDs for products
    const sellers = createdUsers.filter(user => user.role === 'seller');
    const sellerMap = {};
    sellers.forEach(seller => {
      sellerMap[seller.business_name] = seller._id;
    });

    // Create products
    console.log('📦 Creating sample products...');
    const createdProducts = [];
    
    for (const productData of sampleProducts) {
      const product = new Product({
        ...productData,
        seller_id: sellerMap[productData.seller_name]
      });
      await product.save();
      createdProducts.push(product);
      console.log(`   ✅ Created product: ${product.name}`);
    }

    // Create a sample order
    console.log('🛒 Creating sample order...');
    const buyer = createdUsers.find(user => user.role === 'buyer');
    const orderProducts = createdProducts.slice(0, 2); // First 2 products
    
    const orderItems = orderProducts.map(product => ({
      product_id: product._id,
      product_name: product.name,
      quantity: 1,
      price_per_item: product.discounted_price,
      total_price: product.discounted_price
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
    const deliveryFee = 1.00;
    const totalAmount = subtotal + deliveryFee;

    const sampleOrder = new Order({
      buyer_id: buyer._id,
      buyer_name: buyer.name,
      buyer_email: buyer.email,
      buyer_mobile: buyer.mobile_number,
      delivery_address: buyer.delivery_address,
      items: orderItems,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      payment_method: 'card',
      payment_status: 'completed',
      order_status: 'delivered',
      estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    });

    // The order_id will be generated automatically by the pre-save hook

    await sampleOrder.save();
    console.log(`   ✅ Created sample order: ${sampleOrder.order_id}`);

    // Update product quantities (simulate some sales)
    await Product.findByIdAndUpdate(orderProducts[0]._id, {
      $inc: { quantity: -1, sold_quantity: 1 }
    });
    await Product.findByIdAndUpdate(orderProducts[1]._id, {
      $inc: { quantity: -1, sold_quantity: 1 }
    });

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users created: ${createdUsers.length}`);
    console.log(`   📦 Products created: ${createdProducts.length}`);
    console.log(`   🛒 Orders created: 1`);
    
    console.log('\n🔐 Test Accounts:');
    console.log('   Buyer: buyer@example.com / password123');
    console.log('   Seller 1: seller@example.com / password123');
    console.log('   Seller 2: seller2@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();