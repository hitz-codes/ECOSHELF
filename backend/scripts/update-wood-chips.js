const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function updateWoodChips() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Product.updateOne(
      { name: 'Wood Chips', category: 'Derived' },
      { 
        $set: { 
          image_url: 'https://content.jdmagicbox.com/quickquotes/images_main/eucalyptus-wood-chip-bedding-803320647-hj1qk3lr.jpg?impolicy=queryparam&im=Resize=(360,360),aspect=fit'
        } 
      }
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ Updated Wood Chips image successfully!');
      console.log('   New URL: https://content.jdmagicbox.com/quickquotes/images_main/eucalyptus-wood-chip-bedding-803320647-hj1qk3lr.jpg?impolicy=queryparam&im=Resize=(360,360),aspect=fit');
    } else {
      console.log('⚠️  Wood Chips product not found');
    }

    console.log('\n🎉 Wood Chips image updated!');
    console.log('💡 Refresh your browser to see the change');
    
  } catch (error) {
    console.error('Error updating image:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateWoodChips();