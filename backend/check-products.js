const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const products = await Product.find({}).select('name image_url category seller_name');
    console.log(`\nFound ${products.length} products:\n`);
    
    products.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name} (${p.category})`);
      console.log(`   Seller: ${p.seller_name}`);
      console.log(`   Image: ${p.image_url || 'NO IMAGE'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkProducts();