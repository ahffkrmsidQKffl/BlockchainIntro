const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const router = express.Router();
const upload = require('../utils/upload');

const IMGUR_CLIENT_ID = '7061df0e4b5633e';

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const image = fs.createReadStream(imagePath);

    const formData = new FormData();
    formData.append('image', image);

    const response = await axios.post('https://api.imgur.com/3/image', formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
    });

    const imageUrl = response.data.data.link;
    res.status(201).json({ image_url: imageUrl });
  } catch (err) {
    console.error('Imgur 업로드 실패:', err);
    res.status(500).json({ message: 'Imgur 업로드 실패', error: err.message });
  }
});

// /**
//  * @swagger
//  * /api/upload:
//  *   post:
//  *     summary: 이미지 파일 업로드
//  *     tags: [Items]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               image:
//  *                 type: string
//  *                 format: binary
//  *     responses:
//  *       201:
//  *         description: 업로드 성공
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 image_url:
//  *                   type: string
//  *                   example: http://localhost:3000/uploads/zoro.jpg
//  */
// router.post('/', upload.single('image'), (req, res) => {
//   const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
//   res.status(201).json({ image_url: fileUrl });
// });

module.exports = router;