const nftRepo = require('../repositories/nftRepository');

exports.getAllContractsWithNFTItems = async () => {
  const contracts = await nftRepo.getAllContractsWithNFTItems();
  return contracts;
};
