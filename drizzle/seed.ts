import { drizzle } from "drizzle-orm/mysql2";
import { forecasts, incidents, socialIncidents, alerts } from "./schema";

const db = drizzle(process.env.DATABASE_URL!);

async function seed() {
  console.log("🌱 Seeding database with Delhi flood data...");

  // Clear existing data
  await db.delete(alerts);
  await db.delete(socialIncidents);
  await db.delete(incidents);
  await db.delete(forecasts);

  // Seed forecasts for Delhi districts
  await db.insert(forecasts).values([
    { zone: "Yamuna Floodplain", rainProb: 90, rainAmount: 25, riskScore: 0.95 },
    { zone: "West Delhi", rainProb: 85, rainAmount: 22, riskScore: 0.88 },
    { zone: "East Delhi", rainProb: 80, rainAmount: 20, riskScore: 0.85 },
    { zone: "Shahdara", rainProb: 82, rainAmount: 19, riskScore: 0.82 },
    { zone: "North East Delhi", rainProb: 78, rainAmount: 18, riskScore: 0.78 },
    { zone: "Central Delhi", rainProb: 75, rainAmount: 15, riskScore: 0.70 },
    { zone: "North West Delhi", rainProb: 72, rainAmount: 14, riskScore: 0.68 },
    { zone: "North Delhi", rainProb: 70, rainAmount: 12, riskScore: 0.65 },
    { zone: "New Delhi", rainProb: 68, rainAmount: 13, riskScore: 0.62 },
    { zone: "South West Delhi", rainProb: 65, rainAmount: 11, riskScore: 0.55 },
    { zone: "South Delhi", rainProb: 60, rainAmount: 10, riskScore: 0.50 },
  ]);

  // Seed incidents with real Delhi locations
  await db.insert(incidents).values([
    {
      type: "citizen",
      description: "Severe waterlogging near ITO intersection, traffic completely blocked",
      zone: "Central Delhi",
      locationName: "ITO Intersection",
      latitude: 28.6289,
      longitude: 77.2412,
    },
    {
      type: "drain",
      description: "Najafgarh drain overflowing, water entering residential areas",
      zone: "West Delhi",
      locationName: "Najafgarh Drain",
      latitude: 28.6092,
      longitude: 77.0417,
    },
    {
      type: "citizen",
      description: "Yamuna water level rising rapidly, danger mark crossed",
      zone: "Yamuna Floodplain",
      locationName: "Yamuna Bank near ITO Bridge",
      latitude: 28.6304,
      longitude: 77.2497,
    },
    {
      type: "citizen",
      description: "Minto Bridge underpass completely submerged",
      zone: "Central Delhi",
      locationName: "Minto Bridge",
      latitude: 28.6289,
      longitude: 77.2065,
    },
    {
      type: "drain",
      description: "Supplementary drain blocked near Pul Prahladpur",
      zone: "South Delhi",
      locationName: "Pul Prahladpur",
      latitude: 28.5355,
      longitude: 77.2810,
    },
    {
      type: "citizen",
      description: "Heavy waterlogging in Anand Vihar area, metro station affected",
      zone: "East Delhi",
      locationName: "Anand Vihar",
      latitude: 28.6469,
      longitude: 77.3158,
    },
    {
      type: "drain",
      description: "Shahdara drain overflow near GTB Hospital",
      zone: "Shahdara",
      locationName: "GTB Hospital Area",
      latitude: 28.6692,
      longitude: 77.3102,
    },
    {
      type: "citizen",
      description: "Ring Road waterlogged near Azadpur, vehicles stranded",
      zone: "North Delhi",
      locationName: "Azadpur",
      latitude: 28.7041,
      longitude: 77.1750,
    },
    {
      type: "citizen",
      description: "Dwarka Sector 10 metro station area flooded",
      zone: "South West Delhi",
      locationName: "Dwarka Sector 10",
      latitude: 28.5921,
      longitude: 77.0460,
    },
    {
      type: "drain",
      description: "Drain blockage in Rohini Sector 15",
      zone: "North West Delhi",
      locationName: "Rohini Sector 15",
      latitude: 28.7406,
      longitude: 77.1136,
    },
  ]);

  // Seed social media reports
  await db.insert(socialIncidents).values([
    {
      text: "Heavy rain in Delhi! Water entering ground floor of my house in Yamuna Vihar #DelhiRains #FloodAlert",
      user: "@delhiresident1",
      zone: "North East Delhi",
      riskFlag: 1,
    },
    {
      text: "ITO completely waterlogged, avoid this route! Cars stuck in knee-deep water #DelhiFloods",
      user: "@commuter_delhi",
      zone: "Central Delhi",
      riskFlag: 1,
    },
    {
      text: "Yamuna water level at danger mark. Low-lying areas should evacuate immediately #YamunaFlood #Delhi",
      user: "@weatherdelhi",
      zone: "Yamuna Floodplain",
      riskFlag: 1,
    },
    {
      text: "Nice weather in South Delhi, light drizzle only",
      user: "@southdelhi_life",
      zone: "South Delhi",
      riskFlag: 0,
    },
    {
      text: "Najafgarh drain overflowing! Municipal authorities please take action #DelhiMonsoon",
      user: "@westdelhi_news",
      zone: "West Delhi",
      riskFlag: 1,
    },
  ]);

  // Seed alerts
  await db.insert(alerts).values([
    {
      audience: "public",
      message: "🚨 HIGH ALERT: Yamuna floodplain areas at extreme risk. Residents near ITO, Geeta Colony, and Mayur Vihar should evacuate immediately. Water level above danger mark.",
      riskTier: "HIGH",
    },
    {
      audience: "ops",
      message: "URGENT: Deploy emergency pumps to ITO, Minto Bridge, and Anand Vihar. Traffic police needed for diversions.",
      riskTier: "HIGH",
    },
    {
      audience: "public",
      message: "⚠️ MEDIUM ALERT: Waterlogging expected in East Delhi, Shahdara, and West Delhi. Avoid unnecessary travel. Monitor weather updates.",
      riskTier: "MEDIUM",
    },
    {
      audience: "ops",
      message: "Clear Najafgarh and Shahdara drains immediately. Deploy maintenance teams to Rohini and Dwarka.",
      riskTier: "MEDIUM",
    },
    {
      audience: "public",
      message: "✅ SAFE: South Delhi, New Delhi, and South West Delhi showing low flood risk. Normal precautions advised.",
      riskTier: "SAFE",
    },
    {
      audience: "ops",
      message: "Routine monitoring in low-risk zones. Keep emergency teams on standby.",
      riskTier: "SAFE",
    },
  ]);

  console.log("✅ Database seeded successfully!");
  console.log("📊 Summary:");
  console.log("  - 11 weather forecasts (Delhi districts)");
  console.log("  - 10 flood incidents (real Delhi locations)");
  console.log("  - 5 social media reports");
  console.log("  - 6 alerts (public + operations)");
}

seed()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
