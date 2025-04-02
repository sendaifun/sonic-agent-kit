/// <reference types="jest" />
import { SonicAgentKit } from "../../../agent";
import { rock_paper_scissor } from "../rock_paper_scissor";
import * as dotenv from "dotenv";
import { Keypair, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from 'bs58';

dotenv.config();

describe("Rock Paper Scissors API Testing", () => {
  let agent: SonicAgentKit;
  let keypair: Keypair;
  let connection: Connection;

  beforeAll(async () => {
    // Create keypair from private key in env
    const privateKey = process.env.SONIC_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("SONIC_PRIVATE_KEY environment variable is required for tests");
    }

    // Decode the base58 private key
    const privateKeyBytes = bs58.decode(privateKey);
    keypair = Keypair.fromSecretKey(privateKeyBytes);

    // Create connection using RPC URL from env
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error("RPC_URL environment variable is required for tests");
    }
    connection = new Connection(rpcUrl);

    // Check wallet balance
    const balance = await connection.getBalance(keypair.publicKey);
    if (balance < LAMPORTS_PER_SOL * 0.001) {
      console.warn(`Warning: Wallet has insufficient balance (${balance / LAMPORTS_PER_SOL} SOL). Need at least 0.001 SOL for tests.`);
    }

    // Initialize the agent
    agent = new SonicAgentKit(
      process.env.SONIC_PRIVATE_KEY!,
      process.env.RPC_URL!,
      {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
      },
    );
  }, 180000); // 3 minutes timeout for setup

  it("should play rock paper scissors with valid parameters", async () => {
    const amount = 0.001;
    const choice = "paper" as const;

    try {
      const result = await rock_paper_scissor(agent, amount, choice);
      console.log("Game result:", result);
      
      console.log("result: ", result);
      // Basic validation of the result
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      
      // Wait for a moment to allow the transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check if the result contains transaction information
      expect(result.toLowerCase()).toContain("transaction");
      expect(result.toLowerCase()).toContain("signature");
    } catch (error) {
      console.error("Error during rock paper scissors game:", error);
      throw error;
    }
  }, 180000); // 3 minutes timeout for the game
}); 