const User = require('../models/userModel');
const JwtAuthMiddleware = require('../middleware/jwtAuth');
const config = require('../config/config');
const { validationResult } = require('express-validator');

// 初始化JWT认证中间件
const jwtAuth = new JwtAuthMiddleware({
  secret: config.jwt.secret,
  expiresIn: config.jwt.expiresIn,
  refreshExpiresIn: config.jwt.refreshExpiresIn,
  refreshTokenSecret: config.jwt.refreshTokenSecret
});

/**
 * 用户注册
 */
exports.register = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array(),
        message: 'Validation error' 
      });
    }

    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // 创建新用户
    const newUser = new User({
      username,
      email,
      password
    });

    await newUser.save();

    // 生成JWT令牌
    const userData = newUser.toJSON();
    const tokens = jwtAuth.createTokens(userData);

    // 保存刷新令牌
    newUser.refreshToken = tokens.refreshToken;
    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userData,
      tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration',
      error: error.message
    });
  }
};

/**
 * 用户登录
 */
exports.login = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array(),
        message: 'Validation error' 
      });
    }

    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 检查用户是否激活
    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // 生成JWT令牌
    const userData = user.toJSON();
    const tokens = jwtAuth.createTokens(userData);

    // 保存刷新令牌
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData,
      tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: error.message
    });
  }
};

/**
 * 刷新令牌
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // 查找拥有该刷新令牌的用户
    const user = await User.findOne({ refreshToken });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // 刷新访问令牌
    const userData = user.toJSON();
    const newTokens = await jwtAuth.refreshAccessToken(refreshToken, userData);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      ...newTokens
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Failed to refresh token',
      error: error.message
    });
  }
};

/**
 * 退出登录
 */
exports.logout = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    // 清除用户的刷新令牌
    await User.findByIdAndUpdate(userId, { refreshToken: null });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout',
      error: error.message
    });
  }
};

/**
 * 获取当前用户信息
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user information',
      error: error.message
    });
  }
};