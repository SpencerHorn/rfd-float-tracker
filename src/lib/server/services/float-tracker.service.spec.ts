import { existsSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { createDatabase } from '$lib/server/db/connection';
import { createFloatTrackerService } from './float-tracker.service';

describe('createFloatTrackerService', () => {
	const databasePath = resolve(process.cwd(), 'data/test-float-tracker.db');

	afterEach(() => {
		if (existsSync(databasePath)) {
			unlinkSync(databasePath);
		}
	});

	it('tracks float counts, notes, and resets them for a person', () => {
		const connection = createDatabase(databasePath);
		const service = createFloatTrackerService(connection.db);

		connection.sqlite.exec(`
			CREATE TABLE departments (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				public_id TEXT NOT NULL UNIQUE,
				name TEXT NOT NULL,
				abbreviation TEXT NOT NULL UNIQUE,
				is_active INTEGER NOT NULL DEFAULT 1,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);

			CREATE TABLE stations (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				public_id TEXT NOT NULL UNIQUE,
				department_id INTEGER NOT NULL,
				station_number INTEGER NOT NULL,
				name TEXT,
				is_active INTEGER NOT NULL DEFAULT 1,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);

			CREATE TABLE personnel (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				public_id TEXT NOT NULL UNIQUE,
				department_id INTEGER NOT NULL,
				employee_number TEXT,
				first_name TEXT NOT NULL,
				last_name TEXT NOT NULL,
				display_name TEXT,
				rank TEXT,
				is_active INTEGER NOT NULL DEFAULT 1,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);

			CREATE TABLE shifts (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				public_id TEXT NOT NULL UNIQUE,
				department_id INTEGER NOT NULL,
				code TEXT NOT NULL,
				name TEXT NOT NULL,
				sort_order INTEGER NOT NULL DEFAULT 0,
				is_active INTEGER NOT NULL DEFAULT 1,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);

			CREATE TABLE personnel_assignments (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				public_id TEXT NOT NULL UNIQUE,
				personnel_id INTEGER NOT NULL,
				station_id INTEGER,
				shift_id INTEGER,
				assignment_type TEXT NOT NULL DEFAULT 'regular',
				position TEXT,
				start_date TEXT NOT NULL,
				end_date TEXT,
				is_primary INTEGER NOT NULL DEFAULT 1,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);

			CREATE TABLE float_events (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				public_id TEXT NOT NULL UNIQUE,
				personnel_id INTEGER NOT NULL,
				shift_id INTEGER NOT NULL,
				source_station_id INTEGER NOT NULL,
				destination_station_id INTEGER NOT NULL,
				float_date TEXT NOT NULL,
				reason TEXT,
				notes TEXT,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				voided_at DATETIME
			);
		`);

		const stationOne = service.createStation({
			departmentId: 1,
			name: 'Engine 1'
		});

		const stationTwo = service.createStation({
			departmentId: 1,
			name: 'Engine 2'
		});

		const person = service.createPersonnel({
			departmentId: 1,
			firstName: 'Ada',
			lastName: 'Lovelace',
			stationId: stationOne.id
		});

		service.recordFloat({
			departmentId: 1,
			personnelId: person.id,
			sourceStationId: stationOne.id,
			destinationStationId: stationTwo.id,
			notes: 'Covered a call at another station.'
		});

		const dashboard = service.listDepartmentDashboard(1);
		const personSummary = dashboard.personnel[0];

		expect(personSummary.floatCount).toBe(1);
		expect(personSummary.notes).toEqual(['Covered a call at another station.']);

		service.resetFloats(person.id);

		const resetDashboard = service.listDepartmentDashboard(1);
		expect(resetDashboard.personnel[0].floatCount).toBe(0);
		expect(resetDashboard.personnel[0].notes).toEqual([]);

		connection.close();
	});
});
