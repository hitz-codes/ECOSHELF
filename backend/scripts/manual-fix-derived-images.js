const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function manualFixDerivedImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Manually researched correct Unsplash URLs
    const correctImages = [
      {
        name: 'Rice Husk',
        image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&q=80', // Rice grains - KEEP (correct)
        description: 'Rice husks are the hard protecting coverings of grains of rice. Used as biofuel and building material.'
      },
      {
        name: 'Wheat Straw Bales', 
        image_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=300&fit=crop&q=80', // Wheat field
        description: 'Compressed wheat straw formed into bales. Used for animal bedding, construction, and biofuel.'
      },
      {
        name: 'Corn Cob Pellets',
        image_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop&q=80', // Corn
        description: 'Pellets made from ground corn cobs. Used as animal bedding and biomass fuel.'
      },
      {
        name: 'Coconut Coir',
        image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&q=80', // Coconut
        description: 'Natural fiber extracted from coconut husks. Used for gardening, erosion control, and crafts.'
      },
      {
        name: 'Sugarcane Bagasse',
        image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&q=80', // Sugarcane
        description: 'Fibrous residue from sugarcane processing. Used for paper production and biofuel.'
      },
      {
        name: 'Wood Chips',
        image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&q=80', // Forest
        description: 'Small pieces of wood used for landscaping, biomass fuel, and paper production.'
      },
      {
        name: 'Peanut Shells',
        image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&q=80', // Peanuts
        description: 'Outer shells of peanuts. Used for animal bedding, mulch, and biomass fuel.'
      },
      {
        name: 'Sawdust Briquettes',
        image_url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop&q=80', // Wood
        description: 'Compressed sawdust formed into briquettes. Used as eco-friendly fuel for heating.'
      }
    ];

    console.log('🔧 Manually fixing derived product images and descriptions...\n');

    for (const update of correctImages) {
      const result = await Product.updateOne(
        { name: update.name, category: 'Derived' },
        { 
          $set: { 
            image_url: update.image_url,
            description: update.description
          } 
        }
      );
      
      if (result.matchedCount > 0) {
        console.log(`✅ Updated: ${update.name}`);
        console.log(`   Description: ${update.description}`);
      } else {
        console.log(`⚠️  Not found: ${update.name}`);
      }
    }

    console.log('\n🎉 Manual fix complete!');
    console.log('💡 The images should now be more appropriate for each product');
    console.log('💡 Added proper descriptions for each derived product');
    
  } catch (error) {
    console.error('Error updating images:', error);
  } finally {
    await mongoose.disconnect();
  }
}

manualFixDerivedImages();