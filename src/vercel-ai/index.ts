import { tool, type CoreTool } from "ai";
import { SonicAgentKit } from "../agent";
import { executeAction } from "../utils/actionExecutor";
import { ACTIONS } from "../actions";

export function createSonicTools(
  sonicAgentKit: SonicAgentKit,
): Record<string, CoreTool> {
  const tools: Record<string, CoreTool> = {};
  const actionKeys = Object.keys(ACTIONS);

  for (const key of actionKeys) {
    const action = ACTIONS[key as keyof typeof ACTIONS];
    tools[key] = tool({
      id: action.name as `${string}.${string}`,
      description: `
      ${action.description}

      Similes: ${action.similes.map(
        (simile: string) => `
        ${simile} 
      `,
      )}
      `.slice(0, 1023),
      parameters: action.schema,
      execute: async (params) =>
        await executeAction(action, sonicAgentKit, params),
    });
  }

  return tools;
}
