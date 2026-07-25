<script lang="ts">
	import PageContainer from './PageContainer.svelte';
</script>

<header class="app-header">
	<PageContainer>
		<div class="header-content">
			<div class="logo-placeholder" aria-label="RFD logo placeholder">RFD</div>

			<div class="title-group">
				<p class="eyebrow">Raleigh Fire Department</p>
				<h1>Float Tracker</h1>
			</div>
		</div>
	</PageContainer>
</header>

<style>
	.app-header {
		background: var(--color-brand-600);
		color: white;
		box-shadow: var(--shadow-card);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-height: 4.5rem;
		padding-block: var(--space-3);
	}

	.logo-placeholder {
		display: grid;
		flex: 0 0 auto;
		width: 3rem;
		height: 3rem;
		place-items: center;
		border: 2px dashed rgb(255 255 255 / 0.65);
		border-radius: var(--radius-full);
		font-size: 0.75rem;
		font-weight: 800;
	}

	.title-group {
		min-width: 0;
	}

	.eyebrow {
		margin: 0;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		line-height: 1.2;
		text-transform: uppercase;
		opacity: 0.85;
	}

	h1 {
		margin: var(--space-1) 0 0;
		font-size: 1.375rem;
		line-height: 1.15;
	}

	@media (min-width: 48rem) {
		.header-content {
			min-height: 5.25rem;
		}

		.logo-placeholder {
			width: 3.5rem;
			height: 3.5rem;
		}

		h1 {
			font-size: 1.75rem;
		}
	}
</style>
