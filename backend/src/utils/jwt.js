const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * JWT 토큰 생성
 * @param {object} payload - 저장할 사용자 정보 (ex: { id, email })
 * @returns {string} JWT 문자열
 */
exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d', // 7일 유효
  });
};

/**
 * JWT 토큰 검증
 * @param {string} token - JWT 문자열
 * @returns {object} 디코딩된 payload
 */
exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};