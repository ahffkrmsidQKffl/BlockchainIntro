const gachaService = require('../services/gachaService');

exports.getAllContracts = async (req, res) => {
  try {
    const contracts = await gachaService.getAllContracts();
    res.json(contracts);
  } catch (err) {
    console.error('컨트랙트 목록 조회 에러:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createGachaContract = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemIds, walletAddress  } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: '지갑 주소가 없습니다.' });
    }

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ message: 'itemIds 배열이 필요합니다.' });
    }

    const result = await gachaService.createGachaContract(userId, itemIds, walletAddress);

    res.status(201).json({
      contractAddress: result.contractAddress,
      nftAddress:      result.nftAddress,
      tokenIds:        result.tokenIds,
    });
  } catch (err) {
    console.error('가챠 컨트랙트 생성 실패:', err);
    res.status(500).json({ message: '컨트랙트 생성 실패', error: err.message });
  }
};

exports.processDrawResult = async (req, res) => {
  try {
    const { contractAddress, tokenId } = req.body;
    const userId = req.user.id;          // JWT 미들웨어에서 주입

    const result = await gachaService.processDrawResult({
      userId,
      contractAddress,
      tokenId: parseInt(tokenId, 10)
    });

    res.status(201).json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.drawGacha = async (req, res) => {
  try {
    const userId = req.user.id;
    const item = await gachaService.drawItem(userId);
    res.status(200).json({ message: '가챠 성공!', item });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getGachaHistory = async (req, res) => {
    try {
      const userId = req.user.id;
      const history = await gachaService.getUserGachaHistory(userId);
      res.status(200).json({ history });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

exports.saveGachaResult = async (req, res) => {
  try {
    const { contractAddress, tokenId } = req.body;
    const userId = req.user.id;

    const [rows] = await db.query(
      'SELECT id FROM physical_items WHERE contract_address = ? AND token_id = ? AND available = 1',
      [contractAddress, tokenId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '해당 NFT 아이템을 찾을 수 없습니다.' });
    }

    const itemId = rows[0].id;

    await db.query(
      'UPDATE physical_items SET available = 0 WHERE id = ?',
      [itemId]
    );

    await db.query(
      'INSERT INTO gacha_histories (user_id, item_id) VALUES (?, ?)',
      [userId, itemId]
    );

    res.status(200).json({ message: "NFT 기록 성공" });

  } catch (err) {
    console.error("Gacha Result 저장 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};