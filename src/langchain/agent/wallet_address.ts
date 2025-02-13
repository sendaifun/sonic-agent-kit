import { Tool } from "langchain/tools";
import { SonicAgentKit } from "../../agent";

export class SolanaGetWalletAddressTool extends Tool {
  name = "solana_get_wallet_address";
  description = `Get the wallet address of the agent`;

  constructor(private sonicKit: SonicAgentKit) {
    super();
  }

  async _call(_input: string): Promise<string> {
    return this.sonicKit.wallet_address.toString();
  }
}
