import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // CSS 파일 임포트

const HomePage = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">NFT 가챠 플랫폼에 오신 것을 환영합니다!</h1>
      <div className="home-button-container">
        <Link to="/upload" className="home-button">
          가챠 컨트랙트 올리기
        </Link>
        <Link to="/gachas" className="home-button">
          가챠 컨트랙트 사용하기
        </Link>
      </div>
      <div className="home-notice">
        <h2>간단한 공지사항</h2>
        <p>- 모든 NFT 거래는 블록체인 상에서 투명하게 이루어집니다.</p>
        <p>- 가챠 시도 시 소량의 가스비가 발생할 수 있습니다.</p>
        <p>- 본 플랫폼은 데모 목적으로 제작되었습니다.</p>
      </div>
    </div>
  );
};

export default HomePage;