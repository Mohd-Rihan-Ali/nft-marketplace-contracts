# NFT Marketplace Contracts

Welcome to the **NFT Marketplace Contracts** repository, where you'll find the smart contracts powering a decentralized marketplace for NFTs (Non-Fungible Tokens). This project includes two core contracts: `Minter.sol` and `NFTMarketplace.sol`, designed to enable the creation, listing, and trading of NFTs in a seamless and secure manner.

## Table of Contents
- [Overview](#overview)
- [Contracts](#contracts)
  - [Minter.sol](#mintersol)
  - [NFTMarketplace.sol](#nftmarketplacesol)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Deployment](#deployment)
- [Testing](#testing)
- [License](#license)

## Overview

This project encapsulates the core functionality needed for an NFT marketplace, utilizing Solidity smart contracts. The two primary contracts included are:

- **Minter.sol**: Facilitates the minting of new NFTs. It leverages the ERC721 standard to ensure the uniqueness and provenance of each token.
- **NFTMarketplace.sol**: Powers the marketplace where NFTs can be listed for sale, bought, and sold. It provides an essential platform for NFT creators and collectors to engage in decentralized commerce.

## Contracts

### Minter.sol

`Minter.sol` is responsible for minting new NFTs. It uses the [ERC721](https://eips.ethereum.org/EIPS/eip-721) standard from OpenZeppelin, ensuring that each NFT minted is unique and adheres to industry standards. This contract allows users to create their own NFTs with metadata, ready to be listed on the marketplace.

### NFTMarketplace.sol

`NFTMarketplace.sol` is the heart of the NFT trading system. It allows users to list their NFTs for sale, buy listed NFTs, and manage their assets. The contract is designed to ensure secure transactions, providing an open market where creators and collectors can trade with confidence.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Hardhat](https://hardhat.org/)

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/Mohd-Rihan-Ali/nft-marketplace-contracts.git
cd nft-marketplace-contracts
npm install
```

### Deployment

To deploy the contracts to a local or test network, use the following Hardhat commands:

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network <network-name>
```

Replace `<network-name>` with the network you are deploying to (e.g., `sepolia`).

## Testing

This project includes a suite of tests to ensure the contracts perform as expected. To run the tests, use:

```bash
npx hardhat test
```

The tests cover key functionalities such as minting NFTs, listing them on the marketplace, and executing buy and sell transactions.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
