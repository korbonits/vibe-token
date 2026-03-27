const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VibeToken", function () {
  let token, owner, alice, bob;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();
    const VibeToken = await ethers.getContractFactory("VibeToken");
    token = await VibeToken.deploy();
  });

  it("mints 1,000,000 VIBE to the deployer", async function () {
    const supply = await token.totalSupply();
    const ownerBalance = await token.balanceOf(owner.address);
    expect(ownerBalance).to.equal(supply);
    expect(supply).to.equal(ethers.parseUnits("1000000", 18));
  });

  it("transfers tokens between accounts", async function () {
    await token.transfer(alice.address, ethers.parseUnits("100", 18));
    expect(await token.balanceOf(alice.address)).to.equal(ethers.parseUnits("100", 18));
  });

  it("reverts when sender has insufficient balance", async function () {
    await expect(
      token.connect(alice).transfer(bob.address, 1)
    ).to.be.revertedWith("insufficient balance");
  });

  it("approve allows transferFrom", async function () {
    await token.approve(alice.address, ethers.parseUnits("50", 18));
    await token.connect(alice).transferFrom(owner.address, bob.address, ethers.parseUnits("50", 18));
    expect(await token.balanceOf(bob.address)).to.equal(ethers.parseUnits("50", 18));
  });

  it("transferFrom reverts without approval", async function () {
    await expect(
      token.connect(alice).transferFrom(owner.address, bob.address, 1)
    ).to.be.revertedWith("insufficient allowance");
  });

  it("owner can mint new tokens", async function () {
    await token.mint(alice.address, ethers.parseUnits("500", 18));
    expect(await token.balanceOf(alice.address)).to.equal(ethers.parseUnits("500", 18));
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000500", 18));
  });

  it("non-owner cannot mint", async function () {
    await expect(
      token.connect(alice).mint(alice.address, 1)
    ).to.be.revertedWith("not owner");
  });

  it("anyone can burn their own tokens", async function () {
    await token.transfer(alice.address, ethers.parseUnits("100", 18));
    await token.connect(alice).burn(ethers.parseUnits("100", 18));
    expect(await token.balanceOf(alice.address)).to.equal(0);
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("999900", 18));
  });

  it("burn reverts with insufficient balance", async function () {
    await expect(
      token.connect(alice).burn(1)
    ).to.be.revertedWith("insufficient balance");
  });
});
