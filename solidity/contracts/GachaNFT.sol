// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GachaNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId = 0;

    constructor() ERC721("GachaNFT", "GNFT") {
        transferOwnership(msg.sender); // <- 초기 소유권 설정 (레거시 방식)
    }

    function mint(address to, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId;
        nextTokenId++;

        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }
}
