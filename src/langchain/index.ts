export * from "./solana";
export * from "./agent";
export * from "./metaplex";
export * from "./sendarcade";
export * from "./sega";

import { SonicAgentKit } from "../agent";
import {
  SolanaBalanceTool,
  SolanaBalanceOtherTool,
  SolanaTransferTool,
  SolanaRequestFundsTool,
  SolanaTPSCalculatorTool,
  SolanaCloseEmptyTokenAccounts,
  SolanaRockPaperScissorsTool,
  SolanaDeployCollectionTool,
  SolanaDeployTokenTool,
  SolanaMintNFTTool,
  SolanaCreateImageTool,
  SolanaGetWalletAddressTool,
} from "./index";
import { SegaSwapTool, SegaSwapQuoteTool } from "./sega";

export function createSonicTools(sonicKit: SonicAgentKit) {
  return [
    new SolanaGetWalletAddressTool(sonicKit),
    new SolanaCreateImageTool(sonicKit),
    new SolanaDeployCollectionTool(sonicKit),
    new SolanaDeployTokenTool(sonicKit),
    new SolanaMintNFTTool(sonicKit),
    new SolanaRockPaperScissorsTool(sonicKit),
    new SolanaBalanceTool(sonicKit),
    new SolanaBalanceOtherTool(sonicKit),
    new SolanaTransferTool(sonicKit),
    new SolanaRequestFundsTool(sonicKit),
    new SolanaTPSCalculatorTool(sonicKit),
    new SolanaCloseEmptyTokenAccounts(sonicKit),
    new SegaSwapTool(sonicKit),
    new SegaSwapQuoteTool(sonicKit),
  ];
}
