// --- 수정된 controllers/itemController.js ---

const itemService = require('../services/itemService');

// --- ▼▼▼ 2. 새로운 컨트롤러 함수 추가 ▼▼▼ ---
// 모든 (가챠 가능한) 아이템 목록 조회 컨트롤러
exports.getAllAvailableItems = async (req, res) => {
  try {
    const items = await itemService.getAllAvailableItems();
    res.status(200).json(items);
  } catch (err) {
    console.error('전체 아이템 목록 조회 중 에러 발생:', err);
    res.status(500).json({ message: '서버에서 아이템 목록을 가져오는 데 실패했습니다.' });
  }
};

exports.registerItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemData = {
      ...req.body,
      ownerId: userId,
    };
    const newItem = await itemService.registerItem(itemData);
    res.status(201).json({ message: '아이템이 성공적으로 등록되었습니다.', item: newItem });
  } catch (err) {
    console.error('아이템 등록 중 에러 발생:', err);
    res.status(400).json({ message: '아이템 등록 처리 중 오류가 발생했습니다: ' + err.message });
  }
};

exports.getMyItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await itemService.getMyItemsByOwner(userId);
    res.status(200).json(items);
  } catch (err) {
    console.error('내 아이템 목록 조회 중 에러 발생:', err);
    res.status(400).json({ message: '아이템 목록을 가져오는 데 실패했습니다: ' + err.message });
  }
};