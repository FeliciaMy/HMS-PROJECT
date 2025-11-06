require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_db');
    
    const testUser = new User({
      username: 'admin',
      email: 'admin@hospital.com',
      password: 'Admin123!',
      role: 'admin'
    });
    
    await testUser.save();
    console.log('Test user created!');
    console.log('Email: admin@hospital.com');
    console.log('Password: Admin123!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUser();