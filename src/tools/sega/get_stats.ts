import { PublicKey } from "@solana/web3.js";
import { SonicAgentKit } from "../../agent";

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

/**
 * Get the Sega DEX leaderboard
 * @param agent - SonicAgentKit instance
 * @returns Promise resolving to the leaderboard data
 */
export async function sega_get_leaderboard(
  agent: SonicAgentKit
): Promise<SegaLeaderboard> {
  const wallet = agent.wallet_address.toString();
  
  const response = await fetch(
    `https://api.sega.so/sega/leaderboard?wallet=${wallet}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get leaderboard: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Leaderboard lookup failed: ${data.message || "Unknown error"}`);
  }

  return data.data;
}

export interface SegaSonicStats {
  lpTimeWeightedVolume: number;
  totalSwapAmountInUSD: number;
  mySwapAmountInUSD: number;
}

/**
 * Get Sonic stats for a specific wallet
 * @param agent - SonicAgentKit instance
 * @param startTime - Optional start time in unix timestamp
 * @param endTime - Optional end time in unix timestamp
 * @returns Promise resolving to the Sonic stats
 */
export async function sega_get_sonic_stats(
  agent: SonicAgentKit,
  startTime?: number,
  endTime?: number
): Promise<SegaSonicStats> {
  const wallet = agent.wallet_address.toString();
  
  const request = {
    wallet,
    startTime: startTime || 0,
    endTime: endTime || Math.floor(Date.now() / 1000)
  };
  
  const response = await fetch(
    "https://api.sega.so/sega/sonic",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get Sonic stats: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Sonic stats lookup failed: ${data.message || "Unknown error"}`);
  }

  return data.data;
}

/**
 * Request tokens from the Sega faucet (for testnet/devnet)
 * @param agent - SonicAgentKit instance
 * @returns Promise resolving to confirmation of the faucet request
 */
export async function sega_faucet_request(
  agent: SonicAgentKit
): Promise<{ wallet: string }> {
  const wallet = agent.wallet_address.toString();
  
  const request = {
    wallet
  };
  
  const response = await fetch(
    "https://api.sega.so/sega/faucet",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to request from faucet: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Faucet request failed: ${data.message || "Unknown error"}`);
  }

  return data.data;
} 