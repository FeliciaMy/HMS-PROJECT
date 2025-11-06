const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  recordId: {
    type: String,
    unique: true,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  visitDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  visitType: {
    type: String,
    enum: ['outpatient', 'inpatient', 'emergency', 'follow-up'],
    default: 'outpatient'
  },
  chiefComplaint: {
    type: String,
    required: true
  },
  symptoms: [String],
  diagnosis: {
    primary: {
      type: String,
      required: true
    },
    secondary: [String],
    icdCode: String // International Classification of Diseases code
  },
  physicalExamination: {
    bloodPressure: String, // e.g., "120/80"
    heartRate: Number,
    temperature: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number,
    bmi: Number
  },
  labTests: [{
    testName: String,
    testDate: Date,
    result: String,
    normalRange: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'abnormal']
    },
    interpretation: String
  }],
  prescriptions: [{
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine'
    },
    medicineName: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
    quantity: Number
  }],
  treatmentPlan: String,
  procedures: [{
    name: String,
    date: Date,
    description: String,
    outcome: String
  }],
  followUp: {
    required: Boolean,
    date: Date,
    instructions: String
  },
  attachments: [{
    fileName: String,
    fileType: String,
    fileUrl: String,
    uploadDate: Date
  }],
  notes: String,
  status: {
    type: String,
    enum: ['draft', 'completed', 'reviewed'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Auto-generate record ID
medicalRecordSchema.pre('save', async function(next) {
  if (!this.recordId) {
    const count = await mongoose.model('MedicalRecord').countDocuments();
    this.recordId = 'MR' + String(count + 1).padStart(6, '0');
  }
  
  // Calculate BMI if height and weight are provided
  if (this.physicalExamination.weight && this.physicalExamination.height) {
    const heightInMeters = this.physicalExamination.height / 100;
    this.physicalExamination.bmi = (
      this.physicalExamination.weight / (heightInMeters * heightInMeters)
    ).toFixed(2);
  }
  
  next();
});

// Index for efficient queries
medicalRecordSchema.index({ patientId: 1, visitDate: -1 });
medicalRecordSchema.index({ doctorId: 1, visitDate: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);