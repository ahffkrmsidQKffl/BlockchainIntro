import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.css'; // LoginPage와 공통으로 사용할 CSS

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '', email: '' }); // 필요에 따라 필드 추가
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // API 명세에는 email이 없지만, 일반적인 회원가입 폼이라 가정
      await register({ username: formData.username, password: formData.password, email: formData.email });
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <p className="error-message">{error}</p>}
        <div>
          <label htmlFor="username">사용자명</label>
          <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="email">이메일 (선택)</label>
          <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="password">비밀번호</label>
          <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit" disabled={loading} className="button-primary">
          {loading ? '가입 중...' : '회원가입'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;