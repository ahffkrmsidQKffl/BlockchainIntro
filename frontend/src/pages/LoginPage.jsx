import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.css'; // RegisterPage와 공통으로 사용할 CSS

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData);
      const from = location.state?.from?.pathname || '/'; // 이전 페이지 또는 홈으로 리디렉션
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || '로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <p className="error-message">{error}</p>}
        <div>
          <label htmlFor="username">사용자명</label>
          <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="password">비밀번호</label>
          <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit" disabled={loading} className="button-primary">
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;