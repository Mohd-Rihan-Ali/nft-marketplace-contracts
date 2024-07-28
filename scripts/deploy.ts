import hre, { ethers } from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  if (hre.network.name !== "sepolia") {
    console.log("Deploy script can only be run on the sepolia network");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

  const minterAddress = process.env.MINTER_ADDRESS ?? "";
  if (!ethers.utils.isAddress(minterAddress)) {
    console.log("MINTER_ADDRESS is not a valid address");
    process.exit(1);
  }

  console.log("Minter address:", minterAddress);

  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");

  const gasEstimate = await NFTMarketplace.signer.estimateGas(
    NFTMarketplace.getDeployTransaction(minterAddress)
  );
  const gasPrice = await NFTMarketplace.signer.getGasPrice();
  const deployCost = gasEstimate.mul(gasPrice);

  console.log("Gas estimate:", gasEstimate.toString());
  console.log("Gas price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");
  console.log(
    "Estimated deployment cost:",
    ethers.utils.formatEther(deployCost),
    "ETH"
  );

  if (balance.lt(deployCost)) {
    console.log("Insufficient balance to deploy contract");
    process.exit(1);
  }

  const nftMarketplace = await NFTMarketplace.deploy(minterAddress);
  await nftMarketplace.deployed();

  console.log("NFTMarketplace deployed to:", nftMarketplace.address);
}

main().catch((error) => {
  console.error("Error deploying contracts:", error);
  process.exit(1);
});
