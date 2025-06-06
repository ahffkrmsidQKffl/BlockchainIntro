import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api', // package.json에 proxy 설정 ("proxy": "http://localhost:5000" 등) 또는 실제 백엔드 주소
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const removeAuthToken = () => {
    delete apiClient.defaults.headers.common['Authorization'];
};


// Auth (인증 불필요)
export const registerUser = (userData) => apiClient.post('/users/register', userData);
export const loginUser = (credentials) => apiClient.post('/users/login', credentials);
// (참고) /api/users/me 와 같은 엔드포인트가 있다면 토큰으로 사용자 정보 가져오는 데 사용 가능

// Image Upload (명세상 인증 불필요)
export const uploadImage = (formData) => apiClient.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Items (애장품) - 인증 필요
export const registerItem = (itemData) => apiClient.post('/items', itemData);
export const getMyRegisteredItems = () => apiClient.get('/items/my');

// Gacha - 인증 필요
export const drawGacha = (gachaData) => apiClient.post('/gacha/draw', gachaData);
export const getMyGachaHistory = () => apiClient.get('/gacha/history');

// Shipping - 인증 필요
export const submitShippingAddress = (shippingData) => apiClient.post('/shippings/address', shippingData);
export const registerTrackingInfo = (deliveryData) => apiClient.post('/delivery/shipping', deliveryData);
export const uploadDeliveryProof = (proofData) => apiClient.post('/delivery/proof', proofData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// 추가: 가챠 컨트랙트 목록 조회 API (명세에 없지만 필요할 수 있음)
// export const getGachaContracts = () => apiClient.get('/gachas');