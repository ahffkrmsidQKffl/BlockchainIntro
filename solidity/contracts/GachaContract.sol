// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./GachaNFT.sol";

contract GachaContract {
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

        nft.safeTransferFrom(owner, msg.sender, tokenId);
        return tokenId;
    }

    function getRemaining() public view returns (uint256) {
        return tokenIds.length;
    }
}
