const deliveryProofRepository = require('../repositories/deliveryProofRepository');

// 송장 정보 저장
exports.saveShippingInfo = async ({ userId, gachaHistoryId, shippingCompany, trackingNumber }) => {
  // 기본 유효성 체크 생략 가능 (필요시 구현)
  return await deliveryProofRepository.insertShippingInfo({
    userId,
    gachaHistoryId,
    shippingCompany,
    trackingNumber,
  });
};

// 수령 인증 이미지 저장
exports.saveProofImage = async ({ userId, gachaHistoryId, imagePath }) => {
  return await deliveryProofRepository.insertProofImage({
    userId,
    gachaHistoryId,
    imagePath,
  });
};