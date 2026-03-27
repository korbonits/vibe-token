# vibe-token

A minimal ERC-20 token deployed to the Ethereum Sepolia testnet. Built from scratch to understand how smart contracts work — no OpenZeppelin, no abstractions.

**Contract address (Sepolia):** `0x4d5007d5717795331E8b21B3cd584F7BfE505926`

## Token

- **Name:** VibeToken
- **Symbol:** VIBE
- **Decimals:** 18
- **Supply:** 1,000,000 VIBE (minted to deployer)
- **Features:** transfer, approve/transferFrom, mint (owner-only), burn

## Setup

```bash
npm install
cp .env.example .env
# Fill in SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY
```

> On macOS with Node.js 25, add this to your shell profile to fix TLS cert issues:
> `export NODE_EXTRA_CA_CERTS=/etc/ssl/cert.pem`

## Usage

```bash
# Compile
npx hardhat compile

# Test
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia <deployed-address>
```

## Project structure

```
contracts/VibeToken.sol   # ERC-20 contract
scripts/deploy.js         # Deployment script
test/VibeToken.test.js    # Test suite (9 tests)
hardhat.config.js         # Hardhat config
```
