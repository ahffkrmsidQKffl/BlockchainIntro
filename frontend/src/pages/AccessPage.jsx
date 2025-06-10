// frontend/src/pages/AccessPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import GachaNFTArtifact from '../../../solidity/build/contracts/GachaNFT.json';

export default function AccessPage() {
  const { tokenId } = useParams();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed]   = useState(false);
  const [message, setMessage]   = useState('');
  const [recipient, setRecipient] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      if (!window.ethereum) {
        setMessage('MetaMask가 필요합니다.');
        setChecking(false);
        return;
      }
      try {
        // 1) 메타마스크 연결 요청
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer   = await provider.getSigner();
        const userAddr = await signer.getAddress();

        // 2) NFT 컨트랙트 인스턴스
        const nftAddress = "0xD647245c2f45b20b98cb39A3e445f6fA90D3A62c";
        const nft = new ethers.Contract(nftAddress, GachaNFTArtifact.abi, provider);

        // 3) ownerOf 호출로 소유권 확인
        const owner = await nft.ownerOf(tokenId);
        if (owner.toLowerCase() === userAddr.toLowerCase()) {
          setAllowed(true);
        } else {
          setMessage('🔒 접근 권한이 없습니다. 이 토큰의 소유자만 볼 수 있습니다.');
        }
      } catch (err) {
        setMessage(`오류 발생: ${err.message}`);
      } finally {
        setChecking(false);
      }
    })();
  }, [tokenId]);

  if (checking) {
    return <div className="p-4">소유권 확인 중…</div>;
  }
  if (!allowed) {
    return <div className="p-4 text-red-600">{message}</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">환영합니다!</h1>
      <p>토큰 #{tokenId}의 소유자로 확인되었습니다.</p>
      {/* 여기에 실제 콘텐츠나 폼을 추가하세요 */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">배송지 정보 입력</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            // 실제로는 여기서 백엔드로 정보 전송
            setFormSubmitted(true);
          }}
          className="space-y-3"
        >
          <div>
            <label className="block font-medium mb-1">받는 사람 이름</label>
            <input
              className="border rounded p-2 w-full"
              type="text"
              required
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">연락처</label>
            <input
              className="border rounded p-2 w-full"
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">배송지 주소</label>
            <input
              className="border rounded p-2 w-full"
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
          >
            배송지 제출
          </button>
        </form>
        {formSubmitted && (
          <div className="mt-4 text-green-600 font-semibold">
            배송지 정보가 저장되었습니다!
          </div>
        )}
      </div>
    </div>
  );
}
