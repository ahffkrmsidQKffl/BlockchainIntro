const db = require('../config/db');

exports.createItem = async ({ name, description, image_url, available }) => {
  const [result] = await db.query(
    'INSERT INTO physical_items (name, description, image_url, available) VALUES (?, ?, ?, ?)',
    [name, description, image_url, available]
  );

  return {
    id: result.insertId,
    name,
    description,
    image_url,
    available,
  };
};
exports.createItem = async ({ name, description, image_url, available, user_id }) => {
    const [result] = await db.query(
      'INSERT INTO physical_items (name, description, image_url, available, user_id) VALUES (?, ?, ?, ?, ?)',
      [name, description, image_url, available, user_id]
    );
  
    return {
      id: result.insertId,
      name,
      description,
      image_url,
      available,
      user_id
    };
};