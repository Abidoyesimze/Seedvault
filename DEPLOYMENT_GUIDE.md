# Mainnet Deployment Guide

## Prerequisites

1. **Environment Variables** - Create a `.env` file in `smartcontract/` directory:

```bash
# Required for verifier deployment
CELO_MAINNET_PRIVATE_KEY=your_private_key_here
CELO_MAINNET_RPC_URL=https://forno.celo.org  # Optional, has default

# Optional - will use defaults if not set
SELF_HUB_V2=0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF
SELF_SCOPE_SEED=seedvault
SELF_MIN_AGE=18
SELF_OFAC_ENABLED=true
SELF_FORBIDDEN_COUNTRIES=CUB,IRN,PRK,RUS

# Required for vault deployment (set after verifier is deployed)
VERIFIER_ADDRESS=0x...  # From verifier deployment

# Optional - will use defaults if not set
ASSET_ADDRESS=0x765DE816845861e75A25fCA122bb6898B8B1282a  # cUSD
ATOKEN_ADDRESS=0xBba98352628B0B0c4b40583F593fFCb630935a45  # acUSD
AAVE_PROVIDER_ADDRESS=0x9F7Cf9417D5251C59fE94fB9147feEe1aAd9Cea5
MAX_USER_DEPOSIT=10000  # 10,000 cUSD
MAX_TOTAL_DEPOSIT=1000000  # 1,000,000 cUSD
REBALANCER_ADDRESS=0x...  # Optional, defaults to deployer
AUTHORIZE_VAULT=true  # Default true, set to false to skip authorization
```

2. **Fund your deployer wallet** with CELO for gas fees

3. **Compile contracts**:
```bash
cd smartcontract
pnpm exec hardhat compile
```

## Deployment Steps

### Step 1: Deploy SelfProtocolVerifier

```bash
cd smartcontract
pnpm exec hardhat run scripts/deploy-verifier.ts --network celoMainnet
```

**Output will show:**
- Verifier contract address
- Environment variable to set for next step

**Save the verifier address** - you'll need it for vault deployment.

### Step 2: Deploy SeedVault

1. **Set the verifier address** in your `.env`:
```bash
VERIFIER_ADDRESS=0x...  # From Step 1
```

2. **Deploy the vault**:
```bash
pnpm exec hardhat run scripts/deploy-vault.ts --network celoMainnet
```

**This will deploy:**
- AaveV3Strategy
- SeedVault implementation
- SeedVault proxy (UUPS)
- Link strategy to vault
- Authorize vault on verifier (if enabled)

## Deployment Output

After successful deployment, you'll get:

```
Contract Addresses:
- AaveV3Strategy: 0x...
- SeedVault Implementation: 0x...
- SeedVault Proxy: 0x...  ← Use this address in frontend
- SelfProtocolVerifier: 0x...  ← Use this address in frontend
```

## Post-Deployment

### 1. Verify Contracts on CeloScan

For each contract address:
1. Go to https://celoscan.io/address/YOUR_CONTRACT_ADDRESS
2. Click "Contract" tab → "Verify and Publish"
3. Use:
   - Compiler: `0.8.28`
   - License: `MIT`
   - Optimization: Match your compilation settings

### 2. Update Frontend Environment Variables

Add to `apps/web/.env.local`:

```bash
# Mainnet Contract Addresses
NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS_MAINNET=0x...  # SeedVault proxy address
NEXT_PUBLIC_SELF_PROTOCOL_ADDRESS_MAINNET=0x...  # SelfProtocolVerifier address
NEXT_PUBLIC_CUSD_CONTRACT_ADDRESS_MAINNET=0x765DE816845861e75A25fCA122bb6898B8B1282a
NEXT_PUBLIC_ACUSD_CONTRACT_ADDRESS_MAINNET=0x...  # From Aave
NEXT_PUBLIC_SELF_SCOPE=seedvault  # Must match SELF_SCOPE_SEED from deployment
```

### 3. Update Frontend Endpoint Type

In `apps/web/src/components/verification-modal/index.tsx`:
- Change `endpointType: 'celo-staging'` to `endpointType: 'celo'` for mainnet

### 4. Test Deployment

1. Connect wallet to Celo Mainnet
2. Test verification flow
3. Test deposit (small amount first)
4. Test withdraw
5. Monitor contract interactions

## Network Configuration

The deployment scripts automatically detect the network:
- **Celo Mainnet**: Chain ID `42220`
- **Celo Alfajores**: Chain ID `44787`

Default addresses are provided for mainnet. For testnet, you may need to set all addresses manually.

## Troubleshooting

### "Missing required env var VERIFIER_ADDRESS"
- Deploy the verifier first (Step 1)
- Set `VERIFIER_ADDRESS` in `.env`

### "Insufficient funds"
- Fund your deployer wallet with CELO
- Check gas prices on CeloScan

### "Contract verification failed"
- Ensure all contracts are compiled
- Check that contract names match exactly
- Verify OpenZeppelin dependencies are installed

### "Authorization failed"
- Ensure `AUTHORIZE_VAULT=true` in `.env`
- Or manually call `authorizeCaller(vaultAddress)` on verifier

## Security Checklist

- [ ] Contracts verified on CeloScan
- [ ] Deployer private key secured (use hardware wallet for mainnet)
- [ ] Rebalancer address set (if different from deployer)
- [ ] Treasury address configured
- [ ] Deposit limits reviewed
- [ ] Emergency pause function tested
- [ ] Frontend updated with correct addresses
- [ ] Endpoint type changed to 'celo' for mainnet

## Next Steps

1. ✅ Deploy contracts
2. ✅ Verify on CeloScan
3. ✅ Update frontend
4. ✅ Test verification flow
5. ✅ Test deposit/withdraw
6. ✅ Monitor and maintain

