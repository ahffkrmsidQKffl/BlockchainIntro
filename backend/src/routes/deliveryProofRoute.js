const express = require('express');
const router = express.Router();
const deliveryProofController = require('../controllers/deliveryProofController');
const { authenticateToken } = require('../middlewares/auth');
const upload = require('../utils/upload');

/**
 * @swagger
 * /api/delivery/shipping:
 *   post:
 *     summary: 송장 정보 등록
 *     tags: [DeliveryProof]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gachaHistoryId:
 *                 type: integer
 *                 example: 1
 *               shippingCompany:
 *                 type: string
 *                 example: "CJ대한통운"
 *               trackingNumber:
 *                 type: string
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: 등록 성공
 */
router.post('/shipping', authenticateToken, deliveryProofController.registerShipping);

/**
 * @swagger
 * /api/delivery/proof:
 *   post:
 *     summary: 상품 수령 인증 사진 등록
 *     tags: [DeliveryProof]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               gachaHistoryId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 업로드 성공
 */
router.post('/proof', authenticateToken, upload.single('image'), deliveryProofController.uploadProof);

module.exports = router;