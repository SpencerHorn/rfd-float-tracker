<script lang="ts">
	let {
		children,
		class: className = ''
	}: {
		children: import('svelte').Snippet;
		class?: string;
	} = $props();
</script>

<div class={`page-container ${className}`}>
	{@render children()}
</div>

<style>
	.page-container {
		width: 100%;
		max-width: var(--page-max-width);
		margin-inline: auto;
		padding-inline: var(--mobile-page-padding);
	}

	@media (min-width: 48rem) {
		.page-container {
			padding-inline: var(--desktop-page-padding);
		}
	}
</style>
