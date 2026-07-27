<script lang="ts">
	import PageContainer from './PageContainer.svelte';
	import rfdLogo from '$lib/assets/rfd-logo-transparent.png';
</script>

<header class="app-header">
	<PageContainer>
		<div class="header-content">
			<img class="app-logo" src={rfdLogo} alt="Raleigh Fire Department logo" />

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

	.app-logo {
		flex: 0 0 auto;
		width: clamp(2.5rem, 10vw, 4rem);
		height: auto;
		max-height: 4rem;
		object-fit: contain;
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

		h1 {
			font-size: 1.75rem;
		}
	}
</style>
