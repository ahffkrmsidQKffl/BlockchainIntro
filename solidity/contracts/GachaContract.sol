// SPDX-License-Identifier: MIT

// gachaNFT는 수정하면 vsc 상에서 컴파일 및 최초 배포(1회)를 실행한 뒤 해당 주소를 저장해야 그걸 관리자가 민팅 시마다 사용할 수 있게 됨
// 반면 gachaContrace의 배포 시점은 사용자들이 웹페이지에서 생성 버튼을 누를 때마다임 즉 코드를 수정해도 vsc 상에서 뭐 할 게 없음
// 백엔드에 배포 로직이 알아서 구현되어있음(로컬의 bytecode를 읽고 알아서 deploy)


pragma solidity ^0.8.13;

import "./GachaNFT.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract GachaContract is ERC721Holder {
    address public owner;
    GachaNFT public nft;
    uint256[] public tokenIds;

    constructor(address _nftAddress, uint256[] memory _tokenIds) {
        owner = msg.sender;
        nft = GachaNFT(_nftAddress);
        tokenIds = _tokenIds;
    }

    function draw() public returns (uint256) {
        require(tokenIds.length > 0, "No items left");

        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.number))) % tokenIds.length;
        uint256 tokenId = tokenIds[random];

        tokenIds[random] = tokenIds[tokenIds.length - 1];
        tokenIds.pop();

        nft.safeTransferFrom(address(this), msg.sender, tokenId);
        return tokenId;
    }

    function setTokenIds(uint256[] memory _ids) external {
        require(tokenIds.length == 0, "Already set");
        tokenIds = _ids;
    }

    function getRemaining() public view returns (uint256) {
        return tokenIds.length;
    }
}
