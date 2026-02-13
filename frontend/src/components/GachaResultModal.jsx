import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GachaResultModal.css';

const GachaResultModal = ({ isOpen, onClose, result }) => {
  const navigate = useNavigate();

  if (!isOpen || !result) return null;

  const handleShippingRedirect = () => {
    onClose(); // 모달 닫기
    navigate(`/shipping/${result.id}`); // result.id가 뽑힌 상품의 고유 ID라고 가정
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>🎉 축하합니다! 🎉</h2>
        <p><strong>{result.name}</strong> 아이템을 획득했습니다!</p>
        {result.imageUrl && <img src={result.imageUrl} alt={result.name} className="modal-nft-image" />}
        
        {result.needsShipping && ( // API 응답에 needsShipping 같은 플래그가 있다고 가정
          <button onClick={handleShippingRedirect} className="button-primary" style={{marginTop: '15px', backgroundColor: '#28a745'}}>
            배송지 입력하기
          </button>
        )}
        <button onClick={onClose} className="modal-close-button" style={{marginTop: result.needsShipping ? '10px' : '20px' }}>
          확인
        </button>
      </div>
    </div>
  );
};

export default GachaResultModal;