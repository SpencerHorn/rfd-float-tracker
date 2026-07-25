import { z } from 'zod';

import type {
	CreateStationInput,
	StationRepository,
	UpdateStationInput
} from '$lib/server/repositories/station.repository';

const stationNameSchema = z
	.string()
	.trim()
	.max(100, 'Station name must be 100 characters or fewer.')
	.transform((name) => name || null);

export const createStationSchema = z.object({
	departmentId: z.coerce
		.number()
		.int('Department ID must be a whole number.')
		.positive('Department ID must be positive.'),

	stationNumber: z.coerce
		.number()
		.int('Station number must be a whole number.')
		.positive('Station number must be positive.'),

	name: stationNameSchema.optional()
});

export const updateStationSchema = z
	.object({
		stationNumber: z.coerce
			.number()
			.int('Station number must be a whole number.')
			.positive('Station number must be positive.')
			.optional(),

		name: stationNameSchema.optional()
	})
	.refine((input) => input.stationNumber !== undefined || input.name !== undefined, {
		message: 'At least one station field must be provided.'
	});

export type CreateStationData = z.input<typeof createStationSchema>;

export type UpdateStationData = z.input<typeof updateStationSchema>;

export class StationNotFoundError extends Error {
	constructor() {
		super('Station not found.');
		this.name = 'StationNotFoundError';
	}
}

export class DuplicateStationNumberError extends Error {
	constructor(stationNumber: number) {
		super(`Station ${stationNumber} already exists in this department.`);
		this.name = 'DuplicateStationNumberError';
	}
}

/**
 * Coordinates station validation and business rules.
 *
 * Database queries remain in the repository. Routes and server actions
 * should call this service rather than using the repository directly.
 */
export function createStationService(stationRepository: StationRepository) {
	return {
		listByDepartment(departmentId: number, includeInactive = false) {
			const parsedDepartmentId = z.coerce.number().int().positive().parse(departmentId);

			return stationRepository.listByDepartment(parsedDepartmentId, { includeInactive });
		},

		getByPublicId(publicId: string) {
			const parsedPublicId = z.string().uuid('Invalid station ID.').parse(publicId);

			const station = stationRepository.findByPublicId(parsedPublicId);

			if (!station) {
				throw new StationNotFoundError();
			}

			return station;
		},

		create(input: CreateStationData) {
			const parsed = createStationSchema.parse(input);

			const existing = stationRepository.findByDepartmentAndNumber(
				parsed.departmentId,
				parsed.stationNumber
			);

			if (existing) {
				throw new DuplicateStationNumberError(parsed.stationNumber);
			}

			const createInput: CreateStationInput = {
				departmentId: parsed.departmentId,
				stationNumber: parsed.stationNumber,
				name: parsed.name ?? null
			};

			return stationRepository.create(createInput);
		},

		update(publicId: string, input: UpdateStationData) {
			const station = this.getByPublicId(publicId);
			const parsed = updateStationSchema.parse(input);

			if (parsed.stationNumber !== undefined && parsed.stationNumber !== station.stationNumber) {
				const duplicate = stationRepository.findByDepartmentAndNumber(
					station.departmentId,
					parsed.stationNumber
				);

				if (duplicate && duplicate.publicId !== station.publicId) {
					throw new DuplicateStationNumberError(parsed.stationNumber);
				}
			}

			const updateInput: UpdateStationInput = {};

			if (parsed.stationNumber !== undefined) {
				updateInput.stationNumber = parsed.stationNumber;
			}

			if (parsed.name !== undefined) {
				updateInput.name = parsed.name;
			}

			const updated = stationRepository.update(station.publicId, updateInput);

			if (!updated) {
				throw new StationNotFoundError();
			}

			return updated;
		},

		setActive(publicId: string, isActive: boolean) {
			const parsedPublicId = z.string().uuid('Invalid station ID.').parse(publicId);

			const parsedIsActive = z.boolean().parse(isActive);

			const updated = stationRepository.setActive(parsedPublicId, parsedIsActive);

			if (!updated) {
				throw new StationNotFoundError();
			}

			return updated;
		}
	};
}

export type StationService = ReturnType<typeof createStationService>;
