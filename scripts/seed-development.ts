import { and, eq } from 'drizzle-orm';
import { resolve } from 'node:path';

import { createDatabase } from '../src/lib/server/db/connection';
import { departments, stations } from '../src/lib/server/db/schema';

const DEVELOPMENT_DATABASE_PATH = './data/rfd-float-tracker.dev.db';

function getSafeDevelopmentDatabasePath(): string {
	if (process.env.NODE_ENV === 'production') {
		throw new Error(
			'Development seed refused: NODE_ENV is set to production.'
		);
	}

	const allowedPath = resolve(
		process.cwd(),
		DEVELOPMENT_DATABASE_PATH
	);

	const configuredPath = resolve(
		process.cwd(),
		process.env.DATABASE_PATH?.trim() ||
			DEVELOPMENT_DATABASE_PATH
	);

	if (configuredPath !== allowedPath) {
		throw new Error(
			[
				'Development seed refused: the database path is not the approved development database.',
				`Expected: ${allowedPath}`,
				`Received: ${configuredPath}`
			].join('\n')
		);
	}

	return configuredPath;
}

const databasePath = getSafeDevelopmentDatabasePath();
const connection = createDatabase(databasePath);

const departmentSeed = {
	name: 'RFD Development Department',
	abbreviation: 'RFD-DEV'
};

const stationSeeds = [
	{
		stationNumber: 1,
		name: 'Central Development Station'
	},
	{
		stationNumber: 6,
		name: 'Station 6 Development'
	},
	{
		stationNumber: 99,
		name: 'Training and Testing Station'
	}
];

try {
	connection.sqlite.transaction(() => {
		let department = connection.db
			.select()
			.from(departments)
			.where(
				eq(
					departments.abbreviation,
					departmentSeed.abbreviation
				)
			)
			.get();

		if (!department) {
			department = connection.db
				.insert(departments)
				.values(departmentSeed)
				.returning()
				.get();

			console.log(
				`Created development department: ${department.name}`
			);
		} else {
			console.log(
				`Development department already exists: ${department.name}`
			);
		}

		for (const stationSeed of stationSeeds) {
			const existingStation = connection.db
				.select()
				.from(stations)
				.where(
					and(
						eq(
							stations.departmentId,
							department.id
						),
						eq(
							stations.stationNumber,
							stationSeed.stationNumber
						)
					)
				)
				.get();

			if (existingStation) {
				connection.db
					.update(stations)
					.set({
						name: stationSeed.name,
						isActive: true,
						updatedAt: new Date()
					})
					.where(
						eq(
							stations.id,
							existingStation.id
						)
					)
					.run();

				console.log(
					`Updated development Station ${stationSeed.stationNumber}`
				);

				continue;
			}

			connection.db
				.insert(stations)
				.values({
					departmentId: department.id,
					stationNumber: stationSeed.stationNumber,
					name: stationSeed.name
				})
				.run();

			console.log(
				`Created development Station ${stationSeed.stationNumber}`
			);
		}
	})();

	console.log(`Development seed completed: ${databasePath}`);
} finally {
	connection.close();
}