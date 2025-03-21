import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { DEFAULT_OPTIONS } from "../constants";
import {
  deploy_collection,
  deploy_token,
  get_balance,
  get_balance_other,
  getTPS,
  mintCollectionNFT,
  request_faucet_funds,
  transfer,
  rock_paper_scissor,
  closeEmptyTokenAccounts,
  get_token_balance,
  sega_swap_compute,
  sega_smart_swap_compute,
  sega_swap_transaction,
  sega_get_token_price,
  sega_get_mint_info,
  sega_get_default_mint_list,
  sega_get_pool_info_by_ids,
  sega_get_pool_info_by_mints,
  sega_get_pool_info_by_lp_mints,
  sega_get_pool_info_list,
  sega_get_leaderboard,
  sega_get_sonic_stats,
  sega_faucet_request,
} from "../tools";
import {
  Config,
  CollectionDeployment,
  CollectionOptions,
  MintCollectionNFTResponse,
  SegaSwapResponse,
  SwapType,
  SegaLeaderboard,
  SegaSonicStats,
} from "../types";

/**
 * Main class for interacting with Sonic blockchain
 * Provides a unified interface for token operations, NFT management, trading and more
 *
 * @class SonicAgentKit
 * @property {Connection} connection - Sonic RPC connection
 * @property {Keypair} wallet - Wallet keypair for signing transactions
 * @property {PublicKey} wallet_address - Public key of the wallet
 * @property {Config} config - Configuration object
 */
export class SonicAgentKit {
  public connection: Connection;
  public wallet: Keypair;
  public wallet_address: PublicKey;
  public config: Config;

  /**
   * @deprecated Using openai_api_key directly in constructor is deprecated.
   * Please use the new constructor with Config object instead:
   * @example
   * const agent = new SonicAgentKit(privateKey, rpcUrl, {
   *   OPENAI_API_KEY: 'your-key'
   * });
   */
  constructor(
    private_key: string,
    rpc_url: string,
    configOrKey: Config | string | null,
  ) {
    this.connection = new Connection(
      rpc_url || "https://api.testnet.sonic.game",
    );
    this.wallet = Keypair.fromSecretKey(bs58.decode(private_key));
    this.wallet_address = this.wallet.publicKey;

    if (typeof configOrKey === "string" || configOrKey === null) {
      this.config = { OPENAI_API_KEY: configOrKey || "" };
    } else {
      this.config = configOrKey;
    }
  }

  // Tool methods
  async requestFaucetFunds() {
    return request_faucet_funds(this);
  }

  async deployToken(
    name: string,
    uri: string,
    symbol: string,
    decimals: number = DEFAULT_OPTIONS.TOKEN_DECIMALS,
    initialSupply?: number,
  ): Promise<{ mint: PublicKey }> {
    return deploy_token(this, name, uri, symbol, decimals, initialSupply);
  }

  async deployCollection(
    options: CollectionOptions,
  ): Promise<CollectionDeployment> {
    return deploy_collection(this, options);
  }

  async getBalance(token_address?: PublicKey): Promise<number> {
    return get_balance(this, token_address);
  }

  async getTokenBalances(wallet_address?: PublicKey): Promise<{
    sol: number;
    tokens: Array<{
      tokenAddress: string;
      name: string;
      symbol: string;
      balance: number;
      decimals: number;
    }>;
  }> {
    return get_token_balance(this, wallet_address);
  }

  async getBalanceOther(
    walletAddress: PublicKey,
    tokenAddress?: PublicKey,
  ): Promise<number> {
    return get_balance_other(this, walletAddress, tokenAddress);
  }

  async mintNFT(
    collectionMint: PublicKey,
    metadata: Parameters<typeof mintCollectionNFT>[2],
    recipient?: PublicKey,
  ): Promise<MintCollectionNFTResponse> {
    return mintCollectionNFT(this, collectionMint, metadata, recipient);
  }

  async transfer(
    to: PublicKey,
    amount: number,
    mint?: PublicKey,
  ): Promise<string> {
    return transfer(this, to, amount, mint);
  }

  async getTPS(): Promise<number> {
    return getTPS(this);
  }

  async rockPaperScissors(
    amount: number,
    choice: "rock" | "paper" | "scissors",
  ) {
    return rock_paper_scissor(this, amount, choice);
  }

  async closeEmptyTokenAccounts(): Promise<{
    signature: string;
    size: number;
  }> {
    return closeEmptyTokenAccounts(this);
  }

  // SEGA DEX METHODS

  /**
   * Compute a swap on Sega DEX
   * @param inputMint - Input token mint address
   * @param outputMint - Output token mint address
   * @param amount - Amount to swap (in token's smallest units)
   * @param swapType - Type of swap (swap-base-in or swap-base-out)
   * @param slippageBps - Slippage tolerance in basis points (e.g., 50 = 0.5%)
   * @param txVersion - Transaction version (e.g., "V0")
   * @returns Promise resolving to swap computation details
   */
  async segaComputeSwap(
    inputMint: string | PublicKey,
    outputMint: string | PublicKey,
    amount: string | number,
    swapType: SwapType = "swap-base-in",
    slippageBps: number = 50,
    txVersion: string = "V0"
  ): Promise<SegaSwapResponse> {
    return sega_swap_compute(
      this,
      inputMint,
      outputMint,
      amount,
      swapType,
      slippageBps,
      txVersion
    );
  }

