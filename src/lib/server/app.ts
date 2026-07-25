import { db } from '$lib/server/db/client';
import { createStationRepository } from '$lib/server/repositories/station.repository';
import { createStationService } from '$lib/server/services/station.service';

/**
 * Application composition root.
 *
 * Dependencies are created and connected here so repositories and services
 * remain independently testable.
 */
const stationRepository = createStationRepository(db);

export const stationService = createStationService(stationRepository);