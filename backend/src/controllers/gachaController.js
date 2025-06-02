const gachaService = require('../services/gachaService');

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