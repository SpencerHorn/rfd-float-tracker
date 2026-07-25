import { z } from 'zod';

import type {
	CreatePersonnelInput,
	PersonnelRepository,
	UpdatePersonnelInput
} from '$lib/server/repositories/personnel.repository';

const optionalString = (max: number, message: string) =>
	z
		.string()
		.trim()
		.max(max, message)
		.transform((value) => value || null);

export const createPersonnelSchema = z.object({
	departmentId: z.coerce
		.number()
		.int('Department ID must be a whole number.')
		.positive('Department ID must be positive.'),

	employeeNumber: optionalString(
		50,
		'Employee number must be 50 characters or fewer.'
	).optional(),

	firstName: z
		.string()
		.trim()
		.min(1, 'First name is required.')
		.max(100, 'First name must be 100 characters or fewer.'),

	lastName: z
		.string()
		.trim()
		.min(1, 'Last name is required.')
		.max(100, 'Last name must be 100 characters or fewer.'),

	displayName: optionalString(
		100,
		'Display name must be 100 characters or fewer.'
	).optional(),

	rank: optionalString(
		100,
		'Rank must be 100 characters or fewer.'
	).optional()
});

export const updatePersonnelSchema = createPersonnelSchema
	.omit({
		departmentId: true
	})
	.partial()
	.refine(
		(input) =>
			Object.values(input).some((value) => value !== undefined),
		{
			message: 'At least one personnel field must be provided.'
		}
	);

export type CreatePersonnelData = z.input<typeof createPersonnelSchema>;
export type UpdatePersonnelData = z.input<typeof updatePersonnelSchema>;

export class PersonnelNotFoundError extends Error {
	constructor() {
		super('Personnel record not found.');
		this.name = 'PersonnelNotFoundError';
	}
}

export class DuplicateEmployeeNumberError extends Error {
	constructor(employeeNumber: string) {
		super(
			`Employee number "${employeeNumber}" already exists in this department.`
		);

		this.name = 'DuplicateEmployeeNumberError';
	}
}

export function createPersonnelService(
	personnelRepository: PersonnelRepository
) {
	return {
		listByDepartment(
			departmentId: number,
			includeInactive = false
		) {
			const parsedDepartmentId = z.coerce
				.number()
				.int()
				.positive()
				.parse(departmentId);

			return personnelRepository.listByDepartment(
				parsedDepartmentId,
				{
					includeInactive
				}
			);
		},

		getByPublicId(publicId: string) {
			const parsedPublicId = z
				.string()
				.uuid('Invalid personnel ID.')
				.parse(publicId);

			const person =
				personnelRepository.findByPublicId(parsedPublicId);

			if (!person) {
				throw new PersonnelNotFoundError();
			}

			return person;
		},

		create(input: CreatePersonnelData) {
			const parsed = createPersonnelSchema.parse(input);

			if (parsed.employeeNumber) {
				const existing =
					personnelRepository.findByEmployeeNumber(
						parsed.departmentId,
						parsed.employeeNumber
					);

				if (existing) {
					throw new DuplicateEmployeeNumberError(
						parsed.employeeNumber
					);
				}
			}

			const createInput: CreatePersonnelInput = {
				departmentId: parsed.departmentId,
				employeeNumber:
					parsed.employeeNumber ?? null,
				firstName: parsed.firstName,
				lastName: parsed.lastName,
				displayName:
					parsed.displayName ?? null,
				rank: parsed.rank ?? null
			};

			return personnelRepository.create(createInput);
		},

		update(
			publicId: string,
			input: UpdatePersonnelData
		) {
			const person = this.getByPublicId(publicId);

			const parsed =
				updatePersonnelSchema.parse(input);

			if (
				parsed.employeeNumber &&
				parsed.employeeNumber !==
					person.employeeNumber
			) {
				const duplicate =
					personnelRepository.findByEmployeeNumber(
						person.departmentId,
						parsed.employeeNumber
					);

				if (
					duplicate &&
					duplicate.publicId !==
						person.publicId
				) {
					throw new DuplicateEmployeeNumberError(
						parsed.employeeNumber
					);
				}
			}

			const updateInput: UpdatePersonnelInput =
				{
					...parsed
				};

			const updated =
				personnelRepository.update(
					person.publicId,
					updateInput
				);

			if (!updated) {
				throw new PersonnelNotFoundError();
			}

			return updated;
		},

		setActive(
			publicId: string,
			isActive: boolean
		) {
			const parsedPublicId = z
				.string()
				.uuid()
				.parse(publicId);

			const updated =
				personnelRepository.setActive(
					parsedPublicId,
					isActive
				);

			if (!updated) {
				throw new PersonnelNotFoundError();
			}

			return updated;
		}
	};
}

export type PersonnelService = ReturnType<
	typeof createPersonnelService
>;