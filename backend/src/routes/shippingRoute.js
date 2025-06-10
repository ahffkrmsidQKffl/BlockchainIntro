// backend/src/routes/shippingRoute.js
const express = require('express');
const { getShippingInfo, confirmShipping } = require('../controllers/shippingController');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// 토큰게이팅 + 배송정보 조회
router.get('/shipping/info/:infoId', authenticateToken, getShippingInfo);

// 수취인 정보 입력 + 운송장 생성 → DB 업데이트
router.post(
    '/shipping/info/:infoId/confirm',
    authenticateToken,
    confirmShipping
);

module.exports = router;