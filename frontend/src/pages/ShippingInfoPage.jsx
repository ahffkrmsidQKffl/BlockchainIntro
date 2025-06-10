// frontend/src/pages/ShippingInfoPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import GachaNFTArtifact from '../../../solidity/build/contracts/GachaNFT.json';

export default function ShippingInfoPage() {
  const [allowed, setAllowed]   = useState(false);
  const [checking, setChecking] = useState(true);
  const [form, setForm]         = useState({ receiverName: '', receiverAddr: '' });
  const [message, setMessage]   = useState('');

  // URL 쿼리에서 contract, tokenId 가져오기
  const params = new URLSearchParams(useLocation().search);
  const contractAddress = params.get('contract');
  const tokenId         = params.get('tokenId');

  useEffect(() => {
    (async () => {
      if (!contractAddress || !tokenId) {
        setMessage('❗ contract 주소와 tokenId를 URL 쿼리에 담아주세요.');
        setChecking(false);
        return;
      }
      try {
        // 1) 메타마스크 연결
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const userAddr = await signer.getAddress();

        // 2) NFT 소유권 확인
        const nft = new ethers.Contract(contractAddress, GachaNFTArtifact.abi, provider);
        const owner = await nft.ownerOf(tokenId);
        if (owner.toLowerCase() === userAddr.toLowerCase()) {
          setAllowed(true);
        } else {
          setMessage('🔒 이 NFT의 소유자만 접근할 수 있습니다.');
        }
      } catch (err) {
        setMessage(`오류 발생: ${err.message}`);
      } finally {
        setChecking(false);
      }
    })();
  }, [contractAddress, tokenId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // 데모용으로는 alert만
    alert(`실물 신청 완료!\n이름: ${form.receiverName}\n주소: ${form.receiverAddr}`);
  };

  if (checking) {
    return <div className="p-4">소유권 확인 중…</div>;
  }
  if (!allowed) {
    return <div className="p-4 text-red-600">{message}</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">실물 정보 입력 (토큰 게이팅)</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">받는 분 이름</label>
          <input
            name="receiverName"
            value={form.receiverName}
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
          className="w-full py-2 bg-blue-600 text-white rounded"
        >
          제출하기
        </button>
      </form>
    </div>
  );
}
