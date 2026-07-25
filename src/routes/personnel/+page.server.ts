import type { PageServerLoad } from './$types';

import { personnelService } from '$lib/server/app';

const DEFAULT_DEPARTMENT_ID = 1;

export const load: PageServerLoad = () => {
	const personnel = personnelService.listByDepartment(
		DEFAULT_DEPARTMENT_ID,
		true
	);

	return {
		departmentId: DEFAULT_DEPARTMENT_ID,
		personnel
	};
};