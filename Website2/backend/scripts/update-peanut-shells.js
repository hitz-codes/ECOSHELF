const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function updatePeanutShells() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Product.updateOne(
      { name: 'Peanut Shells', category: 'Derived' },
      { 
        $set: { 
          image_url: 'https://5.imimg.com/data5/FM/TJ/MY-44010002/peanut-shell.jpg'
        } 
      }
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ Updated Peanut Shells image successfully!');
      console.log('   New URL: https://5.imimg.com/data5/FM/TJ/MY-44010002/peanut-shell.jpg');
    } else {
      console.log('⚠️  Peanut Shells product not found');
    }

    console.log('\n🎉 Peanut Shells image updated!');
    console.log('💡 Refresh your browser to see the change');
    
  } catch (error) {
    console.error('Error updating image:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updatePeanutShells();