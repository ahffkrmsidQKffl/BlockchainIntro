const db = require('../config/db');

// 송장 정보 저장
exports.insertShippingInfo = async ({ userId, gachaHistoryId, shippingCompany, trackingNumber }) => {
  const [result] = await db.query(
    `INSERT INTO shippings (user_id, gacha_history_id, shipping_company, tracking_number, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [userId, gachaHistoryId, shippingCompany, trackingNumber]
  );
  return result.insertId;
};

// 수령 인증 사진 저장
exports.insertProofImage = async ({ userId, gachaHistoryId, imagePath }) => {
  const [result] = await db.query(
    `INSERT INTO delivery_proofs (user_id, gacha_history_id, image_url, created_at)
     VALUES (?, ?, ?, NOW())`,
    [userId, gachaHistoryId, imagePath]
  );
  return result.insertId;
};