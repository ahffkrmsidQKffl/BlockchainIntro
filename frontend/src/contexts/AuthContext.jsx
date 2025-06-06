import React, { createContext, useState, useEffect, useContext } from 'react';
// import { apiClient, setAuthToken, removeAuthToken } from '../services/api'; // 실제 API 사용 시 주석 해제

// --- 임시 API 클라이언트 및 함수 (실제 API 사용 시 삭제 또는 주석) ---
const fakeApiClient = {
  post: async (url, data) => {
    console.log(`[FAKE API POST] URL: ${url}, Data:`, data);
    if (url === '/users/login') {
      if (data.username === 'testuser' && data.password === 'password') {
        return Promise.resolve({ data: { token: 'fake-jwt-token', user: { id: '1', username: 'testuser', email: 'test@example.com' } } });
      } else {
        return Promise.reject({ response: { data: { message: '아이디 또는 비밀번호가 일치하지 않습니다 (임시 로그인)' } } });
      }
    }
    if (url === '/users/register') {
        return Promise.resolve({ data: { message: '임시 회원가입 성공' } });
    }
    return Promise.reject({ response: { data: { message: '알 수 없는 임시 API 요청' } } });
  },
  get: async (url) => {
    console.log(`[FAKE API GET] URL: ${url}`);
    if (url === '/users/me') {
        // 실제로는 토큰을 검증하고 사용자 정보를 반환해야 함
        // 여기서는 로그인 시 설정된 사용자 정보를 반환한다고 가정
        const storedToken = localStorage.getItem('jwtToken');
        if (storedToken === 'fake-jwt-token') {
            return Promise.resolve({ data: { user: { id: '1', username: 'testuser', email: 'test@example.com' } } });
        } else {
            return Promise.reject({ response: { data: { message: '유효하지 않은 토큰 (임시)'}}});
        }
    }
    return Promise.reject({ response: { data: { message: '알 수 없는 임시 API GET 요청' } } });
  }
};
const apiClient = fakeApiClient; // 실제 API 대신 임시 클라이언트 사용

const setAuthToken = (token) => {
  console.log('[FAKE setAuthToken] Token:', token);
  // 실제 API 클라이언트가 있다면 여기에 설정 로직 추가
  // 예: apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};
const removeAuthToken = () => {
  console.log('[FAKE removeAuthToken]');
  // 실제 API 클라이언트가 있다면 여기에 제거 로직 추가
  // 예: delete apiClient.defaults.headers.common['Authorization'];
};
// --- 임시 API 클라이언트 및 함수 종료 ---


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwtToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      setToken(storedToken);
      setAuthToken(storedToken);

      // 임시: 토큰이 있으면 '/users/me'를 호출하여 사용자 정보를 가져온다고 가정
      apiClient.get('/users/me')
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          logout(); // 토큰은 있지만 사용자 정보를 못 가져오면 로그아웃
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    // --- 실제 API 호출 로직 (주석 처리) ---
    /*
    const response = await apiClient.post('/users/login', credentials);
    if (response.data.token) {
      const newToken = response.data.token;
      localStorage.setItem('jwtToken', newToken);
      setToken(newToken);
      setAuthToken(newToken);
      const userResponse = await apiClient.get('/users/me');
      setUser(userResponse.data.user);
      return userResponse.data.user;
    }
    throw new Error(response.data.message || "로그인 실패");
    */

    // --- 임시 로컬 로그인 로직 ---
    console.log("임시 로그인 시도:", credentials);
    if (credentials.username === 'testuser' && credentials.password === 'password') {
      const fakeToken = 'fake-jwt-token';
      const fakeUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        // 필요한 다른 사용자 정보 추가
      };

      localStorage.setItem('jwtToken', fakeToken);
      setToken(fakeToken);
      setUser(fakeUser);
      setAuthToken(fakeToken); // 가짜 setAuthToken 호출 (실제 API 클라이언트 연동 시 필요)
      console.log("임시 로그인 성공:", fakeUser);
      return fakeUser; // 성공 시 사용자 객체 반환
    } else {
      console.error("임시 로그인 실패: 아이디 또는 비밀번호 불일치");
      throw new Error("아이디 또는 비밀번호가 일치하지 않습니다 (임시 로그인).");
    }
    // --- 임시 로컬 로그인 로직 종료 ---
  };

  const register = async (userData) => {
    // --- 실제 API 호출 로직 (주석 처리) ---
    /*
    const response = await apiClient.post('/users/register', userData);
    return response.data;
    */

    // --- 임시 로컬 회원가입 로직 ---
    console.log("임시 회원가입 시도:", userData);
    // 여기서는 별다른 처리 없이 성공 메시지만 반환 (실제 사용자 생성 안 함)
    return { message: "임시 회원가입 성공! (실제 데이터 저장 안됨)" };
    // --- 임시 로컬 회원가입 로직 종료 ---
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setToken(null);
    setUser(null);
    removeAuthToken(); // 가짜 removeAuthToken 호출
    console.log("로그아웃 완료 (토큰 및 사용자 정보 제거)");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);