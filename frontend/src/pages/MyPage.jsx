import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMyRegisteredItems, getMyGachaHistory, uploadDeliveryProof } from '../services/api';
// import './MyPage.css'; // 필요시 CSS 생성

const MyPage = () => {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [gachaHistory, setGachaHistory] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [uploadingProofFor, setUploadingProofFor] = useState(null); // 어떤 gacha history item에 대한 것인지

  useEffect(() => {
    const fetchMyData = async () => {
      if (user) {
        setLoadingItems(true);
        try {
          const itemsRes = await getMyRegisteredItems();
          setMyItems(itemsRes.data.items || []);
        } catch (error) {
          console.error("내 등록 아이템 조회 실패:", error);
        }
        setLoadingItems(false);

        setLoadingHistory(true);
        try {
          const historyRes = await getMyGachaHistory();
          setGachaHistory(historyRes.data.history || []); // API 응답 형식에 따라
        } catch (error) {
          console.error("가챠 이력 조회 실패:", error);
        }
        setLoadingHistory(false);
      }
    };
    fetchMyData();
  }, [user]);

  const handleProofFileChange = (e, historyId) => {
    setProofFile(e.target.files[0]);
    setUploadingProofFor(historyId); // 현재 작업 중인 이력 ID 설정
  };

  const handleUploadProof = async (historyId) => { // historyId는 gachaHistory의 각 항목 ID
    if (!proofFile || uploadingProofFor !== historyId) {
      alert("먼저 수령 인증 사진을 선택해주세요.");
      return;
    }
    const formData = new FormData();
    formData.append('proofImage', proofFile); // 백엔드에서 받는 필드명
    formData.append('gachaHistoryId', historyId); // 어떤 이력에 대한 증명인지 전달

    try {
      setLoadingHistory(true); // 또는 별도의 로딩 상태
      await uploadDeliveryProof(formData);
      alert('수령 인증 사진이 업로드되었습니다.');
      // 성공 시 UI 업데이트 (예: 해당 이력에 "인증 완료" 표시)
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

  if (!user) return <p>로그인이 필요합니다.</p>;

  return (
    <div className="my-page-container" style={{padding:'1rem'}}>
      <h2>마이페이지</h2>
      <p><strong>사용자명:</strong> {user.username}</p>
      {/* <p><strong>이메일:</strong> {user.email}</p> */}

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
                        hist.needsShipping && !hist.isDelivered ? // 배송 필요하고 아직 미배송 시
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