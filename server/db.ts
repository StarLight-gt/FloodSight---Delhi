import { MongoClient, type Db, type Collection, ObjectId } from "mongodb";
import {
  InsertUser,
  InsertForecast,
  InsertIncident,
  InsertSocialIncident,
  InsertAlert,
  InsertRiskAssessment,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _client: MongoClient | null = null;
let _db: Db | null = null;

async function getMongoDb(): Promise<Db | null> {
  if (_db) return _db;

  const uri = ENV.mongoUri;
  if (!uri) {
    console.warn(
      "[Database] MONGODB_URI / DATABASE_URL not configured – database features disabled"
    );
    return null;
  }

    try {
    _client = new MongoClient(uri);
    await _client.connect();
    _db = _client.db(ENV.mongoDbName);
    console.log("[Database] Connected to MongoDB:", ENV.mongoDbName);
    return _db;
    } catch (error) {
    console.error("[Database] Failed to connect to MongoDB:", error);
      _db = null;
    return null;
    }
  }

async function getCollection<T>(
  name: string
): Promise<Collection<T & { _id?: ObjectId }> | null> {
  const db = await getMongoDb();
  if (!db) return null;
  return db.collection<T & { _id?: ObjectId }>(name);
}

// -----------------------------------------------------------------------------
// Users
// -----------------------------------------------------------------------------

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const usersCol = await getCollection<InsertUser>("users");
  if (!usersCol) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const now = new Date();
    const update: Partial<InsertUser> = {
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      lastSignedIn: user.lastSignedIn ?? now,
      role:
        user.role ??
        (user.openId === ENV.ownerOpenId ? ("admin" as const) : "user"),
    };

    await usersCol.updateOne(
      { openId: user.openId },
      {
        $setOnInsert: {
          openId: user.openId,
          createdAt: now,
        },
        $set: {
          ...update,
          updatedAt: now,
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const usersCol = await getCollection<InsertUser>("users");
  if (!usersCol) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const doc = await usersCol.findOne({ openId });
  return doc ?? undefined;
}

// -----------------------------------------------------------------------------
// FloodGuard query helpers
// -----------------------------------------------------------------------------

export async function getAllForecasts() {
  const col = await getCollection<InsertForecast>("forecasts");
  if (!col) return [];
  return col.find({}).sort({ riskScore: 1 }).toArray();
}

export async function getAllIncidents() {
  const col = await getCollection<InsertIncident>("incidents");
  if (!col) return [];
  return col.find({}).sort({ timestamp: 1 }).toArray();
}

export async function getAllAlerts() {
  const col = await getCollection<InsertAlert>("alerts");
  if (!col) return [];
  return col.find({}).sort({ createdAt: 1 }).toArray();
}

export async function getAllSocialIncidents() {
  const col = await getCollection<InsertSocialIncident>("socialIncidents");
  if (!col) return [];
  return col.find({}).sort({ timestamp: 1 }).toArray();
}

// -----------------------------------------------------------------------------
// Agent cycle persistence helpers
// -----------------------------------------------------------------------------

export async function saveForecast(forecast: InsertForecast) {
  const col = await getCollection<InsertForecast>("forecasts");
  if (!col) return null;
  
  try {
    const result = await col.insertOne({
      ...forecast,
      timestamp: forecast.timestamp ?? new Date(),
    });
    return result.insertedId;
  } catch (error) {
    console.error("[Database] Failed to save forecast:", error);
    return null;
  }
}

export async function saveIncident(incident: InsertIncident) {
  const col = await getCollection<InsertIncident>("incidents");
  if (!col) return null;
  
  try {
    const result = await col.insertOne({
      ...incident,
      timestamp: incident.timestamp ?? new Date(),
    });
    return result.insertedId;
  } catch (error) {
    console.error("[Database] Failed to save incident:", error);
    return null;
  }
}

export async function saveSocialIncident(social: InsertSocialIncident) {
  const col = await getCollection<InsertSocialIncident>("socialIncidents");
  if (!col) return null;
  
  try {
    const result = await col.insertOne({
      ...social,
      timestamp: social.timestamp ?? new Date(),
    });
    return result.insertedId;
  } catch (error) {
    console.error("[Database] Failed to save social incident:", error);
    return null;
  }
}

export async function saveAlert(alert: InsertAlert) {
  const col = await getCollection<InsertAlert>("alerts");
  if (!col) return null;
  
  try {
    const result = await col.insertOne({
      ...alert,
      createdAt: alert.createdAt ?? new Date(),
    });
    return result.insertedId;
  } catch (error) {
    console.error("[Database] Failed to save alert:", error);
    return null;
  }
}

export async function saveRiskAssessment(assessment: InsertRiskAssessment) {
  const col = await getCollection<InsertRiskAssessment>("riskAssessments");
  if (!col) return null;
  
  try {
    const result = await col.insertOne({
      ...assessment,
      timestamp: assessment.timestamp ?? new Date(),
    });
    return result.insertedId;
  } catch (error) {
    console.error("[Database] Failed to save risk assessment:", error);
    return null;
  }
}
