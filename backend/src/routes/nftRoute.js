const express = require('express');
const router = express.Router();
const nftController = require('../controllers/nftController');

// 민팅된 NFT 컨트랙트와 아이템 조회
router.get('/contracts-with-nfts', nftController.getAllContractsWithNFTItems);

module.exports = router;