const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: String,
    unique: true,
    required: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    phone: {
      type: String,
      required: true
    },
    email: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  professional: {
    specialization: {
      type: String,
      required: true,
      enum: [
        'general-medicine',
        'cardiology',
        'neurology',
        'orthopedics',
        'pediatrics',
        'gynecology',
        'dermatology',
        'psychiatry',
        'ophthalmology',
        'ent',
        'dentistry',
        'surgery',
        'anesthesiology',
        'radiology',
        'pathology'
      ]
    },
    qualification: {
      type: String,
      required: true
    },
    experience: {
      type: Number,
      required: true,
      min: 0
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true
    },
    registrationNumber: String,
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    }
  },
  schedule: {
    workDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    workHours: {
      start: String,
      end: String
    },
    consultationDuration: {
      type: Number,
      default: 30 // minutes
    },
    breakTime: {
      start: String,
      end: String
    }
  },
  fees: {
    consultation: {
      type: Number,
      required: true,
      min: 0
    },
    followUp: {
      type: Number,
      min: 0
    },
    emergency: {
      type: Number,
      min: 0
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
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

// Auto-generate doctor ID
doctorSchema.pre('save', async function(next) {
  if (!this.doctorId) {
    const count = await mongoose.model('Doctor').countDocuments();
    this.doctorId = 'DOC' + String(count + 1).padStart(6, '0');
  }
  next();
});

// Virtual for full name
doctorSchema.virtual('fullName').get(function() {
  return `Dr. ${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

doctorSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Doctor', doctorSchema);