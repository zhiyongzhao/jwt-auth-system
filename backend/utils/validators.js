/**
 * 通用验证函数
 */

/**
 * 验证邮箱格式
 * @param {string} email - 需要验证的邮箱
 * @returns {boolean} - 是否有效
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证密码强度
 * @param {string} password - 需要验证的密码
 * @returns {Object} - 验证结果和信息
 */
const validatePasswordStrength = (password) => {
  const result = {
    isValid: true,
    message: 'Password is strong',
    strength: 'strong'
  };
  
  // 检查长度
  if (password.length < 6) {
    result.isValid = false;
    result.message = 'Password must be at least 6 characters long';
    result.strength = 'weak';
    return result;
  }
  
  // 检查复杂性
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  const complexity = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars]
    .filter(Boolean).length;
  
  if (complexity <= 1) {
    result.isValid = false;
    result.message = 'Password is too weak';
    result.strength = 'weak';
  } else if (complexity === 2) {
    result.message = 'Password can be stronger';
    result.strength = 'medium';
  }
  
  return result;
};

/**
 * 验证用户名格式
 * @param {string} username - 需要验证的用户名
 * @returns {boolean} - 是否有效
 */
const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

module.exports = {
  isValidEmail,
  validatePasswordStrength,
  isValidUsername
};