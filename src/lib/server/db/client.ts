import { env } from '$env/dynamic/private';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import * as schema from './schema';

const configuredPath = env.DATABASE_PATH || './data/rfd-float-tracker.db';
const databasePath = resolve(configuredPath);

mkdirSync(dirname(databasePath), { recursive: true });

const sqlite = new Database(databasePath);

sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('busy_timeout = 5000');

export const db = drizzle(sqlite, {
	schema
});

export { sqlite };
