const shippingService = require('../services/shippingService');

exports.registerAddress = async (req, res) => {
  try {
    const { nft_id, receiver_name, phone, address } = req.body;
    const userId = req.user.id;

    await shippingService.saveShippingAddress({ userId, nft_id, receiver_name, phone, address });

    res.status(200).json({ message: '배송지 정보가 등록되었습니다.' });
  } catch (error) {
    console.error('배송지 등록 오류:', error);
    res.status(500).json({ error: '배송지 등록 실패' });
  }
};