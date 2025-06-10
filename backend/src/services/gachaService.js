const { generateMetadata } = require('../utils/metadata');
const gachaRepo = require('../repositories/gachaRepository');
const nftRepo = require('../repositories/nftRepository');

const Web3 = require('web3').default;
const GachaContractArtifact = require('../../../solidity/build/contracts/GachaContract.json');
const GachaNFTArtifact = require('../../../solidity/build/contracts/GachaNFT.json');
const _ = require('lodash');
const rarityProbabilityMap = {
  'super-rare': 0.05,
  'rare': 0.15,
  'normal': 0.80,
};

// 등급별 필터링 함수
function weightedRandomPick(items) {
  // 1. 등급별로 그룹화
  const grouped = {
    'super-rare': [],
    'rare': [],
    'normal': [],
  };

  for (const item of items) {
    const rarity = item.rarity || 'normal'; // 기본값 normal
    if (grouped[rarity]) grouped[rarity].push(item);
  }

  // 2. 확률 계산 기반 추출
  const rand = Math.random(); // 0~1 사이
  let threshold = 0;

  for (const [rarity, prob] of Object.entries(rarityProbabilityMap)) {
    threshold += prob;
    if (rand <= threshold && grouped[rarity].length > 0) {
      // 해당 등급에서 랜덤 선택
      const pool = grouped[rarity];
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }

  // fallback: 아무거나
  const flat = [...grouped['normal'], ...grouped['rare'], ...grouped['super-rare']];
  return flat[Math.floor(Math.random() * flat.length)];
}

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

// 이 함수는 희귀도 기반으로 아이템 1개 선택 후 나머지 used=1 처리
exports.pickNextGachaItem = async (contractAddress) => {
  // 1. 아직 뽑히지 않은 아이템 목록 조회
  const items = await gachaRepo.getUnpickedItemsByContract(contractAddress);
  if (!items || items.length === 0) throw new Error('뽑을 수 있는 아이템이 없습니다.');

  // 2. 희귀도 기반 가중치 랜덤 추첨 (이미 구현한 weightedRandomPick 함수 활용)
  const picked = weightedRandomPick(items);

  // 3. 모든 아이템 used=1로 바꾸고, picked 아이템만 used=0으로 유지
  const allIds = items.map(i => i.id); // physical_items의 id
  await gachaRepo.markItemsAsUsed(contractAddress, allIds); // 모두 used=1로
  await gachaRepo.markItemAsUnpicked(contractAddress, picked.id); // picked만 used=0

  // 반환: 뽑힌 아이템 정보
  return picked;
};

const drawItemFromContract = async (contractAddress) => {
  // 1. 아직 뽑히지 않은 아이템 목록 가져오기
  const items = await gachaRepo.getUnpickedItemsByContract(contractAddress);
  if (!items || items.length === 0) {
    throw new Error('모든 아이템이 이미 소진되었습니다.');
  }

  // 2. 희귀도 기반으로 뽑기
  const selected = weightedRandomPick(items); // 👈 여기 핵심

  return selected;
};

exports.createGachaContract = async (userId, itemIds, userWalletAddress) => {
  const web3 = new Web3('http://127.0.0.1:7545'); // Ganache 주소
  const nftAddress = "0xD647245c2f45b20b98cb39A3e445f6fA90D3A62c"; // ✅ 실제 gachaNFT 배포 주소 입력
  const GachaNFT = new web3.eth.Contract(GachaNFTArtifact.abi, nftAddress);
  const GachaContract = new web3.eth.Contract(GachaContractArtifact.abi);

  console.log("Ganache accounts:", await web3.eth.getAccounts());
  console.log("User wallet address:", userWalletAddress);
  

  // 1. NFT 컨트랙트 owner 주소 불러오기
  const accounts      = await web3.eth.getAccounts();
  const adminAddress  = accounts[0];
  const matched       = accounts.find(a => a.toLowerCase() === userWalletAddress.toLowerCase());
  if (!matched) throw new Error('유저 지갑이 Ganache 계정에 없습니다.');

  /* ───────── 2. GachaContract 배포 (tokenIds는 나중에 세팅) ───────── */
  const contract = await new web3.eth.Contract(GachaContractArtifact.abi)
  .deploy({ data: GachaContractArtifact.bytecode, arguments: [nftAddress, []] })
  .send({ from: matched, gas: 5_000_000 });

  const gachaAddr = contract.options.address;   // 주소 확보

  /* ───────── 3. DB에서 품목 정보 조회 + 컨트랙트 주소로 민팅 ───────── */
  const items          = await gachaRepo.getItemsByIds(itemIds);  // [{ id, image_url }, …]
  const mintedTokenIds = [];

  for (const item of items) {
    const metadataUrl = generateMetadata(item);
    const tx = await GachaNFT.methods
                 .mint(gachaAddr, metadataUrl)        // ← 컨트랙트가 owner!
                 .send({ from: adminAddress, gas: 1_000_000 });

    const tokenId = Number(tx.events.Transfer.returnValues.tokenId);
    mintedTokenIds.push({ tokenId, item });
  }

  // /* ───────── 4. 컨트랙트에 tokenIds 배열 세팅 ─────────
  //    Solidity 쪽에 다음 함수가 있어야 합니다.
  //      function setTokenIds(uint256[] memory _ids) external {
  //        require(tokenIds.length == 0, "already set");
  //        tokenIds = _ids;
  //      }
  // */

  // ② tokenIds 주입
  await contract.methods
    .setTokenIds(mintedTokenIds.map(t => t.tokenId))
    .send({ from: matched, gas : 500_000 });

  /* ───────── 5. DB 저장 ───────── */
  for (const { tokenId, item } of mintedTokenIds) {
    await nftRepo.saveNFT({
      userId,
      itemId:          item.id,
      tokenId,
      metadataUri:     item.image_url,
      contractAddress: gachaAddr          // ★ NFT 컨트랙트 주소
    });
  }

  await gachaRepo.saveGachaContract({
    userId,
    contractAddress: gachaAddr,            // 가챠 컨트랙트 주소
    itemIds: items.map(i => i.id)
  });

  return { 
    contractAddress: gachaAddr,
    nftAddress,
    tokenIds: mintedTokenIds.map(t => t.tokenId)   //  [12, 13, …]
  };
};

// exports.drawItem = async (userId) => {
//   const availableItems = await gachaRepo.getAvailableItems();
//   if (availableItems.length === 0) {
//     throw new Error('가챠 가능한 상품이 없습니다.');
//   }

//   const randomIndex = Math.floor(Math.random() * availableItems.length);
//   const selectedItem = availableItems[randomIndex];

//   // 가챠 결과 저장
//   await gachaRepo.saveGachaResult(userId, selectedItem.id);

//   // 해당 아이템을 더 이상 뽑히지 않도록 처리
//   await gachaRepo.markItemUnavailable(selectedItem.id);

//   return selectedItem;
// };

exports.processDrawResult = async ({ userId, contractAddress, tokenId }) => {
  const selectedItem = await drawItemFromContract(contractAddress);

  // 이후 이 selectedItem을 기반으로 민팅 정보 찾아서 사용
  const nft = await nftRepo.findNFT({ 
    contractAddress, 
    itemId: selectedItem.id, 
    userId 
  });

  // // 1. NFT 한 건 찾기
  // const nft = await nftRepo.findNFT({ contractAddress, tokenId, userId });
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