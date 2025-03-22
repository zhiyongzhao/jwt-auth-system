import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../services/auth';

const Dashboard = ({ user, showAlert }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取仪表盘数据
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await AuthService.getDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('获取仪表盘数据失败，请稍后再试');
        showAlert('获取仪表盘数据失败', 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showAlert]);

  // 测试管理员功能
  const testAdminFunction = async () => {
    try {
      const response = await AuthService.getAdminData();
      showAlert('管理员访问成功！', 'success');
      console.log('Admin data:', response);
    } catch (err) {
      showAlert('无管理员权限访问失败', 'danger');
      console.error('Admin access failed:', err);
    }
  };

  // 显示加载状态
  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">加载中...</span>
        </div>
        <p className="mt-2">加载仪表盘数据...</p>
      </div>
    );
  }

  // 显示错误
  if (error) {
    return (
      <div className="alert alert-danger my-5" role="alert">
        <h4 className="alert-heading">加载失败</h4>
        <p>{error}</p>
        <hr />
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-outline-danger"
            onClick={() => window.location.reload()}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  // 显示仪表盘内容
  return (
    <div className="row">
      <div className="col-md-12 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title">欢迎回来，{user.username}！</h2>
            <p className="card-text">
              这是您的个人仪表盘，您可以在这里查看您的账户信息和管理您的个人资料。
            </p>
          </div>
        </div>
      </div>

      {dashboardData && (
        <>
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">个人资料</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <strong>用户名：</strong> {dashboardData.username}
                </div>
                <div className="mb-3">
                  <strong>角色：</strong> {dashboardData.role === 'admin' ? '管理员' : '普通用户'}
                </div>
                <div className="mb-3">
                  <strong>注册时间：</strong> {new Date(dashboardData.joinDate).toLocaleString()}
                </div>
                <div className="mb-3">
                  <strong>上次活动：</strong> {new Date(dashboardData.lastActive).toLocaleString()}
                </div>
                <div className="mt-4">
                  <Link to="/profile" className="btn btn-outline-primary">
                    编辑个人资料
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-info text-white">
                <h5 className="card-title mb-0">账户统计</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-4 mb-3">
                    <div className="border rounded p-3">
                      <h3 className="mb-2">{dashboardData.stats.totalLogins}</h3>
                      <p className="text-muted mb-0">总登录次数</p>
                    </div>
                  </div>
                  <div className="col-4 mb-3">
                    <div className="border rounded p-3">
                      <h3 className="mb-2">{dashboardData.stats.totalActions}</h3>
                      <p className="text-muted mb-0">总操作次数</p>
                    </div>
                  </div>
                  <div className="col-4 mb-3">
                    <div className="border rounded p-3">
                      <h3 className="mb-2">{dashboardData.stats.accountAge}</h3>
                      <p className="text-muted mb-0">账户天数</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h6>JWT令牌演示</h6>
                  <p className="text-muted small">
                    当前登录使用JWT令牌进行身份验证，令牌会在1小时后过期。
                    系统将在令牌过期前5分钟自动刷新令牌。
                  </p>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => {
                      const token = localStorage.getItem('accessToken');
                      if (token) {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        alert(`令牌有效期至: ${new Date(payload.exp * 1000).toLocaleString()}`);
                      }
                    }}
                  >
                    查看令牌信息
                  </button>
                  {dashboardData.role === 'admin' ? (
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={testAdminFunction}
                    >
                      测试管理员功能
                    </button>
                  ) : (
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={testAdminFunction}
                    >
                      测试权限控制
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;