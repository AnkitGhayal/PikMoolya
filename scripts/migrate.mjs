import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pg;
try {
  pg = (await import('pg')).default;
} catch {
  const pgPath = path.resolve(__dirname, '../apps/api/node_modules/pg/lib/index.js');
  pg = (await import('file:///' + pgPath.replace(/\\/g, '/'))).default;
}

const databaseUrl = process.env.DATABASE_URL;
const isSsl =
  process.env.DB_SSL === 'true' ||
  (databaseUrl && databaseUrl.includes('sslmode=require')) ||
  (databaseUrl && databaseUrl.includes('neon.tech'));

const config = databaseUrl
  ? {
      connectionString: databaseUrl,
      ssl: isSsl ? { rejectUnauthorized: false } : false,
    }

  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'pikmoolya',
      ssl: isSsl ? { rejectUnauthorized: false } : false,
    };
const client = new pg.Client(config);

async function runMigrations() {
  console.log('Connecting to PostgreSQL database...');
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const migrationsDir = path.resolve(__dirname, '../database/migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const appliedRows = await client.query('SELECT name FROM schema_migrations');
  const appliedSet = new Set(appliedRows.rows.map((r) => r.name));

  console.log(`Found ${files.length} migration files in ${migrationsDir}`);

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`- [Skipped] ${file} (already applied)`);
      continue;
    }

    console.log(`- [Applying] ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`  ✓ Successfully applied ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`  ✗ Error applying ${file}:`, err.message);
      throw err;
    }
  }

  console.log('All database migrations are up to date!');
}

runMigrations()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => {
    client.end().catch(() => {});
  });
