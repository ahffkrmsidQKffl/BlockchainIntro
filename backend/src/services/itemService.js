const itemRepo = require('../repositories/itemRepository');

exports.registerItem = async ({ name, description, image_url }) => {
  if (!name || !description || !image_url) {
    throw new Error('필수 항목이 누락되었습니다.');
  }

  return await itemRepo.createItem({
    name,
    description,
    image_url,
    available: true,
  });
};

exports.registerItem = async ({ name, description, image_url }, userId) => {
    if (!name || !description || !image_url) {
      throw new Error('필수 항목이 누락되었습니다.');
    }
  
    return await itemRepo.createItem({
      name,
      description,
      image_url,
      user_id: userId,
      available: true,
    });
  };