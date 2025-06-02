const shippingRepository = require('../repositories/shippingRepository');

exports.saveShippingAddress = async ({ userId, nft_id, receiver_name, phone, address }) => {
  return await shippingRepository.insertShippingAddress({ userId, nft_id, receiver_name, phone, address });
};
