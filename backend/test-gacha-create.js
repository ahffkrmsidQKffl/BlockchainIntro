const { createGachaContract } = require('./src/services/gachaService');
const db = require('./src/config/db'); // 필요 시 연결 확인용

(async () => {
  try {
    const userId = 1;
    const itemIds = [1, 2, 3]; // 실제 등록된 physical_items ID로 대체 가능

    const contractAddress = await createGachaContract(userId, itemIds);

    console.log('✅ 컨트랙트 배포 성공!');
    console.log('📦 배포된 주소:', contractAddress);

    // DB 직접 쿼리로 확인해볼 수도 있음
    const [contracts] = await db.query('SELECT * FROM gacha_contracts ORDER BY id DESC LIMIT 1');
    const [items] = await db.query('SELECT * FROM gacha_contract_items WHERE contract_address = ?', [contractAddress]);

    console.log('\n📄 DB 저장 결과:');
    console.log('contracts:', contracts);
    console.log('contract_items:', items);

    process.exit(0);
  } catch (err) {
    console.error('❌ 에러 발생:', err);
    process.exit(1);
  }
})();
