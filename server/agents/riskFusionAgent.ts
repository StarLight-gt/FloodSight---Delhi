import { Agent, AgentContext } from './base';
import { sendRequest, sendResponse } from './trace';
import { invokeLLM } from '../_core/llm';

/**
 * A4 - Risk Fusion Agent
 * Uses AI to analyze weather, incident, and social data
 * Computes comprehensive flood risk scores
 */
export class RiskFusionAgent extends Agent {
  constructor() {
    super('A4', 'Risk Fusion Agent');
  }

  async execute(context: AgentContext, correlationId: string): Promise<any> {
    try {
      const weatherData = context.params?.weatherData || [];
      const incidentData = context.params?.incidentData || [];
      const socialData = context.params?.socialData || [];

      // Use built-in Manus LLM for risk analysis (no rate limits!)
      const prompt = `You are an AI flood risk analyst for Delhi. Analyze the following data and provide a comprehensive risk assessment.

WEATHER DATA:
${JSON.stringify(weatherData, null, 2)}

INCIDENT REPORTS:
${JSON.stringify(incidentData, null, 2)}

SOCIAL MEDIA SIGNALS:
${JSON.stringify(socialData, null, 2)}

Based on this data, provide a JSON response with the following structure:
{
  "overallRiskScore": <number 0.0-1.0>,
  "riskTier": "<SAFE|MEDIUM|HIGH>",
  "highRiskZones": ["<zone1>", "<zone2>"],
  "keyFactors": ["<factor1>", "<factor2>", "<factor3>"],
  "confidence": <number 0.0-1.0>,
  "reasoning": "<brief explanation of the risk assessment>"
}

Consider:
- Rainfall probability and amount
- Number and severity of incidents
- Urgency and sentiment of social posts
- Historical patterns for Delhi monsoon season
- Drain capacity and known flood-prone areas

Respond ONLY with valid JSON, no other text.`;

      const response = await invokeLLM({
        messages: [
          { role: 'system', content: 'You are a flood risk analysis AI. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'risk_assessment',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                overallRiskScore: { type: 'number' },
                riskTier: { type: 'string', enum: ['SAFE', 'MEDIUM', 'HIGH'] },
                highRiskZones: { 
                  type: 'array',
                  items: { type: 'string' }
                },
                keyFactors: {
                  type: 'array',
                  items: { type: 'string' }
                },
                confidence: { type: 'number' },
                reasoning: { type: 'string' }
              },
              required: ['overallRiskScore', 'riskTier', 'highRiskZones', 'keyFactors', 'confidence', 'reasoning'],
              additionalProperties: false
            }
          }
        }
      });

      const content = response.choices[0].message.content;
      let riskAssessment;
      
      try {
        riskAssessment = JSON.parse(typeof content === 'string' ? content : '{}');
      } catch (e) {
        console.error('Failed to parse AI response:', content);
        riskAssessment = this.fallbackRiskCalculation(weatherData, incidentData, socialData);
      }

      return riskAssessment;
    } catch (error) {
      console.error(`[${this.id}] Error:`, error);
      // Fallback calculation if AI fails
      const fallback = this.fallbackRiskCalculation(
        context.params?.weatherData || [],
        context.params?.incidentData || [],
        context.params?.socialData || []
      );
      return fallback;
    }
  }

  private fallbackRiskCalculation(weatherData: any[], incidentData: any[], socialData: any[]): any {
    // Simple weighted average as fallback
    const avgRainProb = weatherData.length > 0
      ? weatherData.reduce((sum: number, w: any) => sum + (w.rainProb || 0), 0) / weatherData.length / 100
      : 0;

    const incidentFactor = Math.min(incidentData.length / 10, 1);
    const socialFactor = Math.min(socialData.length / 5, 1);

    const overallRiskScore = (avgRainProb * 0.4 + incidentFactor * 0.3 + socialFactor * 0.3);

    return {
      overallRiskScore: Math.round(overallRiskScore * 100) / 100,
      riskTier: overallRiskScore > 0.7 ? 'HIGH' : overallRiskScore > 0.4 ? 'MEDIUM' : 'SAFE',
      highRiskZones: weatherData
        .filter((w: any) => (w.rainProb || 0) > 70)
        .map((w: any) => w.zone)
        .slice(0, 3),
      keyFactors: [
        `${weatherData.length} weather forecasts analyzed`,
        `${incidentData.length} incidents reported`,
        `${socialData.length} social media signals`,
      ],
      confidence: 0.6,
      reasoning: 'Fallback calculation used (AI temporarily unavailable)',
    };
  }
}
