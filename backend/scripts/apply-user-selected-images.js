const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function applyUserSelectedImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // User's selected images from test-unsplash-images.html
    const userSelectedImages = [
      {
        name: 'Coconut Coir',
        image_url: 'https://www.greendna.in/cdn/shop/files/coconut-husk-31_500x.webp?v=1732625548',
        description: 'Natural fiber extracted from coconut husks. Used for gardening, erosion control, and crafts.'
      },
      {
        name: 'Corn Cob Pellets',
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDIVg1o7B1HEqRQJdTah_7Rcc7A4HFDwNtqQ&',
        description: 'Pellets made from ground corn cobs. Used as animal bedding and biomass fuel.'
      },
      {
        name: 'Wheat Straw Bales',
        image_url: 'https://140608649.cdn6.editmysite.com/uploads/1/4/0/6/140608649/VMXTCXL6RS6TTE6H67JGSDEW.jpeg',
        description: 'Compressed wheat straw formed into bales. Used for animal bedding, construction, and biofuel.'
      },
      {
        name: 'Rice Husk',
        image_url: 'https://5.imimg.com/data5/TI/FI/MY-43026256/rice-husk-500x500.jpg',
        description: 'Rice husks are the hard protecting coverings of grains of rice. Used as biofuel and building material.'
      }
    ];

    console.log('🎯 Applying user-selected images to database...\n');

    for (const update of userSelectedImages) {
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
        console.log(`   New URL: ${update.image_url}`);
      } else {
        console.log(`⚠️  Not found: ${update.name}`);
      }
    }

    console.log('\n🎉 User-selected images applied successfully!');
    console.log('💡 These images should be much more accurate representations');
    console.log('💡 Hard refresh your browser to see the changes');
    
  } catch (error) {
    console.error('Error updating images:', error);
  } finally {
    await mongoose.disconnect();
  }
}

applyUserSelectedImages();