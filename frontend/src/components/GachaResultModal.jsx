// frontend/src/components/GachaResultModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function GachaResultModal({ result, onClose }) {
  const navigate = useNavigate();

  // 외부 URL(external_url)에 infoId를 포함해 두셨다면, 
  // result.externalUrl에서 파싱하거나 result.infoId로 직접 가지고 오세요.
  const infoId  = result.infoId;      
  const tokenId = result.tokenId;

  const handleShipping = () => {
    // 모달 닫고 배송 페이지로 이동
    onClose();
    navigate(`/shipping/info/${infoId}?tokenId=${tokenId}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">{result.name}</h2>
        <img src={result.imageUrl} alt={result.name} className="mb-4 w-full object-contain" />
        
        {/* 뽑기 성공 메시지 */}
        <p className="mb-4">🎉 NFT #{tokenId} 뽑기 성공!</p>

        {/* 배송 정보 입력이 필요한 경우만 */}
        {result.needsShipping && (
          <button
            onClick={handleShipping}
            className="w-full py-2 mb-2 bg-blue-600 text-white rounded"
          >
            배송 정보 입력하기
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 bg-gray-300 rounded"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
