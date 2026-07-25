import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import * as schema from './schema';

/**
 * Creates a SQLite/Drizzle database connection.
 *
 * This factory can be reused by:
 * - the running SvelteKit application
 * - development seed scripts
 * - repository tests
 * - future maintenance scripts
 */
export function createDatabase(configuredPath: string) {
	if (!configuredPath.trim()) {
		throw new Error('A database path is required.');
	}

	const databasePath = resolve(process.cwd(), configuredPath);

	mkdirSync(dirname(databasePath), { recursive: true });

	const sqlite = new Database(databasePath);

	// SQLite does not enforce foreign keys unless explicitly enabled.
	sqlite.pragma('foreign_keys = ON');

	// WAL improves reliability when reads and writes occur concurrently.
	sqlite.pragma('journal_mode = WAL');

	// Wait briefly for locked writes instead of immediately throwing.
	sqlite.pragma('busy_timeout = 5000');

	const db = drizzle(sqlite, { schema });

	return {
		db,
		sqlite,
		databasePath,
		close(): void {
			if (sqlite.open) {
				sqlite.close();
			}
		}
	};
}

export type DatabaseConnection = ReturnType<typeof createDatabase>;
export type AppDatabase = DatabaseConnection['db'];
