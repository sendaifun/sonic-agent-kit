import { SonicAgentKit } from "../../agent";

/**
 * Get the agents wallet address
 * @param agent - SonicAgentKit instance
 * @returns string
 */
export function get_wallet_address(agent: SonicAgentKit) {
  return agent.wallet_address.toBase58();
}
