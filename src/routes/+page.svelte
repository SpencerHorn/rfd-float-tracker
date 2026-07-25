<script lang="ts">
	import AppHeader from '$lib/components/layout/AppHeader.svelte';
	import PageContainer from '$lib/components/layout/PageContainer.svelte';
	import Button from '$lib/components/ui/Button.svelte';
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
				<p class="description">Track float counts and notes for A, B, and C shifts.</p>
			</div>

			<Button size="lg" fullWidth>Add station</Button>
		</section>

		<section class="empty-state">
			<div class="empty-icon" aria-hidden="true">+</div>

			<div>
				<h3>No stations added</h3>
				<p>Add your first station to begin organizing personnel by shift.</p>
			</div>

			<Button fullWidth>Add first station</Button>
		</section>
	</PageContainer>
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
		margin: var(--space-2) 0 0;
		color: var(--color-text-muted);
		line-height: 1.5;
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

	h3 {
		margin: 0;
		font-size: 1.125rem;
	}

	.empty-state p {
		margin: var(--space-2) 0 0;
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	@media (min-width: 40rem) {
		.page-heading {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: end;
		}

		.page-heading :global(.button) {
			width: auto;
		}

		.empty-state {
			max-width: 34rem;
			margin-inline: auto;
			padding: var(--space-8);
		}

		.empty-state :global(.button) {
			width: auto;
			justify-self: center;
		}
	}
</style>
