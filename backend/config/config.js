require('dotenv').config();

module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
  },
  
  // 数据库配置
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jwt-auth-system',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key',
  },
  
  // 安全配置
  security: {
    bcryptSaltRounds: 10,
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100 // 每IP限制请求次数
    }
  }
};