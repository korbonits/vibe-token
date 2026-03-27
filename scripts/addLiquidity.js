const hre = require("hardhat");
const { ethers } = hre;

// Uniswap v3 on Sepolia
const WETH_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
const VIBE_ADDRESS = "0x2B2FD8fDdcca4247a1f0370c0F26Dae91648d2F1";
const POSITION_MANAGER_ADDRESS = "0x1238536071E1c677A632429e3655c799b22cDA52";

const FEE = 3000; // 0.3% fee tier

// Full range ticks for fee tier 3000 (tick spacing = 60)
const TICK_LOWER = -887220;
const TICK_UPPER = 887220;

// How much liquidity to seed
const WETH_AMOUNT = ethers.parseEther("0.005");         // 0.005 WETH
const VIBE_AMOUNT = ethers.parseUnits("5000", 18);      // 5,000 VIBE → price: 1 WETH = 1,000,000 VIBE

const WETH_ABI = [
  "function deposit() payable",
  "function approve(address, uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
];

const ERC20_ABI = [
  "function approve(address, uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
];

// NonfungiblePositionManager — createAndInitializePoolIfNecessary + mint
const POSITION_MANAGER_ABI = [
  "function createAndInitializePoolIfNecessary(address token0, address token1, uint24 fee, uint160 sqrtPriceX96) external payable returns (address pool)",
  "function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
];

// BigInt square root (Newton's method)
function sqrtBigInt(n) {
  if (n === 0n) return 0n;
  let x = BigInt(Math.ceil(Math.sqrt(Number(n))));
  while (true) {
    const x1 = (x + n / x) / 2n;
    if (x1 >= x) return x;
    x = x1;
  }
}

// sqrtPriceX96 = sqrt(token1/token0) * 2^96
// Both tokens have 18 decimals, so the decimal factors cancel.
// We want: 1 WETH = 1,000,000 VIBE
// Expressed as token1/token0 depending on which is token0 (lower address wins).
function computeSqrtPriceX96(token0, wethAddr) {
  const Q96 = 2n ** 96n;
  // If WETH is token0: price = VIBE/WETH = 1,000,000
  // If VIBE is token0: price = WETH/VIBE = 1/1,000,000
  if (token0.toLowerCase() === wethAddr.toLowerCase()) {
    // price = 1,000,000 → sqrtPrice = 1000
    return 1000n * Q96;
  } else {
    // price = 0.000001 → sqrtPrice = 1/1000
    // Use sqrt(1 * 2^192 / 1_000_000) to avoid fractions
    return sqrtBigInt(Q96 * Q96 / 1_000_000n);
  }
}

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Account:", signer.address);

  // Determine token ordering (Uniswap requires token0 < token1 by address)
  const [token0, token1, amount0, amount1] =
    WETH_ADDRESS.toLowerCase() < VIBE_ADDRESS.toLowerCase()
      ? [WETH_ADDRESS, VIBE_ADDRESS, WETH_AMOUNT, VIBE_AMOUNT]
      : [VIBE_ADDRESS, WETH_ADDRESS, VIBE_AMOUNT, WETH_AMOUNT];

  console.log("token0:", token0);
  console.log("token1:", token1);

  // Step 1: Wrap ETH → WETH
  console.log("\n1. Wrapping ETH → WETH...");
  const weth = new ethers.Contract(WETH_ADDRESS, WETH_ABI, signer);
  await (await weth.deposit({ value: WETH_AMOUNT })).wait();
  console.log("   WETH balance:", ethers.formatEther(await weth.balanceOf(signer.address)));

  // Step 2: Approve position manager to spend both tokens
  console.log("\n2. Approving tokens...");
  const vibe = new ethers.Contract(VIBE_ADDRESS, ERC20_ABI, signer);
  await (await weth.approve(POSITION_MANAGER_ADDRESS, WETH_AMOUNT)).wait();
  await (await vibe.approve(POSITION_MANAGER_ADDRESS, VIBE_AMOUNT)).wait();
  console.log("   Approved.");

  // Step 3: Create pool (if needed) and initialize with starting price
  const sqrtPriceX96 = computeSqrtPriceX96(token0, WETH_ADDRESS);
  console.log("\n3. Creating/initializing pool...");
  console.log("   sqrtPriceX96:", sqrtPriceX96.toString());

  const positionManager = new ethers.Contract(POSITION_MANAGER_ADDRESS, POSITION_MANAGER_ABI, signer);
  await (await positionManager.createAndInitializePoolIfNecessary(
    token0, token1, FEE, sqrtPriceX96
  )).wait();
  console.log("   Pool ready.");

  // Step 4: Add liquidity
  console.log("\n4. Adding liquidity...");
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  const tx = await positionManager.mint({
    token0,
    token1,
    fee: FEE,
    tickLower: TICK_LOWER,
    tickUpper: TICK_UPPER,
    amount0Desired: amount0,
    amount1Desired: amount1,
    amount0Min: 0,
    amount1Min: 0,
    recipient: signer.address,
    deadline,
  });

  const receipt = await tx.wait();
  console.log("   Liquidity added! tx:", receipt.hash);
  console.log("\nDone. You can now swap VIBE ↔ WETH on Uniswap Sepolia.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
