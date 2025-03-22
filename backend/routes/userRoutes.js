const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const JwtAuthMiddleware = require('../middleware/jwtAuth');
const config = require('../config/config');

const router = express.Router();
const jwtAuth = new JwtAuthMiddleware({
  secret: config.jwt.secret,
  expiresIn: config.jwt.expiresIn,
  refreshTokenSecret: config.jwt.refreshTokenSecret
});

// 保护路由 - 添加JWT认证中间件
router.use(jwtAuth.middleware());

// 获取用户资料 - GET /api/users/profile
router.get('/profile', userController.getUserProfile);

// 更新用户资料 - PUT /api/users/profile
router.put(
  '/profile',
  [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers and underscores'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
  ],
  userController.updateUserProfile
);

// 更改密码 - POST /api/users/change-password
router.post(
  '/change-password',
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
  ],
  userController.changePassword
);

// 获取仪表盘数据 - GET /api/users/dashboard
router.get('/dashboard', userController.getDashboardData);

// 保护的管理员路由 - 添加授权中间件
router.get(
  '/admin',
  jwtAuth.authorize('admin'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Admin access granted',
      adminData: {
        secretInfo: 'This is admin only information',
        timestamp: new Date()
      }
    });
  }
);

module.exports = router;