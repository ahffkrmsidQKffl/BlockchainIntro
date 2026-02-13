// --- 수정된 api.js ---

import axios from 'axios';

// 1. axios 인스턴스를 apiClient로 명명하여 일관성 유지
export const apiClient = axios.create({
  // Vite 프록시 설정을 통해 '/api' 요청이 백엔드 서버로 전달됩니다.
  baseURL: '/api', 
  // 타임아웃을 설정하여 무한정 기다리는 것을 방지합니다. (예: 10초)
  timeout: 10000, 
});

// 모든 요청에 인증 토큰을 자동으로 포함시키는 인터셉터(interceptor) 사용을 권장하지만,
// 기존 방식을 유지하며 로그를 더 명확하게 수정합니다.
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

// --- API 함수 목록 (기존과 동일하며, 명확한 구조를 가짐) ---

// Auth (인증)
export const registerUser = (userData) => apiClient.post('/users/register', userData);
export const loginUser = (credentials) => apiClient.post('/users/login', credentials);

// Image Upload
export const uploadImage = (formData) => apiClient.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Items (애장품)
export const getAllItems = () => apiClient.get('/items');
export const registerItem = (itemData) => apiClient.post('/items', itemData);
export const getMyRegisteredItems = () => apiClient.get('/items/my');

// Gacha (가챠)
export const drawGacha = (gachaData) => apiClient.post('/gacha/draw', gachaData);
export const getMyGachaHistory = () => apiClient.get('/gacha/history'); // 500 에러가 발생하는 API
export const getAllGachaContracts = () => apiClient.get('/gacha/contracts');
export const sendGachaResultToBackend = (contractAddress, tokenId) =>
  axios.post('/api/gacha/result', { contractAddress, tokenId });

// Shipping & Delivery (배송)
export const submitShippingAddress = (shippingData) => apiClient.post('/shippings/address', shippingData);
export const registerTrackingInfo = (deliveryData) => apiClient.post('/delivery/shipping', deliveryData);
export const uploadDeliveryProof = (proofData) => apiClient.post('/delivery/proof', proofData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

//NFT 
export const getAllContractsWithNFTs = () => 
  apiClient.get('/nft/contracts-with-nfts').then(res => res.data);