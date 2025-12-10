/**
 * Agent-to-Agent (A2A) trace system
 * Tracks all agent communications for real-time monitoring
 */

export type A2AEnvelope = {
  dir: '→' | '←';
  env: {
    a2a: string;
    id: string;
    from: string;
    to: string;
    type: 'request' | 'response' | 'event';
    timestamp: string;
    payload?: any;
    correlationId?: string;
  };
};

class TraceStore {
  private trace: A2AEnvelope[] = [];
  private maxSize = 200;

  push(envelope: A2AEnvelope) {
    this.trace.push(envelope);
    // Keep only recent entries
    if (this.trace.length > this.maxSize) {
      this.trace = this.trace.slice(-this.maxSize);
    }
  }

  getAndClear(): A2AEnvelope[] {
    const copy = [...this.trace];
    this.trace = [];
    return copy;
  }

  getRecent(count: number = 50): A2AEnvelope[] {
    return this.trace.slice(-count);
  }
}

export const traceStore = new TraceStore();

/**
 * Helper to create a request envelope
 */
export function createRequest(from: string, to: string, payload?: any, correlationId?: string): A2AEnvelope {
  return {
    dir: '→',
    env: {
      a2a: '1.0',
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      type: 'request',
      timestamp: new Date().toISOString(),
      payload,
      correlationId: correlationId || `corr-${Date.now()}`,
    },
  };
}

/**
 * Helper to create a response envelope
 */
export function createResponse(from: string, to: string, payload?: any, correlationId?: string): A2AEnvelope {
  return {
    dir: '←',
    env: {
      a2a: '1.0',
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      type: 'response',
      timestamp: new Date().toISOString(),
      payload,
      correlationId: correlationId || `corr-${Date.now()}`,
    },
  };
}

/**
 * Simulate agent communication with delay
 */
export async function sendRequest(from: string, to: string, payload?: any, correlationId?: string): Promise<any> {
  const req = createRequest(from, to, payload, correlationId);
  traceStore.push(req);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  return req.env.correlationId;
}

/**
 * Send response back
 */
export async function sendResponse(from: string, to: string, payload?: any, correlationId?: string) {
  const res = createResponse(from, to, payload, correlationId);
  traceStore.push(res);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
}
