const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function updateSugarcaneBagasse() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Product.updateOne(
      { name: 'Sugarcane Bagasse', category: 'Derived' },
      { 
        $set: { 
          image_url: 'https://emeraldecovations.com/wp-content/uploads/2024/01/Bagasse.png'
        } 
      }
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ Updated Sugarcane Bagasse image successfully!');
      console.log('   New URL: https://emeraldecovations.com/wp-content/uploads/2024/01/Bagasse.png');
    } else {
      console.log('⚠️  Sugarcane Bagasse product not found');
    }

    console.log('\n🎉 Sugarcane Bagasse image updated!');
    console.log('💡 Refresh your browser to see the change');
    
  } catch (error) {
    console.error('Error updating image:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateSugarcaneBagasse();