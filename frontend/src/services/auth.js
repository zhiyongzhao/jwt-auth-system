/**
 * 认证服务 - 处理与用户认证相关的所有功能
 */
import api from './api';

/**
 * 用户注册
 * @param {Object} userData - 用户数据
 * @returns {Promise} - 用户信息
 */
const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    // 保存令牌
    if (response.tokens) {
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
    }
    
    return response.user;
  } catch (error) {
    throw error;
  }
};

/**
 * 用户登录
 * @param {Object} credentials - 登录凭证
 * @returns {Promise} - 用户信息
 */
const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    // 保存令牌
    if (response.tokens) {
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
    }
    
    return response.user;
  } catch (error) {
    throw error;
  }
};

/**
 * 获取当前用户信息
 * @returns {Promise} - 用户信息
 */
const getCurrentUser = async () => {
  try {
    // 检查本地存储中是否有令牌
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return null;
    }
    
    const response = await api.get('/auth/me', true);
    return response.user;
  } catch (error) {
    // 清除无效令牌
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

/**
 * 用户登出
 * @returns {Promise} - 登出结果
 */
const logout = async () => {
  try {
    await api.post('/auth/logout', {}, true);
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // 清除本地存储的令牌
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

/**
 * 刷新访问令牌
 * @returns {Promise} - 刷新结果
 */
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await api.post('/auth/refresh-token', { refreshToken });
    
    // 保存新令牌
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
    }
    
    return true;
  } catch (error) {
    // 刷新失败，清除所有令牌
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

/**
 * 更新用户资料
 * @param {Object} profileData - 资料数据
 * @returns {Promise} - 更新后的用户信息
 */
const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData, true);
    return response.user;
  } catch (error) {
    throw error;
  }
};

/**
 * 更改密码
 * @param {Object} passwordData - 密码数据
 * @returns {Promise} - 更改结果
 */
const changePassword = async (passwordData) => {
  try {
    const response = await api.post('/users/change-password', passwordData, true);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * 获取仪表盘数据
 * @returns {Promise} - 仪表盘数据
 */
const getDashboardData = async () => {
  try {
    const response = await api.get('/users/dashboard', true);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 获取管理员数据（仅限管理员）
 * @returns {Promise} - 管理员数据
 */
const getAdminData = async () => {
  try {
    const response = await api.get('/users/admin', true);
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  register,
  login,
  getCurrentUser,
  logout,
  refreshToken,
  updateProfile,
  changePassword,
  getDashboardData,
  getAdminData
};