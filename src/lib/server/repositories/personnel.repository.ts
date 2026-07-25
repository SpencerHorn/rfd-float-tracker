import { and, asc, eq } from 'drizzle-orm';

import type { AppDatabase } from '$lib/server/db/connection';
import { personnel, type Personnel } from '$lib/server/db/schema';

export interface CreatePersonnelInput {
	departmentId: number;
	employeeNumber?: string | null;
	firstName: string;
	lastName: string;
	displayName?: string | null;
	rank?: string | null;
}

export interface UpdatePersonnelInput {
	employeeNumber?: string | null;
	firstName?: string;
	lastName?: string;
	displayName?: string | null;
	rank?: string | null;
}

export interface ListPersonnelOptions {
	includeInactive?: boolean;
}

/**
 * Provides database access for personnel records.
 *
 * Business rules and validation belong in the personnel service.
 */
export function createPersonnelRepository(db: AppDatabase) {
	return {
		/**
		 * Returns personnel for a department ordered alphabetically.
		 */
		listByDepartment(
			departmentId: number,
			options: ListPersonnelOptions = {}
		): Personnel[] {
			if (options.includeInactive) {
				return db
					.select()
					.from(personnel)
					.where(eq(personnel.departmentId, departmentId))
					.orderBy(asc(personnel.lastName), asc(personnel.firstName))
					.all();
			}

			return db
				.select()
				.from(personnel)
				.where(
					and(
						eq(personnel.departmentId, departmentId),
						eq(personnel.isActive, true)
					)
				)
				.orderBy(asc(personnel.lastName), asc(personnel.firstName))
				.all();
		},

		/**
		 * Finds a person by their public UUID.
		 */
		findByPublicId(publicId: string): Personnel | undefined {
			return db
				.select()
				.from(personnel)
				.where(eq(personnel.publicId, publicId))
				.get();
		},

		/**
		 * Finds a person by employee number within a department.
		 */
		findByEmployeeNumber(
			departmentId: number,
			employeeNumber: string
		): Personnel | undefined {
			return db
				.select()
				.from(personnel)
				.where(
					and(
						eq(personnel.departmentId, departmentId),
						eq(personnel.employeeNumber, employeeNumber)
					)
				)
				.get();
		},

		/**
		 * Creates a personnel record.
		 */
		create(input: CreatePersonnelInput): Personnel {
			return db
				.insert(personnel)
				.values({
					departmentId: input.departmentId,
					employeeNumber: input.employeeNumber ?? null,
					firstName: input.firstName,
					lastName: input.lastName,
					displayName: input.displayName ?? null,
					rank: input.rank ?? null
				})
				.returning()
				.get();
		},

		/**
		 * Updates a personnel record.
		 */
		update(
			publicId: string,
			input: UpdatePersonnelInput
		): Personnel | undefined {
			return db
				.update(personnel)
				.set({
					...input,
					updatedAt: new Date()
				})
				.where(eq(personnel.publicId, publicId))
				.returning()
				.get();
		},

		/**
		 * Activates or deactivates a person.
		 */
		setActive(
			publicId: string,
			isActive: boolean
		): Personnel | undefined {
			return db
				.update(personnel)
				.set({
					isActive,
					updatedAt: new Date()
				})
				.where(eq(personnel.publicId, publicId))
				.returning()
				.get();
		}
	};
}

export type PersonnelRepository = ReturnType<
	typeof createPersonnelRepository
>;