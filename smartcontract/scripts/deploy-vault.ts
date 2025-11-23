import "dotenv/config";

import process from "node:process";
import { network } from "hardhat";
import { encodeFunctionData, parseUnits } from "viem";
import type { Address } from "viem";

// Celo Mainnet addresses (queried from Aave)
const CELO_MAINNET_DEFAULTS = {
  asset: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as Address, // cUSD
  aToken: "0xBba98352628B0B0c4b40583F593fFCb630935a45" as Address, // acUSD
  addressesProvider: "0x9F7Cf9417D5251C59fE94fB9147feEe1aAd9Cea5" as Address,
  selfHubV2: "0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF" as Address,
} as const;

// Celo Alfajores Testnet addresses
const CELO_ALFAJORES_DEFAULTS = {
  asset: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1" as Address, // cUSD
  aToken: "" as Address, // TODO: Query from Aave on Alfajores
  addressesProvider: "" as Address, // TODO: Get from Aave docs
  selfHubV2: "0x18E05eAC6F31d03fb188FDc8e72FF354aB24EaB6" as Address,
} as const;

type DeployConfig = {
  asset: Address;
  aToken: Address;
  addressesProvider: Address;
  verifier: Address;
  maxUserDeposit: bigint;
  maxTotalDeposit: bigint;
  assetDecimals: number;
  rebalancer?: Address;
  authorizeVaultOnVerifier: boolean;
};

function getAddress(name: string, defaultValue?: Address): Address {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Missing required env var ${name} and no default available`);
  }
  if (!value.startsWith("0x") || value.length !== 42) {
    throw new Error(`Env var ${name} must be a 20-byte hex address`);
  }
  return value as Address;
}

function requireAddress(name: string): Address {
  return getAddress(name);
}

function getAmountEnv(name: string, decimals: number, fallback: string): bigint {
  const raw = process.env[name] ?? fallback;
  return parseUnits(raw, decimals);
}

async function loadConfig(chainId: bigint): Promise<DeployConfig> {
  const assetDecimals = Number(process.env.ASSET_DECIMALS ?? "18");

  // Get defaults based on chain
  const defaults =
    chainId === 42220n
      ? CELO_MAINNET_DEFAULTS
      : chainId === 44787n
      ? CELO_ALFAJORES_DEFAULTS
      : null;

  if (!defaults) {
    console.warn("⚠️  Unknown chain, using env vars only (no defaults)");
  }

  return {
    asset: getAddress("ASSET_ADDRESS", defaults?.asset),
    aToken: getAddress("ATOKEN_ADDRESS", defaults?.aToken),
    addressesProvider: getAddress("AAVE_PROVIDER_ADDRESS", defaults?.addressesProvider),
    verifier: requireAddress("VERIFIER_ADDRESS"), // Must be provided (deploy verifier first)
    maxUserDeposit: getAmountEnv("MAX_USER_DEPOSIT", assetDecimals, "10000"), // 10,000 cUSD
    maxTotalDeposit: getAmountEnv("MAX_TOTAL_DEPOSIT", assetDecimals, "1000000"), // 1,000,000 cUSD
    assetDecimals,
    rebalancer: process.env.REBALANCER_ADDRESS as Address | undefined,
    authorizeVaultOnVerifier: process.env.AUTHORIZE_VAULT !== "false", // Default true
  };
}

async function main() {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();
  const chainId = await publicClient.getChainId();
  const params = await loadConfig(chainId);

  console.log("Deploying with account:", deployer.account.address);
  console.log("Chain id:", chainId.toString());
  console.log("\nConfiguration:");
  console.log("- Asset (cUSD):", params.asset);
  console.log("- aToken (acUSD):", params.aToken);
  console.log("- Aave Provider:", params.addressesProvider);
  console.log("- Verifier:", params.verifier);
  console.log("- Max User Deposit:", params.maxUserDeposit.toString());
  console.log("- Max Total Deposit:", params.maxTotalDeposit.toString());
  console.log("");

  console.log("Deploying AaveV3Strategy...");
  const strategy = await viem.deployContract("AaveV3Strategy", {
    account: deployer.account,
    args: [params.asset, params.aToken, params.addressesProvider],
  });
  console.log("✅ AaveV3Strategy deployed at:", strategy.address);

  console.log("\nDeploying SeedVault implementation...");
  const vaultImplementation = await viem.deployContract("SeedVault", {
    account: deployer.account,
  });
  console.log("✅ SeedVault implementation deployed at:", vaultImplementation.address);

  const initData = encodeFunctionData({
    abi: vaultImplementation.abi,
    functionName: "initialize",
    args: [
      params.asset,
      strategy.address,
      params.verifier,
      params.maxUserDeposit,
      params.maxTotalDeposit,
    ],
  });

  console.log("\nDeploying ERC1967 proxy...");
  const proxy = await viem.deployContract("TestProxy", {
    account: deployer.account,
    args: [vaultImplementation.address, initData],
  });
  console.log("✅ ERC1967 proxy deployed at:", proxy.address);

  const vault = await viem.getContractAt("SeedVault", proxy.address);
  console.log("✅ SeedVault proxy initialized at:", vault.address);

  console.log("\nLinking strategy to vault...");
  await strategy.write.setVault([vault.address], {
    account: deployer.account,
  });
  console.log("✅ Strategy linked to vault");

  if (params.rebalancer && params.rebalancer !== deployer.account.address) {
    console.log("\nSetting custom rebalancer:", params.rebalancer);
    await vault.write.setRebalancer([params.rebalancer], {
      account: deployer.account,
    });
    console.log("✅ Rebalancer set");
  }

  if (params.authorizeVaultOnVerifier) {
    console.log("\nAuthorizing vault on verifier...");
    const verifier = await viem.getContractAt("SelfProtocolVerifier", params.verifier);
    await verifier.write.authorizeCaller([vault.address], {
      account: deployer.account,
    });
    console.log("✅ Vault authorized on verifier");
  }

  console.log("\n==========================================");
  console.log("🎉 Deployment Complete!");
  console.log("==========================================");
  console.log("\nContract Addresses:");
  console.log("- AaveV3Strategy:", strategy.address);
  console.log("- SeedVault Implementation:", vaultImplementation.address);
  console.log("- SeedVault Proxy:", vault.address);
  console.log("- SelfProtocolVerifier:", params.verifier);
  console.log("\nNext Steps:");
  console.log("1. Verify contracts on CeloScan");
  console.log("2. Update frontend environment variables");
  console.log("3. Test deposit/withdraw flow");
  console.log("4. Configure rebalancer/treasury roles as needed");
}

main().catch((error) => {
  console.error("Error deploying vault:", error);
  process.exit(1);
});

