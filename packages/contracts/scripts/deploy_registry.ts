import { createPublicClient, http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia, sepolia } from "viem/chains";
import hre from "hardhat";

// $OPENWORK Token address (Base Mainnet)
const OPENWORK_TOKEN = process.env.OPENWORK_TOKEN || "0x299c30DD5974BF4D5bFE42C340CA40462816AB07";

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY environment variable is required");
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  
  // Determine chain based on network flag
  const networkName = hre.network.name;
  let chain;
  switch (networkName) {
    case "base":
      chain = base;
      break;
    case "base-sepolia":
      chain = baseSepolia;
      break;
    case "sepolia":
      chain = sepolia;
      break;
    default:
      console.warn(`Network ${networkName} not explicitly mapped to viem chain, defaulting to baseSepolia`);
      chain = baseSepolia;
  }

  const client = createWalletClient({
    account,
    chain,
    transport: http()
  });

  const publicClient = createPublicClient({
    chain,
    transport: http()
  });

  console.log(`Deploying OMYaiRegistry to ${networkName}...`);
  console.log("Deployer account:", account.address);
  console.log("Using OPENWORK token at:", OPENWORK_TOKEN);

  // Deploy contract using hardhat-viem
  const registry = await hre.viem.deployContract("OMYaiRegistry", [OPENWORK_TOKEN as `0x${string}`]);

  console.log("OMYaiRegistry deployed to:", registry.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
