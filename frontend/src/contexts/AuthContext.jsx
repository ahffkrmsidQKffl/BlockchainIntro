import React, { createContext, useState, useEffect, useContext } from 'react';
import { setAuthToken, removeAuthToken, loginUser, registerUser, getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwtToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      setToken(storedToken);
      setAuthToken(storedToken); // API 클라이언트 기본 헤더에 토큰 설정

      getMe() // 서버에 사용자 정보 요청 (토큰 기반)
        .then(response => {
          // 서버 응답의 user 객체에는 email이 포함되어야 하며, nickname 등 다른 정보도 있을 수 있음
          setUser(response.data.user || response.data); // 서버 응답 구조에 따라 조정
        })
        .catch((error) => {
          console.error("Failed to fetch user with token:", error);
          logout(); // 토큰은 있지만 사용자 정보를 못 가져오면 로그아웃
        })
        .finally(() => setLoading(false));
    } else {
      setAuthToken(null); // 초기 로드 시 토큰이 없으면 헤더에서 제거
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    // credentials는 이제 { email: '...', password: '...' } 형태를 기대 (LoginPage.jsx 수정에 따름)
    try {
      const response = await loginUser(credentials); // api.js의 loginUser 함수 사용
      
      if (response.data.token) {
        const newToken = response.data.token;
        localStorage.setItem('jwtToken', newToken);
        setToken(newToken);
        setAuthToken(newToken); // API 클라이언트에 새 토큰 설정

        // 로그인 응답에 사용자 정보가 포함되어 있을 경우
        if (response.data.user) {
          // 서버 응답의 user 객체에는 email이 포함되어야 하며, nickname 등 다른 정보도 있을 수 있음
          setUser(response.data.user);
          return response.data.user;
        } else {
          // 로그인 응답에 사용자 정보가 없다면 /users/me를 호출하여 가져옴
          const userResponse = await getMe();
          // 서버 응답의 user 객체에는 email이 포함되어야 하며, nickname 등 다른 정보도 있을 수 있음
          setUser(userResponse.data.user || userResponse.data);
          return userResponse.data.user || userResponse.data;
        }
      } else {
        throw new Error(response.data.message || "로그인 응답에 토큰이 없습니다.");
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
      throw error; // LoginPage에서 에러를 처리하도록 다시 throw
    }
  };

  const register = async (userData) => {
    // userData에는 email, password가 필수로 포함되고, nickname 등 추가 정보가 있을 수 있음
    // (API 명세에 따라 필요한 필드 확인 필요)
    const response = await registerUser(userData);
    return response.data; 
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setToken(null);
    setUser(null);
    removeAuthToken(); // API 클라이언트에서 토큰 제거
    console.log("로그아웃 완료 (토큰 및 사용자 정보 제거)");
    // 필요하다면 로그인 페이지로 리디렉션
    // window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);