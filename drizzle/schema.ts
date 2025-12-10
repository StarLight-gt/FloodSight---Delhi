import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, float } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Weather forecasts for Delhi zones
 */
export const forecasts = mysqlTable("forecasts", {
  id: int("id").autoincrement().primaryKey(),
  zone: varchar("zone", { length: 100 }).notNull(),
  rainProb: float("rainProb").notNull(), // Probability of rain (0-100)
  rainAmount: float("rainAmount"), // Expected rainfall in mm
  riskScore: float("riskScore").notNull().default(0), // Flood risk score (0-1)
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type Forecast = typeof forecasts.$inferSelect;
export type InsertForecast = typeof forecasts.$inferInsert;

/**
 * Flood incidents reported by citizens or drains
 */
export const incidents = mysqlTable("incidents", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["drain", "citizen"]).notNull(),
  description: text("description").notNull(),
  zone: varchar("zone", { length: 100 }).notNull(),
  photoUrl: text("photoUrl"),
  locationName: varchar("locationName", { length: 200 }),
  latitude: float("latitude"),
  longitude: float("longitude"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

/**
 * Social media incident reports
 */
export const socialIncidents = mysqlTable("socialIncidents", {
  id: int("id").autoincrement().primaryKey(),
  text: text("text").notNull(),
  user: varchar("user", { length: 100 }).notNull(),
  zone: varchar("zone", { length: 100 }).notNull(),
  riskFlag: int("riskFlag").notNull().default(0), // 0 = false, 1 = true
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type SocialIncident = typeof socialIncidents.$inferSelect;
export type InsertSocialIncident = typeof socialIncidents.$inferInsert;

/**
 * Alerts for public and operations
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  audience: mysqlEnum("audience", ["ops", "public"]).notNull(),
  message: text("message").notNull(),
  riskTier: mysqlEnum("riskTier", ["SAFE", "MEDIUM", "HIGH"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * Risk assessments from A4 agent (Gemini AI)
 */
export const riskAssessments = mysqlTable("riskAssessments", {
  id: int("id").autoincrement().primaryKey(),
  overallRiskScore: float("overallRiskScore").notNull(),
  riskTier: mysqlEnum("riskTier", ["SAFE", "MEDIUM", "HIGH"]).notNull(),
  highRiskZones: text("highRiskZones"), // JSON array of zone names
  keyFactors: text("keyFactors"), // JSON array of factors
  confidence: float("confidence").notNull(),
  reasoning: text("reasoning"),
  correlationId: varchar("correlationId", { length: 100 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertRiskAssessment = typeof riskAssessments.$inferInsert;
