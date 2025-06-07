import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadImage, registerItem } from '../services/api';
import './UploadContractPage.css';

const UploadContractPage = () => {
  // 현재 AuthContext의 user 객체는 null일 수 있으므로, 직접 사용 시 주의가 필요합니다.
  const { user } = useAuth(); 
  const [nftItems, setNftItems] = useState([{ name: '', description: '', imageFile: null, imageUrl: '', rarity: '평범' }]);
  const [loading, setLoading] = useState(false);
  const [itemRegistrationMessage, setItemRegistrationMessage] = useState('');

  const handleAddItem = () => {
    setNftItems([...nftItems, { name: '', description: '', imageFile: null, imageUrl: '', rarity: '평범' }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...nftItems];
    newItems[index][field] = value;
    setNftItems(newItems);
  };

  const handleImageChange = (index, file) => {
    const newItems = [...nftItems];
    newItems[index].imageFile = file;
    newItems[index].imageUrl = ''; // 이미지 변경 시, 기존 서버 URL은 무효화
    setNftItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setNftItems(nftItems.filter((_, i) => i !== index));
  };

  const handleRegisterSingleItem = async (itemIndex) => {
  const itemToRegister = nftItems[itemIndex];
  if (!itemToRegister.name || !itemToRegister.imageFile) {
    alert('아이템 이름과 이미지를 모두 선택해주세요.');
    return;
  }
  setLoading(true);
  setItemRegistrationMessage(`'${itemToRegister.name}' 등록 처리 중...`);
  try {
    // 1. 이미지 업로드
    const formData = new FormData();
    formData.append('image', itemToRegister.imageFile);
    const imageUploadResponse = await uploadImage(formData);

    console.log('이미지 업로드 서버 응답:', imageUploadResponse.data);

    // --- 여기가 핵심 수정 부분: 'imageUrl' -> 'image_url' ---
    // 백엔드가 보내준 'image_url' 키를 정확하게 사용합니다.
    const imageUrlFromServer = imageUploadResponse.data.image_url; 

    if (!imageUrlFromServer) {
      throw new Error("이미지 URL을 받지 못했습니다. 개발자 도구의 콘솔에서 서버 응답을 확인하세요.");
    }
    
    const updatedItems = [...nftItems];
    updatedItems[itemIndex].imageUrl = imageUrlFromServer;
    updatedItems[itemIndex].imageFile = null;
    setNftItems(updatedItems);

    // 2. 애장품 정보 등록 (이미지 URL 포함)
    const itemData = {
      name: itemToRegister.name,
      description: itemToRegister.description,
      imageUrl: imageUrlFromServer,
      rarity: itemToRegister.rarity,
    };
    const registerResponse = await registerItem(itemData);
    setItemRegistrationMessage(`'${itemToRegister.name}' 아이템 등록 성공! (서버 응답: ${JSON.stringify(registerResponse.data)})`);

  } catch (error) {
    console.error("아이템 등록 실패:", error);
    setItemRegistrationMessage(`아이템 등록 실패: ${error.response?.data?.message || error.message}`);
  } finally {
    setLoading(false);
  }
};
  
  const handleSubmitContract = (event) => {
    event.preventDefault();
    alert("이 기능은 백엔드 및 스마트 컨트랙트와 연동이 필요합니다.");
  };
  
  const rarityOptions = ["초희귀", "희귀", "평범"];

  return (
    <div className="upload-contract-container">
      <h2>새로운 애장품(가챠 아이템) 등록</h2>
      {itemRegistrationMessage && <p className={itemRegistrationMessage.includes('실패') ? 'error-message' : 'success-message'}>{itemRegistrationMessage}</p>}

      <form onSubmit={handleSubmitContract}>
        <h3>등록할 애장품 목록</h3>
        {nftItems.map((item, index) => (
          <div key={index} className="nft-item-card">
            <h4>품목 {index + 1}</h4>
            <label htmlFor={`item-name-${index}`}>아이템 이름:</label>
            <input id={`item-name-${index}`} type="text" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} placeholder="예: 전설의 검" required />
            
            <label htmlFor={`item-desc-${index}`}>아이템 설명:</label>
            <textarea id={`item-desc-${index}`} value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} placeholder="아이템에 대한 설명"></textarea>

            <label htmlFor={`item-img-${index}`}>이미지 업로드:</label>
            <input id={`item-img-${index}`} type="file" onChange={(e) => handleImageChange(index, e.target.files[0])} accept="image/*" />
            {item.imageUrl && <p>✅ 이미지 등록 완료: <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">링크 확인</a></p>}
            
            <label htmlFor={`item-rarity-${index}`}>희귀도:</label>
            <select id={`item-rarity-${index}`} value={item.rarity} onChange={(e) => handleItemChange(index, 'rarity', e.target.value)}>
              {rarityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            
            <div className="button-group">
                <button type="button" onClick={() => handleRegisterSingleItem(index)} disabled={loading || item.imageUrl} className="button-primary">
                    {loading && '처리중...'}
                    {!loading && (item.imageUrl ? '등록 완료' : '이 아이템 서버에 등록')}
                </button>
                <button type="button" onClick={() => handleRemoveItem(index)} className="remove-item-button">품목 삭제</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={handleAddItem} className="add-item-button">+ 새 품목 추가</button>

        <div className="submit-button-container">
          <h4>(예시) 스마트 컨트랙트 생성</h4>
          <p>모든 아이템을 위에서 개별적으로 등록 후, 해당 아이템들로 컨트랙트를 생성할 수 있습니다.</p>
          <button type="submit" className="button-primary" disabled={loading}>
            컨트랙트 생성 요청
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadContractPage;