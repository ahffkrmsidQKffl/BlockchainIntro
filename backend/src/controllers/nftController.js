const nftService = require('../services/nftService');

exports.getAllContractsWithNFTItems = async (req, res) => {
  try {
    const contracts = await nftService.getAllContractsWithNFTItems();
    res.json({ data: contracts });
  } catch (err) {
    console.error("❌ NFT 컨트랙트+아이템 조회 실패:", err);
    res.status(500).json({ message: 'NFT 컨트랙트 데이터를 불러오지 못했습니다.' });
  }
};
