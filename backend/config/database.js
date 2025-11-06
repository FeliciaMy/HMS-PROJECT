const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Default fallback uses the standard MongoDB port 27017 and a development DB name
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hms_dev', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;