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
} from "../tools";
import {
  Config,
  CollectionDeployment,
  CollectionOptions,
  MintCollectionNFTResponse,
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
}
