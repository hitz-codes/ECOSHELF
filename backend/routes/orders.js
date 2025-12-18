const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create new order
router.post('/', auth, requireRole(['buyer']), [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product_id').isMongoId().withMessage('Valid product ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('payment_method').isIn(['card', 'upi', 'cod']).withMessage('Invalid payment method'),
  body('delivery_address').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Delivery address must be 10-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { items, payment_method, delivery_address, notes } = req.body;

    // Validate and process items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product_id);
      
      if (!product) {
        return res.status(400).json({ 
          message: `Product not found: ${item.product_id}` 
        });
      }

      if (!product.is_active) {
        return res.status(400).json({ 
          message: `Product is no longer available: ${product.name}` 
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}` 
        });
      }

      // Check if product is expired
      if (new Date(product.expiry_date) <= new Date()) {
        return res.status(400).json({ 
          message: `Product has expired: ${product.name}` 
        });
      }

      const itemTotal = product.discounted_price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: product._id,
        product_name: product.name,
        quantity: item.quantity,
        price_per_item: product.discounted_price,
        total_price: itemTotal
      });
    }

    const deliveryFee = 1.00; // Fixed delivery fee
    const totalAmount = subtotal + deliveryFee;

    // Create order
    const order = new Order({
      buyer_id: req.user._id,
      buyer_name: req.user.name,
      buyer_email: req.user.email,
      buyer_mobile: req.user.mobile_number,
      delivery_address: delivery_address || req.user.delivery_address,
      items: orderItems,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      payment_method,
      notes: notes || '',
      estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
    });

    await order.save();

    // Update product quantities and sold counts
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { 
          quantity: -item.quantity,
          sold_quantity: item.quantity
        }
      });
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        order_id: order.order_id,
        total_amount: order.total_amount,
        payment_method: order.payment_method,
        estimated_delivery: order.estimated_delivery,
        order_status: order.order_status
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// Get user's orders
router.get('/my-orders', auth, requireRole(['buyer']), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['placed', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'])
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
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = { buyer_id: req.user._id };
    
    if (req.query.status) {
      filter.order_status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('items.product_id', 'name image_url discounted_price seller_name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_orders: total
      }
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Get single order details
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ order_id: req.params.orderId })
      .populate('items.product_id', 'name image_url discounted_price seller_name category');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order (buyers can only see their own orders)
    if (req.user.role === 'buyer' && order.buyer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Sellers can see orders containing their products
    if (req.user.role === 'seller') {
      const sellerProducts = await Product.find({ seller_id: req.user._id });
      const sellerProductIds = sellerProducts.map(p => p._id.toString());
      
      const hasSellerProduct = order.items.some(item => 
        sellerProductIds.includes(item.product_id.toString())
      );

      if (!hasSellerProduct) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({ order });
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
});

// Update order status (sellers only for their products)
router.patch('/:orderId/status', auth, requireRole(['seller']), [
  body('status').isIn(['confirmed', 'preparing', 'shipped', 'delivered']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { status } = req.body;
    const order = await Order.findOne({ order_id: req.params.orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if seller has products in this order
    const sellerProducts = await Product.find({ seller_id: req.user._id });
    const sellerProductIds = sellerProducts.map(p => p._id.toString());
    
    const hasSellerProduct = order.items.some(item => 
      sellerProductIds.includes(item.product_id.toString())
    );

    if (!hasSellerProduct) {
      return res.status(403).json({ message: 'Access denied. You can only update orders containing your products.' });
    }

    // Update order status
    order.order_status = status;
    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order: {
        order_id: order.order_id,
        order_status: order.order_status
      }
    });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
});

// Cancel order (buyers only, within time limit)
router.patch('/:orderId/cancel', auth, requireRole(['buyer']), async (req, res) => {
  try {
    const order = await Order.findOne({ order_id: req.params.orderId })
      .populate('items.product_id', 'name image_url discounted_price seller_name category');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.buyer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if order can be cancelled
    if (order.order_status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    if (['shipped', 'delivered'].includes(order.order_status)) {
      return res.status(400).json({ message: 'Cannot cancel order that has been shipped or delivered' });
    }

    // Check time limit (e.g., 30 minutes after placing)
    const timeSinceOrder = Date.now() - order.createdAt.getTime();
    const cancelTimeLimit = 30 * 60 * 1000; // 30 minutes

    if (timeSinceOrder > cancelTimeLimit && order.order_status !== 'placed') {
      return res.status(400).json({ message: 'Order cannot be cancelled after 30 minutes' });
    }

    // Cancel order and restore product quantities
    order.order_status = 'cancelled';
    await order.save();

    // Restore product quantities
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { 
          quantity: item.quantity,
          sold_quantity: -item.quantity
        }
      });
    }

    res.json({
      message: 'Order cancelled successfully',
      order: {
        order_id: order.order_id,
        order_status: order.order_status
      }
    });
  } catch (error) {
    console.error('Order cancellation error:', error);
    res.status(500).json({ message: 'Server error cancelling order' });
  }
});

// Get orders for seller's products
router.get('/seller/orders', auth, requireRole(['seller']), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['placed', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'])
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
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get seller's product IDs
    const sellerProducts = await Product.find({ seller_id: req.user._id });
    const sellerProductIds = sellerProducts.map(p => p._id);

    let filter = {
      'items.product_id': { $in: sellerProductIds }
    };

    if (req.query.status) {
      filter.order_status = req.query.status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_orders: total
      }
    });
  } catch (error) {
    console.error('Seller orders fetch error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

module.exports = router;