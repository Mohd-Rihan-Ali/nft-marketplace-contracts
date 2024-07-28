import { expect } from "chai";
import { ethers } from "hardhat";

describe("Minter", function () {
  let Minter: any;
  let minter: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    Minter = await ethers.getContractFactory("Minter");
    minter = await Minter.deploy(owner.address);
    console.log("Minter deployed to:", minter.address);

    // await minter.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      console.log(minter.address);

      expect(await minter.owner()).to.equal(owner.address);
    });

    it("Should have the correct name and symbol", async function () {
      expect(await minter.name()).to.equal("Islands");
      expect(await minter.symbol()).to.equal("ILDS");
    });
  });

  describe("Minting", function () {
    it("Should mint a token to the given address and set correct token URI", async function () {
      await minter.mint(addr1.address, "https://www.google.com");
      await minter.mint(addr2.address, "https://heimlabs.com");

      expect(await minter.ownerOf(0)).to.equal(addr1.address);
      expect(await minter.tokenURI(0)).to.equal("https://www.google.com");

      expect(await minter.ownerOf(1)).to.equal(addr2.address);
      expect(await minter.tokenURI(1)).to.equal("https://heimlabs.com");
    });

    it("Should set the correct token URI", async function () {
      await minter.mint(addr1.address, "https://www.google.com");

      expect(await minter.tokenURI(0)).to.equal("https://www.google.com");
    });
  });

  describe("Ownership", function () {
    it("Should transfer ownership to the given address", async function () {
      await minter.transferOwnership(addr1.address);

      expect(await minter.owner()).to.equal(addr1.address);
    });

    it("Should allow new owner to mint tokens", async function () {
      await minter.transferOwnership(addr1.address);
      await minter.connect(addr1).mint(addr2.address, "https://www.google.com");

      expect(await minter.ownerOf(0)).to.equal(addr2.address);
      expect(await minter.tokenURI(0)).to.equal("https://www.google.com");
    });
  });

  describe("Transfer", function () {
    it("Listens to Transfer event", async function () {
      await minter.mint(owner.address, "https://www.google.com");
      await expect(minter.transferFrom(owner.address, addr2.address, 0))
        .to.emit(minter, "Transfer")
        .withArgs(owner.address, addr2.address, 0);
    });

    it("Should transfer token from one address to another", async function () {
      await minter.mint(owner.address, "https://www.google.com");
      await minter.transferFrom(owner.address, addr2.address, 0);

      expect(await minter.ownerOf(0)).to.equal(addr2.address);
    });
  });
});
