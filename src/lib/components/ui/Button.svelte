<script lang="ts">
	type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
	type ButtonSize = 'sm' | 'md' | 'lg';

	let {
		children,
		type = 'button',
		variant = 'primary',
		size = 'md',
		disabled = false,
		fullWidth = false,
		onclick,
		class: className = ''
	}: {
		children: import('svelte').Snippet;
		type?: 'button' | 'submit' | 'reset';
		variant?: ButtonVariant;
		size?: ButtonSize;
		disabled?: boolean;
		fullWidth?: boolean;
		onclick?: (event: MouseEvent) => void;
		class?: string;
	} = $props();
</script>

<button
	{type}
	{disabled}
	{onclick}
	class:full-width={fullWidth}
	class={`button ${variant} ${size} ${className}`}
>
	{@render children()}
</button>

<style>
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-height: var(--touch-target);
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		font-weight: 700;
		line-height: 1;
		cursor: pointer;
		transition:
			background-color 120ms ease,
			border-color 120ms ease,
			transform 120ms ease;
	}

	.button:active:not(:disabled) {
		transform: scale(0.98);
	}

	.button:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}

	.full-width {
		width: 100%;
	}

	.sm {
		min-height: 2.5rem;
		padding: 0.625rem 0.875rem;
		font-size: 0.875rem;
	}

	.md {
		padding: 0.75rem 1rem;
		font-size: 0.9375rem;
	}

	.lg {
		min-height: 3rem;
		padding: 0.875rem 1.25rem;
		font-size: 1rem;
	}

	.primary {
		background: var(--color-brand-600);
		color: white;
	}

	.primary:hover:not(:disabled) {
		background: var(--color-brand-700);
	}

	.secondary {
		border-color: var(--color-border);
		background: var(--color-surface);
		color: var(--color-text);
	}

	.secondary:hover:not(:disabled) {
		background: var(--color-surface-muted);
	}

	.danger {
		background: var(--color-danger);
		color: white;
	}

	.ghost {
		background: transparent;
		color: var(--color-text);
	}

	.ghost:hover:not(:disabled) {
		background: var(--color-surface-muted);
	}
</style>
