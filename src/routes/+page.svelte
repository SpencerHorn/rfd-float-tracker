<script lang="ts">
	import AppHeader from '$lib/components/layout/AppHeader.svelte';
	import PageContainer from '$lib/components/layout/PageContainer.svelte';
	import type { PageProps } from './$types';

	interface FloatHistoryItem {
		id: number;
		createdAt: string;
		destination: string;
		notes: string | null;
	}

	let { data, form }: PageProps = $props();
	let stationName = $state('');
	let showStationForm = $state(false);
	let personnelDrafts = $state<Record<string, string>>({});
	let showPersonnelForm = $state<Record<string, boolean>>({});
	let notesDrafts = $state<Record<string, string>>({});
	let destinationDrafts = $state<Record<string, string>>({});
	let showHistoryModal = $state(false);
	let selectedPersonnelHistory = $state<FloatHistoryItem[]>([]);
	let selectedPersonnelName = $state('');
	let filterText = $state('');

	const filteredDashboard = $derived.by(() => {
		if (!filterText.trim()) return data.dashboard;
		
		const lowerFilter = filterText.toLowerCase();
		const filteredStations = data.dashboard.stations.map((station) => ({
			...station,
			personnel: station.personnel.filter((person) => {
				const personMatch = `${person.firstName} ${person.lastName}`.toLowerCase().includes(lowerFilter);
				const stationMatch = (station.name ?? '').toLowerCase().includes(lowerFilter);
				return personMatch || stationMatch;
			})
		})).filter((station) => station.personnel.length > 0 || station.name?.toLowerCase().includes(lowerFilter));
		
		return {
			...data.dashboard,
			stations: filteredStations
		};
	});

	const getStationLabel = (stationId: number) => {
		const station = data.dashboard.stations.find((item) => item.id === stationId);
		return station?.name ?? 'Unknown station';
	};

	const openFloatHistory = (personId: number, personFirstName: string, personLastName: string) => {
		const person = data.dashboard.personnel.find((p) => p.id === personId);
		if (!person) return;

		selectedPersonnelName = `${personFirstName} ${personLastName}`;
		selectedPersonnelHistory = person.floatHistory || [];
		showHistoryModal = true;
	};

	const closeHistoryModal = () => {
		showHistoryModal = false;
		selectedPersonnelHistory = [];
		selectedPersonnelName = '';
	};
</script>

<svelte:head>
	<title>RFD Float Tracker</title>
	<meta name="description" content="Track Raleigh Fire Department personnel float assignments." />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<AppHeader />

