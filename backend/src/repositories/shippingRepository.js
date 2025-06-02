const db = require('../config/db');

exports.insertShippingAddress = async ({ userId, nft_id, receiver_name, phone, address }) => {
  const [result] = await db.query(
    `INSERT INTO shippings (nft_id, receiver_name, phone, address, status, created_at)
     VALUES (?, ?, ?, ?, 'READY', NOW())`,
    [nft_id, receiver_name, phone, address]
  );
  return result.insertId;
};
