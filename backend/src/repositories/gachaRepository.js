const db = require('../config/db');

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