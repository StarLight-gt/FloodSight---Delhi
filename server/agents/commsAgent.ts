import { Agent, AgentContext } from './base';
import { invokeLLM } from '../_core/llm';

/**
 * A6 - Communications Agent
 * Generates alerts for operations teams and public based on risk assessment
 */
export class CommsAgent extends Agent {
  constructor() {
    super('A6', 'Communications Agent');
  }

  async execute(context: AgentContext, correlationId: string): Promise<any> {
    const zone = context.location?.label || 'Delhi';
    const { riskAssessment } = context.params || {};
    
    const riskTier = riskAssessment?.assessment?.riskTier || 'MEDIUM';
    const riskScore = riskAssessment?.assessment?.riskScore || 0.5;
    const reasoning = riskAssessment?.assessment?.reasoning || 'Risk assessment pending';
    
    // Use AI to generate appropriate alerts
    const prompt = `You are an emergency communications AI for flood alerts in ${zone}, Delhi.

Risk Assessment:
- Risk Tier: ${riskTier}
- Risk Score: ${riskScore.toFixed(2)}
- Analysis: ${reasoning}

Generate TWO alerts in JSON format:
{
  "publicAlert": {
    "message": "<clear, actionable message for general public>",
    "tone": "<urgent|cautious|informative>"
  },
  "opsAlert": {
    "message": "<technical message for operations team with specific actions>",
    "actions": ["<action1>", "<action2>"]
  }
}

Guidelines:
- HIGH risk: Use urgent tone, evacuation warnings, emergency actions
- MEDIUM risk: Cautionary tone, avoid travel, prepare teams
- SAFE: Informative tone, normal monitoring, routine checks

Respond ONLY with valid JSON.`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: 'system', content: 'You are an emergency communications AI. Generate clear, actionable flood alerts. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'alerts',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                publicAlert: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    tone: { type: 'string' }
                  },
                  required: ['message', 'tone'],
                  additionalProperties: false
                },
                opsAlert: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    actions: {
                      type: 'array',
                      items: { type: 'string' }
                    }
                  },
                  required: ['message', 'actions'],
                  additionalProperties: false
                }
              },
              required: ['publicAlert', 'opsAlert'],
              additionalProperties: false
            }
          }
        }
      });

      const content = response.choices[0].message.content;
      const alerts = JSON.parse(typeof content === 'string' ? content : '{}');
      
      return {
        agent: this.id,
        zone,
        riskTier,
        alerts: [
          {
            audience: 'public',
            message: alerts.publicAlert?.message || 'Monitor weather conditions',
            riskTier,
            tone: alerts.publicAlert?.tone
          },
          {
            audience: 'ops',
            message: alerts.opsAlert?.message || 'Continue routine monitoring',
            riskTier,
            actions: alerts.opsAlert?.actions || []
          }
        ],
        timestamp: new Date().toISOString(),
        correlationId
      };
    } catch (error) {
      // Fallback to template-based alerts
      const templates = {
        HIGH: {
          public: `🚨 HIGH ALERT: Severe flood risk in ${zone}. Evacuate low-lying areas immediately. Avoid all travel.`,
          ops: `URGENT: Deploy emergency pumps in ${zone}. Activate evacuation protocols. Traffic diversions required.`,
          actions: ['Deploy emergency pumps', 'Activate evacuation', 'Set up traffic diversions']
        },
        MEDIUM: {
          public: `⚠️ MEDIUM ALERT: Waterlogging expected in ${zone}. Avoid unnecessary travel. Monitor updates.`,
          ops: `Deploy maintenance teams to ${zone}. Clear drains. Prepare emergency equipment.`,
          actions: ['Clear drains', 'Deploy maintenance teams', 'Prepare emergency equipment']
        },
        SAFE: {
          public: `✅ SAFE: ${zone} showing low flood risk. Normal precautions advised.`,
          ops: `Routine monitoring in ${zone}. Keep emergency teams on standby.`,
          actions: ['Routine monitoring', 'Standby mode']
        }
      };
      
      const template = templates[riskTier as keyof typeof templates] || templates.MEDIUM;
      
      return {
        agent: this.id,
        zone,
        riskTier,
        alerts: [
          {
            audience: 'public',
            message: template.public,
            riskTier
          },
          {
            audience: 'ops',
            message: template.ops,
            riskTier,
            actions: template.actions
          }
        ],
        timestamp: new Date().toISOString(),
        correlationId,
        fallback: true
      };
    }
  }
}
