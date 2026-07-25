import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { personnel } from './personnel';
import { shifts } from './shifts';
import { stations } from './stations';

export const floatEvents = sqliteTable(
	'float_events',
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

		shiftId: integer('shift_id')
			.notNull()
			.references(() => shifts.id, {
				onDelete: 'restrict',
				onUpdate: 'cascade'
			}),

		sourceStationId: integer('source_station_id')
			.notNull()
			.references(() => stations.id, {
				onDelete: 'restrict',
				onUpdate: 'cascade'
			}),

		destinationStationId: integer('destination_station_id')
			.notNull()
			.references(() => stations.id, {
				onDelete: 'restrict',
				onUpdate: 'cascade'
			}),

		// Date on which the float occurred, stored as YYYY-MM-DD.
		floatDate: text('float_date').notNull(),

		reason: text('reason'),
		notes: text('notes'),

		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),

		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),

		voidedAt: integer('voided_at', { mode: 'timestamp' })
	},
	(table) => [
		uniqueIndex('float_events_public_id_unique').on(table.publicId),

		index('float_events_personnel_date_idx').on(table.personnelId, table.floatDate),

		index('float_events_source_date_idx').on(table.sourceStationId, table.floatDate),

		index('float_events_destination_date_idx').on(table.destinationStationId, table.floatDate),

		index('float_events_shift_date_idx').on(table.shiftId, table.floatDate),

		check(
			'float_events_different_stations',
			sql`${table.sourceStationId} <> ${table.destinationStationId}`
		)
	]
);

export type FloatEvent = typeof floatEvents.$inferSelect;
export type NewFloatEvent = typeof floatEvents.$inferInsert;
