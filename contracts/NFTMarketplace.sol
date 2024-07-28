// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";



error NotOwner();
error MarketplaceNotApproved();
error NFTNotListed();
error IncorrectValue();
error NotSeller();

contract NFTMarketplace is ReentrancyGuard {
    address private contractAddress;

    constructor(address _contractAddress) {
        contractAddress = _contractAddress;
    }

    struct Listing {
        address seller;
        uint256 price;
    } 

    mapping(uint256 => Listing) private listings;

    event Listed(address indexed contractAddress, uint256 indexed tokenId, address indexed seller, uint256 price);
    event Sale(address indexed contractAddress, uint256 indexed tokenId, address indexed buyer, uint256 price);
    event ListingCancelled(address indexed contractAddress, uint256 indexed tokenId);
    event PriceUpdated(address indexed contractAddress, uint256 indexed tokenId, uint256 newPrice);

    // List an NFT for sale
    function listNFT(uint256 tokenId, uint256 price) external {
        IERC721 nft = IERC721(contractAddress);

        if (nft.ownerOf(tokenId) != msg.sender) revert NotOwner();
        if (nft.getApproved(tokenId) != address(this) && !nft.isApprovedForAll(msg.sender, address(this))) revert MarketplaceNotApproved();

        listings[tokenId] = Listing(msg.sender, price);

        emit Listed(contractAddress, tokenId, msg.sender, price);
    }

    // Buy an NFT
    function buyNFT(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        IERC721 nft = IERC721(contractAddress);

        if (listing.price == 0) revert NFTNotListed();
        if (msg.value != listing.price) revert IncorrectValue();

        (bool sent, ) = listing.seller.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        nft.transferFrom(listing.seller, msg.sender, tokenId);

        delete listings[tokenId];

        emit Sale(contractAddress, tokenId, msg.sender, listing.price);
    }

    // Cancel a listing
    function cancelListing(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        if (listing.seller != msg.sender) revert NotSeller();
    
        delete listings[tokenId];
    
        emit ListingCancelled(contractAddress, tokenId);
    }

    // Update the price of a listing
    function updatePrice(uint256 tokenId, uint256 newPrice) external {
        Listing storage listing = listings[tokenId];
        if (listing.seller != msg.sender) revert NotSeller();

        listing.price = newPrice;

        emit PriceUpdated(contractAddress, tokenId, newPrice);
    }

    // Get the listing for an NFT
    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }
}
