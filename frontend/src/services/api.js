import axios from 'axios';

export const apiClient = axios.create({
  // 모든 요청은 '/api'로 시작합니다. Vite 프록시 설정과 함께 동작합니다.
  baseURL: '/api', 
});

// 모든 요청 헤더에 JWT 토큰을 추가하는 함수
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Auth token set in apiClient');
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    console.log('Auth token removed from apiClient');
  }
};

// 로그아웃 시 헤더에서 토큰을 명시적으로 제거하는 함수
export const removeAuthToken = () => {
    delete apiClient.defaults.headers.common['Authorization'];
    console.log('Auth token explicitly removed from apiClient by removeAuthToken');
};


// --- API 명세서에 따른 함수 목록 ---

// Auth (인증)
export const registerUser = (userData) => apiClient.post('/users/register', userData);
export const loginUser = (credentials) => apiClient.post('/users/login', credentials);

// --- 1. getMe 함수 제거 ---
// 원인: 현재 API 명세서에 '/api/users/me'가 없어 404 에러를 유발하므로 제거합니다.
// export const getMe = () => apiClient.get('/users/me');

// Image Upload
export const uploadImage = (formData) => apiClient.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Items (애장품)

// --- 2. 전체 아이템 목록을 가져오는 함수 추가 ---
// 용도: '가챠 사용하기' 페이지에서 사용될 모든 아이템 목록을 가져옵니다.
// 백엔드에 GET /api/items 엔드포인트가 구현되어야 합니다.
export const getAllItems = () => apiClient.get('/items');

// 내가 등록한 아이템 목록 조회 (마이페이지 등에서 사용)
export const registerItem = (itemData) => apiClient.post('/items', itemData);
export const getMyRegisteredItems = () => apiClient.get('/items/my');

// Gacha
export const drawGacha = (gachaData) => apiClient.post('/gacha/draw', gachaData);
export const getMyGachaHistory = () => apiClient.get('/gacha/history');

// Shipping & Delivery
export const submitShippingAddress = (shippingData) => apiClient.post('/shippings/address', shippingData);
export const registerTrackingInfo = (deliveryData) => apiClient.post('/delivery/shipping', deliveryData);
export const uploadDeliveryProof = (proofData) => apiClient.post('/delivery/proof', proofData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});