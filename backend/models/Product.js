const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['Normal', 'Seasonal', 'Derived']
  },
  original_price: {
    type: Number,
    required: true,
    min: 0
  },
  discounted_price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  expiry_date: {
    type: Date,
    required: true
  },
  image_url: {
    type: String,
    default: ''
  },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller_name: {
    type: String,
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  sold_quantity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for days until expiry
productSchema.virtual('days_until_expiry').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiry_date);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for discount percentage
productSchema.virtual('discount_percentage').get(function() {
  if (this.original_price <= 0) return 0;
  return Math.round(((this.original_price - this.discounted_price) / this.original_price) * 100);
});

// Index for efficient queries
productSchema.index({ category: 1, is_active: 1 });
productSchema.index({ expiry_date: 1, is_active: 1 });
productSchema.index({ seller_id: 1 });
productSchema.index({ createdAt: -1 });

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);