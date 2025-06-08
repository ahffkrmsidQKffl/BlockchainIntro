// --- 수정된 UseGachaPage.jsx ---

import React, { useState, useEffect } from 'react';
import ContractCard from '../components/ContractCard'; // 가챠 아이템을 표시할 카드 컴포넌트
import { useAuth } from '../contexts/AuthContext';
// 1. api.js에서 올바른 함수들을 import 합니다.
import { getAllItems, drawGacha } from '../services/api'; 
import './UseGachaPage.css';

const UseGachaPage = ({ onGachaAttempt }) => {
  const { isAuthenticated } = useAuth();
  const [gachaItems, setGachaItems] = useState([]); // 가챠 가능한 아이템 목록
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDrawing, setIsDrawing] = useState(false); // 뽑기 동작 중 로딩 상태

  useEffect(() => {
    const fetchGachaItems = async () => {
      setLoading(true);
      setError('');
      try {
        // 2. 'getAllGachaItems'가 아닌, 실제 존재하는 'getAllItems'를 호출합니다.
        const response = await getAllItems(); 
        setGachaItems(response.data || []); // 백엔드가 { items: [...] }가 아닌 배열 자체를 보낼 수도 있으므로 response.data로 받음
      } catch (err) {
        setError(err.response?.data?.message || '가챠 목록을 불러오는데 실패했습니다.');
        console.error("가챠 목록 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGachaItems();
  }, []);

  // 3. '뽑기' 로직 수정: 백엔드는 어떤 아이템을 뽑을지 지정하는 것이 아니라,
  // 그냥 "뽑기" 요청만 보내면 서버가 알아서 랜덤 아이템을 줍니다.
  const handleAttemptGacha = async () => { 
    if (!isAuthenticated) {
      alert("뽑기를 시도하려면 로그인해주세요.");
      return;
    }
    if (isDrawing) return; // 중복 클릭 방지

    setIsDrawing(true); // 뽑기 버튼 로딩 시작
    setError('');

    try {
      // 백엔드는 userId만 필요로 하고, 이 정보는 토큰을 통해 서버에서 얻습니다.
      // 따라서 프론트에서는 아무 데이터도 보낼 필요가 없습니다.
      const response = await drawGacha(); 
      
      const resultData = response.data; // 뽑힌 결과 아이템 정보
      onGachaAttempt(resultData); // App.jsx의 콜백 호출 -> 결과 모달 표시
      
      // 뽑기가 성공하면 화면의 아이템 목록을 갱신합니다.
      // 뽑힌 아이템은 목록에서 사라져야 합니다.
      setGachaItems(prevItems => prevItems.filter(item => item.id !== resultData.id));

    } catch (err) {
      alert(`뽑기 시도 실패: ${err.response?.data?.message || err.message}`);
      setError(err.response?.data?.message || '뽑기 시도 중 오류가 발생했습니다.');
    } finally {
      setIsDrawing(false); // 뽑기 버튼 로딩 종료
    }
  };

  if (loading) return <p className="loading-message">가챠 목록을 불러오는 중...</p>;
  if (error) return <p className="error-message" style={{ textAlign: 'center' }}>{error}</p>;

  // UI 구조를 '전체 뽑기 버튼' 하나로 변경하는 것을 권장합니다.
  return (
    <div className="use-gacha-container">
      <h2>가챠 아이템 목록</h2>
      <div className="gacha-action-area">
        <button onClick={handleAttemptGacha} disabled={isDrawing || gachaItems.length === 0} className="gacha-draw-button">
          {isDrawing ? '뽑는 중...' : '운명의 뽑기 시도!'}
        </button>
        {gachaItems.length === 0 && <p>뽑을 수 있는 아이템이 없습니다.</p>}
      </div>

      <div className="contracts-grid">
        {gachaItems.map(item => (
          <ContractCard 
            key={item.id}
            contract={item}
            // 각 아이템 카드에 뽑기 버튼을 두는 것보다, 상단에 큰 버튼 하나만 두는 것이
            // 백엔드 로직("랜덤으로 하나 뽑기")과 더 잘 맞습니다.
            // onAttemptGacha={() => handleAttemptGacha(item)} // 이 방식은 백엔드와 맞지 않음
            walletConnected={isAuthenticated}
          />
        ))}
      </div>
    </div>
  );
};

export default UseGachaPage;