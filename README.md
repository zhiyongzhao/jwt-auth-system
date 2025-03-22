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
cd jwt-auth-system
安装后端依赖
bash

复制
cd backend
npm install
安装前端依赖
bash

复制
cd ../frontend
npm install
配置
后端配置
创建 .env 文件在 backend 目录下:

ini

复制
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/jwt-auth-system
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-secret-key
REFRESH_TOKEN_EXPIRES_IN=7d
前端配置
如果需要，可以在 frontend/src/services/api.js 中修改 API 地址:

javascript

复制
const API_URL = 'http://localhost:5000/api';
运行
启动后端服务器
bash

复制
cd backend
npm run dev
启动前端开发服务器
bash

复制
cd frontend
npm start
访问 http://localhost:3000 查看应用。

中间件架构设计
核心组件
JwtAuthMiddleware 类：
提供令牌创建、验证和刷新功能
支持路径排除和自定义错误处理
实现自动令牌刷新机制
授权中间件：
基于角色的访问控制
支持多角色和精细权限管理
中间件配置选项
javascript

复制
const jwtAuth = new JwtAuthMiddleware({
  // 必需选项
  secret: 'your-secret-key',              // JWT 密钥
  
  // 可选配置
  expiresIn: '1h',                        // 访问令牌过期时间
  refreshExpiresIn: '7d',                 // 刷新令牌过期时间
  algorithm: 'HS256',                     // 签名算法
  issuer: 'your-app-name',                // 令牌发行者
  audience: 'your-app-client',            // 令牌接收者
  tokenType: 'Bearer',                    // 令牌类型
  refreshTokenSecret: 'refresh-secret',   // 刷新令牌密钥
  autoRefresh: true,                      // 是否自动刷新令牌
  autoRefreshThreshold: 300,              // 刷新阈值（秒）
  customUserKey: 'user',                  // 用户对象在请求中的键
  errorHandler: null,                     // 自定义错误处理函数
  excludedPaths: ['/api/auth/login'],     // 排除的路径
  authorizationHeader: 'Authorization'    // 认证头名称
});
使用方式
基本认证中间件
javascript

复制
// 应用认证中间件到路由
app.use('/api/protected', jwtAuth.middleware());

// 保护特定路由
router.get('/profile', jwtAuth.middleware(), userController.getUserProfile);
角色授权
javascript

复制
// 限制只有管理员可以访问
router.get('/admin', 
  jwtAuth.middleware(),
  jwtAuth.authorize('admin'),
  adminController.getDashboard
);

// 多角色授权
router.get('/reports', 
  jwtAuth.middleware(),
  jwtAuth.authorize(['admin', 'manager']),
  reportsController.getReports
);
创建令牌
javascript

复制
// 用户登录后创建令牌
const userData = { id: user._id, username: user.username, role: user.role };
const tokens = jwtAuth.createTokens(userData);

// 返回令牌给客户端
res.json({
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
  expiresIn: tokens.expiresIn
});
刷新令牌
javascript

复制
// 使用刷新令牌获取新的访问令牌
const newToken = await jwtAuth.refreshAccessToken(refreshToken, userData);
API 文档
认证 API
端点	方法	描述	权限
/api/auth/register	POST	用户注册	公开
/api/auth/login	POST	用户登录	公开
/api/auth/refresh-token	POST	刷新访问令牌	公开
/api/auth/me	GET	获取当前用户信息	已认证
/api/auth/logout	POST	用户登出	已认证
用户 API
端点	方法	描述	权限
/api/users/profile	GET	获取用户资料	已认证
/api/users/profile	PUT	更新用户资料	已认证
/api/users/change-password	POST	更改密码	已认证
/api/users/dashboard	GET	获取仪表盘数据	已认证
/api/users/admin	GET	获取管理员数据	管理员
安全考虑
密码安全：使用 bcrypt 进行密码哈希保护
双令牌系统：短期访问令牌和长期刷新令牌分离
自动令牌轮换：支持令牌轮换降低令牌被盗风险
HTTPS 支持：推荐在生产环境中使用 HTTPS
防止暴力攻击：内置请求速率限制
XSS 保护：使用适当的 HTTP 头和 Cookie 配置
CSRF 保护：SPA 架构与令牌机制天然抵抗 CSRF
扩展与定制
添加自定义认证逻辑
javascript

复制
// 创建自定义认证中间件
const customAuth = (req, res, next) => {
  // 执行自定义认证逻辑
  // ...
  
  // 然后调用 JWT 中间件
  jwtAuth.middleware()(req, res, next);
};

// 应用自定义中间件
app.use('/api/custom', customAuth);
自定义错误处理
javascript

复制
// 定义自定义错误处理函数
const customErrorHandler = (err, req, res, next) => {
  // 自定义错误响应
  return res.status(401).json({
    code: 'CUSTOM_AUTH_ERROR',
    message: '自定义认证错误消息'
  });
};

// 配置带自定义错误处理的中间件
const jwtAuth = new JwtAuthMiddleware({
  secret: config.jwt.secret,
  errorHandler: customErrorHandler
});
与其他 Express 中间件集成
javascript

复制
// 组合多个中间件
const authenticate = [
  rateLimit({ max: 100, windowMs: 15 * 60 * 1000 }),
  jwtAuth.middleware(),
  jwtAuth.authorize('admin')
];

// 应用中间件组合
router.get('/admin/dashboard', authenticate, adminController.getDashboard);
贡献
欢迎贡献代码、报告问题或提出改进建议！

许可证
MIT

markdown

复制

## 运行说明

要运行此项目，请按照以下步骤操作：

1. 将前后端代码分别复制到相应目录。
2. 在后端目录下运行 `npm install` 安装依赖。
3. 在前端目录下运行 `npm install` 安装依赖。
4. 确保已安装并运行 MongoDB 数据库。
5. 在后端目录下创建 `.env` 文件并配置必要的环境变量。
6. 在后端目录下运行 `npm run dev` 启动后端服务器。
7. 在前端目录下运行 `npm start` 启动前端开发服务器。

通过本项目，您将获得一个安全、易用且高度可配置的 JWT 认证中间件系统，可以轻松集成到您的 Node.js 项目中。中间件设计符合单一职责原则和开闭原则，提供了灵活的扩展性和强大的安全特性。