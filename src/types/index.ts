import { PublicKey } from "@solana/web3.js";
import { SonicAgentKit } from "../agent";
import { z } from "zod";

export interface Config {
  OPENAI_API_KEY?: string;
}

export interface Creator {
  address: string;
  percentage: number;
}

export interface CollectionOptions {
  name: string;
  uri: string;
  royaltyBasisPoints?: number;
  creators?: Creator[];
}

// Add return type interface
export interface CollectionDeployment {
  collectionAddress: PublicKey;
  signature: Uint8Array;
}

export interface MintCollectionNFTResponse {
  mint: PublicKey;
  metadata: PublicKey;
}

/**
 * Example of an action with input and output
 */
export interface ActionExample {
  input: Record<string, any>;
  output: Record<string, any>;
  explanation: string;
}

/**
 * Handler function type for executing the action
 */
export type Handler = (
  agent: SonicAgentKit,
  input: Record<string, any>,
) => Promise<Record<string, any>>;

/**
 * Main Action interface inspired by ELIZA
 * This interface makes it easier to implement actions across different frameworks
 */
export interface Action {
  /**
   * Unique name of the action
   */
  name: string;

  /**
   * Alternative names/phrases that can trigger this action
   */
  similes: string[];

  /**
   * Detailed description of what the action does
   */
  description: string;

  /**
   * Array of example inputs and outputs for the action
   * Each inner array represents a group of related examples
   */
  examples: ActionExample[][];

  /**
   * Zod schema for input validation
   */
  schema: z.ZodType<any>;

  /**
   * Function that executes the action
   */
  handler: Handler;
}

// Sega DEX Types
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

export interface SegaLeaderboardEntry {
  wallet: string;
  points: number;
  swapVolume: number;
  liquidityAdded: number;
  rank: number;
}

export interface SegaLeaderboard {
  rows: SegaLeaderboardEntry[];
  me: SegaLeaderboardEntry | null;
}

export interface SegaSonicStats {
  lpTimeWeightedVolume: number;
  totalSwapAmountInUSD: number;
  mySwapAmountInUSD: number;
}