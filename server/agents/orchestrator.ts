import { WeatherAgent } from './weatherAgent';
import { DrainAgent } from './drainAgent';
import { SocialAgent } from './socialAgent';
import { RiskFusionAgent } from './riskFusionAgent';
import { CommsAgent } from './commsAgent';
import { AgentContext } from './base';
import { sendRequest } from './trace';
import { saveForecast, saveIncident, saveSocialIncident, saveAlert, saveRiskAssessment } from '../db';

/**
 * Agent Orchestrator
 * Coordinates the execution of all agents in proper sequence
 */
export class AgentOrchestrator {
  private weatherAgent = new WeatherAgent();
  private drainAgent = new DrainAgent();
  private socialAgent = new SocialAgent();
  private riskFusionAgent = new RiskFusionAgent();
  private commsAgent = new CommsAgent();
  
  private loopInterval: NodeJS.Timeout | null = null;
  private isLooping = false;

  /**
   * Run a single agent cycle
   * Phase 1: Parallel execution of A1, A2, A3
   * Phase 2: A4 fuses the results
   * Phase 3: A6 generates alerts
   */
  async runCycle(context: AgentContext): Promise<any> {
    const correlationId = `cycle-${Date.now()}`;
    const caller = 'A0'; // Orchestrator ID
    
    try {
      // PHASE 1: PARALLEL - Run A1, A2, A3 in parallel
      await sendRequest(caller, 'A1', { phase: 'PARALLEL' }, correlationId);
      await sendRequest(caller, 'A2', { phase: 'PARALLEL' }, correlationId);
      await sendRequest(caller, 'A3', { phase: 'PARALLEL' }, correlationId);
      
      const [weatherData, incidentData, socialData] = await Promise.all([
        this.weatherAgent.run(context, caller, correlationId),
        this.drainAgent.run(context, caller, correlationId),
        this.socialAgent.run(context, caller, correlationId),
      ]);

      // PHASE 2: FUSE - A4 combines all signals
      await sendRequest(caller, 'A4', { phase: 'FUSE' }, correlationId);
      
      const riskContext: AgentContext = {
        ...context,
        params: {
          ...context.params,
          weatherData,
          incidentData,
          socialData,
        },
      };
      
      const riskAssessment = await this.riskFusionAgent.run(riskContext, caller, correlationId);

      // PHASE 3: COMMS - A6 generates alerts
      await sendRequest(caller, 'A6', { phase: 'COMMS' }, correlationId);
      
      const commsContext: AgentContext = {
        ...context,
        params: {
          ...context.params,
          riskAssessment,
        },
      };
      
      const alerts = await this.commsAgent.run(commsContext, caller, correlationId);

      // PERSIST TO DATABASE
      await this.persistCycleResults({
        weatherData,
        incidentData,
        socialData,
        riskAssessment,
        alerts,
        correlationId
      });

      return {
        success: true,
        correlationId,
        results: {
          weather: weatherData,
          incidents: incidentData,
          social: socialData,
          risk: riskAssessment,
          alerts,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Agent cycle error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        correlationId,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Start continuous looping mode
   */
  async startLoop(intervalMs: number, context: AgentContext): Promise<void> {
    if (this.isLooping) {
      throw new Error('Loop already running');
    }

    this.isLooping = true;
    
    // Run first cycle immediately
    await this.runCycle(context);
    
    // Then continue at intervals
    this.loopInterval = setInterval(async () => {
      if (this.isLooping) {
        await this.runCycle(context);
      }
    }, intervalMs);
  }

  /**
   * Stop looping mode
   */
  stopLoop(): void {
    this.isLooping = false;
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }

  /**
   * Check if loop is running
   */
  isLoopRunning(): boolean {
    return this.isLooping;
  }

  /**
   * Persist agent cycle results to database
   */
  private async persistCycleResults(data: any): Promise<void> {
    try {
      const { weatherData, incidentData, socialData, riskAssessment, alerts, correlationId } = data;

      // Save weather forecasts
      if (weatherData?.forecasts) {
        for (const forecast of weatherData.forecasts) {
          await saveForecast({
            zone: forecast.zone,
            rainProb: forecast.rainProb,
            rainAmount: forecast.rainAmount,
            riskScore: forecast.riskScore || 0,
          });
        }
      }

      // Save incidents
      if (incidentData?.incidents) {
        for (const incident of incidentData.incidents) {
          await saveIncident({
            type: incident.type,
            description: incident.description,
            zone: incident.zone,
            locationName: incident.locationName,
            latitude: incident.latitude,
            longitude: incident.longitude,
          });
        }
      }

      // Save social media posts
      if (socialData?.posts) {
        for (const post of socialData.posts) {
          await saveSocialIncident({
            text: post.text,
            user: post.user,
            zone: post.zone,
            riskFlag: post.riskFlag || 0,
          });
        }
      }

      // Save risk assessment
      if (riskAssessment) {
        await saveRiskAssessment({
          overallRiskScore: riskAssessment.overallRiskScore || riskAssessment.riskScore || 0,
          riskTier: riskAssessment.riskTier,
          highRiskZones: JSON.stringify(riskAssessment.highRiskZones || []),
          keyFactors: JSON.stringify(riskAssessment.keyFactors || []),
          confidence: riskAssessment.confidence || 0.5,
          reasoning: riskAssessment.reasoning || '',
          correlationId,
        });
      }

      // Save alerts
      if (alerts?.alerts) {
        for (const alert of alerts.alerts) {
          await saveAlert({
            audience: alert.audience,
            message: alert.message,
            riskTier: alert.riskTier || riskAssessment?.riskTier || 'SAFE',
          });
        }
      }

      console.log(`[Orchestrator] Persisted cycle ${correlationId} to database`);
    } catch (error) {
      console.error('[Orchestrator] Failed to persist cycle results:', error);
    }
  }
}

// Singleton instance
export const orchestrator = new AgentOrchestrator();
