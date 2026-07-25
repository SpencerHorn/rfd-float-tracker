import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const departments = sqliteTable(
	'departments',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),

		publicId: text('public_id')
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),

		name: text('name').notNull(),
		abbreviation: text('abbreviation'),

		isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),

		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [
		uniqueIndex('departments_public_id_unique').on(table.publicId),
		uniqueIndex('departments_name_unique').on(table.name),
		uniqueIndex('departments_abbreviation_unique').on(table.abbreviation)
	]
);

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
