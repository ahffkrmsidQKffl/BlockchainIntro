import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // useAuth 훅 가져오기
import { getMyRegisteredItems, getMyGachaHistory, uploadDeliveryProof } from '../services/api';
// import './MyPage.css'; // 필요시 CSS 생성

const MyPage = () => {
  // user 객체 대신 isAuthenticated (토큰 존재 여부)를 주된 기준으로 삼습니다.
  const { isAuthenticated } = useAuth(); 
  const [myItems, setMyItems] = useState([]);
  const [gachaHistory, setGachaHistory] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [uploadingProofFor, setUploadingProofFor] = useState(null);

  useEffect(() => {
  const fetchMyData = async () => {
    if (isAuthenticated) {
      // 1. 내 등록 아이템 조회
      setLoadingItems(true);
      try {
        const itemsRes = await getMyRegisteredItems();
        setMyItems(itemsRes.data.items || []);
      } catch (error) {
        console.error("내 등록 아이템 조회 실패:", error);
      } finally {
        setLoadingItems(false);
      }

      // 2. 가챠 이력 조회
      setLoadingHistory(true);
      try {
        const historyRes = await getMyGachaHistory();
        setGachaHistory(historyRes.data.history || []);
      } catch (error) {
        // 여기가 현재 에러가 잡히는 부분입니다.
        console.error("가챠 이력 조회 실패:", error); 
      } finally {
        setLoadingHistory(false);
      }
    }
  };
  fetchMyData();
}, [isAuthenticated]);

  const handleProofFileChange = (e, historyId) => {
    setProofFile(e.target.files[0]);
    setUploadingProofFor(historyId); // 현재 작업 중인 이력 ID 설정
  };

  const handleUploadProof = async (historyId) => {
    if (!proofFile || uploadingProofFor !== historyId) {
      alert("먼저 수령 인증 사진을 선택해주세요.");
      return;
    }
    const formData = new FormData();
    formData.append('proofImage', proofFile); // 백엔드에서 받는 필드명
    formData.append('gachaHistoryId', historyId);

    try {
      setLoadingHistory(true);
      await uploadDeliveryProof(formData);
      alert('수령 인증 사진이 업로드되었습니다.');
      const updatedHistory = gachaHistory.map(h => 
        h.id === historyId ? { ...h, proofUploaded: true } : h
      );
      setGachaHistory(updatedHistory);
      setProofFile(null);
      setUploadingProofFor(null);
    } catch (error) {
      alert(`수령 인증 실패: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoadingHistory(false);
    }
  };

  // App.jsx의 ProtectedRoute가 이미 이 페이지를 보호하고 있지만,
  // 만약을 대비해 한번 더 확인하는 것이 좋습니다.
  if (!isAuthenticated) {
    return <p>마이페이지를 보려면 로그인이 필요합니다.</p>;
  }

  return (
    <div className="my-page-container" style={{padding:'1rem'}}>
      <h2>마이페이지</h2>
      {/* 
        - 현재 로그인 API 응답에 사용자 정보(user 객체)가 없어 이름을 표시할 수 없습니다.
        - 추후 백엔드에서 로그인 시 사용자 정보를 함께 보내주거나,
        - 사용자 정보를 가져오는 별도의 API(예: GET /api/users/me)가 생긴다면
        - 이 부분의 주석을 해제하고 사용할 수 있습니다.
        <p><strong>사용자님, 환영합니다.</strong></p> 
      */}

      <section style={{ marginTop: '30px' }}>
        <h3>내가 등록한 애장품 목록</h3>
        {loadingItems ? <p>로딩 중...</p> : (
          myItems.length > 0 ? (
            <ul>{myItems.map(item => <li key={item.id}>{item.name} (희귀도: {item.rarity}) <img src={item.imageUrl} alt={item.name} width="50"/></li>)}</ul>
          ) : <p>아직 등록한 애장품이 없습니다.</p>
        )}
      </section>

      <section style={{ marginTop: '30px' }}>
        <h3>내가 뽑은 상품 이력</h3>
        {loadingHistory ? <p>로딩 중...</p> : (
          gachaHistory.length > 0 ? (
            <table border="1" style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead><tr><th>상품명</th><th>뽑은 날짜</th><th>배송상태</th><th>수령 인증</th></tr></thead>
              <tbody>
                {gachaHistory.map(hist => (
                  <tr key={hist.id}>
                    <td>{hist.itemName} <img src={hist.itemImageUrl} alt={hist.itemName} width="30"/></td>
                    <td>{new Date(hist.drawDate).toLocaleDateString()}</td>
                    <td>{hist.shippingStatus || '확인 중'}</td>
                    <td>
                      {hist.proofUploaded ? '인증 완료' : (
                        hist.needsShipping && !hist.isDelivered ?
                        <>
                          <input type="file" onChange={(e) => handleProofFileChange(e, hist.id)} accept="image/*" style={{fontSize:'0.8em'}} />
                          {uploadingProofFor === hist.id && proofFile && 
                           <button onClick={() => handleUploadProof(hist.id)} style={{fontSize:'0.8em', marginLeft:'5px'}}>업로드</button>}
                        </>
                        : '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>아직 뽑은 상품 이력이 없습니다.</p>
        )}
      </section>
    </div>
  );
};

export default MyPage;