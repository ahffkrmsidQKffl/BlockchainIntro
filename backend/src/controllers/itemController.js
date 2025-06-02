const itemService = require('../services/itemService');

exports.registerItem = async (req, res) => {
  try {
    const newItem = await itemService.registerItem(req.body);
    res.status(201).json({ message: '상품 등록 완료', item: newItem });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.registerItem = async (req, res) => {
    try {
      const userId = req.user.id; // JWT에서 추출한 사용자 ID
      const newItem = await itemService.registerItem(req.body, userId);
      res.status(201).json({ message: '상품 등록 완료', item: newItem });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };