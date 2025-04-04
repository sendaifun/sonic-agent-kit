import { PublicKey } from "@solana/web3.js";
import { SonicAgentKit } from "../../agent";

/**
 * Get the USD price of a token from Sega DEX
 * @param agent - SonicAgentKit instance
 * @param mint - Token mint address
 * @returns Promise resolving to the USD price of the token, or null if not available
 */
export async function sega_get_token_price(
  agent: SonicAgentKit,
  mint: string | PublicKey
): Promise<number | null> {
  // Convert PublicKey to string if needed
  const mintStr = mint instanceof PublicKey ? mint.toString() : mint;

  const response = await fetch(
    `https://api.sega.so/sega/price?mint=${mintStr}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get token price: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Token price lookup failed: ${data.message || "Unknown error"}`);
  }

  return data.data.priceInUSD !== null ? parseFloat(data.data.priceInUSD) : null;
}

/**
 * Get mint information from Sega DEX
 * @param agent - SonicAgentKit instance
 * @param mints - Array of token mint addresses
 * @returns Promise resolving to detailed information about the requested tokens
 */
export async function sega_get_mint_info(
  agent: SonicAgentKit,
  mints: (string | PublicKey)[]
): Promise<any[]> {
  // Convert PublicKey objects to strings if needed
  const mintStrs = mints.map(mint => mint instanceof PublicKey ? mint.toString() : mint);
  
  const response = await fetch(
    `https://api.sega.so/api/mint/ids?mints=${mintStrs.join(",")}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get mint info: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Mint info lookup failed: ${data.message || "Unknown error"}`);
  }

  return data.data;
}

/**
 * Get default mint list from Sega DEX
 * @param agent - SonicAgentKit instance
 * @returns Promise resolving to the default mint list, whitelist, and blacklist
 */
export async function sega_get_default_mint_list(
  agent: SonicAgentKit
): Promise<{ mintList: any[], whiteList: string[], blackList: string[] }> {
  const response = await fetch(
    "https://api.sega.so/api/mint/list",
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get default mint list: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Default mint list lookup failed: ${data.message || "Unknown error"}`);
  }

  return data.data;
} 