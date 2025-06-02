const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 관련 API
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: 회원가입
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nickname
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: test1234
 *               nickname:
 *                 type: string
 *                 example: 홍길동
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       400:
 *         description: 잘못된 요청
 */
router.post('/register', userController.registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: 로그인
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: test1234
 *     responses:
 *       200:
 *         description: 로그인 성공 (JWT 토큰 발급)
 *       401:
 *         description: 인증 실패
 */
router.post('/login', userController.loginUser);

module.exports = router;