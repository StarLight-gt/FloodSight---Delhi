import { Agent, AgentContext } from './base';

/**
 * A1 - Weather Agent
 * Fetches real weather data from Open-Meteo API for Delhi
 * Provides rain probability and expected rainfall for all zones
 */

// Delhi zones for weather monitoring
const DELHI_ZONES = [
  'South Delhi',
  'Central Delhi', 
  'North Delhi',
  'East Delhi',
  'West Delhi',
  'North East Delhi',
  'North West Delhi',
  'South West Delhi',
  'Shahdara',
  'New Delhi',
  'Yamuna Floodplain'
];

// Delhi coordinates (central location)
const DELHI_LAT = 28.65;
const DELHI_LON = 77.23;
const DELHI_ELEVATION = 215;

// Open-Meteo API base URL
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

export class WeatherAgent extends Agent {
  constructor() {
    super('A1', 'Weather Agent');
  }

  async execute(context: AgentContext, correlationId: string): Promise<any> {
    try {
      // Fetch real weather data from Open-Meteo API
      const forecasts = await this.fetchOpenMeteoForecasts();
      
      return {
        agent: this.id,
        forecasts,
        timestamp: new Date().toISOString(),
        correlationId,
        source: 'Open-Meteo API'
      };
    } catch (error) {
      console.error('[A1] Weather forecast error:', error);
      // Fallback to simple random data
      return {
        agent: this.id,
        forecasts: this.getFallbackForecasts(),
        timestamp: new Date().toISOString(),
        correlationId,
        fallback: true
      };
    }
  }

  /**
   * Fetch real weather forecasts from Open-Meteo API
   * Returns forecasts for all Delhi zones based on central Delhi weather
   */
  private async fetchOpenMeteoForecasts(): Promise<any[]> {
    try {
      // Calculate date range for next 3 days
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      // Build API URL
      const params = new URLSearchParams({
        latitude: DELHI_LAT.toString(),
        longitude: DELHI_LON.toString(),
        daily: 'precipitation_sum,precipitation_probability_max,precipitation_probability_mean',
        hourly: 'rain,precipitation_probability',
        current: 'rain,precipitation',
        timezone: 'Asia/Kolkata',
        elevation: DELHI_ELEVATION.toString(),
        start_date: startDate,
        end_date: endDate,
      });

      const url = `${OPEN_METEO_URL}?${params.toString()}`;
      console.log('[A1] Fetching weather from Open-Meteo:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Extract weather data
      // Use current day's data for immediate forecast
      const currentRain = data.current?.rain ?? 0;
      const currentPrecipitation = data.current?.precipitation ?? 0;
      
      // Get today's daily forecast (index 0)
      const dailyData = data.daily;
      const todayPrecipitationSum = dailyData?.precipitation_sum?.[0] ?? 0;
      const todayRainProbMax = dailyData?.precipitation_probability_max?.[0] ?? 0;
      const todayRainProbMean = dailyData?.precipitation_probability_mean?.[0] ?? 0;
      
      // Calculate average expected rainfall (use daily sum or hourly average)
      // If daily sum is available, use it; otherwise estimate from hourly data
      let expectedRainfall = todayPrecipitationSum;
      if (expectedRainfall === 0 && data.hourly?.rain) {
        // Calculate average hourly rain for today
        const hourlyRain = data.hourly.rain.slice(0, 24); // First 24 hours = today
        const sum = hourlyRain.reduce((acc: number, val: number) => acc + (val || 0), 0);
        expectedRainfall = sum;
      }

      // Use maximum probability as the main rain probability
      const rainProbability = Math.max(todayRainProbMax, todayRainProbMean);

      // Generate forecasts for all zones with slight variations
      const forecasts = DELHI_ZONES.map(zone => {
        // Yamuna Floodplain and low-lying areas get higher risk
        const isHighRisk = zone.includes('Yamuna') || zone.includes('East') || zone.includes('Floodplain');
        const zoneRiskMultiplier = isHighRisk ? 1.15 : 1.0;
        
        // Add slight variation per zone (±10% for probability, ±20% for rainfall)
        const zoneVariation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        const rainProb = Math.min(100, Math.round(rainProbability * zoneVariation));
        const rainAmount = Math.max(0, Math.round(expectedRainfall * zoneVariation * 10) / 10);
        
        // Calculate risk score based on rain amount and zone characteristics
        const baseRisk = Math.min(1.0, rainAmount / 50); // Normalize: 50mm = max risk
        const riskScore = Math.min(1.0, baseRisk * zoneRiskMultiplier);

        return {
          zone,
          rainProb,
          rainAmount,
          riskScore: Math.round(riskScore * 100) / 100,
          source: 'Open-Meteo',
          timestamp: new Date().toISOString(),
        };
      });

      console.log('[A1] Successfully fetched weather data:', {
        rainProbability,
        expectedRainfall,
        forecastsCount: forecasts.length,
      });

      return forecasts;
    } catch (error) {
      console.error('[A1] Open-Meteo API fetch failed:', error);
      throw error; // Let it fall back to getFallbackForecasts
    }
  }

  /**
   * Fallback: Generate simple realistic forecasts without AI
   */
  private getFallbackForecasts(): any[] {
    return DELHI_ZONES.map(zone => {
      // Yamuna Floodplain and low-lying areas get higher risk
      const isHighRisk = zone.includes('Yamuna') || zone.includes('East');
      const baseRisk = isHighRisk ? 0.7 : 0.4;
      
      const rainProb = 65 + Math.random() * 30; // 65-95%
      const rainAmount = 12 + Math.random() * 28; // 12-40mm
      const riskScore = Math.min(1.0, baseRisk + (rainAmount / 100) + Math.random() * 0.2);
      
      return {
        zone,
        rainProb: Math.round(rainProb),
        rainAmount: Math.round(rainAmount * 10) / 10,
        riskScore: Math.round(riskScore * 100) / 100
      };
    });
  }

}
