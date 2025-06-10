import ContractCard from '../components/ContractCard';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
// api.js 파일의 경로는 실제 프로젝트 구조에 맞게 확인해주세요. (예: ../api/api.js 또는 ../services/api.js)
import { getMyGachaContracts, getMyRegisteredItems, getMyGachaHistory, } from '../services/api'; 
// import './MyPage.css';

const MyPage = () => {
  const { isAuthenticated } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [gachaHistory, setGachaHistory] = useState([]);
  
  // 1. 로딩과 에러 상태를 객체로 통합하여 관리
  const [loading, setLoading] = useState({ items: false, history: false, proof: false });
  const [error, setError] = useState({ items: null, history: null });

  const [myContracts, setMyContracts] = useState([]);

  useEffect(() => {
    const fetchMyData = async () => {
      if (isAuthenticated) {
        // 2. 여러 API 요청을 병렬로 처리하여 로딩 속도 개선
        setLoading({ items: true, history: true, proof: false });
        setError({ items: null, history: null }); // 요청 시작 전 에러 상태 초기화

        try {
          // Promise.allSettled를 사용해 하나가 실패해도 다른 하나는 결과를 받을 수 있도록 함
          const results = await Promise.allSettled([
            getMyRegisteredItems(),
            getMyGachaHistory(),
            getMyGachaContracts()
          ]);

          // 3. 내 등록 아이템 결과 처리
          if (results[0].status === 'fulfilled') {
            // 백엔드 응답이 { items: [...] } 형태가 아닌 배열 자체일 경우를 대비
            setMyItems(results[0].value.data.items || results[0].value.data || []);
          } else {
            console.error("내 등록 아이템 조회 실패:", results[0].reason);
            setError(prev => ({ ...prev, items: '등록 아이템 목록을 불러오는 데 실패했습니다.' }));
          }

          // 4. 가챠 이력 결과 처리
          if (results[1].status === 'fulfilled') {
            // 백엔드 응답이 { history: [...] } 형태가 아닌 배열 자체일 경우를 대비
            setGachaHistory(results[1].value.data.history || results[1].value.data || []);
          } else {
            console.error("가챠 이력 조회 실패:", results[1].reason);
            // 500 에러의 경우, 백엔드에서 온 에러 메시지를 사용하거나 기본 메시지를 보여줌
            const backendMessage = results[1].reason.response?.data?.message;
            setError(prev => ({ ...prev, history: backendMessage || '가챠 이력을 불러오는 데 실패했습니다.' }));
          }

          // 5. 내가 만든 컨트랙트 처리
          if (results[2].status === 'fulfilled') {
            setMyContracts(results[2].value.data || []);
          } else {
            console.error("내 컨트랙트 목록 조회 실패:", results[2].reason);
          }

        } catch (generalError) {
          // Promise.allSettled는 자체적으로는 거의 실패하지 않지만, 예외 상황 대비
          console.error("데이터 로딩 중 예기치 않은 오류:", generalError);
          setError({ items: '데이터 로딩 중 오류 발생', history: '데이터 로딩 중 오류 발생' });
        } finally {
          setLoading({ items: false, history: false, proof: false });
        }
      }
    };
    fetchMyData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <p>마이페이지를 보려면 로그인이 필요합니다.</p>;
  }

  return (
    <div className="my-page-container" style={{ padding: '1rem' }}>
      <h2>마이페이지</h2>

      <section style={{ marginTop: '30px' }}>
        <h3>내가 만든 가챠 컨트랙트</h3>
        {loading.items && <p>로딩 중...</p>}
        {error.items && <p style={{ color: 'red' }}>{error.items}</p>}
        {!loading.items && !error.items && (
          myContracts.length > 0 ? (
            myContracts.map(contract => (
              <div key={contract.contractAddress} className="gacha-contract-box">
                <h4>📦 컨트랙트 주소: {contract.contractAddress}</h4>
                <p>생성일: {new Date(contract.createdAt).toLocaleString()}</p>

                <div className="contract-items-grid">
                  {contract.items.map(item => (
                    <ContractCard key={item.tokenId} item={{
                      id: item.id,
                      name: `NFT #${item.tokenId}`,
                      image_url: item.image_url,
                      description: item.description || '설명 없음'
                    }} />
                  ))}
                </div>
              </div>
            ))
          ) : <p>아직 등록한 가챠 컨트랙트가 없습니다.</p>
        )}
      </section>

      <section style={{ marginTop: '30px' }}>
        <h3>내가 뽑은 상품 이력</h3>
        {loading.history && <p>로딩 중...</p>}
        {error.history && <p style={{ color: 'red' }}>{error.history}</p>}
        {!loading.history && !error.history && (
          gachaHistory.length > 0 ? (
            <div className="contract-items-grid">
              {gachaHistory.map(item => (
                <ContractCard key={item.itemId} item={{
                  id: item.itemId,
                  name: item.itemName,
                  image_url: item.itemImageUrl,
                  description: item.description || '설명 없음'
                }} />
              ))}
            </div>
          ) : <p>아직 뽑은 상품 이력이 없습니다.</p>
        )}
      </section>
    </div>
  );
};

export default MyPage;