import { Agent, AgentContext } from './base';
import { invokeLLM } from '../_core/llm';

/**
 * A3 - Social Media Agent
 * Generates realistic AI-powered social media posts about Delhi floods
 * (Twitter API free tier doesn't support reading tweets)
 */
export class SocialAgent extends Agent {
  constructor() {
    super('A3', 'Social Media Agent');
  }

  async execute(context: AgentContext, correlationId: string): Promise<any> {
    const zone = context.location?.label || 'Delhi';
    const socialCount = context.params?.soc || 5;

    return this.generateAIPosts(zone, socialCount, correlationId);
  }

  private async generateAIPosts(zone: string, count: number, correlationId: string): Promise<any> {
    const prompt = `Generate ${count} realistic social media posts (like Twitter/X) about flooding or weather in ${zone}, Delhi during monsoon season.

Mix of:
- Urgent flood warnings (high risk) - 30%
- Waterlogging reports - 30%
- Weather observations - 20%
- Normal rain updates (low risk) - 20%

Include:
- Realistic usernames (mix of real names and handles)
- Authentic Delhi locations (ITO, Yamuna, Najafgarh, Minto Bridge, etc.)
- Appropriate hashtags (#DelhiFloods, #DelhiRains, #Monsoon2024)
- Varied tone and writing styles
- Some typos or informal language for authenticity

Return JSON:
{
  "posts": [
    {
      "text": "<tweet text with hashtags and location>",
      "user": "@username",
      "riskFlag": <0 or 1>,
      "sentiment": "<urgent|concerned|neutral>"
    }
  ]
}

Make posts feel completely authentic. Respond ONLY with valid JSON.`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: 'system', content: 'You are a social media monitoring AI. Generate realistic flood-related posts that sound like real people tweeting during a flood event. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'social_posts',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                posts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      text: { type: 'string' },
                      user: { type: 'string' },
                      riskFlag: { type: 'number' },
                      sentiment: { type: 'string' }
                    },
                    required: ['text', 'user', 'riskFlag', 'sentiment'],
                    additionalProperties: false
                  }
                }
              },
              required: ['posts'],
              additionalProperties: false
            }
          }
        }
      });

      const content = response.choices[0].message.content;
      const data = JSON.parse(typeof content === 'string' ? content : '{"posts":[]}');
      const posts = (data.posts || []).map((p: any) => ({
        ...p,
        zone,
        platform: 'social_media',
        timestamp: new Date().toISOString()
      }));
      
      return {
        agent: this.id,
        zone,
        posts,
        totalPosts: posts.length,
        highRiskCount: posts.filter((p: any) => p.riskFlag === 1).length,
        source: 'ai_generated',
        timestamp: new Date().toISOString(),
        correlationId
      };
    } catch (error) {
      console.error(`[${this.id}] AI generation error:`, error);
      // Fallback to simple simulated data
      const posts = [];
      const locations = ['ITO', 'Yamuna Bank', 'Najafgarh', 'Minto Bridge', 'Anand Vihar', 'Kashmere Gate'];
      const users = ['@delhi_citizen', '@yamuna_watch', '@flood_alert_ncr', '@weather_delhi', '@ncr_updates'];
      
      for (let i = 0; i < count; i++) {
        const isHighRisk = Math.random() > 0.6;
        const location = locations[Math.floor(Math.random() * locations.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        
        posts.push({
          text: isHighRisk 
            ? `Severe waterlogging at ${location}! Water entering homes. Need immediate help #DelhiFloods #Emergency`
            : `Light rain at ${location}, roads clear for now #DelhiRains #Monsoon2024`,
          user,
          zone,
          platform: 'social_media',
          riskFlag: isHighRisk ? 1 : 0,
          sentiment: isHighRisk ? 'urgent' : 'neutral',
          timestamp: new Date().toISOString()
        });
      }
      
      return {
        agent: this.id,
        zone,
        posts,
        totalPosts: posts.length,
        highRiskCount: posts.filter(p => p.riskFlag === 1).length,
        source: 'fallback',
        timestamp: new Date().toISOString(),
        correlationId
      };
    }
  }
}
