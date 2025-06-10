const db = require('../config/db');

exports.getItemsByIds = async (itemIds) => {
  if (!itemIds || itemIds.length === 0) return [];

  const placeholders = itemIds.map(() => '?').join(',');
  const [rows] = await db.query(
    `SELECT id, name, description, image_url FROM physical_items WHERE id IN (${placeholders})`,
    itemIds
  );
  return rows;
};

exports.getAllContractsWithItems = async () => {
  const sql = `
    SELECT 
      gc.id AS contractId,
      gc.contract_address,
      gc.created_at,
      pi.id AS itemId,
      pi.name AS itemName,
      pi.description,
      pi.image_url
    FROM gacha_contracts gc
    JOIN gacha_contract_items gci ON gc.contract_address = gci.contract_address
    JOIN physical_items pi ON gci.item_id = pi.id
    WHERE gc.contract_address != '0x466567571F033Da2f81747e6a05105A39b938Fda'
    ORDER BY gc.created_at DESC
  `;
  const [rows] = await db.query(sql);
  return rows;
};

exports.getAvailableItems = async () => {
  const [rows] = await db.query(
    'SELECT * FROM physical_items WHERE available = 1'
  );
  return rows;
};

exports.saveGachaResult = async (userId, itemId) => {
  // saveGachaResult 함수는 item_id만 저장하고 있으며,
  // gacha_histories 테이블에 created_at 컬럼이 DATETIME DEFAULT CURRENT_TIMESTAMP로 설정되어 있다면
  // 자동으로 현재 시간이 기록됩니다. 이 부분은 별도 수정이 필요 없습니다.
  await db.query(
    'INSERT INTO gacha_histories (user_id, item_id) VALUES (?, ?)',
    [userId, itemId]
  );
};

exports.markItemUnavailable = async (itemId) => {
  await db.query(
    'UPDATE physical_items SET available = 0 WHERE id = ?',
    [itemId]
  );
};

exports.saveGachaHistory = async ({ userId, itemId, tokenId, contractAddress }) => {
  await db.query(
    `INSERT INTO gacha_histories (user_id, item_id, token_id, contract_address)
     VALUES (?, ?, ?, ?)`,
    [userId, itemId, tokenId, contractAddress]
  );
};

// 'Unknown column' 에러가 발생한 함수
exports.getGachaHistoryByUser = async (userId) => {
    // 1. 문제가 발생한 SQL 쿼리 수정
    // - 'gh.draw_time'을 실제 DB 컬럼명인 'gh.created_at'으로 변경
    // - 프론트엔드에서 사용하기 쉽도록 별칭(AS)을 붙여줍니다. (예: drawDate)
    const sql = `
      SELECT 
        gh.id,
        gh.created_at AS drawDate, 
        pi.id AS itemId, 
        pi.name AS itemName, 
        pi.description, 
        pi.image_url AS itemImageUrl
      FROM gacha_histories gh
      JOIN physical_items pi ON gh.item_id = pi.id
      WHERE gh.user_id = ?
      ORDER BY gh.created_at DESC
    `;

    const [rows] = await db.query(sql, [userId]);
    return rows;
};

exports.saveGachaContract = async ({ userId, contractAddress, itemIds }) => {
  // 1. contracts 테이블에 저장
  await db.query(
    'INSERT INTO gacha_contracts (user_id, contract_address, created_at) VALUES (?, ?, NOW())',
    [userId, contractAddress]
  );

  // 2. 연결된 itemIds도 저장 (선택)
  for (let itemId of itemIds) {
    await db.query(
      'INSERT INTO gacha_contract_items (contract_address, item_id) VALUES (?, ?)',
      [contractAddress, itemId]
    );
  }
};