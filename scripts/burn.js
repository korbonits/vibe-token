const hre = require("hardhat");
const { ethers } = hre;

const ADDRESSES = {
  sepolia: "0x2B2FD8fDdcca4247a1f0370c0F26Dae91648d2F1",
  mainnet: "0x4d5007d5717795331e8b21b3cd584f7bfe505926",
};

const ABI = [
  "function burn(uint256 amount) public",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];

async function main() {
  const network = hre.network.name;
  const address = ADDRESSES[network];
  if (!address) throw new Error(`Unsupported network: ${network}`);

  // Amount in whole VIBE tokens — change as needed
  const AMOUNT = ethers.parseUnits("1000", 18);

  const [signer] = await ethers.getSigners();
  const token = new ethers.Contract(address, ABI, signer);

  const supplyBefore = await token.totalSupply();
  const balanceBefore = await token.balanceOf(signer.address);
  console.log("Total supply before:", ethers.formatUnits(supplyBefore, 18), "VIBE");
  console.log("Your balance before:", ethers.formatUnits(balanceBefore, 18), "VIBE");

  console.log(`Burning ${ethers.formatUnits(AMOUNT, 18)} VIBE from ${signer.address}...`);
  const tx = await token.burn(AMOUNT);
  await tx.wait();
  console.log("tx:", tx.hash);

  const supplyAfter = await token.totalSupply();
  console.log("Total supply after: ", ethers.formatUnits(supplyAfter, 18), "VIBE");
  console.log("Your balance after: ", ethers.formatUnits(await token.balanceOf(signer.address), 18), "VIBE");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
