const itemService = require('../services/itemService');

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
    res.status(400).json({ error: '아이템 등록 처리 중 오류가 발생했습니다: ' + err.message });
  }
};

// 2. 내가 등록한 아이템 목록 조회 컨트롤러 (이 함수가 없어서 에러가 발생했습니다)
exports.getMyItems = async (req, res) => {
  try {
    const userId = req.user.id; // 로그인한 사용자의 ID를 가져옵니다.

    // itemService에 이 사용자 ID에 해당하는 아이템만 찾아달라고 요청합니다.
    // (itemService에 getMyItemsByOwner와 같은 함수가 구현되어 있어야 합니다)
    const items = await itemService.getMyItemsByOwner(userId);
    
    res.status(200).json(items);
  } catch (err) {
    console.error('내 아이템 목록 조회 중 에러 발생:', err);
    res.status(400).json({ error: '아이템 목록을 가져오는 데 실패했습니다: ' + err.message });
  }
};