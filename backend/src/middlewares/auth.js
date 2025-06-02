// src/middlewares/authMiddleware.js

const jwt = require('../utils/jwt');

/**
 * JWT 인증 미들웨어
 * - 요청 헤더에 있는 토큰을 확인하고 유효하면 req.user에 사용자 정보 삽입
 */
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // 헤더가 없거나 Bearer 형식이 아닐 경우
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verifyToken(token);
    req.user = decoded; // 사용자 정보 저장
    next();
  } catch (err) {
    return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
  }
};