<main>
	<PageContainer>
		<section class="page-heading">
			<div>
				<p class="section-label">Stations</p>
				<h2>Float assignments</h2>
				<p class="description">
					Track float counts, notes, and station assignments for personnel.
				</p>
				<input
					bind:value={filterText}
					type="text"
					placeholder="Filter by personnel or station name..."
					class="filter-input"
				/>
			</div>

			<button class="primary-button" type="button" onclick={() => (showStationForm = !showStationForm)}>
				{showStationForm ? 'Cancel' : 'Add station'}
			</button>
		</section>

		{#if form?.message}
			<p class="status-banner" class:error={form?.type === 'error'}>{form.message}</p>
		{/if}

		{#if showStationForm}
			<form method="POST" action="?/createStation" class="panel">
				<input
					bind:value={stationName}
					name="name"
					placeholder="Enter station name"
					class="input"
					required
				/>
				<button class="primary-button" type="submit">Save station</button>
			</form>
		{/if}

		{#if data.dashboard.stations.length === 0}
			<section class="empty-state">
				<div class="empty-icon" aria-hidden="true">+</div>

				<div>
					<h3>No stations added</h3>
					<p>Add your first station to begin organizing personnel by shift.</p>
				</div>
			</section>
		{:else if filteredDashboard.stations.length === 0}
			<section class="empty-state">
				<div class="empty-icon" aria-hidden="true">🔍</div>

				<div>
					<h3>No results found</h3>
					<p>No personnel or stations match your search. Try adjusting your filter.</p>
				</div>
			</section>
		{:else}
			<div class="station-grid">
				{#each filteredDashboard.stations as station (station.publicId)}
					<section class="station-card">
						<div class="station-card__header">
							<div>
								<p class="station-number">Station {station.stationNumber}</p>
								<h3>{station.name ?? 'Unnamed station'}</h3>
							</div>
							<button
								type="button"
								class="secondary-button"
								onclick={() => {
									showPersonnelForm[station.publicId] = !showPersonnelForm[station.publicId];
								}}
							>
								{showPersonnelForm[station.publicId] ? 'Cancel' : 'Add personnel'}
							</button>
						</div>

						{#if showPersonnelForm[station.publicId]}
							<form method="POST" action="?/createPersonnel" class="panel">
								<input type="hidden" name="stationId" value={station.id} />
								<input
									bind:value={personnelDrafts[station.publicId]}
									name="name"
									placeholder="Enter full name"
									class="input"
									required
								/>
								<button class="primary-button" type="submit">Save person</button>
							</form>
						{/if}

						{#if station.personnel.length === 0}
							<p class="empty-text">No personnel assigned yet.</p>
						{:else}
							<ul class="personnel-list">
								{#each station.personnel as person (person.publicId)}
									<li class="personnel-item">
										<div class="personnel-item__header">
											<div class="personnel-main">
												<div>
													<p class="personnel-name">{person.firstName} {person.lastName}</p>
													<p class="personnel-subtext">Assigned to {person.stationName ?? 'a station'}</p>
												</div>
											</div>
											<div class="personnel-actions-right">
												<form method="POST" action="?/deletePersonnel" class="delete-form">
													<input type="hidden" name="personnelId" value={person.id} />
													<button type="submit" class="delete-button" title="Remove personnel">×</button>
												</form>
												<button
													type="button"
													class="float-count-button"
													onclick={() => openFloatHistory(person.id, person.firstName, person.lastName)}
												>
													<span class="pill">{person.floatCount} float{person.floatCount === 1 ? '' : 's'}</span>
												</button>
											</div>
										</div>

										<div class="personnel-actions">
											<form method="POST" action="?/recordFloat" class="inline-form">
												<input type="hidden" name="personnelId" value={person.id} />
												<input type="hidden" name="sourceStationId" value={station.id} />
										<input
													bind:value={destinationDrafts[person.publicId]}
													name="destination"
													placeholder="Destination station"
													class="input input--compact"
												/>
												<textarea
													bind:value={notesDrafts[person.publicId]}
													name="notes"
													placeholder="Notes (optional)"
													rows="2"
													class="input input--compact"
												></textarea>
												<button class="primary-button" type="submit">I floated</button>
											</form>

											{#if person.floatCount > 0}
												<form method="POST" action="?/resetFloats" class="inline-form">
													<input type="hidden" name="personnelId" value={person.id} />
													<button class="secondary-button" type="submit">Reset</button>
												</form>
											{/if}
										</div>

										{#if person.floatHistory && person.floatHistory.length > 0}
											<div class="float-history-summary">
												<p class="history-label">Float history:</p>
												<ul class="history-items">
													{#each person.floatHistory.slice(0, 3) as float (float.id)}
														<li class="history-item">
															<span class="history-date">{new Date(float.createdAt).toLocaleDateString()}</span>
															<span class="history-station">{float.destination}</span>
														</li>
													{/each}
												</ul>
											</div>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
					</section>
				{/each}
			</div>
		{/if}
	</PageContainer>

	{#if showHistoryModal}
		<div 
			class="modal-overlay" 
			role="button"
			tabindex="0"
			onclick={() => closeHistoryModal()}
			onkeydown={(e) => e.key === 'Escape' && closeHistoryModal()}
		>
			<div 
				class="modal" 
				role="dialog"
				tabindex="-1"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
				<div class="modal-header">
					<h2>Float History - {selectedPersonnelName}</h2>
					<button type="button" class="modal-close" onclick={() => closeHistoryModal()}>×</button>
				</div>
				<div class="modal-content">
					{#if selectedPersonnelHistory.length === 0}
						<p class="no-history">No float history recorded.</p>
					{:else}
						<table class="history-table">
							<thead>
								<tr>
									<th>Date</th>
									<th>Station</th>
									<th>Notes</th>
								</tr>
							</thead>
							<tbody>
								{#each selectedPersonnelHistory as floatEvent (floatEvent.id)}
									<tr>
										<td class="date-cell">{new Date(floatEvent.createdAt).toLocaleString()}</td>
										<td class="station-cell">{floatEvent.destination}</td>
										<td class="notes-cell">{floatEvent.notes || '—'}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	main {
		padding-block: var(--space-6);
	}

	.page-heading {
		display: grid;
		gap: var(--space-4);
	}

	.section-label {
		margin: 0 0 var(--space-1);
		color: var(--color-brand-600);
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	h2 {
		margin: 0;
		font-size: 1.625rem;
		line-height: 1.2;
	}

	.description {
		max-width: 35rem;
		margin: var(--space-2) 0 var(--space-3);
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	.filter-input {
		max-width: 20rem;
		padding: 0.8rem 0.95rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: white;
		font-size: 0.95rem;
	}

	.filter-input::placeholder {
		color: var(--color-text-muted);
	}

	.primary-button,
	.secondary-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: var(--radius-md);
		padding: 0.7rem 1rem;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
	}

	.primary-button {
		background: var(--color-brand-600);
		color: white;
	}

	.secondary-button {
		background: #e2e8f0;
		color: var(--color-text);
	}

	.status-banner {
		margin-top: var(--space-4);
		padding: 0.9rem 1rem;
		border-radius: var(--radius-md);
		background: #dcfce7;
		color: #166534;
	}

	.status-banner.error {
		background: #fee2e2;
		color: #991b1b;
	}

	.panel {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-4);
		padding: 1rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
	}

	.input {
		flex: 1 1 14rem;
		min-width: 0;
		padding: 0.8rem 0.95rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: white;
	}

	.input--compact {
		flex: 1 1 8rem;
		min-width: 10rem;
	}

	.empty-state {
		display: grid;
		gap: var(--space-4);
		margin-top: var(--space-6);
		padding: var(--space-6);
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		text-align: center;
		box-shadow: var(--shadow-card);
	}

	.empty-icon {
		display: grid;
		width: 3rem;
		height: 3rem;
		margin-inline: auto;
		place-items: center;
		border-radius: var(--radius-full);
		background: var(--color-brand-50);
		color: var(--color-brand-600);
		font-size: 1.75rem;
		font-weight: 500;
	}

	.station-grid {
		display: grid;
		gap: var(--space-5);
		margin-top: var(--space-6);
	}

	.station-card {
		padding: var(--space-5);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: white;
		box-shadow: var(--shadow-card);
	}

	.station-card__header {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.station-number {
		margin: 0;
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-brand-600);
	}

	.station-card h3 {
		margin: 0.2rem 0 0;
		font-size: 1.2rem;
	}

	.empty-text {
		margin: 0;
		color: var(--color-text-muted);
	}

	.personnel-list {
		display: grid;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.personnel-item {
		padding: var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	.personnel-main {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		align-items: center;
	}

	.personnel-name {
		margin: 0;
		font-weight: 700;
	}

	.personnel-subtext {
		margin: 0.2rem 0 0;
		color: var(--color-text-muted);
		font-size: 0.95rem;
	}

	.pill {
		padding: 0.35rem 0.6rem;
		border-radius: var(--radius-full);
		background: var(--color-brand-50);
		color: var(--color-brand-700);
		font-size: 0.9rem;
		font-weight: 700;
		white-space: nowrap;
	}

	.personnel-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-3);
	}

	.inline-form {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
	}

	.float-history-summary {
		margin: var(--space-3) 0 0;
		padding: var(--space-2) var(--space-3);
		background: #f8fafc;
		border-radius: var(--radius-md);
	}

	.history-label {
		margin: 0 0 var(--space-2);
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.history-items {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.history-item {
		display: flex;
		gap: var(--space-2);
		align-items: center;
		padding: 0.4rem 0;
		font-size: 0.9rem;
	}

	.history-date {
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.history-station {
		color: var(--color-brand-600);
		font-weight: 600;
	}

	.personnel-item__header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}

	.personnel-actions-right {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
	}

	.float-count-button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
	}

	.float-count-button:hover .pill {
		opacity: 0.8;
		transform: scale(1.05);
	}

	.delete-button {
		background: none;
		color: var(--color-text-muted);
		border: none;
		border-radius: var(--radius-md);
		width: 1.75rem;
		height: 1.75rem;
		font-size: 1.25rem;
		font-weight: 400;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.delete-button:hover {
		color: #991b1b;
	}

	.delete-form {
		display: flex;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: white;
		border-radius: var(--radius-lg);
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
		max-width: 600px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-5);
		border-bottom: 1px solid var(--color-border);
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.3rem;
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 2rem;
		cursor: pointer;
		color: var(--color-text-muted);
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}

	.modal-close:hover {
		color: var(--color-text);
	}

	.modal-content {
		padding: var(--space-5);
	}

	.no-history {
		text-align: center;
		color: var(--color-text-muted);
		margin: 0;
		padding: var(--space-4);
	}

	.history-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.95rem;
	}

	.history-table thead {
		background: #f8fafc;
		border-bottom: 2px solid var(--color-border);
	}

	.history-table th {
		padding: 0.7rem;
		text-align: left;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.history-table td {
		padding: 0.7rem;
		border-bottom: 1px solid var(--color-border);
	}

	.history-table tr:last-child td {
		border-bottom: none;
	}

	.date-cell {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.station-cell {
		font-weight: 500;
	}

	.notes-cell {
		color: var(--color-text-muted);
		word-break: break-word;
	}

	@media (min-width: 40rem) {
		.page-heading {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: end;
		}

		.station-card__header {
			align-items: center;
		}
	}
</style>
