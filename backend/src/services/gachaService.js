const gachaRepo = require('../repositories/gachaRepository');
const nftRepo = require('../repositories/nftRepository');

const Web3 = require('web3').default;
const GachaContractArtifact = require('../../../solidity/build/contracts/GachaContract.json');
const GachaNFTArtifact = require('../../../solidity/build/contracts/GachaNFT.json');
const _ = require('lodash');

exports.getAllContracts = async () =>{
  const flatData = await gachaRepo.getAllContractsWithItems();

  // 그룹핑: contractId 기준으로 묶기
  const grouped = _.groupBy(flatData, 'contractId');

  // 변환: 각 그룹을 contract + items 구조로 재구성
  const result = Object.entries(grouped).map(([contractId, items]) => ({
    contractId: parseInt(contractId),
    contractAddress: items[0].contract_address,
    createdAt: items[0].created_at,
    items: items.map(i => ({
      id: i.itemId,
      name: i.itemName,
      description: i.description,
      image_url: i.image_url
    }))
  }));

  return result;
};

exports.createGachaContract = async (userId, itemIds, userWalletAddress) => {
  const web3 = new Web3('http://127.0.0.1:7545'); // Ganache 주소
  const nftAddress = "0xD647245c2f45b20b98cb39A3e445f6fA90D3A62c"; // ✅ 실제 gachaNFT 배포 주소 입력
  const GachaNFT = new web3.eth.Contract(GachaNFTArtifact.abi, nftAddress);
  const GachaContract = new web3.eth.Contract(GachaContractArtifact.abi);

  console.log("Ganache accounts:", await web3.eth.getAccounts());
  console.log("User wallet address:", userWalletAddress);
  

  // ✅ 1. NFT 컨트랙트 owner 주소 불러오기
  const accounts = await web3.eth.getAccounts();
  const adminAddress = accounts[0];
  console.log("adminAddress:", adminAddress);

  const realOwner = await GachaNFT.methods.owner().call();
  console.log("🧾 GachaNFT owner:", realOwner);

  const matchedAddress = accounts.find(acc => acc.toLowerCase() === userWalletAddress.toLowerCase());

  if (!matchedAddress) {
    throw new Error("❌ 유저 지갑 주소가 Ganache 계정 목록에 없습니다.");
  }

  // ✅ DB에서 아이템 정보 불러오기 및 민팅
  const items = await gachaRepo.getItemsByIds(itemIds); // name, image_url 포함되어 있어야 함
  const mintedTokenIds = [];

  for (const item of items) {
    const mintTx = await GachaNFT.methods.mint(matchedAddress, item.image_url).send({
      from: adminAddress,
      gas: 300000
    });

    const tokenId = mintTx.events.Transfer.returnValues.tokenId;
    mintedTokenIds.push({tokenId: parseInt(tokenId), item});
  }

  // ✅ GachaContract 배포
  const deployTx = GachaContract.deploy({
    data: GachaContractArtifact.bytecode,
    arguments: [nftAddress, mintedTokenIds.map(t => t.tokenId)]
  });

  const contractInstance = await deployTx.send({
    from: matchedAddress,
    gas: 5000000
  });

  const address = contractInstance.options.address;

  // 여기서 NFT DB 저장
  for (const { tokenId, item } of mintedTokenIds) {
    await nftRepo.saveNFT({
      userId,
      itemId: item.id,
      tokenId,
      metadataUri: item.image_url,
      contractAddress: address
    });
  }

  const dbItemIds = items.map(i => i.id);   // physical_items.id 배열

  await gachaRepo.saveGachaContract({ userId, contractAddress: address, itemIds: dbItemIds });

  return { 
    contractAddress: address,
    nftAddress,
    tokenIds: mintedTokenIds.map(t => t.tokenId)   //  [12, 13, …]
  };
};

exports.drawItem = async (userId) => {
  const availableItems = await gachaRepo.getAvailableItems();
  if (availableItems.length === 0) {
    throw new Error('가챠 가능한 상품이 없습니다.');
  }

  const randomIndex = Math.floor(Math.random() * availableItems.length);
  const selectedItem = availableItems[randomIndex];

  // 가챠 결과 저장
  await gachaRepo.saveGachaResult(userId, selectedItem.id);

  // 해당 아이템을 더 이상 뽑히지 않도록 처리
  await gachaRepo.markItemUnavailable(selectedItem.id);

  return selectedItem;
};

exports.processDrawResult = async ({ userId, contractAddress, tokenId }) => {
  // 1. NFT 한 건 찾기
  const nft = await nftRepo.findNFT({ contractAddress, tokenId, userId });
  if (!nft) throw new Error('해당 NFT를 찾을 수 없습니다.');

  // 2. 히스토리 저장
  await gachaRepo.saveGachaHistory({
    userId,
    itemId: nft.item_id,
    tokenId,
    contractAddress
  });

  // 3. nfts / gacha_contract_items 테이블에서 제거
  await nftRepo.deleteNFT({ contractAddress, tokenId });
  await nftRepo.deleteGachaContractItem({ contractAddress, itemId: nft.item_id });

  return { itemId: nft.item_id, metadataUri: nft.metadata_uri };
};

exports.getUserGachaHistory = async (userId) => {
  return await gachaRepo.getGachaHistoryByUser(userId);
};