const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const JwtAuthMiddleware = require('../middleware/jwtAuth');
const config = require('../config/config');

const router = express.Router();
const jwtAuth = new JwtAuthMiddleware({
  secret: config.jwt.secret,
  expiresIn: config.jwt.expiresIn,
  refreshTokenSecret: config.jwt.refreshTokenSecret
});

// 注册路由 - POST /api/auth/register
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers and underscores'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  authController.register
);

// 登录路由 - POST /api/auth/login
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  authController.login
);

// 刷新令牌路由 - POST /api/auth/refresh-token
router.post(
  '/refresh-token',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required')
  ],
  authController.refreshToken
);

// 获取当前用户信息 - GET /api/auth/me
router.get(
  '/me',
  jwtAuth.middleware(),
  authController.getCurrentUser
);

// 退出登录路由 - POST /api/auth/logout
router.post(
  '/logout',
  jwtAuth.middleware(),
  authController.logout
);

module.exports = router;