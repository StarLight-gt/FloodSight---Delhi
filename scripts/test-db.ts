import "dotenv/config";
import { MongoClient } from "mongodb";

async function main() {
  const uri = process.env.MONGODB_URI;
  console.log("MONGODB_URI =", uri);

  if (!uri) {
    throw new Error("MONGODB_URI is not set in .env");
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const dbName = process.env.MONGODB_DB_NAME || "floodguard";
    const db = client.db(dbName);
    console.log("Using database:", dbName);

    const collections = await db.listCollections().toArray();
    console.log(
      "Collections:",
      collections.map((c) => c.name)
    );
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("❌ Test DB error:", err);
  process.exit(1);
});


