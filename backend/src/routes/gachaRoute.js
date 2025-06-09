const express = require('express');
const router = express.Router();
const gachaController = require('../controllers/gachaController');
const { authenticateToken } = require('../middlewares/auth');

router.post('/result', authenticateToken, gachaController.processDrawResult);

router.get('/contracts', gachaController.getAllContracts);

/**
 * @swagger
 * /api/gacha/create:
 *   post:
 *     summary: 가챠 컨트랙트 생성
 *     tags: [Gacha]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: 생성된 컨트랙트 주소 반환
 */
router.post('/create', authenticateToken, gachaController.createGachaContract);

/**
 * @swagger
 * /api/gacha/draw:
 *   post:
 *     summary: 가챠 실행 (랜덤 애장품 1개 뽑기)
 *     tags: [Gacha]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 뽑은 상품 반환
 */
router.post('/draw', authenticateToken, gachaController.drawGacha);

/**
 * @swagger
 * /api/gacha/history:
 *   get:
 *     summary: 내가 뽑은 가챠 결과 목록 조회
 *     tags: [Gacha]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 뽑은 결과 목록 반환
 */
router.get('/history', authenticateToken, gachaController.getGachaHistory);
module.exports = router;