// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Minter is ERC721URIStorage, Ownable {
    constructor(address initialOwner) ERC721("Islands", "ILDS") Ownable(initialOwner) {}


    event Minted(address indexed contractAddress, uint256 indexed tokenId);

    uint256 private _tokenId = 0;

    function mint(address _to, string calldata _uri) public {
        _mint(_to, _tokenId);
        _setTokenURI(_tokenId, _uri);

        emit Minted(msg.sender, _tokenId);

        _tokenId++;
    }
}
