// frontend/src/pages/ShippingAddressPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  getShippingInfo,        // GET /api/shipping/info/:infoId?tokenId=…
  confirmShippingInfo     // POST /api/shipping/info/:infoId/confirm
} from '../services/api';

export default function ShippingAddressPage() {
  const { infoId } = useParams();
  const location  = useLocation();
  const navigate  = useNavigate();

  const [info, setInfo]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [form, setForm]             = useState({
    receiverName: '',
    receiverTel:  '',
    receiverAddr: ''
  });

  // 1) 페이지 로드될 때 배송 정보(GET) 호출
  useEffect(() => {
    const tokenId = new URLSearchParams(location.search).get('tokenId');
    if (!tokenId) {
      setError(new Error('tokenId가 URL에 없습니다.'));
      setLoading(false);
      return;
    }

    getShippingInfo(infoId, tokenId)
      .then(res => {
        setInfo(res.data);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [infoId, location.search]);

  // 2) 입력값 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // 3) 폼 제출 시 POST 호출
  const handleSubmit = async (e) => {
    e.preventDefault();
    const tokenId = new URLSearchParams(location.search).get('tokenId');

    try {
      const res = await confirmShippingInfo(infoId, {
        tokenId,
        receiverName: form.receiverName,
        receiverTel:  form.receiverTel,
        receiverAddr: form.receiverAddr
      });
      alert(`운송장 번호 발급 완료: ${res.data.waybillNo}`);
      // 완료 후 마이페이지나 메인으로 이동
      navigate('/my-page');
    } catch (err) {
      alert(`배송 정보 등록 실패: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error)   return <div>에러 발생: {error.message}</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">배송 정보 입력</h1>
      {/* 배송 조건 요약 */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <p><strong>아이템 ID:</strong> {info.item_id}</p>
        <p><strong>배송 조건:</strong> 무게 {info.conditions.weight}kg, 부피 {info.conditions.volume}m³</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">받는 사람 이름</label>
          <input
            type="text"
            name="receiverName"
            value={form.receiverName}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">전화번호</label>
          <input
            type="tel"
            name="receiverTel"
            value={form.receiverTel}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">주소</label>
          <textarea
            name="receiverAddr"
            value={form.receiverAddr}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          배송 요청
        </button>
      </form>
    </div>
  );
}
