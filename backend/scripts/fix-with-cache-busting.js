const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function fixWithCacheBusting() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Add cache busting parameter to force browser refresh
    const timestamp = Date.now();
    
    const correctImageUpdates = [
      {
        name: 'Rice Husk',
        image_url: `https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&q=80&t=${timestamp}1`
      },
      {
        name: 'Wheat Straw Bales', 
        image_url: `https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&q=80&t=${timestamp}2`
      },
      {
        name: 'Corn Cob Pellets',
        image_url: `https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop&q=80&t=${timestamp}3`
      },
      {
        name: 'Coconut Coir',
        image_url: `https://images.unsplash.com/photo-1605034313761-73ea4a0cfbf3?w=400&h=300&fit=crop&q=80&t=${timestamp}4`
      },
      {
        name: 'Sugarcane Bagasse',
        image_url: `https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&q=80&t=${timestamp}5`
      },
      {
        name: 'Wood Chips',
        image_url: `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&q=80&t=${timestamp}6`
      },
      {
        name: 'Peanut Shells',
        image_url: `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&q=80&t=${timestamp}7`
      },
      {
        name: 'Sawdust Briquettes',
        image_url: `https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop&q=80&t=${timestamp}8`
      }
    ];

    console.log('Updating with cache-busting URLs...\n');

    for (const update of correctImageUpdates) {
      const result = await Product.updateOne(
        { name: update.name, category: 'Derived' },
        { $set: { image_url: update.image_url } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`✅ Updated: ${update.name}`);
        console.log(`   New URL: ${update.image_url}`);
      } else {
        console.log(`⚠️  Not found: ${update.name}`);
      }
    }

    console.log('\n🎉 Cache-busting update complete!');
    
  } catch (error) {
    console.error('Error updating images:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixWithCacheBusting();