# 🚀 Sepolia Smart Contract Deployment Guide

This guide will help you deploy your lottery smart contract to the Sepolia testnet and integrate it with your dApp.

## 📋 Prerequisites

1. **MetaMask Wallet** with Sepolia testnet configured
2. **Sepolia ETH** for deployment (get from faucet)
3. **Infura or Alchemy account** for RPC access

## 🛠️ Step 1: Get Sepolia ETH

1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address
3. Request 0.5 ETH (enough for deployment + testing)

## 🔧 Step 2: Set Up Environment

Add these environment variables to your deployment setup:

```bash
# Your wallet private key (NEVER share this!)
export DEPLOYER_PRIVATE_KEY="your_private_key_here"

# Sepolia RPC URL (get from Infura/Alchemy)
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
```

## 📝 Step 3: Deploy Using Remix (Recommended)

### Option A: Remix IDE (Easiest)

1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create new file: `Lottery.sol`
3. Copy the contract code from `contracts/Lottery.sol`
4. Go to "Solidity Compiler" tab
5. Select Solidity version 0.8.19+
6. Click "Compile Lottery.sol"
7. Go to "Deploy & Run Transactions" tab
8. Select "Injected Provider - MetaMask"
9. Choose Sepolia network in MetaMask
10. Click "Deploy"
11. Confirm transaction in MetaMask

### Option B: Hardhat (Advanced)

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat
npx hardhat init

# Copy contract to contracts/ folder
cp contracts/Lottery.sol contracts/

# Create deployment script
# contracts/scripts/deploy.js

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

## 🔗 Step 4: Update Frontend

After deployment, update your contract address:

1. Copy the deployed contract address
2. Update `client/src/lib/lottery-contract.ts`:

```typescript
const CONTRACT_ADDRESSES: Record<string, string> = {
  sepolia: 'YOUR_DEPLOYED_CONTRACT_ADDRESS', // Replace with actual address
  scai: '0x0000000000000000000000000000000000000000'
};
```

## 🧪 Step 5: Test Your Contract

1. Connect MetaMask to your dApp
2. Switch to Sepolia network
3. Try purchasing a ticket
4. Check transaction on [Sepolia Etherscan](https://sepolia.etherscan.io)

## 📊 Contract Features

Your deployed contract includes:

✅ **50 Ticket Lottery System**
✅ **0.01 ETH Ticket Price** 
✅ **24-Hour Rounds**
✅ **Automatic Prize Distribution**
✅ **Winner Selection Algorithm**
✅ **Prize Withdrawal Function**
✅ **Round Management**

## 🔍 Verify Contract (Optional)

1. Go to [Sepolia Etherscan](https://sepolia.etherscan.io)
2. Find your contract address
3. Click "Contract" → "Verify and Publish"
4. Upload source code for transparency

## 🚨 Security Notes

- **NEVER share your private key**
- **Test thoroughly on Sepolia before mainnet**
- **Use a separate wallet for deployment**
- **Keep deployment records safe**

## 🆘 Troubleshooting

### Common Issues:

**❌ "Insufficient funds"**
- Get more Sepolia ETH from faucet

**❌ "Gas estimation failed"**
- Check contract compilation
- Verify network selection

**❌ "Transaction reverted"**
- Check contract logic
- Verify function parameters

### Need Help?

- Check [Remix Documentation](https://remix-ide.readthedocs.io)
- Visit [Sepolia Etherscan](https://sepolia.etherscan.io)
- Test with small amounts first

---

🎉 Once deployed, your lottery dApp will be fully functional on Sepolia testnet with real blockchain transactions!
