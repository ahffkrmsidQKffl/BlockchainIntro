
import React from 'react';
import './ContractCard.css'; // CSS 파일 임포트


const ContractCard = ({ item }) => {
  
  // item 데이터가 비정상적으로 전달될 경우 에러를 방지하는 방어 코드입니다.
  if (!item) {
    return (
      <div className="contract-card-error">
        <p>아이템 정보를 표시할 수 없습니다.</p>
      </div>
    );
  }

  // 이제 item 객체에 있는 실제 데이터를 사용하여 UI를 구성합니다.
  return (
    <div className="contract-card">
      {/* item.image_url을 사용하여 아이템 이미지를 표시합니다. */}
      <img 
        src={item.image_url || 'https://via.placeholder.com/200'} 
        alt={item.name} 
        className="card-image"
      />
      
      <div className="card-content">
        {/* item.name을 제목으로 표시합니다. */}
        <h3 className="card-title">{item.name || "이름 없는 아이템"}</h3>
        
        {/* item.description을 설명으로 표시합니다. */}
        <p className="card-description">
          {item.description || "아이템에 대한 설명이 없습니다."}
        </p>
      </div>


    </div>
  );
};

export default ContractCard;