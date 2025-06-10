const fs = require('fs');
const path = require('path');

const METADATA_DIR = path.join(__dirname, '../public/metadata');

exports.generateMetadata = (item) => {
  const metadata = {
    name: item.name,
    description: item.description || '',
    image: item.image_url  // 외부 이미지 URL
  };

  // 파일 경로: public/metadata/{item.id}.json
  const filePath = path.join(METADATA_DIR, `${item.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));

  // 퍼블릭 접근 가능한 메타데이터 URL 반환
  const metadataUrl = `${process.env.PUBLIC_BASE_URL}/metadata/${item.id}.json`;
  return metadataUrl;
};
