import { ethers } from "hardhat";
import { expect } from "chai";

describe("NFTMarketplace", function () {
  let nftMarketplace: any;
  let owner: any;
  let seller: any;
  let buyer: any;
  let minter: any;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    const Minter = await ethers.getContractFactory("Minter");
    minter = await Minter.deploy(owner.address);
    await minter.deployed();

    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy(minter.address);
    await nftMarketplace.deployed();

    await minter.connect(owner).mint(seller.address, "https://google.com");
    await minter.connect(owner).mint(seller.address, "https://heimlabs.com");
    await minter.connect(owner).mint(seller.address, "https://web3.com");
    await minter.connect(seller).approve(nftMarketplace.address, 0);
    await minter.connect(seller).approve(nftMarketplace.address, 1);
  });

  describe("Deployment", function () {
    it("Should have the correct name and symbol", async function () {
      expect(await minter.name()).to.equal("Islands");
      expect(await minter.symbol()).to.equal("ILDS");
    });

    it("Should have the correct approval for the NFTMarketplace", async function () {
      expect(await minter.getApproved(0)).to.equal(nftMarketplace.address);
    });
  });

  describe("listNFT", function () {
    it("should allow owner to list an NFT", async function () {
      await expect(
        nftMarketplace.connect(seller).listNFT(1, ethers.utils.parseEther("1"))
      )
        .to.emit(nftMarketplace, "Listed")
        .withArgs(
          minter.address,
          1,
          seller.address,
          ethers.utils.parseEther("1")
        );

      const listing = await nftMarketplace.getListing(1);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(ethers.utils.parseEther("1"));
    });

    it("Should not allow listing an NFT not owned by the caller", async function () {
      await expect(
        nftMarketplace.connect(buyer).listNFT(0, ethers.utils.parseEther("1"))
      ).to.be.revertedWithCustomError(nftMarketplace, "NotOwner");
    });

    it("Should not allow listing an NFT without marketplace approval", async function () {
      await expect(
        nftMarketplace.connect(seller).listNFT(2, ethers.utils.parseEther("1"))
      ).to.be.revertedWithCustomError(nftMarketplace, "MarketplaceNotApproved");
    });
  });

  describe("buyNFT", function () {
    beforeEach(async function () {
      await nftMarketplace
        .connect(seller)
        .listNFT(0, ethers.utils.parseEther("1"));
    });

    it("Should allow a user to buy a listed NFT", async function () {
      await expect(
        nftMarketplace
          .connect(buyer)
          .buyNFT(0, { value: ethers.utils.parseEther("1") })
      )
        .to.emit(nftMarketplace, "Sale")
        .withArgs(
          minter.address,
          0,
          buyer.address,
          ethers.utils.parseEther("1")
        );

      expect(await minter.ownerOf(0)).to.equal(buyer.address);
    });

    it("Should add the correct amount to the seller's balance", async function () {
      const sellerBalanceBefore = await seller.getBalance();
      await nftMarketplace
        .connect(buyer)
        .buyNFT(0, { value: ethers.utils.parseEther("1") });

      const sellerBalanceAfter = await seller.getBalance();
      expect(sellerBalanceAfter).to.equal(
        sellerBalanceBefore.add(ethers.utils.parseEther("1"))
      );
    });

    it("Should not allow buying an NFT that is not listed", async function () {
      await expect(
        nftMarketplace
          .connect(buyer)
          .buyNFT(1, { value: ethers.utils.parseEther("1") })
      ).to.be.revertedWithCustomError(nftMarketplace, "NFTNotListed");
    });

    it("Should not allow buying an NFT with incorrect value", async function () {
      await expect(
        nftMarketplace
          .connect(buyer)
          .buyNFT(0, { value: ethers.utils.parseEther("0.5") })
      ).to.be.revertedWithCustomError(nftMarketplace, "IncorrectValue");
    });

    it("Should not allow buying an NFT after it has been delisted", async function () {
      await nftMarketplace.connect(seller).cancelListing(0);
      await expect(
        nftMarketplace
          .connect(buyer)
          .buyNFT(0, { value: ethers.utils.parseEther("1") })
      ).to.be.revertedWithCustomError(nftMarketplace, "NFTNotListed");
    });
  });

  describe("cancelListing", function () {
    it("Should allow a user to cancel a listed NFT", async function () {
      await nftMarketplace
        .connect(seller)
        .listNFT(0, ethers.utils.parseEther("1"));

      await expect(nftMarketplace.connect(seller).cancelListing(0))
        .to.emit(nftMarketplace, "ListingCancelled")
        .withArgs(minter.address, 0);
    });

    it("Should not allow canceling a listing for an NFT that is not listed", async function () {
      await expect(
        nftMarketplace.connect(seller).cancelListing(3)
      ).to.be.revertedWithCustomError(nftMarketplace, "NotSeller");
    });

    it("Should not allow a non-seller to cancel a listing", async function () {
      await nftMarketplace
        .connect(seller)
        .listNFT(0, ethers.utils.parseEther("1"));
      await expect(
        nftMarketplace.connect(buyer).cancelListing(0)
      ).to.be.revertedWithCustomError(nftMarketplace, "NotSeller");
    });

    it("Should emit ListingCancelled event on successful cancellation", async function () {
      await nftMarketplace
        .connect(seller)
        .listNFT(0, ethers.utils.parseEther("1"));
      await expect(nftMarketplace.connect(seller).cancelListing(0))
        .to.emit(nftMarketplace, "ListingCancelled")
        .withArgs(minter.address, 0);
    });
  });

  describe("updatePrice", function () {
    it("Should allow the seller to update the price of a listed NFT", async function () {
      await nftMarketplace
        .connect(seller)
        .listNFT(0, ethers.utils.parseEther("1"));

      await expect(
        nftMarketplace
          .connect(seller)
          .updatePrice(0, ethers.utils.parseEther("2"))
      )
        .to.emit(nftMarketplace, "PriceUpdated")
        .withArgs(minter.address, 0, ethers.utils.parseEther("2"));

      const listing = await nftMarketplace.getListing(0);
      expect(listing.price).to.equal(ethers.utils.parseEther("2"));
    });

    it("Should not allow a non-seller to update the price", async function () {
      await nftMarketplace
        .connect(seller)
        .listNFT(0, ethers.utils.parseEther("1"));

      await expect(
        nftMarketplace
          .connect(buyer)
          .updatePrice(0, ethers.utils.parseEther("2"))
      ).to.be.revertedWithCustomError(nftMarketplace, "NotSeller");
    });
  });
});
