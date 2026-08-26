require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: 'MongoDB (Mongoose ODM)',
    brand: 'XIV STUDIO',
    version: '2.0.0',
    time: new Date().toISOString(),
  });
});

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API Endpoint không tồn tại' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Đã có lỗi nội bộ máy chủ xảy ra',
  });
});

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`⚡ XIV STUDIO Backend Server running on port ${PORT}`);
  console.log(`🍃 Database Engine: MongoDB (Mongoose ODM)`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🤖 AI Gemini & SSE Streaming Endpoint: /api/ai/chat/stream`);
  console.log(`💳 VietQR Napas 247 Integration: Ready`);
  console.log(`====================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Cổng ${PORT} đang bị chiếm dụng. Đang chạy trên tiến trình khác.`);
  } else {
    console.error('Server error:', err);
  }
});
