import { and, asc, eq } from 'drizzle-orm';

import type { AppDatabase } from '$lib/server/db/connection';
import { stations, type Station } from '$lib/server/db/schema';

export interface CreateStationInput {
	departmentId: number;
	stationNumber: number;
	name?: string | null;
}

export interface UpdateStationInput {
	stationNumber?: number;
	name?: string | null;
}

export interface ListStationsOptions {
	includeInactive?: boolean;
}

/**
 * Provides database access for station records.
 *
 * Business rules and user-input validation belong in the station service.
 */
export function createStationRepository(db: AppDatabase) {
	return {
		/**
		 * Returns stations for one department, ordered by station number.
		 */
		listByDepartment(
			departmentId: number,
			options: ListStationsOptions = {}
		): Station[] {
			if (options.includeInactive) {
				return db
					.select()
					.from(stations)
					.where(eq(stations.departmentId, departmentId))
					.orderBy(asc(stations.stationNumber))
					.all();
			}

			return db
				.select()
				.from(stations)
				.where(
					and(
						eq(stations.departmentId, departmentId),
						eq(stations.isActive, true)
					)
				)
				.orderBy(asc(stations.stationNumber))
				.all();
		},

		/**
		 * Finds a station using its public UUID.
		 */
		findByPublicId(publicId: string): Station | undefined {
			return db
				.select()
				.from(stations)
				.where(eq(stations.publicId, publicId))
				.get();
		},

		/**
		 * Finds a station by its department and station number.
		 */
		findByDepartmentAndNumber(
			departmentId: number,
			stationNumber: number
		): Station | undefined {
			return db
				.select()
				.from(stations)
				.where(
					and(
						eq(stations.departmentId, departmentId),
						eq(stations.stationNumber, stationNumber)
					)
				)
				.get();
		},

		/**
		 * Creates and returns a station.
		 */
		create(input: CreateStationInput): Station {
			return db
				.insert(stations)
				.values({
					departmentId: input.departmentId,
					stationNumber: input.stationNumber,
					name: input.name ?? null
				})
				.returning()
				.get();
		},

		/**
		 * Updates a station and returns the resulting record.
		 *
		 * Returns undefined when the public ID does not exist.
		 */
		update(
			publicId: string,
			input: UpdateStationInput
		): Station | undefined {
			return db
				.update(stations)
				.set({
					...input,
					updatedAt: new Date()
				})
				.where(eq(stations.publicId, publicId))
				.returning()
				.get();
		},

		/**
		 * Activates or deactivates a station without deleting its history.
		 *
		 * Returns undefined when the public ID does not exist.
		 */
		setActive(
			publicId: string,
			isActive: boolean
		): Station | undefined {
			return db
				.update(stations)
				.set({
					isActive,
					updatedAt: new Date()
				})
				.where(eq(stations.publicId, publicId))
				.returning()
				.get();
		}
	};
}

export type StationRepository = ReturnType<
	typeof createStationRepository
>;