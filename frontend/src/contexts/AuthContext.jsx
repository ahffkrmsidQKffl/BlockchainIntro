import React, { createContext, useState, useEffect, useContext } from 'react';

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
      setLoading(false);
    } else {
      setAuthToken(null);
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      console.log('서버 응답 데이터:', response.data); 

      // --- 여기가 핵심 수정 부분 ---
      // 서버 응답에 user 객체는 없지만, token은 있으므로 token만 확인합니다.
      if (response.data.token) {
        const newToken = response.data.token;

        localStorage.setItem('jwtToken', newToken);
        setToken(newToken);
        setAuthToken(newToken);

        // ※ 중요: 서버가 사용자 정보를 주지 않으므로, user 상태는 여기서 설정할 수 없습니다.
        // 이로 인해 로그인 직후 헤더에 사용자 이름이 표시되지 않을 수 있습니다.
        // setUser(null); // 또는 그대로 둠

        // token만 반환합니다. user 데이터가 없기 때문입니다.
        return { token: newToken }; 
      } else {
        // 응답에 토큰조차 없는 경우
        throw new Error("로그인 응답에 토큰이 없습니다.");
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
      throw error;
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