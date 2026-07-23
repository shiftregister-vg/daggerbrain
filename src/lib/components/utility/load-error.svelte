<script lang="ts">
	import { page } from '$app/state';
	import FeedbackDialog from '$lib/components/feedback/feedback-dialog.svelte';

	const contactEnabled = $derived(
		page.data.system_settings?.operations.community.contact_enabled ?? true
	);
</script>

<div class="flex flex-col items-center justify-center py-24">
	<p class="text-sm text-muted-foreground">
		There was an error loading this page.
		{#if contactEnabled}
			If the problem persists
			<FeedbackDialog
				triggerText="let us know"
				variant="link"
				size="sm"
				class="inline-flex h-auto px-0 py-0 align-baseline underline hover:text-accent"
			/>!
		{/if}
	</p>
</div>
