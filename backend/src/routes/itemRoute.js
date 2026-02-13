// --- 수정된 routes/itemRoute.js ---

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: 애장품 등록 및 조회
 */

// --- ▼▼▼ 1. 새로운 API 경로 추가 ▼▼▼ ---
/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: 가챠 가능한 모든 애장품 목록 조회
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: 가챠 가능한 애장품 목록
 *       500:
 *         description: 서버 오류
 */
// 이 라우터는 'my' 같은 특정 경로보다 위에 두는 것이 좋습니다.
router.get('/', itemController.getAllAvailableItems);

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: 실물 애장품 등록
 *     tags: [Items]
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - image_url
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: 등록 성공
 */
router.post('/', authenticateToken, itemController.registerItem);

/**
 * @swagger
 * /api/items/my:
 *   get:
 *     summary: 내가 등록한 애장품 목록 조회
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 내 애장품 목록
 */
router.get('/my', authenticateToken, itemController.getMyItems);

module.exports = router;