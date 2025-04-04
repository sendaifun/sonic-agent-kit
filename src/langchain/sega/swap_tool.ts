import { Tool } from "langchain/tools";
import { SonicAgentKit } from "../../agent";
import { PublicKey } from "@solana/web3.js";

export class SegaSwapTool extends Tool {
  name = "sega_swap";
  description =
    "Swaps tokens using Sega.so platform. Input should be a JSON string containing inputMint, outputMint, and amount.";

  constructor(private sonicKit: SonicAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const { inputMint, outputMint, amount, slippageBps } = JSON.parse(input);

      if (!inputMint || !outputMint || !amount) {
        throw new Error(
          "Missing required parameters: inputMint, outputMint, or amount",
        );
      }

      const result = await this.sonicKit.segaSwap(
        inputMint,
        outputMint,
        Number(amount),
        slippageBps ? Number(slippageBps) : undefined,
      );

      return JSON.stringify({
        status: "success",
        message: "Swap executed successfully",
        data: result,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "SWAP_ERROR",
      });
    }
  }
}

export class SegaSwapQuoteTool extends Tool {
  name = "sega_swap_quote";
  description =
    "Gets a swap quote from Sega.so without executing the swap. Input should be a JSON string containing inputMint, outputMint, and amount.";

  constructor(private sonicKit: SonicAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const { inputMint, outputMint, amount } = JSON.parse(input);

      if (!inputMint || !outputMint || !amount) {
        throw new Error(
          "Missing required parameters: inputMint, outputMint, or amount",
        );
      }

      const result = await this.sonicKit.getSegaSwapQuote(
        inputMint,
        outputMint,
        Number(amount),
      );

      return JSON.stringify({
        status: "success",
        message: "Swap quote fetched successfully",
        data: result,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "SWAP_QUOTE_ERROR",
      });
    }
  }
}
