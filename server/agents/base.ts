import { sendRequest, sendResponse } from './trace';

export type AgentContext = {
  location?: {
    latitude: number;
    longitude: number;
    label: string;
    zoneId: string;
  };
  params?: Record<string, any>;
};

/**
 * Base Agent class
 */
export abstract class Agent {
  constructor(public id: string, public name: string) {}

  /**
   * Main execution method - must be implemented by each agent
   */
  abstract execute(context: AgentContext, correlationId: string): Promise<any>;

  /**
   * Send request to another agent
   */
  protected async request(targetAgent: string, payload?: any, correlationId?: string): Promise<string> {
    return await sendRequest(this.id, targetAgent, payload, correlationId);
  }

  /**
   * Send response back to caller
   */
  protected async respond(targetAgent: string, payload?: any, correlationId?: string) {
    await sendResponse(this.id, targetAgent, payload, correlationId);
  }

  /**
   * Run the agent with proper request/response tracking
   */
  async run(context: AgentContext, caller: string = 'A0', correlationId?: string): Promise<any> {
    const corrId = correlationId || `corr-${Date.now()}`;
    
    // Execute agent logic
    const result = await this.execute(context, corrId);
    
    // Send response back to caller
    await this.respond(caller, result, corrId);
    
    return result;
  }
}
