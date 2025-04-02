import axios from 'axios';
import { Keypair, Connection, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from 'bs58';
import * as dotenv from 'dotenv';

dotenv.config();

async function playRockPaperScissors() {
  try {
    // Setup
    const privateKey = process.env.SONIC_PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;
    
    if (!privateKey || !rpcUrl) {
      throw new Error("Missing required environment variables");
    }

    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    const connection = new Connection(rpcUrl);

    console.log("Starting Rock Paper Scissors game...");
    console.log("Wallet address:", keypair.publicKey.toBase58());

    // Step 1: Initial game setup
    console.log("\nStep 1: Initial game setup");
    const setupResponse = await axios.post(
      `https://rps.sendarcade.fun/api/actions/sonic/backend?amount=0.001&choice=paper`,
      {
        account: keypair.publicKey.toBase58(),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Setup response:", JSON.stringify(setupResponse.data, null, 2));

    if (!setupResponse.data.transaction) {
      throw new Error("No transaction received from setup");
    }

    // Step 2: Sign and send transaction
    console.log("\nStep 2: Sign and send transaction");
    const txn = Transaction.from(Buffer.from(setupResponse.data.transaction, "base64"));
    txn.sign(keypair);
    txn.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signature = await sendAndConfirmTransaction(
      connection,
      txn,
      [keypair],
      { commitment: "confirmed" }
    );

    console.log("Transaction signature:", signature);

    // Step 3: Get outcome
    console.log("\nStep 3: Get game outcome");
    const outcomeResponse = await axios.post(
      `https://rps.sendarcade.fun/api/actions/sonic/outcome?id=${setupResponse.data.id}`,
      {
        account: keypair.publicKey.toBase58(),
        signature: signature,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Outcome response:", JSON.stringify(outcomeResponse.data, null, 2));

    // Final result
    console.log("\nFinal Result:");
    if (outcomeResponse.data.type === "action") {
      console.log("Title:", outcomeResponse.data.title);
      console.log("Description:", outcomeResponse.data.description);
    } else if (outcomeResponse.data.error) {
      console.log("Error:", outcomeResponse.data.error);
    } else {
      console.log("Unexpected response format:", outcomeResponse.data);
    }

  } catch (error: any) {
    console.error("\nError occurred:");
    if (axios.isAxiosError(error)) {
      console.error("API Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      console.error("Error:", error.message);
    }
  }
}

// Run the game
playRockPaperScissors(); 