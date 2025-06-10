const db = require('../config/db');

exports.findAllAvailableItems = async () => {
  try {
    // 가챠 가능한 아이템, 즉 available 플래그가 1인 아이템만 조회합니다.
    const sql = 'SELECT * FROM physical_items WHERE available = 1';
    const [rows] = await db.query(sql);
    return rows;
  } catch (error) {
    console.error('DB에서 전체 아이템 조회 중 에러 발생:', error);
    throw error; // 에러를 상위로 전파
  }
};

// 아이템 생성 함수
exports.createItem = async ({ name, description, image_url, ownerId, rarity }) => {
  try {
    const sql =
      'INSERT INTO physical_items (name, description, image_url, user_id, rarity) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [
      name,
      description,
      image_url,
      ownerId,
      rarity
    ]);
    return {
      id: result.insertId,
      name,
      description,
      image_url,
      user_id: ownerId,
      rarity,
    };
  } catch (error) {
    console.error('DB에서 아이템 생성 중 에러 발생:', error);
    throw error;
  }
};

// 내가 등록한 아이템 목록 조회 함수
exports.findItemsByOwner = async (userId) => {
  try {
    const sql = 'SELECT * FROM physical_items WHERE user_id = ?';
    const [rows] = await db.query(sql, [userId]);
    return rows;
  } catch (error) {
    console.error('DB에서 아이템 조회 중 에러 발생:', error);
    throw error;
  }
};

exports.findMyGachaContractsWithItems = async (userId) => {
  const sql = `
    SELECT 
      gc.id AS contractId,
      gc.contract_address,
      gc.created_at,
      pi.id AS itemId,
      pi.name,
      pi.description,
      pi.image_url,
      n.token_id
    FROM gacha_contracts gc
    JOIN gacha_contract_items gci ON gc.contract_address = gci.contract_address
    JOIN physical_items pi ON gci.item_id = pi.id
    JOIN nfts n ON n.item_id = pi.id
    WHERE gc.user_id = ?
    ORDER BY gc.created_at DESC
  `;
  const [rows] = await db.query(sql, [userId]);
  return rows;
};