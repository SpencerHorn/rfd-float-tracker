import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { departments } from './departments';

export const personnel = sqliteTable(
	'personnel',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),

		publicId: text('public_id')
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),

		departmentId: integer('department_id')
			.notNull()
			.references(() => departments.id, {
				onDelete: 'restrict',
				onUpdate: 'cascade'
			}),

		employeeNumber: text('employee_number'),
		firstName: text('first_name').notNull(),
		lastName: text('last_name').notNull(),
		displayName: text('display_name'),
		rank: text('rank'),

		isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),

		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [
		uniqueIndex('personnel_public_id_unique').on(table.publicId),

		uniqueIndex('personnel_department_employee_number_unique').on(
			table.departmentId,
			table.employeeNumber
		),

		index('personnel_department_idx').on(table.departmentId),
		index('personnel_name_idx').on(table.lastName, table.firstName)
	]
);

export type Personnel = typeof personnel.$inferSelect;
export type NewPersonnel = typeof personnel.$inferInsert;
