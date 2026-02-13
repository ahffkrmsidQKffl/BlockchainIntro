// --- 수정된 services/itemService.js ---

const itemRepo = require('../repositories/itemRepository');

// --- ▼▼▼ 3. 새로운 서비스 함수 추가 ▼▼▼ ---
// 모든 가챠 가능한 아이템 조회 서비스
exports.getAllAvailableItems = async () => {
  // itemRepository에 정의될 함수를 호출합니다.
  return await itemRepo.findAllAvailableItems();
};

// 아이템 등록 서비스 함수
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