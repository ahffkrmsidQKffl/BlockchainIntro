// --- 수정된 UseGachaPage.jsx ---

import React, { useState, useEffect } from 'react';
import ContractCard from '../components/ContractCard'; // 가챠 아이템을 표시할 카드 컴포넌트
import { useAuth } from '../contexts/AuthContext';
import { getAllContractsWithNFTs, drawGacha, sendGachaResultToBackend } from '../services/api'; 
import { ethers } from "ethers";
import GachaContractArtifact  from "../../../solidity/build/contracts/GachaContract.json";
import GachaNFTArtifact       from "../../../solidity/build/contracts/GachaNFT.json";
import './UseGachaPage.css';

const UseGachaPage = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false); // 뽑기 동작 중 로딩 상태
  const [contracts, setContracts] = useState([]);
  const [modalResult, setModalResult]   = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllContractsWithNFTs();
        const grouped = groupByContract(res.data);
        setContracts(grouped);
        console.log("📦 서버 응답 데이터:", res.data);
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
          tokenId: row.token_id,
          metadataUri: row.metadata_uri,
          description: row.description || ''
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

      // --- NFT 전용 인터페이스로 Transfer 이벤트만 골라 파싱 ---
      const nftInterface = new ethers.Interface(GachaNFTArtifact.abi);
      // 배포할 때 받은 NFT 컨트랙트 주소를 환경변수 등에서 가져오세요.
      const nftAddress   = "0xD647245c2f45b20b98cb39A3e445f6fA90D3A62c"; // ✅ 실제 gachaNFT 배포 주소 입력
      
      const transferLog = receipt.logs.find(log =>
        log.address.toLowerCase() === nftAddress.toLowerCase()
      );
      if (!transferLog) {
        throw new Error("NFT Transfer 이벤트를 찾을 수 없습니다.");
      }
      const parsed = nftInterface.parseLog(transferLog);
      const tokenId = parsed.args.tokenId.toString();
      alert(`🎉 NFT ${tokenId} 뽑기 성공!`);

      // 1) 백엔드로 결과 전송
      // sendGachaResultToBackend 응답에 result.{itemId, metadataUri}
      const { data } = await sendGachaResultToBackend(contractAddress, tokenId);

      /* 2) MetaMask 지갑에 NFT 팝업 추가 -------------------- */
      // try {
      //   await window.ethereum.request({
      //     method: "wallet_watchAsset",
      //     params: {
      //       type: "ERC721",
      //       options: {
      //         address: nftAddress,
      //         tokenId: tokenId
      //       }
      //     }
      //   });
      //   console.log(`NFT #${tokenId} 추가 요청 완료`);
      // } catch (e) {
      //   console.warn("사용자가 NFT 추가를 취소했습니다.", e);
      // }

      // 3) 모달에 뽑기 결과 표시
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
                  image_url: item.metadataUri,
                  description: item.description || '이 아이템에 대한 설명이 없습니다.'
                }} />
            ))}
          </div>

          <button onClick={() => handleDraw(contract.contractAddress)} className="gacha-draw-button" disabled={isDrawing}>
            {isDrawing ? '뽑는 중...' : '이 컨트랙트로 뽑기!'}
          </button>
        </div>
      ))}
      {modalResult && (
        <YourModalComponent
          title={modalResult.name}
          imageUrl={modalResult.imageUrl}
          onClose={() => setModalResult(null)}
        >
          {/* 배송 정보 등록 등 추가 UI */}  
        </YourModalComponent>
      )}
    </div>
  );
};

export default UseGachaPage;