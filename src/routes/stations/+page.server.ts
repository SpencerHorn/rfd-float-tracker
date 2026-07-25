import type { PageServerLoad } from './$types';

import { stationService } from '$lib/server/app';

const DEFAULT_DEPARTMENT_ID = 1;

export const load: PageServerLoad = () => {
	const stations = stationService.listByDepartment(
		DEFAULT_DEPARTMENT_ID,
		true
	);

	return {
		departmentId: DEFAULT_DEPARTMENT_ID,
		stations
	};
};