import { PublicKey } from "@solana/web3.js";
import { SonicAgentKit } from "../../agent";
import { SegaSwapResponse, SwapType } from "./swap_compute";

interface SwapTransactionRequest {
  wallet: string;
  computeUnitPriceMicroLamports?: string;
  swapResponse: {
    id: string;
    success: boolean;
    data: SegaSwapResponse;
  };
  txVersion: string;
  wrapSol?: boolean;
  unwrapSol?: boolean;
  outputAccount?: string;
}

/**
 * Get a serialized transaction for executing a swap on Sega DEX
 * @param agent - SonicAgentKit instance
 * @param swapResponse - The response from a swap computation call
 * @param txVersion - Transaction version (e.g., "V0")
 * @param computeUnitPriceMicroLamports - Optional compute unit price in micro lamports
 * @param wrapSol - Whether to wrap SOL if needed
 * @param unwrapSol - Whether to unwrap SOL if needed
 * @param outputAccount - Optional specific output account
 * @returns Promise resolving to an array of serialized transactions
 */
export async function sega_swap_transaction(
  agent: SonicAgentKit,
  swapResponse: SegaSwapResponse,
  txVersion: string = "V0",
  computeUnitPriceMicroLamports?: string,
  wrapSol: boolean = true,
  unwrapSol: boolean = true,
  outputAccount?: string | PublicKey
): Promise<string[]> {
  // Convert PublicKey to string if needed
  const outputAccountStr = outputAccount instanceof PublicKey 
    ? outputAccount.toString() 
    : outputAccount;

  const request: SwapTransactionRequest = {
    wallet: agent.wallet_address.toString(),
    swapResponse: {
      id: "",
      success: true,
      data: swapResponse
    },
    txVersion,
    wrapSol,
    unwrapSol
  };

  if (computeUnitPriceMicroLamports) {
    request.computeUnitPriceMicroLamports = computeUnitPriceMicroLamports;
  }

  if (outputAccountStr) {
    request.outputAccount = outputAccountStr;
  }

  const response = await fetch(
    `https://api.sega.so/swap/transaction/${swapResponse.swapType}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate swap transaction: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Swap transaction generation failed: ${data.message || "Unknown error"}`);
  }

  return data.data.map((item: any) => item.transaction);
} 