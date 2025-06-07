import axios from 'axios';

export const apiClient = axios.create({
  // 이제 모든 요청은 '/api'로 시작하게 됩니다. (예: /api/users/login)
  baseURL: '/api', 
});

// 이 함수는 토큰이 있을 때 모든 요청 헤더에 자동으로 토큰을 추가해줍니다.
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Auth token set in apiClient');
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    console.log('Auth token removed from apiClient');
  }
};

// 로그아웃 시 헤더에서 토큰을 명시적으로 제거합니다.
export const removeAuthToken = () => {
    delete apiClient.defaults.headers.common['Authorization'];
    console.log('Auth token explicitly removed from apiClient by removeAuthToken');
};


// --- API 명세서에 따른 함수 목록 ---

// Auth (인증)
export const registerUser = (userData) => apiClient.post('/users/register', userData);
export const loginUser = (credentials) => apiClient.post('/users/login', credentials);

// 사용자 정보 가져오기 (인증 필요)
// 참고: 이 엔드포인트는 명세서에 명시되지 않았지만,
// JWT 인증 시스템에서 사용자 정보를 가져오는 표준적인 방법이므로 그대로 둡니다.
// 백엔드에 /api/users/me 엔드포인트가 구현되어 있어야 합니다.
export const getMe = () => apiClient.get('/users/me');

// Image Upload
export const uploadImage = (formData) => apiClient.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Items (애장품)
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