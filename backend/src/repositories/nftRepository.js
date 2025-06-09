const db = require('../config/db'); 

exports.saveNFT = async ({ userId, itemId, tokenId, metadataUri, contractAddress }) => {
  const query = `
    INSERT INTO nfts (user_id, item_id, token_id, metadata_uri, contract_address)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await db.execute(query, [userId, itemId, tokenId, metadataUri, contractAddress]);
  return result.insertId;
};

exports.getAllContractsWithNFTItems = async () => {
  const query = `
    SELECT 
      gc.id AS contractId,
      gc.contract_address,
      gc.created_at,
      n.token_id,
      n.metadata_uri,
      pi.id AS itemId,
      pi.name AS itemName,
      pi.description,
      pi.image_url
    FROM gacha_contracts gc
    JOIN nfts n ON gc.contract_address = n.contract_address
    JOIN physical_items pi ON n.item_id = pi.id
    ORDER BY gc.created_at DESC
  `;
  const [rows] = await db.query(query);
  return rows;
};

/* 뽑힌 NFT 하나 가져오기 */
exports.findNFT = async ({ contractAddress, tokenId, userId }) => {
  const [rows] = await db.query(
    `SELECT * FROM nfts
     WHERE contract_address = ? AND token_id = ? AND user_id = ?`,
    [contractAddress, tokenId, userId]
  );
  return rows[0];
};

/* NFT 삭제 → 화면에서 사라짐 */
exports.deleteNFT = async ({ contractAddress, tokenId }) => {
  await db.query(
    'DELETE FROM nfts WHERE contract_address = ? AND token_id = ?',
    [contractAddress, tokenId]
  );
};

/* gacha_contract_items 에서도 제거 */
exports.deleteGachaContractItem = async ({ contractAddress, itemId }) => {
  await db.query(
    'DELETE FROM gacha_contract_items WHERE contract_address = ? AND item_id = ?',
    [contractAddress, itemId]
  );
};