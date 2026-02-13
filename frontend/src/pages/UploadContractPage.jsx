import React, { useState, useEffect  } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadImage, registerItem } from '../services/api';
import './UploadContractPage.css';

const UploadContractPage = () => {
  // 현재 AuthContext의 user 객체는 null일 수 있으므로, 직접 사용 시 주의가 필요합니다.
  const { user, token } = useAuth(); 
  const [nftItems, setNftItems] = useState([{ name: '', description: '', imageFile: null, imageUrl: '', rarity: '평범' }]);
  const [loading, setLoading] = useState(false);
  const [itemRegistrationMessage, setItemRegistrationMessage] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    const getWalletAddress = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } else {
        alert("MetaMask를 설치하고 활성화해주세요.");
      }
    };
    getWalletAddress();
  }, []);

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
    setItemRegistrationMessage('');
    try {
      // 1. 이미지 업로드
      const formData = new FormData();
      formData.append('image', itemToRegister.imageFile); // 'image'는 백엔드에서 받는 필드명
      const imageUploadResponse = await uploadImage(formData);
      const imageUrlFromServer = imageUploadResponse.data.image_url; // API 응답 형식에 따라 imageUrl 필드 확인

      if (!imageUrlFromServer) {
        throw new Error("이미지 URL을 받지 못했습니다. 개발자 도구의 콘솔에서 서버 응답을 확인하세요.");
      }

      // 2. 애장품 정보 등록 (이미지 URL 포함)
      const itemData = {
        name: itemToRegister.name,
        description: itemToRegister.description,
        image_url: imageUrlFromServer,
        rarity: itemToRegister.rarity,
        // ownerId: user.id // 필요하다면 사용자 ID도 함께 전송
      };
      const registerResponse = await registerItem(itemData);

      // 3. 서버 응답에서 itemId 추출 -------------------------------
      console.log('📦 registerResponse:', registerResponse);

      const itemIdFromServer = registerResponse.data?.item?.id;

      if (!itemIdFromServer) {
        throw new Error('서버 응답에 item.id 가 없습니다.');
      }

      // 4. state 갱신
      const updatedItems = [...nftItems];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        imageUrl: imageUrlFromServer,
        imageFile: null,
        itemId: itemIdFromServer,
      };
      setNftItems(updatedItems);

      setItemRegistrationMessage(`'${itemToRegister.name}' 아이템 등록 성공! (ID: ${itemIdFromServer})`); // API 응답 형식에 따라
      // 등록 성공 후, 해당 아이템은 목록에서 비활성화하거나 UI 변경 가능
    } 
    
    catch (error) {
      console.error("아이템 등록 실패:", error);
      setItemRegistrationMessage(`아이템 등록 실패: ${error.response?.data?.message || error.message}`);
    } 
    
    finally {
      setLoading(false);
    }
  };
  
  const handleSubmitContract = async (event) => {
    event.preventDefault();

    // 0. 로그인 / 유저 확인 -------------------------------------------------
    const userId = user?.id || user?.uid || user?._id;  // 구조 맞춰서 하나만 남겨
    if (!userId) {
      alert('로그인 정보가 없습니다. 다시 로그인해 주세요.');
      return;
    }

    if (!walletAddress) {
      alert('지갑 주소를 불러오지 못했습니다. MetaMask 연결을 확인해주세요.');
      return;
    }
    
    // 1. 등록된 itemId가 모두 존재하는지 확인
    const itemIds = nftItems.map(item => item.itemId).filter(id => id !== undefined);
    console.log("🔥 NFT Items 상태:", nftItems);
    console.log("🟢 등록된 itemIds:", itemIds);
    if (itemIds.length !== nftItems.length) {
      alert("모든 아이템을 먼저 등록해야 합니다.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/gacha/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, },
        body: JSON.stringify({ itemIds, walletAddress }) // userId는 백엔드에서 req.user.id 로 해결
      });

      const result = await response.json();
      if (response.ok) {
        alert(`✅ 컨트랙트 생성 성공!\n주소: ${result.contractAddress}`);
        // 2-1) 메타마스크에 NFT 자동 추가
        for (const tid of result.tokenIds) {
          try {
            await window.ethereum.request({
              method: "wallet_watchAsset",
              params: {
                type: "ERC721",
                options: {
                  address: result.nftAddress,   // 0xD647…
                  tokenId: tid.toString(),
                },
              },
            });
            console.log(`NFT #${tid} 추가 완료`);
          } catch (e) {
            console.warn(`NFT #${tid} 추가 취소/실패`, e);
          }
        }
      } else {
        throw new Error(result.message || "컨트랙트 생성 실패");
      }
    } catch (error) {
      console.error("컨트랙트 생성 중 오류:", error);
      alert("컨트랙트 생성 실패: " + error.message);
    } finally {
      setLoading(false);
    }
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