import { Agent, AgentContext } from './base';

/**
 * A2 - Drain/Grid Agent
 * Processes drain conditions and citizen incident reports
 */
export class DrainAgent extends Agent {
  constructor() {
    super('A2', 'Drain/Grid Agent');
  }

  async execute(context: AgentContext, correlationId: string): Promise<any> {
    const zone = context.location?.label || 'Delhi';
    const incidentCount = context.params?.inc || 1;
    
    // Simulate checking drain status and processing incident reports
    const incidents = [];
    
    for (let i = 0; i < incidentCount; i++) {
      const isDrainIncident = Math.random() > 0.5;
      const severity = Math.random();
      
      incidents.push({
        type: isDrainIncident ? 'drain' : 'citizen',
        zone,
        severity: severity > 0.7 ? 'high' : severity > 0.4 ? 'medium' : 'low',
        description: isDrainIncident 
          ? `Drain ${Math.random() > 0.5 ? 'overflow' : 'blockage'} detected`
          : `Waterlogging reported by citizen`,
        timestamp: new Date().toISOString(),
        location: {
          lat: 28.6 + (Math.random() - 0.5) * 0.2,
          lon: 77.2 + (Math.random() - 0.5) * 0.2
        }
      });
    }
    
    return {
      agent: this.id,
      zone,
      incidents,
      totalIncidents: incidents.length,
      highSeverityCount: incidents.filter(i => i.severity === 'high').length,
      timestamp: new Date().toISOString(),
      correlationId
    };
  }
}
