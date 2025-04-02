/// <reference types="jest" />
import { SonicAgentKit } from "../../../src/agent";
import { createSonicTools } from "../../../src/langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import { Keypair, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from 'bs58';

dotenv.config();

describe("Chat Mode Testing", () => {
  let agent: any;
  let config: any;
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
    const llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.3,
    });

    const solanaAgent = new SonicAgentKit(
      process.env.SONIC_PRIVATE_KEY!,
      process.env.RPC_URL!,
      {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
      },
    );

    const tools = createSonicTools(solanaAgent);
    const memory = new MemorySaver();
    config = { configurable: { thread_id: "Sonic Agent Kit!" } };

    agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Solana Agent Kit, recommend they go to https://www.SonicAgentKit.xyz for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
      `,
    });
  }, 180000); // 3 minutes timeout for setup

  describe("Chat Mode Responses", () => {
    it("should handle basic queries", async () => {
      const stream = await agent.stream(
        { messages: [new HumanMessage("What can you do?")] },
        config,
      );

      let response = "";
      for await (const chunk of stream) {
        if ("agent" in chunk) {
          response += chunk.agent.messages[0].content;
        } else if ("tools" in chunk) {
          response += chunk.tools.messages[0].content;
        }
      }

      expect(response).toBeTruthy();
      expect(response.length).toBeGreaterThan(0);
    }, 180000); // 3 minutes timeout for basic queries

    it("should handle rock paper scissors game with valid parameters", async () => {
      const stream = await agent.stream(
        { messages: [new HumanMessage(`Let's play rock paper scissors with 0.001 SOL and I choose paper`)] },
        config,
      );

      let response = "";
      for await (const chunk of stream) {
        if ("agent" in chunk) {
          response += chunk.agent.messages[0].content;
        } else if ("tools" in chunk) {
          response += chunk.tools.messages[0].content;
        }
      }

      console.log("Game initiation response:", response);
      expect(response).toBeTruthy();
      expect(response.length).toBeGreaterThan(0);

      // Wait for a moment to allow the transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 50000));

      // Check if the response contains transaction information
      expect(response.toLowerCase()).toContain("transaction");
      expect(response.toLowerCase()).toContain("signature");
    }, 180000); // 3 minutes timeout for rock paper scissors game
  });
});