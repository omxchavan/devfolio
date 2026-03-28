import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and multiple function invocations in production (Next.js/Vercel).
 */
let cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  // 1. If we already have a connection, return it immediately
  if (cached.conn) {
    return cached.conn;
  }

  // 2. If we don't have a promise, start a new connection attempt
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Limit to prevent Atlas overloads
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4, // Force IPv4 to avoid potential DNS/IPv6 delays in some cloud environments
    };

    console.log("=> MongoDB: Connecting to database...");

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((m) => {
        console.log("=> MongoDB: Connection established successfully");
        return m;
      })
      .catch((error) => {
        // IMPORTANT: If connection fails, clear the promise so the next request can retry
        console.error("=> MongoDB: Connection failed:", error.message);
        cached.promise = null; 
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Ensure we clear on await error too
    throw e;
  }

  return cached.conn;
}
