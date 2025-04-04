import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { SonicAgentKit } from "../../agent";
import { z } from "zod";

const swapAction: Action = {
  name: "SEGA_SWAP",
  similes: [
    "swap tokens on sega",
    "trade tokens",
    "exchange tokens",
    "sega swap",
    "swap crypto",
  ],
  description: `Swap tokens using Sega.so - a decentralized exchange on Solana. Provide inputMint (token to sell), outputMint (token to buy), and amount to swap.`,
  examples: [
    [
      {
        input: {
          inputMint: "So11111111111111111111111111111111111111112",
          outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          amount: 0.1,
        },
        output: {
          status: "success",
          message: "Swap completed successfully",
          inputAmount: 100000000,
          outputAmount: 2500000,
          inputMint: "So11111111111111111111111111111111111111112",
          outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          signature:
            "5UfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation: "Swap 0.1 SOL for USDC",
      },
    ],
    [
      {
        input: {
          inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          outputMint: "So11111111111111111111111111111111111111112",
          amount: 2.5,
          slippageBps: 100,
        },
        output: {
          status: "success",
          message: "Swap completed successfully",
          inputAmount: 2500000,
          outputAmount: 99000000,
          inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          outputMint: "So11111111111111111111111111111111111111112",
          signature:
            "4VfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation: "Swap 2.5 USDC for SOL with 1% slippage tolerance",
      },
    ],
  ],
  schema: z.object({
    inputMint: z.string().min(32, "Invalid Solana token address"),
    outputMint: z.string().min(32, "Invalid Solana token address"),
    amount: z.number().positive("Amount must be positive"),
    slippageBps: z.number().optional(),
  }),
  handler: async (agent: SonicAgentKit, input: Record<string, any>) => {
    try {
      // Convert amounts to lamports/smallest units (assuming 9 decimals)
      const amountInSmallestUnits = Math.floor(input.amount * 1e9);

      const result = await agent.segaSwap(
        input.inputMint,
        input.outputMint,
        amountInSmallestUnits,
        input.slippageBps,
      );

      return {
        status: "success",
        message: "Swap completed successfully",
        ...result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Swap failed: ${error.message}`,
      };
    }
  },
};

export default swapAction;
