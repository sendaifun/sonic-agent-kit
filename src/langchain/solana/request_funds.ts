import { Tool } from "langchain/tools";
import { SonicAgentKit } from "../../agent";

export class SolanaRequestFundsTool extends Tool {
  name = "solana_request_funds";
  description = "Request SOL from Solana faucet (devnet/testnet only)";

  constructor(private sonicKit: SonicAgentKit) {
    super();
  }

  protected async _call(_input: string): Promise<string> {
    try {
      await this.sonicKit.requestFaucetFunds();

      return JSON.stringify({
        status: "success",
        message: "Successfully requested faucet funds",
        network: this.sonicKit.connection.rpcEndpoint.split("/")[2],
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
