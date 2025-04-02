import { Tool } from "langchain/tools";
import { SonicAgentKit } from "../../agent";

export class SolanaRockPaperScissorsTool extends Tool {
  name = "rock_paper_scissors";
  description = `Play rock paper scissors to win SOL coins.

  Input should be either:
  1. A JSON string with format: {"choice": "rock|paper|scissors", "amount": 0.5|0.05|0.1}
  2. A natural language string containing:
     - An amount in SOL (must be 0.5, 0.05, or 0.1 SOL)
     - A choice (rock, paper, or scissors)

  Example inputs:
  - {"choice": "paper", "amount": 0.05}
  - "Let's play with 0.05 SOL and I choose paper"`;

  constructor(private sonicKit: SonicAgentKit) {
    super();
  }

  private validateInput(input: any): void {
    if (!input || typeof input !== 'object') {
      throw new Error("Input must be a valid object");
    }
    if (!input.choice || typeof input.choice !== 'string') {
      throw new Error("choice is required and must be a string");
    }
    if (!["rock", "paper", "scissors"].includes(input.choice.toLowerCase())) {
      throw new Error("choice must be either 'rock', 'paper', or 'scissors'");
    }
    if (!input.amount || typeof input.amount !== 'number') {
      throw new Error("amount is required and must be a number");
    }
    if (![0.1, 0.05, 0.5].includes(input.amount)) {
      throw new Error("amount must be 0.1, 0.05, or 0.5 SOL");
    }
  }

  protected async _call(input: string): Promise<string> {
    try {
      let parsedInput;
      try {
        // First try to parse as JSON
        parsedInput = JSON.parse(input);
      } catch (e) {
        // If JSON parsing fails, try to extract from natural language
        const amountMatch = input.match(/(\d+\.?\d*)\s*SOL/);
        const choiceMatch = input.match(/choose\s+(rock|paper|scissors)/i);
        
        if (!amountMatch || !choiceMatch) {
          throw new Error("Input must contain both an amount in SOL (0.5, 0.05, or 0.1) and a choice (rock, paper, or scissors)");
        }

        const amount = parseFloat(amountMatch[1]);
        if (![0.1, 0.05, 0.5].includes(amount)) {
          throw new Error("Amount must be 0.5, 0.05, or 0.1 SOL");
        }

        parsedInput = {
          amount: amount,
          choice: choiceMatch[1].toLowerCase()
        };
      }

      this.validateInput(parsedInput);
      
      const result = await this.sonicKit.rockPaperScissors(
        parsedInput.amount,
        parsedInput.choice as "rock" | "paper" | "scissors"
      );

      return JSON.stringify({
        status: "success",
        message: result,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
