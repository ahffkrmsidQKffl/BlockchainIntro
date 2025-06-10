const db = require('../config/db'); // mysql2/promise pool

/**
 * 새로운 배송 요청 정보를 생성합니다.
 * @param {{ userId: number, itemId: number, conditions: object }} params
 * @returns {Promise<object>} 생성된 레코드 전체
 */
async function createShippingInfo({ userId, itemId, conditions, senderName, senderTel  }) {
  const sql = `
    INSERT INTO shippings
      (user_id, item_id, conditions, sender_name, sender_tel)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await db.execute(sql, [
    userId,
    itemId,
    JSON.stringify(conditions),
    senderName,
    senderTel
  ]);
  // 방금 생성된 레코드를 조회해서 그대로 리턴
  const [rows] = await db.execute(
    'SELECT * FROM shippings WHERE id = ?',
    [result.insertId]
  );
  return rows[0];
}

/**
 * 배송 요청 정보를 ID로 조회합니다.
 * @param {number} id
 * @returns {Promise<object|null>} 해당 레코드 혹은 null
 */
async function getShippingInfoById(id) {
  const [rows] = await db.execute(
    'SELECT * FROM shippings WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

/**
 * 배송 정보를 업데이트합니다.
 * @param {number} id
 * @param {{
 *   receiverName?: string,
 *   receiverTel?: string,
 *   receiverAddr?: string,
 *   waybillNo?: string,
 *   status?: 'pending'|'ready_to_ship'|'shipped',
 *   shippedAt?: string
 * }} fields
 * @returns {Promise<boolean>} 변경된 행이 있으면 true
 */
async function updateShippingInfo(id, fields) {
  const sets = [];
  const params = [];

  if (fields.receiverName != null) {
    sets.push('receiver_name = ?');
    params.push(fields.receiverName);
  }
  if (fields.receiverTel != null) {
    sets.push('receiver_tel = ?');
    params.push(fields.receiverTel);
  }
  if (fields.receiverAddr != null) {
    sets.push('address = ?');
    params.push(fields.receiverAddr);
  }
  if (fields.waybillNo != null) {
    sets.push('waybill_no = ?');
    params.push(fields.waybillNo);
  }
  if (fields.status != null) {
    sets.push('status = ?');
    params.push(fields.status);
  }
  if (fields.shippedAt != null) {
    sets.push('shipped_at = ?');
    params.push(fields.shippedAt);
  }

  if (sets.length === 0) {
    // 변경할 필드가 없으면 바로 false 리턴
    return false;
  }

  // updated_at 자동 갱신
  sets.push('updated_at = CURRENT_TIMESTAMP');

  const sql = `
    UPDATE shippings
       SET ${sets.join(', ')}
     WHERE id = ?
  `;
  params.push(id);

  const [result] = await db.execute(sql, params);
  return result.affectedRows > 0;
}

module.exports = {
  createShippingInfo,
  getShippingInfoById,
  updateShippingInfo,
};

