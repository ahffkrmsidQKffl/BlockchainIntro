import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitShippingAddress } from '../services/api'; // api.js에서 가져오기
// import './ShippingAddressPage.css'; // 필요시 CSS 생성

const ShippingAddressPage = () => {
  const { itemId } = useParams(); // URL에서 itemId 가져오기
  const navigate = useNavigate();
  const [addressData, setAddressData] = useState({
    recipientName: '',
    phoneNumber: '',
    address: '',
    detailAddress: '',
    zipCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // API 요청 본문에 itemId 포함 (API 설계에 따라 다를 수 있음)
      await submitShippingAddress({ ...addressData, itemId }); 
      alert('배송지 정보가 성공적으로 제출되었습니다.');
      navigate('/mypage'); // 또는 다른 적절한 페이지로 이동
    } catch (err) {
      setError(err.response?.data?.message || '배송지 제출에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shipping-address-container" style={{maxWidth: '600px', margin: '2rem auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
      <h2>배송지 입력 (상품 ID: {itemId})</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <div>
          <label>수령인 이름:</label>
          <input type="text" name="recipientName" value={addressData.recipientName} onChange={handleChange} required />
        </div>
        <div>
          <label>연락처:</label>
          <input type="tel" name="phoneNumber" value={addressData.phoneNumber} onChange={handleChange} required />
        </div>
        <div>
          <label>우편번호:</label>
          <input type="text" name="zipCode" value={addressData.zipCode} onChange={handleChange} required />
        </div>
        <div>
          <label>주소:</label>
          <input type="text" name="address" value={addressData.address} onChange={handleChange} required />
        </div>
        <div>
          <label>상세주소:</label>
          <input type="text" name="detailAddress" value={addressData.detailAddress} onChange={handleChange} />
        </div>
        <button type="submit" disabled={loading} className="button-primary" style={{marginTop: '1rem'}}>
          {loading ? '제출 중...' : '배송지 제출'}
        </button>
      </form>
    </div>
  );
};

export default ShippingAddressPage;