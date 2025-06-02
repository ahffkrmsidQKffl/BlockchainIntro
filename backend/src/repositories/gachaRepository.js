const db = require('../config/db');

exports.getAvailableItems = async () => {
  const [rows] = await db.query(
    'SELECT * FROM physical_items WHERE available = 1'
  );
  return rows;
};

exports.saveGachaResult = async (userId, itemId) => {
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
exports.getGachaHistoryByUser = async (userId) => {
    const [rows] = await db.query(
      `SELECT gh.id AS history_id, gh.draw_time, 
              pi.id AS item_id, pi.name, pi.description, pi.image_url
       FROM gacha_histories gh
       JOIN physical_items pi ON gh.item_id = pi.id
       WHERE gh.user_id = ?
       ORDER BY gh.draw_time DESC`,
      [userId]
    );
    return rows;
};