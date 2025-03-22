import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 处理表单输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // 特殊处理密码确认字段
    if (name === 'password' || name === 'confirmPassword') {
      if (name === 'password' && formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors({ ...errors, confirmPassword: '两次输入的密码不一致' });
      } else if (name === 'confirmPassword' && value !== formData.password) {
        setErrors({ ...errors, confirmPassword: '两次输入的密码不一致' });
      } else {
        setErrors({ ...errors, confirmPassword: '' });
      }
    }
  };

  // 验证表单数据
  const validateForm = () => {
    const newErrors = {};
    
    // 验证用户名
    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名';
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(formData.username)) {
      newErrors.username = '用户名必须为3-30个字符，只能包含字母、数字和下划线';
    }
    
    // 验证邮箱
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    // 验证密码
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度不能少于6个字符';
    }
    
    // 验证密码确认
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 检查密码强度
  const getPasswordStrength = (password) => {
    if (!password) return '';
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars]
      .filter(Boolean).length;
    
    if (password.length < 6) return 'weak';
    if (strength <= 1) return 'weak';
    if (strength === 2) return 'medium';
    if (strength === 3) return 'good';
    return 'strong';
  };

  // 获取密码强度提示文本
  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 'weak': return '弱';
      case 'medium': return '中';
      case 'good': return '强';
      case 'strong': return '非常强';
      default: return '';
    }
  };

  // 获取密码强度条颜色
  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case 'weak': return 'danger';
      case 'medium': return 'warning';
      case 'good': return 'info';
      case 'strong': return 'success';
      default: return 'secondary';
    }
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证表单
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // 提取注册所需数据（不包括确认密码）
      const { confirmPassword, ...registrationData } = formData;
      
      // 调用注册函数
      const success = await onRegister(registrationData);
      
      if (success) {
        // 重置表单
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 计算密码强度
  const passwordStrength = getPasswordStrength(formData.password);
  const strengthText = getPasswordStrengthText(passwordStrength);
  const strengthColor = getPasswordStrengthColor(passwordStrength);

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow">
          <div className="card-body p-4">
            <h2 className="text-center mb-4">注册账号</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">用户名</label>
                <input
                  type="text"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="请输入用户名"
                  required
                />
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                <small className="form-text text-muted">用户名只能包含字母、数字和下划线</small>
              </div>
              
              <div className="mb-3">
                <label htmlFor="email" className="form-label">邮箱地址</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="请输入您的邮箱"
                  required
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label">密码</label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="请输入密码"
                  required
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                
                {formData.password && (
                  <div className="mt-1">
                    <small className="d-block mb-1">密码强度: <span className={`text-${strengthColor}`}>{strengthText}</span></small>
                    <div className="progress" style={{ height: '5px' }}>
                      <div 
                        className={`progress-bar bg-${strengthColor}`} 
                        role="progressbar" 
                        style={{ 
                          width: passwordStrength === 'weak' ? '25%' : 
                                 passwordStrength === 'medium' ? '50%' : 
                                 passwordStrength === 'good' ? '75%' : '100%' 
                        }} 
                        aria-valuenow={
                          passwordStrength === 'weak' ? 25 : 
                          passwordStrength === 'medium' ? 50 : 
                          passwordStrength === 'good' ? 75 : 100
                        }
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                )}
                
                <small className="form-text text-muted">密码至少需要6个字符</small>
              </div>
              
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label">确认密码</label>
                <input
                  type="password"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="请再次输入密码"
                  required
                />
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>
              
              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      注册中...
                    </>
                  ) : '注册'}
                </button>
              </div>
            </form>
            
            <div className="mt-3 text-center">
              <p>
                已有账号？ <Link to="/login">立即登录</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;