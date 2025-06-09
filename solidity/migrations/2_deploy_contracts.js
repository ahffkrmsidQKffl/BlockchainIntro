const GachaNFT = artifacts.require("GachaNFT");
const GachaContract = artifacts.require("GachaContract");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(GachaNFT);
  const nft = await GachaNFT.deployed();

  // 예시로 빈 GachaContract 하나 배포해보기
  const dummyTokenIds = [0, 1, 2];
  await deployer.deploy(GachaContract, nft.address, dummyTokenIds);
};
