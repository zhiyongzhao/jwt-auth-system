/**
 * API 服务 - 处理与后端API的所有通信
 */

// 后端API地址
const API_URL = 'http://localhost:5000/api';

/**
 * 发送 HTTP 请求
 * @param {string} endpoint - API端点
 * @param {string} method - HTTP方法
 * @param {Object} data - 请求体数据
 * @param {boolean} auth - 是否需要认证
 * @returns {Promise} - 响应数据
 */
const request = async (endpoint, method = 'GET', data = null, auth = false) => {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // 如果需要认证，添加令牌
  if (auth) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const options = {
    method,
    headers
  };
  
  // 添加请求体
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  // 发送请求
  const response = await fetch(url, options);
  
  // 检查令牌刷新
  const newToken = response.headers.get('X-New-Access-Token');
  if (newToken) {
    localStorage.setItem('accessToken', newToken);
  }
  
  // 解析响应
  const responseData = await response.json();
  
  // 检查响应状态
  if (!response.ok) {
    throw new Error(responseData.message || '请求失败');
  }
  
  return responseData;
};

/**
 * HTTP GET 请求
 * @param {string} endpoint - API端点
 * @param {boolean} auth - 是否需要认证
 * @returns {Promise} - 响应数据
 */
const get = (endpoint, auth = false) => {
  return request(endpoint, 'GET', null, auth);
};

/**
 * HTTP POST 请求
 * @param {string} endpoint - API端点
 * @param {Object} data - 请求体数据
 * @param {boolean} auth - 是否需要认证
 * @returns {Promise} - 响应数据
 */
const post = (endpoint, data, auth = false) => {
  return request(endpoint, 'POST', data, auth);
};

/**
 * HTTP PUT 请求
 * @param {string} endpoint - API端点
 * @param {Object} data - 请求体数据
 * @param {boolean} auth - 是否需要认证
 * @returns {Promise} - 响应数据
 */
const put = (endpoint, data, auth = false) => {
  return request(endpoint, 'PUT', data, auth);
};

/**
 * HTTP DELETE 请求
 * @param {string} endpoint - API端点
 * @param {boolean} auth - 是否需要认证
 * @returns {Promise} - 响应数据
 */
const del = (endpoint, auth = false) => {
  return request(endpoint, 'DELETE', null, auth);
};

export default {
  get,
  post,
  put,
  delete: del
};