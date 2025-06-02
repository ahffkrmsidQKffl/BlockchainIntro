const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/shippings/address:
 *   post:
 *     summary: 수령자 배송지 정보 등록
 *     tags: [Shipping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nft_id
 *               - receiver_name
 *               - phone
 *               - address
 *             properties:
 *               nft_id:
 *                 type: integer
 *                 example: 3
 *               receiver_name:
 *                 type: string
 *                 example: 홍길동
 *               phone:
 *                 type: string
 *                 example: 01012345678
 *               address:
 *                 type: string
 *                 example: 서울특별시 중구 세종대로 110
 *     responses:
 *       200:
 *         description: 배송지 등록 성공
 */
router.post('/address', authenticateToken, shippingController.registerAddress);

module.exports = router;