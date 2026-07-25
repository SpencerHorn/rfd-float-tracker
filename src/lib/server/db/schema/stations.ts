import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { departments } from './departments';

export const stations = sqliteTable(
	'stations',
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

		stationNumber: integer('station_number').notNull(),
		name: text('name'),

		isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),

		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [
		uniqueIndex('stations_public_id_unique').on(table.publicId),

		uniqueIndex('stations_department_number_unique').on(table.departmentId, table.stationNumber),

		index('stations_department_idx').on(table.departmentId),

		check('stations_number_positive', sql`${table.stationNumber} > 0`)
	]
);

export type Station = typeof stations.$inferSelect;
export type NewStation = typeof stations.$inferInsert;
