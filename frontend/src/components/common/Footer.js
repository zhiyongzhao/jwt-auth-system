import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-light text-center text-muted py-3 mt-5">
      <div className="container">
        <p className="mb-0">
          JWT 认证系统 &copy; {new Date().getFullYear()} - 安全、易用且高度可配置的JWT认证解决方案
        </p>
      </div>
    </footer>
  );
};

export default Footer;