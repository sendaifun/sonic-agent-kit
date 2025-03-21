import { PublicKey } from "@solana/web3.js";
import { SonicAgentKit } from "../../agent";

/**
 * Get pool information by pool IDs from Sega DEX
 * @param agent - SonicAgentKit instance
 * @param poolIds - Array of pool IDs
 * @returns Promise resolving to detailed information about the requested pools
 */
export async function sega_get_pool_info_by_ids(
  agent: SonicAgentKit,
  poolIds: string[]
): Promise<any[]> {
  const response = await fetch(
    `https://api.sega.so/api/pools/info/ids?ids=${poolIds.join(",")}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get pool info: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Pool info lookup failed: ${data.message || "Unknown error"}`);
  }

  return data.data;
}

/**
 * Get pool information by token mints from Sega DEX
 * @param agent - SonicAgentKit instance
 * @param mint1 - First token mint address
 * @param mint2 - Second token mint address
 * @param page - Page number for pagination (1-indexed)
 * @param pageSize - Number of items per page
 * @param poolType - Optional filter for pool type
 * @returns Promise resolving to paginated pool information matching the token pair
 */
export async function sega_get_pool_info_by_mints(
  agent: SonicAgentKit,
  mint1: string | PublicKey,
  mint2: string | PublicKey,
  page: number = 1,
  pageSize: number = 10,
  poolType?: string
): Promise<{ count: number; data: any[]; hasNextPage: boolean }> {
  // Convert PublicKey objects to strings if needed
  const mint1Str = mint1 instanceof PublicKey ? mint1.toString() : mint1;
  const mint2Str = mint2 instanceof PublicKey ? mint2.toString() : mint2;
  
  let url = `https://api.sega.so/api/pools/info/mint?page=${page}&pageSize=${pageSize}&mint1=${mint1Str}&mint2=${mint2Str}`;
  
  if (poolType) {
    url += `&poolType=${poolType}`;
  }
  
  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get pool info by mints: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Pool info by mints lookup failed: ${data.message || "Unknown error"}`);
  }

  return data.data;
}

/**
 * Get pool information by LP token mints from Sega DEX
 * @param agent - SonicAgentKit instance
 * @param lpMints - Array of LP token mint addresses
 * @returns Promise resolving to pool information for the given LP tokens
 */
export async function sega_get_pool_info_by_lp_mints(
  agent: SonicAgentKit,
  lpMints: (string | PublicKey)[]
): Promise<any[]> {
  // Convert PublicKey objects to strings if needed
  const lpMintStrs = lpMints.map(mint => mint instanceof PublicKey ? mint.toString() : mint);
  
  const response = await fetch(
    `https://api.sega.so/api/pools/info/lps?lps=${lpMintStrs.join(",")}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get pool info by LP mints: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Pool info by LP mints lookup failed: ${data.message || "Unknown error"}`);
  }

  return data.data;
}

/**
 * Get paginated list of pool information from Sega DEX
 * @param agent - SonicAgentKit instance
 * @param page - Page number for pagination (1-indexed)
 * @param pageSize - Number of items per page
 * @param poolType - Optional filter for pool type
 * @param poolSortField - Optional field to sort by
 * @param sortType - Optional sort direction
 * @returns Promise resolving to paginated pool information
 */
export async function sega_get_pool_info_list(
  agent: SonicAgentKit,
  page: number = 1,
  pageSize: number = 10,
  poolType?: string,
  poolSortField?: string,
  sortType?: string
): Promise<{ count: number; data: any[]; hasNextPage: boolean }> {
  let url = `https://api.sega.so/api/pools/info/list?page=${page}&pageSize=${pageSize}`;
  
  if (poolType) {
    url += `&poolType=${poolType}`;
  }
  
  if (poolSortField) {
    url += `&poolSortField=${poolSortField}`;
  }
  
  if (sortType) {
    url += `&sortType=${sortType}`;
  }
  
  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get pool info list: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Pool info list lookup failed: ${data.message || "Unknown error"}`);
  }

  return data.data;
} 