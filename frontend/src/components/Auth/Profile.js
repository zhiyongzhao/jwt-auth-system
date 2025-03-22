import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../../services/auth';

const Profile = ({ user, setUser, showAlert }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 处理个人资料表单变化
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  // 处理密码表单变化
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // 特殊处理密码确认字段
    if (name === 'newPassword' || name === 'confirmNewPassword') {
      if (name === 'newPassword' && passwordData.confirmNewPassword && value !== passwordData.confirmNewPassword) {
        setErrors({ ...errors, confirmNewPassword: '两次输入的新密码不一致' });
      } else if (name === 'confirmNewPassword' && value !== passwordData.newPassword) {
        setErrors({ ...errors, confirmNewPassword: '两次输入的新密码不一致' });
      } else {
        setErrors({ ...errors, confirmNewPassword: '' });
      }
    }
  };
  
  // 验证个人资料表单
  const validateProfileForm = () => {
    const newErrors = {};
    
    // 验证用户名
    if (!profileData.username.trim()) {
      newErrors.username = '请输入用户名';
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(profileData.username)) {
      newErrors.username = '用户名必须为3-30个字符，只能包含字母、数字和下划线';
    }
    
    // 验证邮箱
    if (!profileData.email.trim()) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 验证密码表单
  const validatePasswordForm = () => {
    const newErrors = {};
    
    // 验证当前密码
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = '请输入当前密码';
    }
    
    // 验证新密码
    if (!passwordData.newPassword) {
      newErrors.newPassword = '请输入新密码';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = '新密码长度不能少于6个字符';
    }
    
    // 验证确认密码
    if (!passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = '请确认新密码';
    } else if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = '两次输入的新密码不一致';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 提交个人资料表单
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    // 验证表单
    if (!validateProfileForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // 调用更新资料API
      const updatedUser = await AuthService.updateProfile(profileData);
      
      // 更新用户信息
      setUser(updatedUser);
      showAlert('个人资料更新成功！', 'success');
    } catch (error) {
      console.error('Profile update error:', error);
      showAlert(error.message || '更新个人资料失败', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 提交密码表单
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // 验证表单
    if (!validatePasswordForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // 调用更改密码API
      await AuthService.changePassword(passwordData);
      
      // 重置密码表单
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      
      showAlert('密码修改成功！', 'success');
    } catch (error) {
      console.error('Password change error:', error);
      showAlert(error.message || '修改密码失败', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-7">
        <div className="card shadow">
          <div className="card-header">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  个人资料
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  安全设置
                </button>
              </li>
            </ul>
          </div>
          
          <div className="card-body p-4">
            {activeTab === 'profile' ? (
              <>
                <h3 className="mb-4">编辑个人资料</h3>
                
                <form onSubmit={handleProfileSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">用户名</label>
                    <input
                      type="text"
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      id="username"
                      name="username"
                      value={profileData.username}
                      onChange={handleProfileChange}
                      placeholder="请输入用户名"
                    />
                    {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                    <small className="form-text text-muted">用户名只能包含字母、数字和下划线</small>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label">邮箱地址</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      placeholder="请输入邮箱地址"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <Link to="/dashboard" className="btn btn-outline-secondary">
                      返回仪表盘
                    </Link>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          保存中...
                        </>
                      ) : '保存更改'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 className="mb-4">修改密码</h3>
                
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">当前密码</label>
                    <input
                      type="password"
                      className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="请输入当前密码"
                    />
                    {errors.currentPassword && <div className="invalid-feedback">{errors.currentPassword}</div>}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">新密码</label>
                    <input
                      type="password"
                      className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="请输入新密码"
                    />
                    {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                    <small className="form-text text-muted">密码至少需要6个字符</small>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="confirmNewPassword" className="form-label">确认新密码</label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmNewPassword ? 'is-invalid' : ''}`}
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      value={passwordData.confirmNewPassword}
                      onChange={handlePasswordChange}
                      placeholder="请再次输入新密码"
                    />
                    {errors.confirmNewPassword && <div className="invalid-feedback">{errors.confirmNewPassword}</div>}
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <Link to="/dashboard" className="btn btn-outline-secondary">
                      返回仪表盘
                    </Link>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          保存中...
                        </>
                      ) : '修改密码'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;