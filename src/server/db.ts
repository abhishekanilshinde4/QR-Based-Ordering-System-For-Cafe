import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

let prisma: PrismaClient;

if (url && authToken) {
  console.log('[ScanDine DB] Connecting to Turso Cloud Database via libSQL adapter...');
  const libsql = createClient({
    url,
    authToken
  });
  const adapter = new PrismaLibSQL(libsql);
  prisma = new PrismaClient({ adapter });
} else {
  console.log('[ScanDine DB] Using local SQLite database...');
  prisma = new PrismaClient();
}

export { prisma };
