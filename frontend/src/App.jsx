import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import HomePage from './pages/HomePage';
import UploadContractPage from './pages/UploadContractPage';
import UseGachaPage from './pages/UseGachaPage';
import GachaResultModal from './components/GachaResultModal'; // 필요시 App 레벨에서 관리
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';
import ShippingAddressPage from './pages/ShippingAddressPage'; // 추가

import './App.css';

// 인증이 필요한 라우트를 감싸는 컴포넌트
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>; // 또는 스피너
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};


const Layout = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="app-layout">
      <header className="app-header">
        <nav>
          <Link to="/">홈</Link>
          {isAuthenticated && <Link to="/upload">컨트랙트 올리기</Link>}
          <Link to="/gachas">컨트랙트 사용하기</Link>
          {isAuthenticated && <Link to="/mypage">마이페이지</Link>}
        </nav>
        <div className="wallet-info"> {/* 이 부분은 지갑 연결 UI로 유지하거나 사용자 정보와 통합 */}
          {isAuthenticated ? (
            <>
              <span>{user?.username || '사용자'}님</span> {/* user 객체에 username 있다고 가정 */}
              <button onClick={logout} style={{ marginLeft: '10px' }}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: '10px' }}>로그인</Link>
              <Link to="/register">회원가입</Link>
            </>
          )}
        </div>
      </header>
      <main className="app-main">
        {children}
      </main>
      <footer className="app-footer">
        <p>© 2024 Gacha Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

function App() {
  const [showResultModal, setShowResultModal] = useState(false);
  const [gachaResult, setGachaResult] = useState(null); // 예시: { id: 'itemId123', name: '레전더리 검', image: '...', needsShipping: true }

  const handleGachaAttempt = (result) => {
    setGachaResult(result);
    setShowResultModal(true);
  };

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/gachas" element={<UseGachaPage onGachaAttempt={handleGachaAttempt} />} />

          <Route path="/upload" element={
            <ProtectedRoute><UploadContractPage /></ProtectedRoute>
          } />
          <Route path="/mypage" element={
            <ProtectedRoute><MyPage /></ProtectedRoute>
          } />
          <Route path="/shipping/:itemId" element={ // itemId를 URL 파라미터로 전달
            <ProtectedRoute><ShippingAddressPage /></ProtectedRoute>
          } />
          {/* 기타 라우트들 */}
        </Routes>
      </Layout>
      {gachaResult && (
        <GachaResultModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          result={gachaResult}
        />
      )}
    </Router>
  );
}

export default App;