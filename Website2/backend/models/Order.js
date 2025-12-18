const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  product_name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price_per_item: {
    type: Number,
    required: true,
    min: 0
  },
  total_price: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  order_id: {
    type: String,
    unique: true
  },
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyer_name: {
    type: String,
    required: true
  },
  buyer_email: {
    type: String,
    required: true
  },
  buyer_mobile: {
    type: String,
    required: true
  },
  delivery_address: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  delivery_fee: {
    type: Number,
    default: 1.00,
    min: 0
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  payment_method: {
    type: String,
    enum: ['card', 'upi', 'cod'],
    required: true
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  order_status: {
    type: String,
    enum: ['placed', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'],
    default: 'placed'
  },
  estimated_delivery: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Generate unique order ID
orderSchema.pre('save', function(next) {
  if (!this.order_id) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.order_id = `ECO${timestamp.slice(-6)}${random}`;
  }
  next();
});

// Index for efficient queries
orderSchema.index({ buyer_id: 1, createdAt: -1 });
orderSchema.index({ order_status: 1 });
orderSchema.index({ order_id: 1 });

module.exports = mongoose.model('Order', orderSchema);