const db = require('../config/db');
exports.createItem = async ({ name, description, image_url, ownerId }) => {
  try {
  const sql =
      'INSERT INTO physical_items (name, description, image_url, user_id) VALUES (?, ?, ?, ?)';

    const [result] = await db.query(sql, [
      name,
      description,
      image_url,
      ownerId, 
    ]);


    return {
      id: result.insertId,
      name,
      description,
      image_url,
      user_id: ownerId,
    };
  } catch (error) {
    console.error('DB에서 아이템 생성 중 에러 발생:', error);
    throw error;
  }
};