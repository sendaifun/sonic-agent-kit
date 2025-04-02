import { sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { SonicAgentKit } from "../../agent";

export async function rock_paper_scissor(
  agent: SonicAgentKit,
  amount: number,
  choice: "rock" | "paper" | "scissors",
) {
  try {
    // Initial game setup
    const res = await fetch(
      `https://rps.sendarcade.fun/api/actions/sonic/backend?amount=${amount}&choice=${choice}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: agent.wallet.publicKey.toBase58(),
        }),
      },
    );

    const data = await res.json();
    if (data.transaction) {
      try {
        const txn = Transaction.from(Buffer.from(data.transaction, "base64"));
        txn.sign(agent.wallet);
        txn.recentBlockhash = (
          await agent.connection.getLatestBlockhash()
        ).blockhash;
        const sig = await sendAndConfirmTransaction(
          agent.connection,
          txn,
          [agent.wallet],
          { commitment: "confirmed" },
        );
        return await outcome(agent, sig, data?.links?.next?.href);
      } catch (txnError: any) {
        console.error("Transaction error:", txnError);
        throw new Error(`Transaction failed: ${txnError.message}`);
      }
    } else {
      return "Failed to start game";
    }
  } catch (error: any) {
    console.error(error);
    throw new Error(`RPS game failed: ${error.message}`);
  }
}

async function outcome(
  agent: SonicAgentKit,
  sig: string,
  href: string,
): Promise<string> {
  try {
    const res = await fetch(
      `https://rps.sendarcade.fun` + href,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: agent.wallet.publicKey.toBase58(),
          signature: sig,
        }),
      },
    );

    // Check if response is ok
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error: ${res.status} ${res.statusText} - ${text}`);
    }

    // Try to parse as JSON
    let data;
    try {
      data = await res.json();
    } catch (e) {
      const text = await res.text();
      throw new Error(`Invalid JSON response: ${text}`);
    }

    // Handle different outcomes based on API response format
    if (data.type === "action") {
      if (data.title && data.description) {
        return `${data.title}\n${data.description}`;
      }
      return "Game completed but outcome details are missing";
    } else if (data.error) {
      throw new Error(`Game error: ${data.error}`);
    }
    
    return "Unexpected response format";
  } catch (error: any) {
    console.error("Outcome error:", error);
    throw new Error(`RPS outcome failed: ${error.message}`);
  }
}
