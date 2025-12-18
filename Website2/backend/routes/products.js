const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const { auth, requireRole } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Get all products with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
  query('category').optional().isIn(['Normal', 'Seasonal', 'Derived']).withMessage('Invalid category'),
  query('sort').optional().isIn(['expiring-soon', 'price-low-high', 'price-high-low', 'rating', 'newest', 'discount']).withMessage('Invalid sort option'),
  query('time_period').optional().isIn(['all', 'today', '3-days', '1-week', '2-weeks']).withMessage('Invalid time period'),
  query('price_range').optional().isString().withMessage('Invalid price range'),
  query('availability').optional().isIn(['in-stock', 'low-stock', 'high-stock']).withMessage('Invalid availability filter')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = { is_active: true, quantity: { $gt: 0 } };

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Time period filter
    if (req.query.time_period && req.query.time_period !== 'all') {
      const now = new Date();
      let expiryDate;
      
      switch (req.query.time_period) {
        case 'today':
          expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case '3-days':
          expiryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
          break;
        case '1-week':
          expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case '2-weeks':
          expiryDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
          break;
      }
      
      if (expiryDate) {
        filter.expiry_date = { $lte: expiryDate, $gte: now };
      }
    } else {
      // Only show products that haven't expired
      filter.expiry_date = { $gte: new Date() };
    }

    // Price range filter
    if (req.query.price_range) {
      const priceRange = req.query.price_range;
      switch (priceRange) {
        case '0-500':
          filter.discounted_price = { $gte: 0, $lte: 500 };
          break;
        case '500-1500':
          filter.discounted_price = { $gte: 500, $lte: 1500 };
          break;
        case '1500-3000':
          filter.discounted_price = { $gte: 1500, $lte: 3000 };
          break;
        case '3000+':
          filter.discounted_price = { $gte: 3000 };
          break;
      }
    }

    // Availability filter
    if (req.query.availability) {
      switch (req.query.availability) {
        case 'in-stock':
          filter.quantity = { $gt: 0 };
          break;
        case 'low-stock':
          filter.quantity = { $gt: 0, $lt: 5 };
          break;
        case 'high-stock':
          filter.quantity = { $gt: 10 };
          break;
      }
    }

    // Build sort
    let sort = {};
    switch (req.query.sort) {
      case 'expiring-soon':
        sort = { expiry_date: 1 };
        break;
      case 'price-low-high':
        sort = { discounted_price: 1 };
        break;
      case 'price-high-low':
        sort = { discounted_price: -1 };
        break;
      case 'rating':
        sort = { views: -1 }; // Using views as proxy for popularity
        break;
      case 'discount':
        // Sort by highest discount percentage (calculated field)
        sort = { discounted_price: 1, original_price: -1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
        break;
    }

    // Execute query
    const products = await Product.find(filter)
      .populate('seller_id', 'name business_name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_products: total,
        has_next: page < Math.ceil(total / limit),
        has_prev: page > 1
      }
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller_id', 'name business_name mobile_number');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.is_active) {
      return res.status(404).json({ message: 'Product is no longer available' });
    }

    // Increment view count
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ product });
  } catch (error) {
    console.error('Product fetch error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ message: 'Server error fetching product' });
  }
});

// Search products
router.get('/search/:query', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = {
      is_active: true,
      quantity: { $gt: 0 },
      expiry_date: { $gte: new Date() },
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } }
      ]
    };

    const products = await Product.find(filter)
      .populate('seller_id', 'name business_name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      search_query: searchQuery,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_products: total
      }
    });
  } catch (error) {
    console.error('Product search error:', error);
    res.status(500).json({ message: 'Server error searching products' });
  }
});

// Add new product (sellers only)
router.post('/', auth, requireRole(['seller']), upload.single('product_image'), [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Product name must be 2-200 characters'),
  body('category').isIn(['Normal', 'Seasonal', 'Derived']).withMessage('Invalid category'),
  body('original_price').isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('discounted_price').isFloat({ min: 0 }).withMessage('Discounted price must be a positive number'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('expiry_date').isISO8601().withMessage('Valid expiry date required'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be max 1000 characters')
], handleUploadError, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, description, category, original_price, discounted_price, quantity, expiry_date } = req.body;

    // Validate expiry date is in the future
    const expiryDateObj = new Date(expiry_date);
    if (expiryDateObj <= new Date()) {
      return res.status(400).json({ message: 'Expiry date must be in the future' });
    }

    // Validate discounted price is less than original price
    if (parseFloat(discounted_price) >= parseFloat(original_price)) {
      return res.status(400).json({ message: 'Discounted price must be less than original price' });
    }

    // Create product
    const product = new Product({
      name,
      description: description || '',
      category,
      original_price: parseFloat(original_price),
      discounted_price: parseFloat(discounted_price),
      quantity: parseInt(quantity),
      expiry_date: expiryDateObj,
      image_url: req.file ? `/uploads/products/${req.file.filename}` : '',
      seller_id: req.user._id,
      seller_name: req.user.business_name || req.user.name
    });

    await product.save();

    res.status(201).json({
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
});

// Update product (seller only, own products)
router.put('/:id', auth, requireRole(['seller']), upload.single('product_image'), [
  body('name').optional().trim().isLength({ min: 2, max: 200 }),
  body('category').optional().isIn(['Normal', 'Seasonal', 'Derived']),
  body('original_price').optional().isFloat({ min: 0 }),
  body('discounted_price').optional().isFloat({ min: 0 }),
  body('quantity').optional().isInt({ min: 0 }),
  body('expiry_date').optional().isISO8601(),
  body('description').optional().trim().isLength({ max: 1000 })
], handleUploadError, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns this product
    if (product.seller_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only update your own products.' });
    }

    // Build update object
    const updates = {};
    const allowedFields = ['name', 'description', 'category', 'original_price', 'discounted_price', 'quantity', 'expiry_date'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle image upload
    if (req.file) {
      updates.image_url = `/uploads/products/${req.file.filename}`;
    }

    // Validate expiry date if provided
    if (updates.expiry_date) {
      const expiryDateObj = new Date(updates.expiry_date);
      if (expiryDateObj <= new Date()) {
        return res.status(400).json({ message: 'Expiry date must be in the future' });
      }
      updates.expiry_date = expiryDateObj;
    }

    // Validate prices if both are provided
    const originalPrice = updates.original_price || product.original_price;
    const discountedPrice = updates.discounted_price || product.discounted_price;
    
    if (discountedPrice >= originalPrice) {
      return res.status(400).json({ message: 'Discounted price must be less than original price' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Product update error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ message: 'Server error updating product' });
  }
});

// Delete product (seller only, own products)
router.delete('/:id', auth, requireRole(['seller']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns this product
    if (product.seller_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own products.' });
    }

    // Soft delete by setting is_active to false
    await Product.findByIdAndUpdate(req.params.id, { is_active: false });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

// Get seller's products
router.get('/seller/my-products', auth, requireRole(['seller']), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ seller_id: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ seller_id: req.user._id });

    res.json({
      products,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_products: total
      }
    });
  } catch (error) {
    console.error('Seller products fetch error:', error);
    res.status(500).json({ message: 'Server error fetching your products' });
  }
});

module.exports = router;