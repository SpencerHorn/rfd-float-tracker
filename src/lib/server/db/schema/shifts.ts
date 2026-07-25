import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { departments } from './departments';

export const shifts = sqliteTable(
	'shifts',
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

		code: text('code').notNull(),
		name: text('name').notNull(),
		sortOrder: integer('sort_order').notNull().default(0),

		isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),

		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [
		uniqueIndex('shifts_public_id_unique').on(table.publicId),

		uniqueIndex('shifts_department_code_unique').on(table.departmentId, table.code),

		index('shifts_department_idx').on(table.departmentId)
	]
);

export type Shift = typeof shifts.$inferSelect;
export type NewShift = typeof shifts.$inferInsert;
