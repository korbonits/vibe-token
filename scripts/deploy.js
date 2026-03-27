const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const VibeToken = await hre.ethers.getContractFactory("VibeToken");
  const token = await VibeToken.deploy();
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("VibeToken deployed to:", address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
