import { db } from '$lib/server/db/client';

import { createPersonnelRepository } from '$lib/server/repositories/personnel.repository';
import { createStationRepository } from '$lib/server/repositories/station.repository';

import { createPersonnelService } from '$lib/server/services/personnel.service';
import { createStationService } from '$lib/server/services/station.service';

/**
 * Application composition root.
 *
 * Dependencies are created and connected here so repositories and services
 * remain independently testable.
 */

// Repositories
const stationRepository = createStationRepository(db);
const personnelRepository = createPersonnelRepository(db);

// Services
export const stationService = createStationService(stationRepository);
export const personnelService = createPersonnelService(personnelRepository);