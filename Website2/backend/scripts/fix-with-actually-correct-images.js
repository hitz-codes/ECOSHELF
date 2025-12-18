const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function fixWithActuallyCorrectImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // COMPLETELY NEW URLs that actually match the products
    const actuallyCorrectImages = [
      {
        name: 'Rice Husk',
        image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&q=80' // Rice - KEEP (correct)
      },
      {
        name: 'Wheat Straw Bales', 
        image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&q=80' // Wheat field/straw
      },
      {
        name: 'Corn Cob Pellets',
        image_url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=300&fit=crop&q=80' // Corn kernels
      },
      {
        name: 'Coconut Coir',
        image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&q=80' // Coconut
      },
      {
        name: 'Sugarcane Bagasse',
        image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&q=80' // Sugarcane - KEEP
      },
      {
        name: 'Wood Chips',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80' // Wood logs/chips
      },
      {
        name: 'Peanut Shells',
        image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&q=80' // Peanuts - KEEP
      },
      {
        name: 'Sawdust Briquettes',
        image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&q=80' // Forest/wood - KEEP
      }
    ];

    console.log('🔧 Fixing with ACTUALLY correct images...\n');

    for (const update of actuallyCorrectImages) {
      const result = await Product.updateOne(
        { name: update.name, category: 'Derived' },
        { $set: { image_url: update.image_url } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`✅ Fixed: ${update.name}`);
      } else {
        console.log(`⚠️  Not found: ${update.name}`);
      }
    }

    console.log('\n🎉 Actually correct images updated!');
    console.log('💡 Hard refresh your browser (Ctrl+Shift+R) to see changes');
    
  } catch (error) {
    console.error('Error updating images:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixWithActuallyCorrectImages();