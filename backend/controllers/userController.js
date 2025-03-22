const User = require('../models/userModel');
const { validationResult } = require('express-validator');

/**
 * 获取用户资料
 */
exports.getUserProfile = async (req, res) => {
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
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      error: error.message
    });
  }
};

/**
 * 更新用户资料
 */
exports.updateUserProfile = async (req, res) => {
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

    const userId = req.user.id || req.user._id;
    const { username, email } = req.body;

    // 检查邮箱是否已被其他用户使用
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email is already in use by another account'
        });
      }
    }

    // 检查用户名是否已被其他用户使用
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username is already in use by another account'
        });
      }
    }

    // 更新用户资料
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          ...(username && { username }),
          ...(email && { email }),
          updatedAt: Date.now()
        } 
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message
    });
  }
};

/**
 * 更改密码
 */
exports.changePassword = async (req, res) => {
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

    const userId = req.user.id || req.user._id;
    const { currentPassword, newPassword } = req.body;

    // 获取用户并验证当前密码
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 验证当前密码
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

/**
 * 获取用户面板数据（仅用于演示）
 */
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 模拟一些面板数据
    const dashboardData = {
      username: user.username,
      role: user.role,
      joinDate: user.createdAt,
      lastActive: user.updatedAt,
      stats: {
        totalLogins: Math.floor(Math.random() * 100),
        totalActions: Math.floor(Math.random() * 500),
        accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard data',
      error: error.message
    });
  }
};