// lib/mongodb.ts
import mongoose from 'mongoose';

let cached = (global as any).mongoose || { conn: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  cached.conn = await mongoose.connect(process.env.MONGODB_URI!, {
    dbName: 'vieclap_db',
  });
  (global as any).mongoose = cached;

  return cached.conn;
}



