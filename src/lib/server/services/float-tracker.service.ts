import { and, asc, desc, eq, isNull } from 'drizzle-orm';

import type { AppDatabase } from '$lib/server/db/connection';
import {
	departments,
	floatEvents,
	personnel,
	personnelAssignments,
	shifts,
	stations,
	type Personnel,
	type Station
} from '$lib/server/db/schema';

export interface CreateStationInput {
	departmentId: number;
	stationNumber?: number;
	name?: string | null;
}

export interface CreatePersonnelInput {
	departmentId: number;
	firstName: string;
	lastName: string;
	displayName?: string | null;
	employeeNumber?: string | null;
	stationId?: number | null;
}

export interface RecordFloatInput {
	departmentId: number;
	personnelId: number;
	sourceStationId: number;
	destinationStationId: number;
	notes?: string | null;
}

export interface FloatHistoryItem {
	id: number;
	createdAt: string;
	destination: string;
	notes: string | null;
}

export interface PersonnelDashboardItem {
	id: number;
	publicId: string;
	firstName: string;
	lastName: string;
	displayName: string | null;
	stationId: number | null;
	stationName: string | null;
	floatCount: number;
	notes: string[];
	floatHistory: FloatHistoryItem[];
}

export interface StationDashboardItem extends Station {
	personnel: PersonnelDashboardItem[];
}

export interface DepartmentDashboard {
	departmentId: number;
	stations: StationDashboardItem[];
	personnel: PersonnelDashboardItem[];
}

