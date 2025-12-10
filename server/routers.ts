import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  getAllAlerts,
  getAllForecasts,
  getAllIncidents,
  getAllSocialIncidents,
  saveIncident,
} from "./db";
import { orchestrator } from "./agents/orchestrator";
import { traceStore } from "./agents/trace";
import { iotRouter } from "./routers/iot";
import { z } from "zod";
import * as fs from 'fs';
import * as path from 'path';
import proj4 from 'proj4';

// Define UTM Zone 43N projection for coordinate conversion
proj4.defs('EPSG:32643', '+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // IoT sensor endpoints
  iot: iotRouter,

  flood: router({
    forecasts: publicProcedure.query(async () => {
      return await getAllForecasts();
    }),
    incidents: publicProcedure.query(async () => {
      return await getAllIncidents();
    }),
    reportIncident: publicProcedure
      .input(
        z.object({
          zone: z.string().min(1),
          type: z.enum(["drain", "citizen"]),
          description: z.string().min(1),
          locationName: z.string().min(1).optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await saveIncident({
          zone: input.zone,
          type: input.type,
          description: input.description,
          locationName: input.locationName ?? null,
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
        });

        return { success: true } as const;
      }),
    alerts: publicProcedure.query(async () => {
      return await getAllAlerts();
    }),
    socialReports: publicProcedure.query(async () => {
      return await getAllSocialIncidents();
    }),
    riskMap: publicProcedure.query(async () => {
      try {
        const geojsonPath = path.resolve(
          import.meta.dirname,
          'data',
          'ncr_districts_with_flood_risk.geojson'
        );
        
        const geojsonData = fs.readFileSync(geojsonPath, 'utf-8');
        const geoJson = JSON.parse(geojsonData);
        
        // Convert coordinates from UTM Zone 43N (EPSG:32643) to WGS84 (EPSG:4326)
        if (geoJson.crs?.properties?.name?.includes('32643')) {
          geoJson.features = geoJson.features.map((feature: any) => {
            if (feature.geometry.type === 'LineString') {
              feature.geometry.coordinates = feature.geometry.coordinates.map((coord: number[]) => {
                // Convert from UTM (meters) to WGS84 (degrees): [lng, lat]
                const [lng, lat] = proj4('EPSG:32643', 'EPSG:4326', [coord[0], coord[1]]);
                return [lng, lat];
              });
            }
            return feature;
          });
          // Remove CRS after conversion
          delete geoJson.crs;
        }
        
        return geoJson;
      } catch (error) {
        console.error('[Flood Risk Map] Failed to load GeoJSON:', error);
        return { type: 'FeatureCollection', features: [] };
      }
    }),
    districtRisks: publicProcedure.query(async () => {
      try {
        const geojsonPath = path.resolve(
          import.meta.dirname,
          'data',
          'ncr_districts_with_flood_risk.geojson'
        );
        
        const geojsonData = fs.readFileSync(geojsonPath, 'utf-8');
        const geoJson = JSON.parse(geojsonData);
        
        // Extract district risk data
        const districts = geoJson.features?.map((feature: any) => ({
          name: feature.properties?.NAME || 'Unknown District',
          riskScore: feature.properties?.Average_Flood_Risk || 0,
          riskPercentage: ((feature.properties?.Average_Flood_Risk || 0) * 100).toFixed(4),
          adminLevel: feature.properties?.ADMIN_LEVE || null,
        })) || [];
        
        // Sort by risk (highest first)
        districts.sort((a: any, b: any) => b.riskScore - a.riskScore);
        
        return districts;
      } catch (error) {
        console.error('[District Risks] Failed to load:', error);
        return [];
      }
    }),
  }),

  // Agent operations
  ops: router({
    // Run a single agent cycle
    run: publicProcedure
      .input(z.object({
        inc: z.number().optional().default(1),
        soc: z.number().optional().default(2),
        lat: z.number().optional(),
        lon: z.number().optional(),
        location: z.string().optional(),
        zoneId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const context = {
          location: input.lat && input.lon ? {
            latitude: input.lat,
            longitude: input.lon,
            label: input.location || 'Delhi',
            zoneId: input.zoneId || 'delhi',
          } : undefined,
          params: {
            inc: input.inc,
            soc: input.soc,
          },
        };
        
        return await orchestrator.runCycle(context);
      }),

    // Start continuous loop
    loop: router({
      start: publicProcedure
        .input(z.object({
          intervalMs: z.number().optional().default(15000),
          inc: z.number().optional().default(1),
          soc: z.number().optional().default(2),
          lat: z.number().optional(),
          lon: z.number().optional(),
          location: z.string().optional(),
          zoneId: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const context = {
            location: input.lat && input.lon ? {
              latitude: input.lat,
              longitude: input.lon,
              label: input.location || 'Delhi',
              zoneId: input.zoneId || 'delhi',
            } : undefined,
            params: {
              inc: input.inc,
              soc: input.soc,
            },
          };
          
          await orchestrator.startLoop(input.intervalMs, context);
          
          return {
            success: true,
            message: 'Loop started',
            intervalMs: input.intervalMs,
          };
        }),

      stop: publicProcedure.mutation(async () => {
        orchestrator.stopLoop();
        return {
          success: true,
          message: 'Loop stopped',
        };
      }),

      status: publicProcedure.query(async () => {
        return {
          isRunning: orchestrator.isLoopRunning(),
        };
      }),
    }),

    // Get agent trace (for timeline visualization)
    trace: publicProcedure.query(async () => {
      return traceStore.getAndClear();
    }),
  }),
});

export type AppRouter = typeof appRouter;
