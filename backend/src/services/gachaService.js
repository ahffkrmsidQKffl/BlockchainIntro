const gachaRepo = require('../repositories/gachaRepository');

exports.drawItem = async (userId) => {
  const availableItems = await gachaRepo.getAvailableItems();
  if (availableItems.length === 0) {
    throw new Error('가챠 가능한 상품이 없습니다.');
  }

  const randomIndex = Math.floor(Math.random() * availableItems.length);
  const selectedItem = availableItems[randomIndex];

  // 가챠 결과 저장
  await gachaRepo.saveGachaResult(userId, selectedItem.id);

  // 해당 아이템을 더 이상 뽑히지 않도록 처리
  await gachaRepo.markItemUnavailable(selectedItem.id);

  return selectedItem;
};
exports.getUserGachaHistory = async (userId) => {
    return await gachaRepo.getGachaHistoryByUser(userId);
  };