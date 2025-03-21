import { PublicKey } from "@solana/web3.js";
import { SonicAgentKit } from "../../agent";

export type SwapType = "swap-base-in" | "swap-base-out";

export interface SegaSwapRoute {
  poolId: string;
  inputMint: string;
  outputMint: string;
  feeMint: string;
  feeRate: number;
  feeAmount: string;
  remainingAccounts: string[];
}

export interface SegaSwapResponse {
  swapType: string;
  inputMint: string;
  inputAmount: string;
  outputMint: string;
  outputAmount: string;
  otherAmountThreshold: string;
  slippageBps: number;
  priceImpactPct: number;
  referrerAmount: string;
  routePlan: SegaSwapRoute[];
}

/**
 * Compute a swap on Sega DEX given input parameters
 * @param agent - SonicAgentKit instance
 * @param inputMint - Input token mint address
 * @param outputMint - Output token mint address
 * @param amount - Amount to swap (in token's smallest units)
 * @param swapType - Type of swap (swap-base-in or swap-base-out)
 * @param slippageBps - Slippage tolerance in basis points (e.g., 50 = 0.5%)
 * @param txVersion - Transaction version (e.g., "V0")
 * @returns Promise resolving to swap computation details
 */
export async function sega_swap_compute(
  agent: SonicAgentKit,
  inputMint: string | PublicKey,
  outputMint: string | PublicKey,
  amount: string | number,
  swapType: SwapType = "swap-base-in",
  slippageBps: number = 50,
  txVersion: string = "V0"
): Promise<SegaSwapResponse> {
  // Convert PublicKey objects to strings if needed
  const inputMintStr = inputMint instanceof PublicKey ? inputMint.toString() : inputMint;
  const outputMintStr = outputMint instanceof PublicKey ? outputMint.toString() : outputMint;
  const amountStr = typeof amount === "number" ? amount.toString() : amount;

  const response = await fetch(
    `https://api.sega.so/swap/compute/${swapType}?inputMint=${inputMintStr}&outputMint=${outputMintStr}&amount=${amountStr}&slippageBps=${slippageBps}&txVersion=${txVersion}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to compute swap: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Swap computation failed: ${data.message || "Unknown error"}`);
  }

  return data.data;
}

/**
 * Compute a swap using smart routing on Sega DEX
 * @param agent - SonicAgentKit instance
 * @param inputMint - Input token mint address
 * @param outputMint - Output token mint address
 * @param amount - Amount to swap (in token's smallest units)
 * @param swapType - Type of swap (swap-base-in or swap-base-out)
 * @param slippageBps - Slippage tolerance in basis points (e.g., 50 = 0.5%)
 * @param txVersion - Transaction version (e.g., "V0")
 * @returns Promise resolving to swap computation details with optimal routing
 */
export async function sega_smart_swap_compute(
  agent: SonicAgentKit,
  inputMint: string | PublicKey,
  outputMint: string | PublicKey,
  amount: string | number,
  swapType: SwapType = "swap-base-in",
  slippageBps: number = 50,
  txVersion: string = "V0"
): Promise<SegaSwapResponse> {
  // Convert PublicKey objects to strings if needed
  const inputMintStr = inputMint instanceof PublicKey ? inputMint.toString() : inputMint;
  const outputMintStr = outputMint instanceof PublicKey ? outputMint.toString() : outputMint;
  const amountStr = typeof amount === "number" ? amount.toString() : amount;

  const response = await fetch(
    `https://api.sega.so/swap/smart-compute/${swapType}?inputMint=${inputMintStr}&outputMint=${outputMintStr}&amount=${amountStr}&slippageBps=${slippageBps}&txVersion=${txVersion}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to compute smart swap: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Smart swap computation failed: ${data.message || "Unknown error"}`);
  }

  return data.data;
} 