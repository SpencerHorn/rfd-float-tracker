import { fail, redirect } from '@sveltejs/kit';

import { floatTrackerService, personnelService } from '$lib/server/app';
import type { Actions, PageServerLoad } from './$types';

const DEFAULT_DEPARTMENT_ID = 1;

export const load: PageServerLoad = () => {
	const dashboard = floatTrackerService.listDepartmentDashboard(DEFAULT_DEPARTMENT_ID);

	return {
		departmentId: DEFAULT_DEPARTMENT_ID,
		dashboard
	};
};

export const actions: Actions = {
	async createStation({ request }) {
		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim();

		if (!name) {
			return fail(400, { type: 'error', message: 'Please enter a station name.' });
		}

		floatTrackerService.createStation({
			departmentId: DEFAULT_DEPARTMENT_ID,
			name
		});

		throw redirect(303, '/');
	},

	async createPersonnel({ request }) {
		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim();
		const stationId = Number(formData.get('stationId'));

		if (!name) {
			return fail(400, { type: 'error', message: 'Please enter a person name.' });
		}

		const [firstName, ...rest] = name.split(' ');
		const lastName = rest.join(' ') || 'Unknown';

		floatTrackerService.createPersonnel({
			departmentId: DEFAULT_DEPARTMENT_ID,
			firstName,
			lastName,
			stationId
		});

		throw redirect(303, '/');
	},

	async recordFloat({ request }) {
		const formData = await request.formData();
		const personnelId = Number(formData.get('personnelId'));
		const sourceStationId = Number(formData.get('sourceStationId'));
		const destinationName = formData.get('destination')?.toString().trim();
		const notes = formData.get('notes')?.toString().trim() || null;

		if (!personnelId || !sourceStationId || !destinationName) {
			return fail(400, { type: 'error', message: 'Please enter a destination station.' });
		}

		// Find or create the destination station
		let destinationStation = floatTrackerService.findOrCreateStation({
			departmentId: DEFAULT_DEPARTMENT_ID,
			name: destinationName
		});

		floatTrackerService.recordFloat({
			departmentId: DEFAULT_DEPARTMENT_ID,
			personnelId,
			sourceStationId,
			destinationStationId: destinationStation.id,
			notes
		});

		throw redirect(303, '/');
	},

	async resetFloats({ request }) {
		const formData = await request.formData();
		const personnelId = Number(formData.get('personnelId'));

		if (!personnelId) {
			return fail(400, { type: 'error', message: 'A person is required.' });
		}

		floatTrackerService.resetFloats(personnelId);

		throw redirect(303, '/');
	},

	async deletePersonnel({ request }) {
		const formData = await request.formData();
		const personnelId = Number(formData.get('personnelId'));

		if (!personnelId) {
			return fail(400, { type: 'error', message: 'A person is required.' });
		}

		// Get the person's public ID first
		const person = floatTrackerService.getPersonnelById(personnelId);
		if (person) {
			personnelService.setActive(person.publicId, false);
		}

		throw redirect(303, '/');
	}
};
