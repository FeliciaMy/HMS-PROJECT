const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billId: {
    type: String,
    unique: true,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  medicalRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },
  billDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  services: [{
    serviceType: {
      type: String,
      required: true,
      enum: ['consultation', 'procedure', 'lab-test', 'medication', 'room-charge', 'other']
    },
    description: String,
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: Number,
    discount: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    rate: {
      type: Number,
      default: 0
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'fixed'
    },
    value: {
      type: Number,
      default: 0,
      min: 0
    },
    amount: {
      type: Number,
      default: 0
    },
    reason: String
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'bank-transfer', 'mobile-payment']
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    balance: Number,
    transactions: [{
      transactionId: String,
      date: Date,
      amount: Number,
      method: String,
      reference: String
    }]
  },
  insurance: {
    provider: String,
    policyNumber: String,
    claimNumber: String,
    claimStatus: {
      type: String,
      enum: ['not-filed', 'pending', 'approved', 'rejected', 'partially-approved']
    },
    coveredAmount: {
      type: Number,
      default: 0
    },
    claimDate: Date
  },
  notes: String,
  dueDate: Date,
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Auto-generate bill ID
billSchema.pre('save', async function(next) {
  if (!this.billId) {
    const count = await mongoose.model('Bill').countDocuments();
    this.billId = 'BILL' + String(count + 1).padStart(6, '0');
  }
  
  // Calculate service totals
  this.services.forEach(service => {
    service.totalPrice = service.quantity * service.unitPrice - (service.discount || 0);
  });
  
  // Calculate subtotal
  this.subtotal = this.services.reduce((sum, service) => sum + service.totalPrice, 0);
  
  // Calculate discount
  if (this.discount.type === 'percentage') {
    this.discount.amount = (this.subtotal * this.discount.value) / 100;
  } else {
    this.discount.amount = this.discount.value;
  }
  
  // Calculate tax
  const taxableAmount = this.subtotal - this.discount.amount;
  this.tax.amount = (taxableAmount * this.tax.rate) / 100;
  
  // Calculate total
  this.total = taxableAmount + this.tax.amount;
  
  // Calculate balance
  this.payment.balance = this.total - this.payment.paidAmount;
  
  // Update payment status
  if (this.payment.paidAmount === 0) {
    this.payment.status = 'pending';
  } else if (this.payment.paidAmount >= this.total) {
    this.payment.status = 'paid';
    this.payment.balance = 0;
  } else {
    this.payment.status = 'partial';
  }
  
  // Set due date if not set (30 days from bill date)
  if (!this.dueDate) {
    this.dueDate = new Date(this.billDate);
    this.dueDate.setDate(this.dueDate.getDate() + 30);
  }
  
  next();
});

// Index for efficient queries
billSchema.index({ patientId: 1, billDate: -1 });
billSchema.index({ 'payment.status': 1 });
billSchema.index({ billDate: -1 });

module.exports = mongoose.model('Bill', billSchema);