const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function convertPricesToRupees() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to convert`);

    // USD to INR conversion rate (approximate)
    const conversionRate = 83; // 1 USD = 83 INR (approximate)

    let updatedCount = 0;

    for (const product of products) {
      // Convert prices from USD to INR
      const newOriginalPrice = Math.round(product.original_price * conversionRate);
      const newDiscountedPrice = Math.round(product.discounted_price * conversionRate);

      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            original_price: newOriginalPrice,
            discounted_price: newDiscountedPrice
          }
        }
      );

      console.log(`✅ ${product.name}:`);
      console.log(`   Original: $${product.original_price} → ₹${newOriginalPrice}`);
      console.log(`   Discounted: $${product.discounted_price} → ₹${newDiscountedPrice}`);
      
      updatedCount++;
    }

    console.log(`\n🎉 Successfully converted ${updatedCount} products to rupees!`);
    console.log('💡 All prices are now in Indian Rupees (₹)');
    
  } catch (error) {
    console.error('Error converting prices:', error);
  } finally {
    await mongoose.disconnect();
  }
}

convertPricesToRupees();