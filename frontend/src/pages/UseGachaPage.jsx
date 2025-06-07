import React, { useState, useEffect } from 'react';
import ContractCard from '../components/ContractCard'; // 실제로는 GachaItemCard 등이 될 수 있음
import { useAuth } from '../contexts/AuthContext';
import { getMyRegisteredItems, drawGacha } from '../services/api'; // getMyRegisteredItems는 예시, 실제 가챠 목록 API 필요
import './UseGachaPage.css';

const UseGachaPage = ({ onGachaAttempt }) => {
  const { isAuthenticated } = useAuth(); // 로그인 여부 확인
  const [gachaItems, setGachaItems] = useState([]); // 실제 가챠 목록 또는 아이템들
  // ... (필터, 정렬 상태)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGachaItems = async () => {
      setLoading(true);
      setError('');
      try {
        // --- 여기가 핵심 수정 부분 ---
        // 임시 함수 대신, 새로 만든 전체 목록 API를 호출합니다.
        const response = await getAllGachaItems(); 
        setGachaItems(response.data.items || []);
      } catch (err) {
        setError(err.response?.data?.message || '가챠 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGachaItems();

  }, []);
  const handleAttemptGacha = async (gachaItem) => { // gachaItem은 뽑을 대상 (예: { id, name, price })
    if (!isAuthenticated) {
      alert("뽑기를 시도하려면 로그인해주세요.");
      return;
    }
    setLoading(true); // UI에 로딩 표시
    try {
      // gachaItem.id는 /api/gacha/draw 가 요구하는 ID (예: 가챠 컨트랙트 ID 또는 아이템 ID)
      const response = await drawGacha({ gachaId: gachaItem.id /*, 필요한 다른 데이터 */ });
      // API 응답으로 뽑힌 결과 NFT 정보 받기
      const resultData = response.data; // 예: { id: 'nftId', name: '뽑힌 NFT', imageUrl: '...', needsShipping: true }
      onGachaAttempt(resultData); // App.jsx의 콜백 호출 -> 모달 표시
    } catch (err) {
      alert(`뽑기 시도 실패: ${err.response?.data?.message || err.message}`);
    } finally {
        setLoading(false);
    }
  };

  if (loading && !gachaItems.length) return <p className="loading-message">가챠 목록을 불러오는 중...</p>;
  if (error) return <p className="error-message" style={{textAlign:'center'}}>{error}</p>;


  return (
    <div className="use-gacha-container">
      <h2>가챠 아이템 목록</h2>
      {/* ... 필터 UI ... */}
      <div className="contracts-grid"> {/* CSS 클래스명은 적절히 수정 */}
        {gachaItems.length > 0 ? (
          gachaItems.map(item => ( // ContractCard 대신 GachaItemCard 등으로 변경 가능
            <ContractCard 
              key={item.id} // item.id는 DB의 PKey 또는 고유 식별자
              contract={item} // contract prop 대신 item prop 등 사용
              // contract.name, contract.price 대신 item.name, item.price (가챠 가격) 사용
              // ContractCard 내부도 API 데이터 구조에 맞게 수정 필요
              onAttemptGacha={() => handleAttemptGacha(item)}
              walletConnected={isAuthenticated} // 로그인 여부로 변경
            />
          ))
        ) : (
          !loading && <p className="no-contracts-message">표시할 가챠 아이템이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default UseGachaPage;