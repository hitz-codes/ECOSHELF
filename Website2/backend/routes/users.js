const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth, requireRole } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Store OTP temporarily (in production, use Redis or database)
const otpStore = new Map();

// Update user profile (name)
router.put('/profile', auth, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id, 
      { name }, 
      { new: true }
    ).select('-password');

    res.json({ 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Send email OTP for email change
router.post('/send-email-otp', auth, [
  body('newEmail').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { newEmail } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry (5 minutes)
    const otpKey = `${req.user._id}_${newEmail}`;
    otpStore.set(otpKey, {
      otp,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // In production, send actual email here
    console.log(`OTP for ${newEmail}: ${otp}`);

    res.json({ 
      message: 'OTP sent successfully',
      // For development, include OTP in response (remove in production)
      developmentOtp: otp
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error sending OTP' });
  }
});

// Verify email OTP and update email
router.post('/verify-email-otp', auth, [
  body('newEmail').isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { newEmail, otp } = req.body;
    const otpKey = `${req.user._id}_${newEmail}`;
    
    const storedOtpData = otpStore.get(otpKey);
    
    if (!storedOtpData) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    if (Date.now() > storedOtpData.expires) {
      otpStore.delete(otpKey);
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (storedOtpData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is valid, update email
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { email: newEmail },
      { new: true }
    ).select('-password');

    // Clean up OTP
    otpStore.delete(otpKey);

    res.json({ 
      message: 'Email updated successfully',
      user 
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
});

// Get seller dashboard stats
router.get('/seller/dashboard', auth, requireRole(['seller']), async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Get total listings
    const totalListings = await Product.countDocuments({ 
      seller_id: sellerId 
    });

    // Get active listings
    const activeListings = await Product.countDocuments({ 
      seller_id: sellerId, 
      is_active: true,
      quantity: { $gt: 0 }
    });

    // Get items sold in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const itemsSold24h = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: yesterday },
          order_status: { $ne: 'cancelled' }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $match: {
          'product.seller_id': sellerId
        }
      },
      {
        $group: {
          _id: null,
          totalSold: { $sum: '$items.quantity' }
        }
      }
    ]);

    // Get total revenue
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          order_status: { $ne: 'cancelled' }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $match: {
          'product.seller_id': sellerId
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$items.total_price' }
        }
      }
    ]);

    // Get products nearing expiry (within 3 days)
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const nearingExpiry = await Product.countDocuments({
      seller_id: sellerId,
      is_active: true,
      quantity: { $gt: 0 },
      expiry_date: { 
        $gte: new Date(),
        $lte: threeDaysFromNow 
      }
    });

    res.json({
      stats: {
        total_listings: totalListings,
        active_listings: activeListings,
        items_sold_24h: itemsSold24h[0]?.totalSold || 0,
        total_revenue: totalRevenue[0]?.totalRevenue || 0,
        nearing_expiry: nearingExpiry
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
});

// Get buyer dashboard stats
router.get('/buyer/dashboard', auth, requireRole(['buyer']), async (req, res) => {
  try {
    const buyerId = req.user._id;

    // Get total orders
    const totalOrders = await Order.countDocuments({ buyer_id: buyerId });

    // Get recent orders (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentOrders = await Order.countDocuments({
      buyer_id: buyerId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get total spent
    const totalSpent = await Order.aggregate([
      {
        $match: {
          buyer_id: buyerId,
          order_status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$total_amount' }
        }
      }
    ]);

    // Get pending orders
    const pendingOrders = await Order.countDocuments({
      buyer_id: buyerId,
      order_status: { $in: ['placed', 'confirmed', 'preparing', 'shipped'] }
    });

    res.json({
      stats: {
        total_orders: totalOrders,
        recent_orders: recentOrders,
        total_spent: totalSpent[0]?.totalSpent || 0,
        pending_orders: pendingOrders
      }
    });
  } catch (error) {
    console.error('Buyer dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
});

// Change password
router.put('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

// Deactivate account
router.patch('/deactivate', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });

    // If seller, deactivate all their products
    if (req.user.role === 'seller') {
      await Product.updateMany(
        { seller_id: req.user._id },
        { is_active: false }
      );
    }

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Account deactivation error:', error);
    res.status(500).json({ message: 'Server error deactivating account' });
  }
});

// Get user addresses (for buyers)
router.get('/addresses', auth, requireRole(['buyer']), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      addresses: [
        {
          id: 'default',
          type: 'default',
          address: user.delivery_address,
          is_default: true
        }
      ]
    });
  } catch (error) {
    console.error('Addresses fetch error:', error);
    res.status(500).json({ message: 'Server error fetching addresses' });
  }
});

// Update delivery address
router.put('/addresses/default', auth, requireRole(['buyer']), [
  body('address').trim().isLength({ min: 10, max: 500 }).withMessage('Address must be 10-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { address } = req.body;

    await User.findByIdAndUpdate(req.user._id, { delivery_address: address });

    res.json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error('Address update error:', error);
    res.status(500).json({ message: 'Server error updating address' });
  }
});

module.exports = router;