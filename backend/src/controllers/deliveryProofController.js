const deliveryProofService = require('../services/deliveryProofService');

// 송장 정보 등록
exports.registerShipping = async (req, res) => {
  try {
    const { gachaHistoryId, shippingCompany, trackingNumber } = req.body;
    const userId = req.user.id;

    await deliveryProofService.saveShippingInfo({
      userId,
      gachaHistoryId,
      shippingCompany,
      trackingNumber,
    });

    res.status(200).json({ message: '송장 정보가 등록되었습니다.' });
  } catch (error) {
    console.error('송장 등록 오류:', error);
    res.status(500).json({ error: '송장 등록 실패' });
  }
};

// 수령 인증 사진 업로드
exports.uploadProof = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gachaHistoryId } = req.body;
    const imagePath = req.file.path;

    await deliveryProofService.saveProofImage({
      userId,
      gachaHistoryId,
      imagePath,
    });

    res.status(200).json({ message: '수령 인증 이미지가 업로드되었습니다.' });
  } catch (error) {
    console.error('인증 이미지 업로드 오류:', error);
    res.status(500).json({ error: '인증 이미지 업로드 실패' });
  }
};