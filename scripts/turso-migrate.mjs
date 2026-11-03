import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const localDbPath = path.join(projectRoot, 'prisma', 'dev.db');

const localClient = createClient({
  url: `file:${localDbPath}`
});

const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://scandine-abhi04.aws-ap-south-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function run() {
  console.log('--- Testing Turso Connection ---');
  const ping = await tursoClient.execute('SELECT 1 as connected');
  console.log('Turso connection OK:', ping.rows);

  console.log('--- Reading Local SQLite Schema ---');
  const schemaRows = await localClient.execute(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%' AND sql IS NOT NULL"
  );

  console.log(`Found ${schemaRows.rows.length} tables in local database.`);

  console.log('--- Creating Tables on Turso ---');
  for (const row of schemaRows.rows) {
    const ddl = row.sql;
    console.log('Applying DDL:\n', ddl);
    try {
      await tursoClient.execute(ddl);
    } catch (err) {
      console.log('Note on DDL:', err.message);
    }
  }

  // Create unique indexes if any
  const indexRows = await localClient.execute(
    "SELECT sql FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL"
  );
  for (const row of indexRows.rows) {
    if (row.sql) {
      try {
        await tursoClient.execute(row.sql);
      } catch (err) {
        console.log('Index note:', err.message);
      }
    }
  }

  // Copy data for each table
  const tables = ['Admin', 'Tables', 'Menu', 'Orders', 'Order_Items', 'Review', 'WaiterCall'];

  console.log('--- Copying Data from Local to Turso ---');
  for (const table of tables) {
    const records = await localClient.execute(`SELECT * FROM "${table}"`);
    console.log(`Table ${table}: found ${records.rows.length} rows.`);

    if (records.rows.length === 0) continue;

    const columns = records.columns;
    const placeholders = columns.map(() => '?').join(', ');
    const colNames = columns.map(c => `"${c}"`).join(', ');

    // Clear existing rows on Turso to avoid duplicate key errors
    await tursoClient.execute(`DELETE FROM "${table}"`);

    for (const row of records.rows) {
      const values = columns.map(c => row[c]);
      await tursoClient.execute({
        sql: `INSERT INTO "${table}" (${colNames}) VALUES (${placeholders})`,
        args: values
      });
    }
    console.log(`Successfully migrated ${records.rows.length} rows to "${table}" in Turso.`);
  }

  console.log('--- Verifying Turso Data Counts ---');
  for (const table of tables) {
    const countRes = await tursoClient.execute(`SELECT count(*) as cnt FROM "${table}"`);
    console.log(`Turso table "${table}" count:`, countRes.rows[0].cnt);
  }

  console.log('--- Turso Migration Complete! ---');
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

