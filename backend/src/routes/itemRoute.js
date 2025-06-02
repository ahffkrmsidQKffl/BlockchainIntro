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

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: 실물 애장품 등록
 *     tags: [Items]
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
 *                 example: 조로의 검
 *               description:
 *                 type: string
 *                 example: 원피스 공식 피규어, 한정판입니다.
 *               image_url:
 *                 type: string
 *                 example: https://cdn.site.com/images/zoro-sword.jpg
 *     responses:
 *       201:
 *         description: 등록 성공
 *       400:
 *         description: 유효성 오류
 */
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
router.post('/', itemController.registerItem);
router.get('/my', authenticateToken, itemController.getMyItems);

module.exports = router;