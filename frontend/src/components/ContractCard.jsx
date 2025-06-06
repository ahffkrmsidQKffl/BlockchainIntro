import React, { useState } from 'react';
import './ContractCard.css'; // CSS 파일 임포트

const ContractCard = ({ contract, onAttemptGacha, walletConnected }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="contract-card">
      <h3>{contract.name || "이름 없는 가챠"}</h3>
      <p><strong>뽑기 가격:</strong> {contract.price}</p>
      <p><strong>초희귀 확률:</strong> {contract.superRareChance}</p>
      <p><strong>등록일:</strong> {contract.registeredDate}</p>
      <p><strong>등록자:</strong> {`${contract.creatorAddress.substring(0, 6)}...${contract.creatorAddress.substring(contract.creatorAddress.length - 4)}`}</p>
      
      <div className="contract-card-actions">
        <button onClick={() => setShowDetails(!showDetails)} className="details-button">
          {showDetails ? "상세 숨기기" : "품목/확률 보기"}
        </button>
        <button 
          onClick={onAttemptGacha} 
          disabled={!walletConnected} 
          title={!walletConnected ? "지갑을 연결해주세요" : "뽑기 시도"}
          className="attempt-button"
        >
          뽑기 시도
        </button>
      </div>

      {showDetails && (
        <div className="contract-details">
          <h4>품목 구성:</h4>
          <ul>
            {contract.items && contract.items.length > 0 ? (
              contract.items.map((item, index) => (
                <li key={index}>{item.name} - {item.rarity} (확률: 상세 정보 필요)</li>
              ))
            ) : (
              <li>품목 정보가 없습니다.</li>
            )}
          </ul>
          {/* TODO: 확률 상세 정보 표시 */}
        </div>
      )}
    </div>
  );
};

export default ContractCard;