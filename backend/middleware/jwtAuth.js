/**
 * JWT 认证中间件 - 安全、易用且高度可配置的 JWT 认证解决方案
 * 支持多种认证策略、自定义错误处理、令牌自动刷新等功能
 */
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

class JwtAuthMiddleware {
  constructor(options = {}) {
    // 默认配置
    this.options = {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: '1h',
      refreshExpiresIn: '7d',
      algorithm: 'HS256',
      issuer: 'jwt-auth-system',
      audience: 'jwt-auth-client',
      tokenType: 'Bearer',
      refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key',
      autoRefresh: true,
      autoRefreshThreshold: 300, // 5分钟
      customUserKey: 'user',
      errorHandler: null,
      excludedPaths: [],
      authorizationHeader: 'Authorization',
      ...options
    };

    // JWT 验证选项
    this.verifyOptions = {
      algorithms: [this.options.algorithm],
      issuer: this.options.issuer,
      audience: this.options.audience
    };

    // JWT 签名选项
    this.signOptions = {
      algorithm: this.options.algorithm,
      expiresIn: this.options.expiresIn,
      issuer: this.options.issuer,
      audience: this.options.audience
    };

    // 将 jwt.verify 转换为 Promise
    this.verifyAsync = promisify(jwt.verify);
  }

  /**
   * 创建 JWT 令牌
   * @param {Object} payload - 令牌载荷
   * @param {Object} options - 额外选项
   * @returns {Object} - 包含访问令牌和刷新令牌的对象
   */
  createTokens(payload, options = {}) {
    const tokenPayload = { ...payload };
    
    // 删除不应该包含在令牌中的敏感信息
    delete tokenPayload.password;
    delete tokenPayload.refreshToken;
    
    // 创建访问令牌
    const accessToken = jwt.sign(
      tokenPayload,
      this.options.secret,
      { ...this.signOptions, ...options }
    );
    
    // 创建刷新令牌
    const refreshToken = jwt.sign(
      { id: payload.id || payload._id },
      this.options.refreshTokenSecret,
      { 
        algorithm: this.options.algorithm,
        expiresIn: this.options.refreshExpiresIn 
      }
    );
    
    return {
      accessToken,
      refreshToken,
      tokenType: this.options.tokenType,
      expiresIn: this.options.expiresIn
    };
  }

  /**
   * 刷新访问令牌
   * @param {string} refreshToken - 刷新令牌
   * @param {Object} userData - 用户数据
   * @returns {Object} - 新的访问令牌
   */
  async refreshAccessToken(refreshToken, userData) {
    try {
      // 验证刷新令牌
      const decoded = await this.verifyAsync(
        refreshToken,
        this.options.refreshTokenSecret,
        { algorithms: [this.options.algorithm] }
      );
      
      // 确保用户ID匹配
      if (decoded.id !== (userData.id || userData._id)) {
        throw new Error('Invalid refresh token');
      }
      
      // 生成新的访问令牌
      return {
        accessToken: jwt.sign(
          { ...userData },
          this.options.secret,
          this.signOptions
        ),
        tokenType: this.options.tokenType,
        expiresIn: this.options.expiresIn
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * 验证令牌是否需要刷新
   * @param {Object} decoded - 解码后的令牌
   * @returns {boolean} - 是否需要刷新
   */
  shouldRefreshToken(decoded) {
    if (!this.options.autoRefresh) return false;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const tokenExp = decoded.exp;
    
    // 检查令牌是否接近过期（在阈值范围内）
    return tokenExp - currentTime < this.options.autoRefreshThreshold;
  }

  /**
   * 检查路径是否在排除列表中
   * @param {string} path - 请求路径
   * @returns {boolean} - 是否排除
   */
  isPathExcluded(path) {
    return this.options.excludedPaths.some(excludedPath => {
      if (excludedPath instanceof RegExp) {
        return excludedPath.test(path);
      }
      return path === excludedPath || path.startsWith(excludedPath);
    });
  }

  /**
   * 中间件函数
   * @returns {Function} - Express 中间件函数
   */
  middleware() {
    return async (req, res, next) => {
      try {
        // 检查是否排除此路径
        if (this.isPathExcluded(req.path)) {
          return next();
        }

        // 从请求头获取令牌
        const authHeader = req.headers[this.options.authorizationHeader.toLowerCase()];
        if (!authHeader) {
          throw new Error('Authorization header is missing');
        }

        // 检查令牌格式
        const [tokenType, token] = authHeader.split(' ');
        if (tokenType !== this.options.tokenType || !token) {
          throw new Error(`Invalid token format. Expected ${this.options.tokenType} <token>`);
        }

        // 验证令牌
        const decoded = await this.verifyAsync(
          token,
          this.options.secret,
          this.verifyOptions
        );

        // 将解码后的信息添加到请求对象
        req[this.options.customUserKey] = decoded;

        // 检查是否需要刷新令牌
        if (this.shouldRefreshToken(decoded)) {
          const newToken = jwt.sign(
            { ...decoded },
            this.options.secret,
            this.signOptions
          );
          
          // 在响应头中返回新令牌
          res.setHeader('X-New-Access-Token', newToken);
        }

        next();
      } catch (error) {
        // 使用自定义错误处理或默认处理
        if (this.options.errorHandler && typeof this.options.errorHandler === 'function') {
          return this.options.errorHandler(error, req, res, next);
        }
        
        // 默认错误处理
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            success: false, 
            message: 'Token has expired',
            code: 'TOKEN_EXPIRED'
          });
        }
        
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid token',
            code: 'INVALID_TOKEN' 
          });
        }
        
        return res.status(401).json({ 
          success: false, 
          message: error.message || 'Authentication failed',
          code: 'AUTH_FAILED'
        });
      }
    };
  }

  /**
   * 角色授权中间件
   * @param {string|Array} roles - 允许的角色
   * @returns {Function} - Express 中间件函数
   */
  authorize(roles = []) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    return (req, res, next) => {
      try {
        const user = req[this.options.customUserKey];
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        if (allowedRoles.length > 0 && (!user.role || !allowedRoles.includes(user.role))) {
          return res.status(403).json({
            success: false,
            message: 'Access forbidden: insufficient permissions',
            code: 'FORBIDDEN'
          });
        }
        
        next();
      } catch (error) {
        if (this.options.errorHandler && typeof this.options.errorHandler === 'function') {
          return this.options.errorHandler(error, req, res, next);
        }
        
        return res.status(401).json({
          success: false,
          message: error.message || 'Authorization failed',
          code: 'AUTH_FAILED'
        });
      }
    };
  }
}

module.exports = JwtAuthMiddleware;