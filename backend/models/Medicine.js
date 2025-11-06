const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  medicineId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'antibiotic',
      'analgesic',
      'antiviral',
      'antifungal',
      'cardiovascular',
      'diabetes',
      'respiratory',
      'gastrointestinal',
      'neurological',
      'vitamin',
      'other'
    ]
  },
  form: {
    type: String,
    required: true,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler']
  },
  strength: {
    type: String,
    required: true // e.g., "500mg", "10ml"
  },
  description: String,
  stock: {
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      enum: ['pieces', 'bottles', 'boxes', 'strips']
    },
    reorderLevel: {
      type: Number,
      required: true,
      default: 10
    },
    maxLevel: {
      type: Number,
      required: true,
      default: 1000
    }
  },
  pricing: {
    costPrice: {
      type: Number,
      required: true,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  batchInfo: [{
    batchNumber: String,
    manufacturingDate: Date,
    expiryDate: Date,
    quantity: Number,
    supplier: String,
    purchaseDate: Date
  }],
  prescriptionRequired: {
    type: Boolean,
    default: true
  },
  sideEffects: [String],
  contraindications: [String],
  storage: {
    temperature: String,
    conditions: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Auto-generate medicine ID
medicineSchema.pre('save', async function(next) {
  if (!this.medicineId) {
    const count = await mongoose.model('Medicine').countDocuments();
    this.medicineId = 'MED' + String(count + 1).padStart(6, '0');
  }
  next();
});

// Virtual for stock status
medicineSchema.virtual('stockStatus').get(function() {
  if (this.stock.quantity === 0) return 'out-of-stock';
  if (this.stock.quantity <= this.stock.reorderLevel) return 'low-stock';
  if (this.stock.quantity >= this.stock.maxLevel) return 'overstock';
  return 'in-stock';
});

// Index for efficient queries
medicineSchema.index({ name: 1 });
medicineSchema.index({ category: 1 });
medicineSchema.index({ 'stock.quantity': 1 });

medicineSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);