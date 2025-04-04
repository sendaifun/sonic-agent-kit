import { SonicAgentKit } from "../../index";
import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { DEFAULT_OPTIONS } from "../../constants";

interface TokenPrices {
  id: string;
  success: boolean;
  data: {
    [tokenAddress: string]: string;
  };
}

interface RouteStep {
  poolId: string;
  inputMint: string;
  outputMint: string;
  feeMint: string;
  feeRate: number;
  feeAmount: string;
  remainingAccounts: any[];
}

interface SwapQuote {
  id: string;
  success: boolean;
  data: {
    swapType: string;
    inputMint: string;
    inputAmount: string;
    outputMint: string;
    outputAmount: string;
    otherAmountThreshold: string;
    slippageBps: number;
    priceImpactPct: number;
    referrerAmount: string;
    routePlan: RouteStep[];
  };
}

interface SwapRequestParams {
  wallet: string;
  computeUnitPriceMicroLamports: string;
  swapResponse: SwapQuote;
  txVersion: string;
  wrapSol: boolean;
  unwrapSol: boolean;
  outputAccount?: string | undefined;
}

interface TransactionData {
  transaction: string;
}

interface SwapTransactionResponse {
  id: string;
  success: boolean;
  data: TransactionData[];
}

/**
 * Fetches the price of tokens from the Sega API
 * @param tokenAddresses Array of token mint addresses
 * @returns Price data for the specified tokens
 */
