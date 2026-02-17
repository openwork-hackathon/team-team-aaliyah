import { createPublicClient, http, createWalletClient, formatEther, parseEther, encodeFunctionData, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import hre from "hardhat";

// Mint Club V2 Bond Contract
const BOND_ADDRESS = "0xc5a076cad94176c2996B32d8466Be1cE757FAa27";
const OPENWORK_TOKEN = "0x299c30DD5974BF4D5bFE42C340CA40462816AB07";

const BOND_ABI = [
  {
    inputs: [
      { components: [{ name: "name", type: "string" }, { name: "symbol", type: "string" }], name: "tokenParams", type: "tuple" },
      { components: [{ name: "mintRoyalty", type: "uint16" }, { name: "burnRoyalty", type: "uint16" }, { name: "reserveToken", type: "address" }, { name: "maxSupply", type: "uint128" }, { name: "stepRanges", type: "uint128[]" }, { name: "stepPrices", type: "uint128[]" }], name: "bondParams", type: "tuple" }
    ],
    name: "createToken",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "creationFee",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

const ERC20_ABI = [
  {
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

async function main() {
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: base,
    transport: http()
  });
  const publicClient = createPublicClient({
    chain: base,
    transport: http()
  });
  
  console.log("Deploying with account:", account.address);

  // 1. Check creation fee
  const bondContract = getContract({
    address: BOND_ADDRESS,
    abi: BOND_ABI,
    client: publicClient
  });
  
  const creationFee = await bondContract.read.creationFee();
  console.log("Creation fee:", formatEther(creationFee), "ETH");

  // 2. Approve $OPENWORK (max)
  console.log("Approving $OPENWORK...");
  const hashApprove = await client.writeContract({
    address: OPENWORK_TOKEN,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [BOND_ADDRESS, BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")]
  });
  await publicClient.waitForTransactionReceipt({ hash: hashApprove });
  console.log("Approved.");

  // 3. Create OMYAI Token
  console.log("Creating OMYAI token...");
  const hashCreate = await client.writeContract({
    address: BOND_ADDRESS,
    abi: BOND_ABI,
    functionName: "createToken",
    args: [
      { name: "OMYai Token", symbol: "OMYAI" },
      {
        mintRoyalty: 50, // 0.5%
        burnRoyalty: 50, // 0.5%
        reserveToken: OPENWORK_TOKEN,
        maxSupply: parseEther("1000000"), // 1M supply
        stepRanges: [parseEther("10000"), parseEther("100000"), parseEther("1000000")],
        stepPrices: [parseEther("0.0001"), parseEther("0.001"), parseEther("0.01")] // Cheap start
      }
    ],
    value: creationFee
  });

  console.log("Token creation TX:", hashCreate);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: hashCreate });
  console.log("Token created! Check logs for address.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});