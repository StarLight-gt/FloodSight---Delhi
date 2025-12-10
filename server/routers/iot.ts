import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';

/**
 * IoT Router
 * Endpoints for receiving water level data from IoT sensors
 * 
 * FOR TEAMMATE: Use these endpoints to send Yamuna water level data
 */

// Water level data schema
const WaterLevelInput = z.object({
  sensorId: z.string().describe('Unique sensor identifier'),
  location: z.string().describe('Sensor location (e.g., "Yamuna at ITO Bridge")'),
  latitude: z.number().describe('GPS latitude'),
  longitude: z.number().describe('GPS longitude'),
  waterLevel: z.number().describe('Water level in meters'),
  dangerLevel: z.number().optional().describe('Danger threshold in meters'),
  timestamp: z.string().optional().describe('ISO timestamp from sensor'),
});

// Store latest water level readings in memory
// TODO: Save to database for persistence
const waterLevelReadings: Map<string, any> = new Map();

export const iotRouter = router({
  /**
   * Submit water level reading from IoT sensor
   * 
   * Example usage from IoT device:
   * POST /api/trpc/iot.submitWaterLevel
   * {
   *   "sensorId": "yamuna-ito-001",
   *   "location": "Yamuna at ITO Bridge",
   *   "latitude": 28.6289,
   *   "longitude": 77.2065,
   *   "waterLevel": 205.5,
   *   "dangerLevel": 204.5,
   *   "timestamp": "2025-11-13T10:30:00Z"
   * }
   */
  submitWaterLevel: publicProcedure
    .input(WaterLevelInput)
    .mutation(async ({ input }) => {
      const reading = {
        ...input,
        timestamp: input.timestamp || new Date().toISOString(),
        receivedAt: new Date().toISOString(),
      };

      // Store reading
      waterLevelReadings.set(input.sensorId, reading);

      // Check if water level exceeds danger threshold
      const isDangerous = input.dangerLevel 
        ? input.waterLevel > input.dangerLevel 
        : false;

      console.log(`[IoT] Water level received: ${input.location} = ${input.waterLevel}m ${isDangerous ? '⚠️ DANGER' : '✓'}`);

      return {
        success: true,
        reading,
        alert: isDangerous ? {
          level: 'HIGH',
          message: `Water level (${input.waterLevel}m) exceeds danger threshold (${input.dangerLevel}m) at ${input.location}`
        } : null
      };
    }),

  /**
   * Get latest water level readings from all sensors
   */
  getWaterLevels: publicProcedure
    .query(async () => {
      const readings = Array.from(waterLevelReadings.values());
      
      return {
        count: readings.length,
        readings,
        lastUpdated: readings.length > 0 
          ? readings.sort((a, b) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )[0].timestamp
          : null
      };
    }),

  /**
   * Get water level for specific sensor
   */
  getSensorReading: publicProcedure
    .input(z.object({ sensorId: z.string() }))
    .query(async ({ input }) => {
      const reading = waterLevelReadings.get(input.sensorId);
      
      if (!reading) {
        throw new Error(`No reading found for sensor: ${input.sensorId}`);
      }

      return reading;
    }),

  /**
   * Generate mock water level data (for testing without real sensors)
   */
  generateMockData: publicProcedure
    .mutation(async () => {
      const mockSensors = [
        {
          sensorId: 'yamuna-ito-001',
          location: 'Yamuna at ITO Bridge',
          latitude: 28.6289,
          longitude: 77.2065,
          dangerLevel: 204.5,
        },
        {
          sensorId: 'yamuna-wazirabad-001',
          location: 'Yamuna at Wazirabad Barrage',
          latitude: 28.7196,
          longitude: 77.2294,
          dangerLevel: 203.0,
        },
        {
          sensorId: 'najafgarh-drain-001',
          location: 'Najafgarh Drain',
          latitude: 28.6092,
          longitude: 77.0432,
          dangerLevel: 2.5,
        },
      ];

      const readings = mockSensors.map(sensor => {
        // Generate realistic water level (sometimes above danger level)
        const variation = (Math.random() - 0.5) * 2; // -1 to +1
        const waterLevel = sensor.dangerLevel + variation;

        const reading = {
          ...sensor,
          waterLevel: Math.round(waterLevel * 100) / 100,
          timestamp: new Date().toISOString(),
          receivedAt: new Date().toISOString(),
          mock: true,
        };

        waterLevelReadings.set(sensor.sensorId, reading);
        return reading;
      });

      console.log('[IoT] Generated mock water level data for testing');

      return {
        success: true,
        readings,
        message: 'Mock data generated successfully'
      };
    }),
});
