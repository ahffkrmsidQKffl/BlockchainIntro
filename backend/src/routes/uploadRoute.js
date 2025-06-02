const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: 이미지 파일 업로드
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 image_url:
 *                   type: string
 *                   example: http://localhost:3000/uploads/zoro.jpg
 */
router.post('/', upload.single('image'), (req, res) => {
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(201).json({ image_url: fileUrl });
});

module.exports = router;