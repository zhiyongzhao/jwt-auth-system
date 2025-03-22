const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

// API 路由映射
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// API 根路由
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to JWT Authentication API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/*',
      users: '/api/users/*'
    }
  });
});

module.exports = router;