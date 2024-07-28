import hre from "hardhat";

async function main() {
  const Minter = await hre.ethers.getContractFactory("Minter");

  const [deployer] = await hre.ethers.getSigners();
  const initialOwner = deployer.address;
  const minter = await Minter.deploy(initialOwner);

  await minter.deployed();

  console.log("Minter deployed to:", minter.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
