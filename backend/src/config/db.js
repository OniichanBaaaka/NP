const mongoose = require('mongoose');

const connectDB = async (retries = 3) => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/xiv_studio';
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      });
      console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB Connection Attempt ${attempt}/${retries} Error: ${error.message}`);
      if (attempt < retries) {
        console.log(`⏳ Retrying MongoDB connection in 2s...`);
        await new Promise((res) => setTimeout(res, 2000));
      } else {
        console.warn(`⚠️ Lưu ý: Đảm bảo dịch vụ MongoDB (mongod / MongoDB Compass / Atlas) đang chạy.`);
        return null;
      }
    }
  }
};

module.exports = connectDB;