async function fetchPrice(tokenAddresses: string[]): Promise<TokenPrices> {
  try {
    const response = await fetch(
      `https://api.sega.so/api/mint/price?mints=${tokenAddresses.join(",")}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = (await response.json()) as TokenPrices;

    if (!data.success) {
      throw new Error("Failed to fetch price data");
    }

    return data;
  } catch (error: any) {
    console.error("Error fetching token prices:", error);
    throw error;
  }
}

/**
 * Fetches a swap quote from the Sega API
 * @param inputMint Input token mint address
 * @param outputMint Output token mint address
 * @param amount Amount of input tokens (in base units)
 * @param slippageBps Slippage tolerance in basis points (default: 50 = 0.5%)
 * @returns Swap quote data
 */
async function fetchQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 50,
): Promise<SwapQuote> {
  try {
    const response = await fetch(
      `https://api.sega.so/swap/compute/swap-base-in?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}&txVersion=V0`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = (await response.json()) as SwapQuote;

    if (!data.success) {
      throw new Error(`Quote failed: ${data.id}`);
    }

    return data;
  } catch (error: any) {
    console.error("Error fetching quote:", error);
    throw error;
  }
}

/**
 * Fetches the swap transaction from the Sega API
 * @param userPublicKey User's public key
 * @param quote Swap quote from fetchQuote
 * @param computeUnitPriceMicroLamports Compute unit price in micro lamports
 * @returns Swap transaction response
 */
async function fetchSwapTransaction(
  userPublicKey: PublicKey,
  quote: SwapQuote,
  computeUnitPriceMicroLamports: string = "10500",
): Promise<SwapTransactionResponse> {
  try {
    const requestParams: SwapRequestParams = {
      wallet: userPublicKey.toBase58(),
      computeUnitPriceMicroLamports,
      swapResponse: quote,
      txVersion: "V0",
      wrapSol: true,
      unwrapSol: false,
    };

    const txn = await fetch(
      "https://api.sega.so/swap/transaction/swap-base-in",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json, text/plain, */*",
        },
        body: JSON.stringify(requestParams),
      },
    );

    if (!txn.ok) {
      throw new Error(`HTTP error! Status: ${txn.status}`);
    }

    const response = (await txn.json()) as SwapTransactionResponse;
    return response;
  } catch (error: any) {
    console.error("Error in swap transaction:", error);
    throw error;
  }
}

/**
 * Processes a swap transaction response and returns a VersionedTransaction object
 * @param response Swap transaction response from the API
 * @returns A VersionedTransaction object that can be signed and sent
 */
function processSwapTransaction(
  response: SwapTransactionResponse,
): VersionedTransaction {
  if (!response.success || !response.data || response.data.length === 0) {
    throw new Error("Invalid transaction response");
  }

  const transactionBase64 = response.data[0].transaction;
  const transactionBuffer = Uint8Array.from(
    Buffer.from(transactionBase64, "base64"),
  );

  try {
    const versionedTransaction =
      VersionedTransaction.deserialize(transactionBuffer);
    return versionedTransaction;
  } catch (error: any) {
    console.error("Error deserializing transaction:", error);
    throw new Error(`Failed to deserialize transaction: ${error.message}`);
  }
}

/**
 * Calculates estimated output amount based on token prices
 * @param inputMint Input token mint address
 * @param outputMint Output token mint address
 * @param inputAmount Amount of input tokens (in base units)
 * @returns Estimated output amount (in base units)
 */
async function calculateSwapEstimate(
  inputMint: string,
  outputMint: string,
  inputAmount: number,
): Promise<number> {
  try {
    const priceData = await fetchPrice([inputMint, outputMint]);

    if (!priceData.data[inputMint] || !priceData.data[outputMint]) {
      throw new Error("Price data missing for one or both tokens");
    }

    const inputPriceUSD = parseFloat(priceData.data[inputMint]);
    const outputPriceUSD = parseFloat(priceData.data[outputMint]);

    const inputValueUSD = (inputAmount / 1e9) * inputPriceUSD;
    const estimatedOutputAmount = (inputValueUSD / outputPriceUSD) * 1e9;
    const estimatedOutputWithSlippage = estimatedOutputAmount * 0.99;

    return Math.floor(estimatedOutputWithSlippage);
  } catch (error: any) {
    console.error("Error calculating swap estimate:", error);
    throw error;
  }
}

/**
 * Swap tokens using Sega.so API
 * @param agent SonicAgentKit instance
 * @param inputMint Input token mint address
 * @param outputMint Output token mint address
 * @param amount Amount of input tokens (in base units)
 * @param slippageBps Slippage tolerance in basis points (optional, default: from DEFAULT_OPTIONS)
 * @returns Object containing transaction signature and swap details
 */
export async function swap(
  agent: SonicAgentKit,
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = DEFAULT_OPTIONS.SLIPPAGE_BPS,
): Promise<{
  signature: string;
  inputAmount: number;
  outputAmount: number;
  inputMint: string;
  outputMint: string;
}> {
  try {
    // Get swap quote
    const quote = await fetchQuote(inputMint, outputMint, amount, slippageBps);

    // Get swap transaction
    const swapResponse = await fetchSwapTransaction(
      agent.wallet_address,
      quote,
    );

    // Process transaction
    const transaction = processSwapTransaction(swapResponse);

    // Sign and send the transaction
    transaction.sign([agent.wallet]);
    const signature = await agent.connection.sendTransaction(transaction);

    // Wait for confirmation
    await agent.connection.confirmTransaction(signature);

    return {
      signature,
      inputAmount: amount,
      outputAmount: Number(quote.data.outputAmount),
      inputMint,
      outputMint,
    };
  } catch (error: any) {
    throw new Error(`Swap failed: ${error.message}`);
  }
}

/**
 * Get price quote for a swap without executing it
 * @param agent SonicAgentKit instance
 * @param inputMint Input token mint address
 * @param outputMint Output token mint address
 * @param amount Amount of input tokens (in base units)
 * @returns Object containing estimated output amount and price impact
 */
export async function getSwapQuote(
  agent: SonicAgentKit,
  inputMint: string,
  outputMint: string,
  amount: number,
): Promise<{
  inputAmount: number;
  outputAmount: number;
  priceImpactPct: number;
  inputMint: string;
  outputMint: string;
}> {
  try {
    const quote = await fetchQuote(inputMint, outputMint, amount);

    return {
      inputAmount: amount,
      outputAmount: Number(quote.data.outputAmount),
      priceImpactPct: quote.data.priceImpactPct,
      inputMint,
      outputMint,
    };
  } catch (error: any) {
    throw new Error(`Failed to get swap quote: ${error.message}`);
  }
}
