
const mongoose = require('mongoose');

// ตัวแปรสำหรับเก็บสถานะการเชื่อมต่อ
let isConnected = false;

const connectDB = async () => {
  // ถ้าเชื่อมต่ออยู่แล้วให้ return
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  try {
    // ตั้งค่า Mongoose
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout หลัง 5 วินาที
      socketTimeoutMS: 45000, // Close sockets หลัง 45 วินาที
    });

    isConnected = true;
    
    console.log('╔══════════════════════════════════════╗');
    console.log('║   ✅ MongoDB Connected Successfully   ║');
    console.log('╚══════════════════════════════════════╝');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔌 Port: ${conn.connection.port}`);
    
  } catch (error) {
    console.error('╔══════════════════════════════════════╗');
    console.error('║   ❌ MongoDB Connection Failed       ║');
    console.error('╚══════════════════════════════════════╝');
    console.error('Error:', error.message);
    console.error('Full Error:', error);
    process.exit(1);
  }
};

// Event Listeners
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
  isConnected = false;
});

// Reconnect logic
mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose reconnected to MongoDB');
  isConnected = true;
});

// Graceful Shutdown
const gracefulShutdown = async (msg) => {
  try {
    await mongoose.connection.close();
    console.log(`🛑 Mongoose connection closed: ${msg}`);
    isConnected = false;
  } catch (err) {
    console.error('Error during shutdown:', err);
  }
};

// จัดการ shutdown signals
process.on('SIGINT', async () => {
  await gracefulShutdown('App termination (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await gracefulShutdown('App termination (SIGTERM)');
  process.exit(0);
});

// Export
module.exports = connectDB;