  /**
   * Compute a swap using smart routing on Sega DEX
   * @param inputMint - Input token mint address
   * @param outputMint - Output token mint address
   * @param amount - Amount to swap (in token's smallest units)
   * @param swapType - Type of swap (swap-base-in or swap-base-out)
   * @param slippageBps - Slippage tolerance in basis points (e.g., 50 = 0.5%)
   * @param txVersion - Transaction version (e.g., "V0")
   * @returns Promise resolving to swap computation details with optimal routing
   */
  async segaComputeSmartSwap(
    inputMint: string | PublicKey,
    outputMint: string | PublicKey,
    amount: string | number,
    swapType: SwapType = "swap-base-in",
    slippageBps: number = 50,
    txVersion: string = "V0"
  ): Promise<SegaSwapResponse> {
    return sega_smart_swap_compute(
      this,
      inputMint,
      outputMint,
      amount,
      swapType,
      slippageBps,
      txVersion
    );
  }

  /**
   * Generate a serialized transaction for a swap on Sega DEX
   * @param swapResponse - The response from a swap computation call
   * @param txVersion - Transaction version (e.g., "V0")
   * @param computeUnitPriceMicroLamports - Optional compute unit price in micro lamports
   * @param wrapSol - Whether to wrap SOL if needed
   * @param unwrapSol - Whether to unwrap SOL if needed
   * @param outputAccount - Optional specific output account
   * @returns Promise resolving to an array of serialized transactions
   */
  async segaSwapTransaction(
    swapResponse: SegaSwapResponse,
    txVersion: string = "V0",
    computeUnitPriceMicroLamports?: string,
    wrapSol: boolean = true,
    unwrapSol: boolean = true,
    outputAccount?: string | PublicKey
  ): Promise<string[]> {
    return sega_swap_transaction(
      this,
      swapResponse,
      txVersion,
      computeUnitPriceMicroLamports,
      wrapSol,
      unwrapSol,
      outputAccount
    );
  }

  /**
   * Get the USD price of a token from Sega DEX
   * @param mint - Token mint address
   * @returns Promise resolving to the USD price of the token, or null if not available
   */
  async segaGetTokenPrice(
    mint: string | PublicKey
  ): Promise<number | null> {
    return sega_get_token_price(this, mint);
  }

  /**
   * Get mint information from Sega DEX
   * @param mints - Array of token mint addresses
   * @returns Promise resolving to detailed information about the requested tokens
   */
  async segaGetMintInfo(
    mints: (string | PublicKey)[]
  ): Promise<any[]> {
    return sega_get_mint_info(this, mints);
  }

  /**
   * Get default mint list from Sega DEX
   * @returns Promise resolving to the default mint list, whitelist, and blacklist
   */
  async segaGetDefaultMintList(): Promise<{ mintList: any[], whiteList: string[], blackList: string[] }> {
    return sega_get_default_mint_list(this);
  }

  /**
   * Get pool information by pool IDs from Sega DEX
   * @param poolIds - Array of pool IDs
   * @returns Promise resolving to detailed information about the requested pools
   */
  async segaGetPoolInfoByIds(
    poolIds: string[]
  ): Promise<any[]> {
    return sega_get_pool_info_by_ids(this, poolIds);
  }

  /**
   * Get pool information by token mints from Sega DEX
   * @param mint1 - First token mint address
   * @param mint2 - Second token mint address
   * @param page - Page number for pagination (1-indexed)
   * @param pageSize - Number of items per page
   * @param poolType - Optional filter for pool type
   * @returns Promise resolving to paginated pool information matching the token pair
   */
  async segaGetPoolInfoByMints(
    mint1: string | PublicKey,
    mint2: string | PublicKey,
    page: number = 1,
    pageSize: number = 10,
    poolType?: string
  ): Promise<{ count: number; data: any[]; hasNextPage: boolean }> {
    return sega_get_pool_info_by_mints(this, mint1, mint2, page, pageSize, poolType);
  }

  /**
   * Get pool information by LP token mints from Sega DEX
   * @param lpMints - Array of LP token mint addresses
   * @returns Promise resolving to pool information for the given LP tokens
   */
  async segaGetPoolInfoByLpMints(
    lpMints: (string | PublicKey)[]
  ): Promise<any[]> {
    return sega_get_pool_info_by_lp_mints(this, lpMints);
  }

  /**
   * Get paginated list of pool information from Sega DEX
   * @param page - Page number for pagination (1-indexed)
   * @param pageSize - Number of items per page
   * @param poolType - Optional filter for pool type
   * @param poolSortField - Optional field to sort by
   * @param sortType - Optional sort direction
   * @returns Promise resolving to paginated pool information
   */
  async segaGetPoolInfoList(
    page: number = 1,
    pageSize: number = 10,
    poolType?: string,
    poolSortField?: string,
    sortType?: string
  ): Promise<{ count: number; data: any[]; hasNextPage: boolean }> {
    return sega_get_pool_info_list(this, page, pageSize, poolType, poolSortField, sortType);
  }

  /**
   * Get the Sega DEX leaderboard
   * @returns Promise resolving to the leaderboard data
   */
  async segaGetLeaderboard(): Promise<SegaLeaderboard> {
    return sega_get_leaderboard(this);
  }

  /**
   * Get Sonic stats for the agent's wallet
   * @param startTime - Optional start time in unix timestamp
   * @param endTime - Optional end time in unix timestamp
   * @returns Promise resolving to the Sonic stats
   */
  async segaGetSonicStats(
    startTime?: number,
    endTime?: number
  ): Promise<SegaSonicStats> {
    return sega_get_sonic_stats(this, startTime, endTime);
  }

  /**
   * Request tokens from the Sega faucet (for testnet/devnet)
   * @returns Promise resolving to confirmation of the faucet request
   */
  async segaFaucetRequest(): Promise<{ wallet: string }> {
    return sega_faucet_request(this);
  }
}
