import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying AttestifyVault to Celo Sepolia...\n");

  // Get the deployer account
  const [deployer] = await hre.viem.getWalletClients();
  console.log("Deploying with account:", deployer.account.address);
  
  // Get balance
  const publicClient = hre.viem.getPublicClient();
  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log("Account balance:", hre.viem.formatEther(balance), "CELO\n");

  // Contract addresses on Celo Sepolia
  const SELF_PROTOCOL = "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74";
  const CUSD_ADDRESS = "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b";
  const ACUSD_ADDRESS = "0xBba98352628B0B0c4b40583F593fFCb630935a45";
  const AAVE_POOL = "0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402";

  console.log("📝 Using Celo Sepolia Contracts:");
  console.log("  Self Protocol:", SELF_PROTOCOL);
  console.log("  cUSD:", CUSD_ADDRESS);
  console.log("  acUSD (Aave):", ACUSD_ADDRESS);
  console.log("  Aave Pool:", AAVE_POOL);

  // Deploy AttestifyVault
  console.log("\n📝 Deploying AttestifyVault...");
  
  // Get contract factory
  const contractFactory = await hre.viem.getContractFactory("AttestifyVault");
  
  // Deploy the contract
  const hash = await contractFactory.deploy({
    args: [
      CUSD_ADDRESS,
      ACUSD_ADDRESS,
      SELF_PROTOCOL,
      AAVE_POOL,
      "attestify-vault"
    ],
  });

  console.log("Deployment transaction hash:", hash);

  // Wait for deployment
  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
  });

  const vaultAddress = receipt.contractAddress;
  console.log("\n✅ AttestifyVault deployed to:", vaultAddress);

  // Set config ID
  console.log("\n📝 Setting Self Protocol config ID...");
  const CONFIG_ID = "0x986751c577aa5cfaef6f49fa2a46fa273b04e1bf78250966b8037dccf8afd399";
  
  const vault = await hre.viem.getContractAt("AttestifyVault", vaultAddress);
  
  const setConfigHash = await vault.write.setConfigId([CONFIG_ID]);
  console.log("Set config transaction hash:", setConfigHash);
  
  await publicClient.waitForTransactionReceipt({
    hash: setConfigHash,
  });
  
  console.log("✅ Config ID set successfully!");

  // Deployment Summary
  const deploymentSummary = {
    vault: vaultAddress,
    cUSD: CUSD_ADDRESS,
    acUSD: ACUSD_ADDRESS,
    aavePool: AAVE_POOL,
    selfProtocol: SELF_PROTOCOL,
    configId: CONFIG_ID,
  };

  console.log("\n============================================================");
  console.log("💾 Deployment summary:");
  console.log(JSON.stringify(deploymentSummary, null, 2));
  console.log("============================================================\n");

  console.log("🎉 Deployment complete! Update your frontend with the new contract address.");
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
