import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Auth/Profile';
import AuthService from './services/auth';
import Alert from './components/common/Alert';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // 显示警告提示
  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // 检查用户登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 用户登录
  const handleLogin = async (userData) => {
    try {
      const loggedInUser = await AuthService.login(userData);
      setUser(loggedInUser);
      showAlert('登录成功！', 'success');
      return true;
    } catch (error) {
      showAlert(error.message || '登录失败', 'danger');
      return false;
    }
  };

  // 用户注册
  const handleRegister = async (userData) => {
    try {
      const registeredUser = await AuthService.register(userData);
      setUser(registeredUser);
      showAlert('注册成功！', 'success');
      return true;
    } catch (error) {
      showAlert(error.message || '注册失败', 'danger');
      return false;
    }
  };

  // 用户登出
  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      showAlert('已成功退出登录', 'success');
    } catch (error) {
      showAlert(error.message || '退出登录失败', 'danger');
    }
  };

  // 受保护的路由组件
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div className="d-flex justify-content-center mt-5"><div className="spinner-border" role="status"></div></div>;
    }
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="container mt-4 flex-grow-1">
        {alert && <Alert message={alert.message} type={alert.type} />}
        
        <Routes>
          <Route path="/" element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          } />
          
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
          } />
          
          <Route path="/register" element={
            user ? <Navigate to="/dashboard" /> : <Register onRegister={handleRegister} />
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard user={user} showAlert={showAlert} />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile user={user} setUser={setUser} showAlert={showAlert} />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={
            <div className="text-center mt-5">
              <h2>404 - 页面未找到</h2>
              <p>请求的页面不存在</p>
            </div>
          } />
        </Routes>
      </div>
      
      <Footer />
    </div>
  );
}

export default App;