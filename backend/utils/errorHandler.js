/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // 默认错误状态码和消息
  let statusCode = 500;
  let message = 'Server error';
  let errorData = {};
  
  // MongoDB 错误
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    
    // 处理验证错误
    const errors = {};
    for (const field in err.errors) {
      errors[field] = err.errors[field].message;
    }
    errorData = { errors };
  }
  
  // MongoDB 重复键错误
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate key error';
    
    // 提取重复的字段
    const field = Object.keys(err.keyPattern)[0];
    errorData = { field, value: err.keyValue[field] };
  }
  
  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }
  
  // 发送错误响应
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    ...errorData
  });
};

/**
 * 404 Not Found 处理中间件
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Not found - ${req.originalUrl}`
  });
};

/**
 * 异步处理包装器
 * @param {Function} fn - 异步函数
 * @returns {Function} - 包装后的中间件函数
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};