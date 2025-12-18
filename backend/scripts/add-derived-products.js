const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

async function addDerivedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a seller to assign products to
    const seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      console.log('No seller found. Please create a seller account first.');
      return;
    }

    const derivedProducts = [
      {
        name: 'Rice Husk',
        description: 'Natural rice husk perfect for fuel, composting, or construction material. Eco-friendly and sustainable.',
        category: 'Derived',
        original_price: 15.00,
        discounted_price: 8.00,
        quantity: 50,
        expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
        seller_id: seller._id,
        seller_name: seller.business_name || seller.name
      },
      {
        name: 'Wheat Straw Bales',
        description: 'Compressed wheat straw bales ideal for biofuel, animal bedding, or construction. Clean and dry.',
        category: 'Derived',
        original_price: 25.00,
        discounted_price: 12.00,
        quantity: 30,
        expiry_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 4 months
        image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
        seller_id: seller._id,
        seller_name: seller.business_name || seller.name
      },
      {
        name: 'Corn Cob Pellets',
        description: 'Ground corn cob pellets excellent for biomass fuel, animal litter, or industrial absorbent.',
        category: 'Derived',
        original_price: 20.00,
        discounted_price: 10.00,
        quantity: 40,
        expiry_date: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000), // 5 months
        image_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop',
        seller_id: seller._id,
        seller_name: seller.business_name || seller.name
      },
      {
        name: 'Coconut Coir',
        description: 'Natural coconut fiber perfect for gardening, erosion control, or as a sustainable fuel source.',
        category: 'Derived',
        original_price: 18.00,
        discounted_price: 9.00,
        quantity: 35,
        expiry_date: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000), // 6.5 months
        image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop',
        seller_id: seller._id,
        seller_name: seller.business_name || seller.name
      },
      {
        name: 'Sugarcane Bagasse',
        description: 'Fibrous sugarcane waste ideal for paper production, biofuel, or building materials. Sustainable choice.',
        category: 'Derived',
        original_price: 22.00,
        discounted_price: 11.00,
        quantity: 25,
        expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
        image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
        seller_id: seller._id,
        seller_name: seller.business_name || seller.name
      },
      {
        name: 'Wood Chips',
        description: 'Mixed hardwood chips perfect for biomass fuel, mulching, or smoking food. Clean and seasoned.',
        category: 'Derived',
        original_price: 30.00,
        discounted_price: 15.00,
        quantity: 20,
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        image_url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop',
        seller_id: seller._id,
        seller_name: seller.business_name || seller.name
      },
      {
        name: 'Peanut Shells',
        description: 'Ground peanut shells excellent for fuel pellets, garden mulch, or animal bedding. Natural and organic.',
        category: 'Derived',
        original_price: 12.00,
        discounted_price: 6.00,
        quantity: 60,
        expiry_date: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000), // 3.3 months
        image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
        seller_id: seller._id,
        seller_name: seller.business_name || seller.name
      },
      {
        name: 'Sawdust Briquettes',
        description: 'Compressed sawdust briquettes for efficient burning. Great for heating, cooking, or industrial use.',
        category: 'Derived',
        original_price: 28.00,
        discounted_price: 14.00,
        quantity: 45,
        expiry_date: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000), // 10 months
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        seller_id: seller._id,
        seller_name: seller.business_name || seller.name
      }
    ];

    // Check if products already exist
    for (const productData of derivedProducts) {
      const existingProduct = await Product.findOne({ 
        name: productData.name, 
        seller_id: productData.seller_id 
      });
      
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        console.log(`✅ Added: ${productData.name}`);
      } else {
        console.log(`⏭️  Skipped: ${productData.name} (already exists)`);
      }
    }

    console.log('\n🎉 Derived products setup complete!');
    console.log('These products are now available in the "Derived" category.');
    
  } catch (error) {
    console.error('Error adding derived products:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the script
addDerivedProducts();