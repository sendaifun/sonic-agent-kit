import tokenBalancesAction from "./solana/tokenBalances";
import deployTokenAction from "./metaplex/deployToken";
import balanceAction from "./solana/balance";
import transferAction from "./solana/transfer";
import deployCollectionAction from "./metaplex/deployCollection";
import mintNFTAction from "./metaplex/mintNFT";
import requestFundsAction from "./solana/requestFunds";
import getTPSAction from "./solana/getTPS";
import createImageAction from "./agent/createImage";
import getWalletAddressAction from "./agent/getWalletAddress";

export const ACTIONS = {
  WALLET_ADDRESS_ACTION: getWalletAddressAction,
  TOKEN_BALANCES_ACTION: tokenBalancesAction,
  DEPLOY_TOKEN_ACTION: deployTokenAction,
  BALANCE_ACTION: balanceAction,
  TRANSFER_ACTION: transferAction,
  DEPLOY_COLLECTION_ACTION: deployCollectionAction,
  MINT_NFT_ACTION: mintNFTAction,
  REQUEST_FUNDS_ACTION: requestFundsAction,
  GET_TPS_ACTION: getTPSAction,
  CREATE_IMAGE_ACTION: createImageAction,
};

export type { Action, ActionExample, Handler } from "../types/action";