export function createFloatTrackerService(db: AppDatabase) {
	const ensureDepartment = (departmentId: number) => {
		const existingDepartment = db
			.select()
			.from(departments)
			.where(eq(departments.id, departmentId))
			.get();

		if (existingDepartment) {
			return existingDepartment;
		}

		return db
			.insert(departments)
			.values({
				id: departmentId,
				publicId: crypto.randomUUID(),
				name: 'RFD Development Department',
				abbreviation: 'RFD-DEV'
			})
			.returning()
			.get();
	};

	const ensureDefaultShift = (departmentId: number) => {
		const existingShift = db
			.select()
			.from(shifts)
			.where(and(eq(shifts.departmentId, departmentId), eq(shifts.code, 'A')))
			.get();

		if (existingShift) {
			return existingShift;
		}

		return db
			.insert(shifts)
			.values({
				publicId: crypto.randomUUID(),
				departmentId,
				code: 'A',
				name: 'A Shift',
				sortOrder: 1
			})
			.returning()
			.get();
	};

	return {
		ensureDepartment,

		getPersonnelById(personnelId: number) {
			return db
				.select()
				.from(personnel)
				.where(eq(personnel.id, personnelId))
				.get();
		},

		createStation(input: CreateStationInput) {
			const department = ensureDepartment(input.departmentId);
			const nextStationNumber = db
				.select({ stationNumber: stations.stationNumber })
				.from(stations)
				.where(eq(stations.departmentId, department.id))
				.orderBy(desc(stations.stationNumber))
				.limit(1)
				.get();

			const stationNumber = input.stationNumber ?? (nextStationNumber?.stationNumber ?? 0) + 1;

			return db
				.insert(stations)
				.values({
					departmentId: department.id,
					stationNumber,
					name: input.name?.trim() || null
				})
				.returning()
				.get();
		},

		findOrCreateStation(input: CreateStationInput) {
			const department = ensureDepartment(input.departmentId);
			const trimmedName = input.name?.trim();

			// Try to find existing station with this name
			if (trimmedName) {
				const existing = db
					.select()
					.from(stations)
					.where(and(eq(stations.departmentId, department.id), eq(stations.name, trimmedName)))
					.get();

				if (existing) {
					return existing;
				}
			}

			// Create new station if not found
			return this.createStation(input);
		},

		createPersonnel(input: CreatePersonnelInput) {
			const department = ensureDepartment(input.departmentId);
			const person = db
				.insert(personnel)
				.values({
					departmentId: department.id,
					employeeNumber: input.employeeNumber?.trim() || null,
					firstName: input.firstName.trim(),
					lastName: input.lastName.trim(),
					displayName: input.displayName?.trim() || null
				})
				.returning()
				.get();

			if (input.stationId) {
				const today = new Date().toISOString().slice(0, 10);

				db.insert(personnelAssignments)
					.values({
						personnelId: person.id,
						stationId: input.stationId,
						assignmentType: 'regular',
						startDate: today,
						isPrimary: true
					})
					.run();
			}

			return person;
		},

		recordFloat(input: RecordFloatInput) {
			ensureDepartment(input.departmentId);
			const shift = ensureDefaultShift(input.departmentId);
			const today = new Date().toISOString().slice(0, 10);

			return db
				.insert(floatEvents)
				.values({
					personnelId: input.personnelId,
					shiftId: shift.id,
					sourceStationId: input.sourceStationId,
					destinationStationId: input.destinationStationId,
					floatDate: today,
					notes: input.notes?.trim() || null
				})
				.returning()
				.get();
		},

		resetFloats(personnelId: number) {
			return db.delete(floatEvents).where(eq(floatEvents.personnelId, personnelId)).run();
		},

		listDepartmentDashboard(departmentId: number): DepartmentDashboard {
			const department = ensureDepartment(departmentId);
			const stationRows = db
				.select()
				.from(stations)
				.where(and(eq(stations.departmentId, department.id), eq(stations.isActive, true)))
				.orderBy(asc(stations.stationNumber))
				.all();

			const personnelRows = db
				.select()
				.from(personnel)
				.where(and(eq(personnel.departmentId, department.id), eq(personnel.isActive, true)))
				.orderBy(asc(personnel.lastName), asc(personnel.firstName))
				.all();

			const stationLookup = new Map<number, StationDashboardItem>();
			const stationDashboardItems = stationRows.map((station) => {
				const item: StationDashboardItem = {
					...station,
					personnel: []
				};

				stationLookup.set(station.id, item);
				return item;
			});

			const personnelSummaries: PersonnelDashboardItem[] = personnelRows.map((person) => {
				const latestAssignment = db
					.select()
					.from(personnelAssignments)
					.where(eq(personnelAssignments.personnelId, person.id))
					.orderBy(desc(personnelAssignments.createdAt))
					.get();

				const assignmentStation = latestAssignment?.stationId
					? stationLookup.get(latestAssignment.stationId)
					: undefined;

				const floatRows = db
					.select()
					.from(floatEvents)
					.where(and(eq(floatEvents.personnelId, person.id), isNull(floatEvents.voidedAt)))
					.orderBy(desc(floatEvents.createdAt))
					.all();

				const floatCount = floatRows.length;
				const notesList = floatRows.map((event) => event.notes).filter((note): note is string => Boolean(note));
				const floatHistory = floatRows.map((event) => {
					const destinationStation = db
						.select()
						.from(stations)
						.where(eq(stations.id, event.destinationStationId))
						.get();

					return {
						id: event.id,
						createdAt: event.createdAt.toISOString(),
						destination: destinationStation?.name ?? `Station ${destinationStation?.stationNumber ?? 'Unknown'}`,
						notes: event.notes
					};
				});

				if (assignmentStation && latestAssignment?.stationId) {
					assignmentStation.personnel.push({
						id: person.id,
						publicId: person.publicId,
						firstName: person.firstName,
						lastName: person.lastName,
						displayName: person.displayName,
						stationId: latestAssignment.stationId,
						stationName: assignmentStation.name,
						floatCount,
						notes: notesList,
						floatHistory
					});
				}

				return {
					id: person.id,
					publicId: person.publicId,
					firstName: person.firstName,
					lastName: person.lastName,
					displayName: person.displayName,
					stationId: latestAssignment?.stationId ?? null,
					stationName: assignmentStation?.name ?? null,
					floatCount,
					notes: notesList,
					floatHistory
				};
			});

			return {
				departmentId: department.id,
				stations: stationDashboardItems,
				personnel: personnelSummaries
			};
		}
	};
}

export type FloatTrackerService = ReturnType<typeof createFloatTrackerService>;
