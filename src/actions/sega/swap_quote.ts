import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { SonicAgentKit } from "../../agent";
import { z } from "zod";

const swapQuoteAction: Action = {
  name: "SEGA_SWAP_QUOTE",
  similes: [
    "get swap quote on sega",
    "check swap rate",
    "estimate swap",
    "sega swap quote",
    "token exchange rate",
  ],
  description: `Get a price quote for swapping tokens on Sega.so without executing the trade. Provide inputMint (token to sell), outputMint (token to buy), and amount to swap.`,
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
          message: "Swap quote fetched successfully",
          inputAmount: 100000000,
          outputAmount: 2500000,
          priceImpactPct: 0.05,
          inputMint: "So11111111111111111111111111111111111111112",
          outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        explanation: "Get a quote for swapping 0.1 SOL for USDC",
      },
    ],
  ],
  schema: z.object({
    inputMint: z.string().min(32, "Invalid Solana token address"),
    outputMint: z.string().min(32, "Invalid Solana token address"),
    amount: z.number().positive("Amount must be positive"),
  }),
  handler: async (agent: SonicAgentKit, input: Record<string, any>) => {
    try {
      // Convert amounts to lamports/smallest units (assuming 9 decimals)
      const amountInSmallestUnits = Math.floor(input.amount * 1e9);

      const result = await agent.getSegaSwapQuote(
        input.inputMint,
        input.outputMint,
        amountInSmallestUnits,
      );

      return {
        status: "success",
        message: "Swap quote fetched successfully",
        ...result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get swap quote: ${error.message}`,
      };
    }
  },
};

export default swapQuoteAction;
