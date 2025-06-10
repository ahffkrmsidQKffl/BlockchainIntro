// --- 수정된 services/itemService.js ---
const _ = require('lodash');
const itemRepo = require('../repositories/itemRepository');
const rarityMap = {
  '평범': 'normal',
  '희귀': 'rare',
  '초희귀': 'super-rare',
};

// --- ▼▼▼ 3. 새로운 서비스 함수 추가 ▼▼▼ ---
// 모든 가챠 가능한 아이템 조회 서비스
exports.getAllAvailableItems = async () => {
  // itemRepository에 정의될 함수를 호출합니다.
  return await itemRepo.findAllAvailableItems();
};

// 아이템 등록 서비스 함수
exports.registerItem = async ({ name, description, image_url, ownerId, rarity }) => {
  if (!name || !description || !image_url || !ownerId) {
    throw new Error('필수 항목이 누락되었습니다.');
  }

  const rarityEnum = rarityMap[rarity] || 'normal';

  return await itemRepo.createItem({
    name,
    description,
    image_url,
    ownerId,
    rarity:rarityEnum,
  });
};

// 내가 등록한 아이템 조회 서비스 함수
exports.getMyItemsByOwner = async (userId) => {
  if (!userId) throw new Error('사용자 ID가 누락되었습니다.');
  return await itemRepo.findItemsByOwner(userId);
};

exports.getMyGachaContracts = async (userId) => {
  const flat = await itemRepo.findMyGachaContractsWithItems(userId);
  console.log("📦 DB 결과 flat:", flat);
  const grouped = _.groupBy(flat, 'contractId');
  console.log("📦 grouped:", grouped);

  return Object.entries(grouped).map(([contractId, items]) => {
    if (!items || items.length === 0) {
      console.warn(`❗ [경고] contractId ${contractId}에 해당하는 item이 비어 있음`);
      return null; // 혹은 continue 할 수도 있음
    }

    return {
      contractId,
      contractAddress: items[0].contract_address,
      createdAt: items[0].created_at,
      items: items.map(i => ({
        id: i.itemId,
        name: i.name,
        image_url: i.image_url,
        tokenId: i.token_id,
        description: i.description
      }))
    };
  }).filter(Boolean);
};