import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // 인증 정보 사용
import { uploadImage, registerItem } from '../services/api'; // API 함수 임포트
import './UploadContractPage.css';

const UploadContractPage = () => {
  const { user } = useAuth(); // 현재 로그인한 사용자 정보 (필요시)
  const [nftItems, setNftItems] = useState([{ name: '', description: '', imageFile: null, imageUrl: '', rarity: '평범' }]);
  // gachaPrice는 스마트 컨트랙트 배포 시 사용되거나, 백엔드에 가챠 정보를 저장할 때 사용될 수 있습니다.
  // 이 예제에서는 개별 아이템(애장품) 등록에 초점
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
    newItems[index].imageUrl = ''; // 기존 이미지 URL 초기화
    setNftItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setNftItems(nftItems.filter((_, i) => i !== index));
  };

  // 개별 아이템(애장품) 등록 핸들러
  const handleRegisterSingleItem = async (itemIndex) => {
    const itemToRegister = nftItems[itemIndex];
    if (!itemToRegister.name || !itemToRegister.imageFile) {
      alert('아이템 이름과 이미지를 모두 선택해주세요.');
      return;
    }
    setLoading(true);
    setItemRegistrationMessage('');
    try {
      // 1. 이미지 업로드
      const formData = new FormData();
      formData.append('image', itemToRegister.imageFile); // 'image'는 백엔드에서 받는 필드명
      const imageUploadResponse = await uploadImage(formData);
      const imageUrlFromServer = imageUploadResponse.data.imageUrl; // API 응답 형식에 따라 imageUrl 필드 확인

      if (!imageUrlFromServer) {
        throw new Error("이미지 URL을 받지 못했습니다.");
      }
      
      const updatedItems = [...nftItems];
      updatedItems[itemIndex].imageUrl = imageUrlFromServer;
      setNftItems(updatedItems);

      // 2. 애장품 정보 등록 (이미지 URL 포함)
      const itemData = {
        name: itemToRegister.name,
        description: itemToRegister.description,
        imageUrl: imageUrlFromServer,
        rarity: itemToRegister.rarity,
        // ownerId: user.id // 필요하다면 사용자 ID도 함께 전송
      };
      const registerResponse = await registerItem(itemData);
      setItemRegistrationMessage(`'${itemToRegister.name}' 아이템 등록 성공! (ID: ${registerResponse.data.itemId})`); // API 응답 형식에 따라
      // 등록 성공 후, 해당 아이템은 목록에서 비활성화하거나 UI 변경 가능

    } catch (error) {
      console.error("아이템 등록 실패:", error);
      setItemRegistrationMessage(`아이템 등록 실패: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // "컨트랙트 등록"은 실제 스마트 컨트랙트 배포 로직 + 등록된 아이템 ID들을 사용하는 로직이 될 것임
  // 여기서는 개별 아이템 등록 기능 위주로 보여줌
  const handleSubmitContract = async (event) => {
    event.preventDefault();
    // TODO: 모든 아이템들이 imageUrl을 가지고 있는지 (즉, 서버에 등록되었는지) 확인
    //       이후 이 아이템 정보(ID 또는 URL)들을 모아서 스마트 컨트랙트 배포 로직으로 전달
    alert("스마트 컨트랙트 배포 로직을 여기에 구현합니다. (등록된 아이템 정보 사용)");
    // 예: const registeredItemIds = nftItems.map(item => item.idFromServer).filter(id => id);
    //     await deployGachaSmartContract(registeredItemIds, gachaPrice);
  };
  
  const rarityOptions = ["초희귀", "희귀", "평범"];

  return (
    <div className="upload-contract-container">
      <h2>새로운 애장품(가챠 아이템) 등록</h2>
      {/* <p>이 페이지에서 개별 아이템을 먼저 등록하고, 등록된 아이템들로 가챠 스마트 컨트랙트를 생성합니다.</p> */}
      {itemRegistrationMessage && <p style={{color: loading? 'blue':'green'}}>{itemRegistrationMessage}</p>}

      <form onSubmit={handleSubmitContract}>
        <h3>등록할 애장품 목록</h3>
        {nftItems.map((item, index) => (
          <div key={index} className="nft-item-card">
            <h4>품목 {index + 1}</h4>
            <label>아이템 이름:</label>
            <input type="text" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} placeholder="예: 전설의 검" required />
            
            <label>아이템 설명:</label>
            <textarea value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} placeholder="아이템에 대한 설명"></textarea>

            <label>이미지 업로드:</label>
            <input type="file" onChange={(e) => handleImageChange(index, e.target.files[0])} accept="image/*" />
            {item.imageUrl && <p>업로드된 이미지 URL: <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">{item.imageUrl}</a></p>}
            
            <label>희귀도:</label>
            <select value={item.rarity} onChange={(e) => handleItemChange(index, 'rarity', e.target.value)}>
              {rarityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            
            <div style={{marginTop: '10px'}}>
                <button type="button" onClick={() => handleRegisterSingleItem(index)} disabled={loading || item.imageUrl} className="button-primary" style={{marginRight:'10px'}}>
                    {loading && '처리중...'}
                    {!loading && (item.imageUrl ? '등록 완료' : '이 아이템 등록')}
                </button>
                <button type="button" onClick={() => handleRemoveItem(index)} className="remove-item-button">품목 삭제</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={handleAddItem} className="add-item-button">새 품목 추가</button>

        <div className="submit-button-container" style={{marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '2rem'}}>
          <h4>스마트 컨트랙트 생성 (선택사항)</h4>
          <p>모든 아이템을 위에서 개별적으로 서버에 등록 후, 해당 아이템들을 포함하는 스마트 컨트랙트를 생성할 수 있습니다.</p>
          {/* <label>총 가챠 가격 (ETH): <input type="number" ... /></label> */}
          <button type="submit" className="button-primary" disabled={loading}>
            (예시) 스마트 컨트랙트 생성 요청
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadContractPage;