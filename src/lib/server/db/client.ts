import { createDatabase, type DatabaseConnection } from './connection';
import { existsSync } from 'node:fs';

const DEFAULT_DEVELOPMENT_DATABASE_PATH = './data/rfd-float-tracker.dev.db';

const DEFAULT_PRODUCTION_DATABASE_PATH = './data/rfd-float-tracker.db';

const RENDER_DISK_MOUNT_PATH = '/var/data';

function isRenderDiskPath(path: string): boolean {
	return path === RENDER_DISK_MOUNT_PATH || path.startsWith(`${RENDER_DISK_MOUNT_PATH}/`);
}

function getDatabasePath(): string {
	const configuredPath = process.env.DATABASE_PATH?.trim();

	if (configuredPath) {
		// Render does not mount persistent disks during build. If DATABASE_PATH points
		// at /var/data during build-time analysis, use a local fallback path instead.
		if (isRenderDiskPath(configuredPath) && !existsSync(RENDER_DISK_MOUNT_PATH)) {
			return DEFAULT_PRODUCTION_DATABASE_PATH;
		}

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
