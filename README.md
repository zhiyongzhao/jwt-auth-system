markdown

复制
# JWT 认证中间件系统

一个安全、易用且高度可配置的 Node.js JWT 认证中间件，提供完整的前后端实现，支持令牌管理、权限控制和自动刷新等功能。

## 功能特点

- **高度可配置**：支持自定义密钥、过期时间、算法等参数
- **双令牌系统**：使用访问令牌和刷新令牌增强安全性
- **自动令牌刷新**：在令牌过期前自动刷新
- **细粒度权限控制**：基于角色的授权机制
- **全面错误处理**：提供完善的错误处理
- **安全认证**：符合最佳安全实践
- **完整前端集成**：包含响应式用户界面和无缝交互
- **可扩展设计**：易于扩展和集成到现有项目中

## 技术栈

### 后端
- Node.js
- Express.js
- MongoDB 与 Mongoose
- JSON Web Token (JWT)
- bcrypt.js (密码哈希)

### 前端
- React
- React Router
- Bootstrap 5 (UI 框架)
- Fetch API (网络请求)

## 快速开始

### 安装依赖

1. 克隆仓库
```bash
git clone https://github.com/your-username/jwt-auth-system.git
cd jwt-auth-system```
2. 安装后端依赖
```bash
cd backend
npm install```
3. 安装前端依赖
```bash
cd ../frontend
npm install```

### 配置
1. 后端配置
创建 .env 文件在 backend 目录下:
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/jwt-auth-system
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-secret-key
REFRESH_TOKEN_EXPIRES_IN=7d```
2. 前端配置
如果需要，可以在 frontend/src/services/api.js 中修改 API 地址:
```javascript
const API_URL = 'http://localhost:5000/api';```

### 运行
1. 启动后端服务器
```bash
cd backend
npm run dev```
2. 启动前端开发服务器
```bash
cd frontend
npm start```
访问 http://localhost:3000 查看应用。

## 中间件架构设计
### 核心组件
1. JwtAuthMiddleware 类：
- 提供令牌创建、验证和刷新功能
- 支持路径排除和自定义错误处理
- 实现自动令牌刷新机制

2. 授权中间件：
- 基于角色的访问控制
- 支持多角色和精细权限管理

### 中间件配置选项