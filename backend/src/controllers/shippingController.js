require('dotenv').config();
const { ethers } = require('ethers');

const shippingRepo    = require('../repositories/shippingRepository');
const shippingService = require('../services/shippingService');
const NFTArtifact     = require('../../../solidity/build/contracts/GachaNFT.json');

// JSON-RPC 프로바이더 (예: Ganache, Infura 등)
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
// 민팅된 NFT 컨트랙트 주소 (환경변수에 설정)
const NFT_ADDRESS = process.env.GACHA_NFT_ADDRESS;

/**
 * GET  /api/shipping/info/:infoId?tokenId=...
 * - infoId 로 DB 조회
 * - tokenId 소유권 확인(ownerOf)
 * - 문제 없으면 배송정보 반환
 */
async function getShippingInfo(req, res, next) {
  try {
    const infoId  = parseInt(req.params.infoId, 10);
    const tokenId = req.query.tokenId;
    if (!tokenId) {
      return res.status(400).json({ error: 'tokenId 쿼리 파라미터가 필요합니다.' });
    }

    // 1) DB에서 레코드 조회
    const info = await shippingRepo.getShippingInfoById(infoId);
    if (!info) {
      return res.status(404).json({ error: '해당 배송 정보를 찾을 수 없습니다.' });
    }

    // 2) on-chain 소유권 검증 (토큰 게이팅)
    const nftContract = new ethers.Contract(NFT_ADDRESS, NFTArtifact.abi, provider);
    const owner        = await nftContract.ownerOf(tokenId);
    // req.user.walletAddress 에 사용자의 지갑 주소가 들어 있다고 가정
    if (owner.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
      return res.status(403).json({ error: '이 토큰의 소유자만 접근할 수 있습니다.' });
    }

    // 3) 성공 시 배송 정보 반환
    return res.json(info);

  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/shipping/info/:infoId/confirm
 * Body: { tokenId, receiverName, receiverTel, receiverAddr }
 *
 * - tokenId 소유권 재검증
 * - DB에 수취인 정보·상태 업데이트 (ready_to_ship)
 * - 한진 API로 운송장 생성 → waybillNo
 * - DB에 waybillNo + 상태(shipped) 업데이트
 * - 응답으로 waybillNo 반환
 */
async function confirmShipping(req, res, next) {
  try {
    const infoId = parseInt(req.params.infoId, 10);
    const {
      tokenId,
      receiverName,
      receiverTel,
      receiverAddr
    } = req.body;

    // 필수 파라미터 검사
    if (!tokenId || !receiverName || !receiverTel || !receiverAddr) {
      return res.status(400).json({
        error: 'tokenId, receiverName, receiverTel, receiverAddr 모두 필요합니다.'
      });
    }

    // 1) DB 레코드 확인
    const info = await shippingRepo.getShippingInfoById(infoId);
    if (!info) {
      return res.status(404).json({ error: '배송 정보가 존재하지 않습니다.' });
    }

    // 2) on-chain 소유권 재검증
    const nftContract = new ethers.Contract(NFT_ADDRESS, NFTArtifact.abi, provider);
    const owner        = await nftContract.ownerOf(tokenId);
    if (owner.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
      return res.status(403).json({ error: '토큰 소유자만 실행할 수 있습니다.' });
    }

    // 3) 수취인 정보 + 상태 업데이트 (ready_to_ship)
    await shippingRepo.updateShippingInfo(infoId, {
      receiverName,
      receiverTel,
      receiverAddr,
      status: 'ready_to_ship'
    });

    // 4) 한진 API 호출로 운송장 생성
    //    shippingService.createWaybill은 { number: '1234567890' } 형태로 반환된다고 가정
    const { number: waybillNo } = await shippingService.createWaybill({
      senderName: info.sender_name,
      senderTel:  info.sender_tel,
      receiverName,
      receiverTel,
      receiverAddr,
      conditions: info.conditions
    });

    // 5) 운송장 번호 + 상태 업데이트 (shipped)
    await shippingRepo.updateShippingInfo(infoId, {
      waybillNo,
      status: 'shipped',
      shippedAt: new Date().toISOString()
    });

    // 6) 클라이언트에 운송장 번호 반환
    return res.json({ waybillNo });

  } catch (err) {
    next(err);
  }
}

async function createShippingInfo(req, res, next) {
  const { itemId, conditions, senderName, senderTel } = req.body;
  // user_id는 req.user.id 로부터
  const info = await shippingRepo.createShippingInfo({
    userId: req.user.id,
    itemId,
    conditions,
    senderName,
    senderTel
  });
  res.status(201).json(info);
}

module.exports = {
  getShippingInfo,
  confirmShipping
};
