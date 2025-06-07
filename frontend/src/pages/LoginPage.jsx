import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // 경로 확인
import './AuthPage.css'; // RegisterPage와 공통으로 사용할 CSS

const LoginPage = () => {
  // formData의 키를 'nickname'에서 'email'으로 변경하여 API 명세에 맞춤
  const [formData, setFormData] = useState({ email: '', password: '' }); 
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
      // login 함수에 formData (이제 { email, password }) 전달
      await login(formData); 
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) { // 수정된 부분: 화살표(=>) 제거
      // API 에러 응답이 err.response.data.message 에 담겨 올 것을 기대
      setError(err.response?.data?.message || err.message || '로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.');
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
          {/* htmlFor와 label 텍스트, input의 name과 id를 'email'로 변경 */}
          <label htmlFor="email">이메일</label>
          <input 
            type="email" // type을 "email"로 변경하여 기본적인 이메일 형식 검증 활용 가능
            name="email" 
            id="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div>
          <label htmlFor="password">비밀번호</label>
          <input 
            type="password" 
            name="password" 
            id="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
        </div>
        <button type="submit" disabled={loading} className="button-primary">
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;