// --- 수정된 UseGachaPage.jsx ---

import React, { useState, useEffect } from 'react';
import ContractCard from '../components/ContractCard'; // 가챠 아이템을 표시할 카드 컴포넌트
import { useAuth } from '../contexts/AuthContext';
import { getAllContractsWithNFTs, drawGacha, sendGachaResultToBackend } from '../services/api'; 
import { ethers } from "ethers";
import GachaContractArtifact  from "../../../solidity/build/contracts/GachaContract.json";
import './UseGachaPage.css';

const UseGachaPage = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false); // 뽑기 동작 중 로딩 상태
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllContractsWithNFTs();
        const grouped = groupByContract(res.data);
        setContracts(grouped);
      } catch (error) {
        console.error("가챠 컨트랙트 목록 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const groupByContract = (data) => {
      const map = {};
      data.forEach(row => {
        const addr = row.contract_address;
        if (!map[addr]) {
          map[addr] = {
            contractId: row.contractId,
            contractAddress: addr,
            createdAt: row.created_at,
            items: []
          };
        }
        map[addr].items.push({
          id: row.nftId,
          tokenId: row.tokenId,
          metadataUri: row.metadata_uri
        });
      });
      return Object.values(map);
    };

  const handleDraw = async (contractAddress) => {
    if (!window.ethereum) {
      alert("메타마스크가 필요합니다.");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, GachaContractArtifact.abi, signer);

      setIsDrawing(true);
      const tx = await contract.draw(); // draw() 실행
      const receipt = await tx.wait();

      // Transfer 이벤트에서 tokenId 파싱
      const transferEvent = receipt.logs.find(log => {
        try {
          return contract.interface.parseLog(log).name === "Transfer";
        } catch (_) {
          return false;
        }
      });

      const parsed = contract.interface.parseLog(transferEvent);
      const tokenId = parsed.args.tokenId.toString();

      alert(`🎉 NFT ${tokenId} 뽑기 성공!`);

      // 백엔드로 결과 전송
      // sendGachaResultToBackend 응답에 result.{itemId, metadataUri}
      const { data } = await sendGachaResultToBackend(contractAddress, tokenId);
      setModalResult({
        id: data.result.itemId,
        name: `NFT #${tokenId}`,
        imageUrl: data.result.metadataUri,
        needsShipping: true
      });

    } catch (err) {
      console.error("뽑기 실패:", err);
      alert("뽑기 트랜잭션 실패");
    } finally {
      setIsDrawing(false);
    }
  };

  return (
    <div className="use-gacha-container">
      <h2>가챠 컨트랙트 목록</h2>

      {contracts.map(contract => (
        <div key={contract.contractAddress} className="gacha-contract-box">
          <h3>📦 컨트랙트 주소: {contract.contractAddress}</h3>
          <p>생성일: {new Date(contract.createdAt).toLocaleString()}</p>

          <div className="contract-items-grid">
            {contract.items.map(item => (
              <ContractCard key={item.tokenId} item={{
                  id: item.id,
                  name: `NFT #${item.tokenId}`,
                  image_url: item.metadataUri
                }} />
            ))}
          </div>

          <button onClick={() => handleDraw(contract.contractAddress)} className="gacha-draw-button" disabled={isDrawing}>
            {isDrawing ? '뽑는 중...' : '이 컨트랙트로 뽑기!'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default UseGachaPage;