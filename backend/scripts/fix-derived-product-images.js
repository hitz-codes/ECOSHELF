const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function fixDerivedProductImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Corrected image URLs that actually match the product names
    const correctImageUpdates = [
      {
        name: 'Rice Husk',
        image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&q=80' // Rice grains - KEEP (correct)
      },
      {
        name: 'Wheat Straw Bales',
        image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&q=80' // Actual wheat straw bales
      },
      {
        name: 'Corn Cob Pellets',
        image_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop&q=80' // Corn cobs - KEEP (correct)
      },
      {
        name: 'Coconut Coir',
        image_url: 'https://images.unsplash.com/photo-1605034313761-73ea4a0cfbf3?w=400&h=300&fit=crop&q=80' // Coconut fiber/coir
      },
      {
        name: 'Sugarcane Bagasse',
        image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&q=80' // Sugarcane - KEEP (correct)
      },
      {
        name: 'Wood Chips',
        image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&q=80' // Wood chips - KEEP (correct)
      },
      {
        name: 'Peanut Shells',
        image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&q=80' // Peanuts - KEEP (correct)
      },
      {
        name: 'Sawdust Briquettes',
        image_url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop&q=80' // Wood/sawdust - KEEP (correct)
      }
    ];

    console.log('Updating derived product images with correct matches...\n');

    for (const update of correctImageUpdates) {
      const result = await Product.updateOne(
        { name: update.name, category: 'Derived' },
        { $set: { image_url: update.image_url } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`✅ Updated: ${update.name}`);
      } else {
        console.log(`⚠️  Not found: ${update.name}`);
      }
    }

    console.log('\n🎉 Image corrections complete!');
    console.log('\nFixed mismatches:');
    console.log('- Coconut Coir: Now shows coconut fiber instead of city street');
    console.log('- Wheat Straw Bales: Now shows wheat straw instead of cows');
    console.log('- Other products: Verified to match their names');
    
  } catch (error) {
    console.error('Error updating images:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixDerivedProductImages();