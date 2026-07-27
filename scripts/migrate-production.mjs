import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const databasePath = process.env.DATABASE_PATH?.trim() || './data/rfd-float-tracker.db';
const resolvedDatabasePath = resolve(databasePath);

mkdirSync(dirname(resolvedDatabasePath), { recursive: true });

const sqlite = new Database(resolvedDatabasePath);
sqlite.pragma('journal_mode = WAL');

const db = drizzle(sqlite);

try {
	migrate(db, { migrationsFolder: resolve('./drizzle') });
	console.log(`Migrations complete for ${resolvedDatabasePath}`);
} finally {
	sqlite.close();
}
