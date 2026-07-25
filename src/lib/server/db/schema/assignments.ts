import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { personnel } from './personnel';
import { shifts } from './shifts';
import { stations } from './stations';
import { assignmentTypes, type AssignmentType } from './types';

export const personnelAssignments = sqliteTable(
	'personnel_assignments',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),

		publicId: text('public_id')
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),

		personnelId: integer('personnel_id')
			.notNull()
			.references(() => personnel.id, {
				onDelete: 'restrict',
				onUpdate: 'cascade'
			}),

		stationId: integer('station_id').references(() => stations.id, {
			onDelete: 'restrict',
			onUpdate: 'cascade'
		}),

		shiftId: integer('shift_id').references(() => shifts.id, {
			onDelete: 'restrict',
			onUpdate: 'cascade'
		}),

		assignmentType: text('assignment_type').$type<AssignmentType>().notNull().default('regular'),

		position: text('position'),

		// Store date-only values as ISO YYYY-MM-DD strings.
		startDate: text('start_date').notNull(),
		endDate: text('end_date'),

		isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(true),

		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),

		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [
		uniqueIndex('personnel_assignments_public_id_unique').on(table.publicId),

		index('personnel_assignments_personnel_idx').on(table.personnelId),

		index('personnel_assignments_station_shift_idx').on(table.stationId, table.shiftId),

		index('personnel_assignments_active_idx').on(table.personnelId, table.endDate),

		check(
			'personnel_assignments_date_order',
			sql`${table.endDate} is null or ${table.endDate} >= ${table.startDate}`
		),

		check(
			'personnel_assignments_type_valid',
			sql`${table.assignmentType} in (${sql.join(
				assignmentTypes.map((type) => sql`${type}`),
				sql`, `
			)})`
		)
	]
);

export type PersonnelAssignment = typeof personnelAssignments.$inferSelect;
export type NewPersonnelAssignment = typeof personnelAssignments.$inferInsert;
