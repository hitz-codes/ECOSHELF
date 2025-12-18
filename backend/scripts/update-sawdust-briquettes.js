const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function updateSawdustBriquettes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Product.updateOne(
      { name: 'Sawdust Briquettes', category: 'Derived' },
      { 
        $set: { 
          image_url: 'https://img500.exportersindia.com/product_images/bc-500/2023/11/12337011/saw-dust-briquettes-1698900309-7155032.jpeg'
        } 
      }
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ Updated Sawdust Briquettes image successfully!');
      console.log('   New URL: https://img500.exportersindia.com/product_images/bc-500/2023/11/12337011/saw-dust-briquettes-1698900309-7155032.jpeg');
    } else {
      console.log('⚠️  Sawdust Briquettes product not found');
    }

    console.log('\n🎉 Sawdust Briquettes image updated!');
    console.log('💡 Refresh your browser to see the change');
    
  } catch (error) {
    console.error('Error updating image:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateSawdustBriquettes();