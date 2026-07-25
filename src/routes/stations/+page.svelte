<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Stations | RFD Float Tracker</title>
	<meta
		name="description"
		content="Manage fire stations in the RFD Float Tracker."
	/>
</svelte:head>

<div class="min-h-screen bg-slate-100">
	<main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
		<header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p class="text-sm font-semibold tracking-wide text-red-700 uppercase">
					RFD Float Tracker
				</p>

				<h1 class="mt-1 text-3xl font-bold tracking-tight text-slate-950">
					Stations
				</h1>

				<p class="mt-2 text-sm text-slate-600">
					View and manage stations for this department.
				</p>
			</div>

			<button
				type="button"
				disabled
				title="Station creation will be added in the next commit."
				class="inline-flex cursor-not-allowed items-center justify-center rounded-md bg-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600"
			>
				Add station
			</button>
		</header>

		<section
			aria-labelledby="station-list-heading"
			class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
		>
			<div class="border-b border-slate-200 px-6 py-4">
				<div class="flex items-center justify-between gap-4">
					<h2
						id="station-list-heading"
						class="text-lg font-semibold text-slate-950"
					>
						Station directory
					</h2>

					<p class="text-sm text-slate-500">
						{data.stations.length}
						{data.stations.length === 1 ? 'station' : 'stations'}
					</p>
				</div>
			</div>

			{#if data.stations.length === 0}
				<div class="px-6 py-16 text-center">
					<h3 class="text-base font-semibold text-slate-900">
						No stations found
					</h3>

					<p class="mx-auto mt-2 max-w-md text-sm text-slate-600">
						There are no station records for department
						{data.departmentId}. Station creation will be added next.
					</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-slate-200">
						<thead class="bg-slate-50">
							<tr>
								<th
									scope="col"
									class="px-6 py-3 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase"
								>
									Station
								</th>

								<th
									scope="col"
									class="px-6 py-3 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase"
								>
									Name
								</th>

								<th
									scope="col"
									class="px-6 py-3 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase"
								>
									Status
								</th>

								<th
									scope="col"
									class="px-6 py-3 text-right text-xs font-semibold tracking-wide text-slate-600 uppercase"
								>
									Actions
								</th>
							</tr>
						</thead>

						<tbody class="divide-y divide-slate-200 bg-white">
							{#each data.stations as station (station.publicId)}
								<tr>
									<td class="px-6 py-4 text-sm font-semibold whitespace-nowrap text-slate-950">
										Station {station.stationNumber}
									</td>

									<td class="px-6 py-4 text-sm text-slate-600">
										{station.name ?? '—'}
									</td>

									<td class="px-6 py-4 whitespace-nowrap">
										{#if station.isActive}
											<span
												class="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800"
											>
												Active
											</span>
										{:else}
											<span
												class="inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700"
											>
												Inactive
											</span>
										{/if}
									</td>

									<td class="px-6 py-4 text-right text-sm whitespace-nowrap">
										<button
											type="button"
											disabled
											title="Editing will be added in a later commit."
											class="cursor-not-allowed font-semibold text-slate-400"
										>
											Edit
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</section>
	</main>
</div>