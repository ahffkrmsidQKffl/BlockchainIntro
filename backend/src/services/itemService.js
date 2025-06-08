const itemRepo = require('../repositories/itemRepository');

// 아이템 등록 서비스 함수 (컨트롤러에서 ownerId를 함께 전달함)
exports.registerItem = async ({ name, description, image_url, ownerId }) => {
  if (!name || !description || !image_url || !ownerId) {
    throw new Error('필수 항목이 누락되었습니다.');
  }

  return await itemRepo.createItem({
    name,
    description,
    image_url,
    ownerId,
  });
};

// 내가 등록한 아이템 조회 서비스 함수
exports.getMyItemsByOwner = async (userId) => {
  if (!userId) throw new Error('사용자 ID가 누락되었습니다.');
  return await itemRepo.findItemsByOwner(userId);
};