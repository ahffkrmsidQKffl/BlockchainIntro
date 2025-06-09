import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { setAuthToken, removeAuthToken, loginUser, registerUser } from '../services/api';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwtToken'));
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      setAuthToken(storedToken);
      try {
        const payload = jwtDecode(storedToken);              
        setUser({ id: payload.id, nickname: payload.nickname, email: payload.email });
      } catch {                                         
        console.warn('Invalid JWT – could not decode');
        localStorage.removeItem('jwtToken');
      }
    } else {
      setAuthToken(null);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const { data } = await loginUser(credentials);    // axios 응답
      if (!data.token) throw new Error('로그인 응답에 토큰이 없습니다.');

      localStorage.setItem('jwtToken', data.token);
      setToken(data.token);
      setAuthToken(data.token);

      // 🔥 토큰 디코드 → user 세팅
      const payload = jwtDecode(data.token);
      setUser({ id: payload.id, nickname: payload.nickname, email: payload.email });

      return { token: data.token };                     // 필요하면 호출부에서 이용
    } catch (err) {
      console.error('Login failed:', err.response?.data?.message || err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    const response = await registerUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setToken(null);
    setUser(null);
    removeAuthToken();
    console.log("로그아웃 완료");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);