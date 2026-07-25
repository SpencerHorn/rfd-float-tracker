import { createDatabase, type DatabaseConnection } from './connection';

const DEFAULT_DEVELOPMENT_DATABASE_PATH = './data/rfd-float-tracker.dev.db';

const DEFAULT_PRODUCTION_DATABASE_PATH = './data/rfd-float-tracker.db';

function getDatabasePath(): string {
	const configuredPath = process.env.DATABASE_PATH?.trim();

	if (configuredPath) {
		return configuredPath;
	}

	return process.env.NODE_ENV === 'production'
		? DEFAULT_PRODUCTION_DATABASE_PATH
		: DEFAULT_DEVELOPMENT_DATABASE_PATH;
}

/**
 * During SvelteKit development, hot-module replacement can reload this module.
 * Storing the connection on globalThis prevents unnecessary SQLite connections
 * from being opened during those reloads.
 */
declare global {
	// eslint-disable-next-line no-var
	var __rfdDatabaseConnection: DatabaseConnection | undefined;
}

const connection =
	process.env.NODE_ENV === 'production'
		? createDatabase(getDatabasePath())
		: (globalThis.__rfdDatabaseConnection ??= createDatabase(getDatabasePath()));

export const db = connection.db;
export const sqlite = connection.sqlite;
export const databasePath = connection.databasePath;

export default db;
