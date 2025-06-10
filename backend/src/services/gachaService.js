const { generateMetadata } = require('../utils/metadata');
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

  // 3. DB에서 품목 정보 조회 + “토큰 게이팅용 external_url” 박아가며 민팅
  const items          = await gachaRepo.getItemsByIds(itemIds);
  const mintedTokenIds = [];

  for (const item of items) {
    // 3-1) 다음에 발행될 tokenId 예측 (supply + 1)
    const supply = await GachaNFT.methods.totalSupply().call();
    const nextTokenId = Number(supply) + 1;

    // 3-2) 메타데이터 생성 시 external_url 포함
    const rawMeta = {
      name:        item.name,
      description: item.description,
      image:       item.image_url,
      external_url:`${process.env.FRONTEND_BASE_URL}/access/${nextTokenId}`
    };
    // (uploadMetadata는 IPFS나 여러분 서버에 JSON을 올려주는 유틸)
    const metadataUrl = await uploadMetadata(rawMeta);

    // 3-3) mint 호출
    const tx = await GachaNFT.methods
      .mint(gachaAddr, metadataUrl)
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