const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function fixDerivedImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Updated image URLs with more specific and relevant images
    const imageUpdates = [
      {
        name: 'Rice Husk',
        image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&q=80'
      },
      {
        name: 'Wheat Straw Bales',
        image_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=300&fit=crop&q=80'
      },
      {
        name: 'Corn Cob Pellets',
        image_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop&q=80'
      },
      {
        name: 'Coconut Coir',
        image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&q=80'
      },
      {
        name: 'Sugarcane Bagasse',
        image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&q=80'
      },
      {
        name: 'Wood Chips',
        image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&q=80'
      },
      {
        name: 'Peanut Shells',
        image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&q=80'
      },
      {
        name: 'Sawdust Briquettes',
        image_url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop&q=80'
      }
    ];

    console.log('Updating derived product images...\n');

    for (const update of imageUpdates) {
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

    console.log('\n🎉 Image updates complete!');
    
  } catch (error) {
    console.error('Error updating images:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixDerivedImages();