<script lang="ts">
	import { page } from '$app/state';
	import { postApi } from '$lib/api/client';
	import Button, {
		buttonVariants,
		type ButtonSize,
		type ButtonVariant
	} from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		triggerText = 'Send Feedback',
		variant = 'outline',
		size = 'sm',
		class: className = '',
		initialCategory = 'general',
		onTrigger,
		children
	}: {
		triggerText?: string;
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
		initialCategory?: 'general' | 'bug' | 'feature' | 'content' | 'account';
		onTrigger?: () => void;
		children?: Snippet;
	} = $props();

	let open = $state(false);
	let category = $state<'general' | 'bug' | 'feature' | 'content' | 'account'>('general');
	let subject = $state('');
	let message = $state('');
	let submitError = $state('');
	let submitMessage = $state('');
	let isSubmitting = $state(false);

	$effect(() => {
		if (!open) {
			category = initialCategory;
		}
	});

	async function submitFeedback() {
		if (isSubmitting) return;
		submitError = '';
		submitMessage = '';
		isSubmitting = true;
		try {
			await postApi('/feedback', {
				category,
				subject,
				message,
				page_url: page.url.href
			});
			subject = '';
			message = '';
			category = initialCategory;
			submitMessage = 'Feedback submitted. Thank you.';
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Unable to submit feedback';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={cn(buttonVariants({ variant, size }), className)} onclick={onTrigger}>
		{#if children}
			{@render children()}
		{:else}
			{triggerText}
		{/if}
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-xl">
		<Dialog.Header>
			<Dialog.Title>Send Feedback</Dialog.Title>
			<Dialog.Description>
				Share a bug, content issue, or feature request. The current page is included automatically.
			</Dialog.Description>
		</Dialog.Header>

		<form
			class="space-y-4"
			onsubmit={(event) => {
				event.preventDefault();
				submitFeedback();
			}}
		>
			<label class="grid gap-2">
				<span class="text-sm font-medium text-foreground">Category</span>
				<select
					bind:value={category}
					class="inset-shadow flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
				>
					<option value="general">General</option>
					<option value="bug">Bug Report</option>
					<option value="feature">Feature Request</option>
					<option value="content">Content</option>
					<option value="account">Account</option>
				</select>
			</label>

			<label class="grid gap-2">
				<span class="text-sm font-medium text-foreground">Subject</span>
				<Input placeholder="Short summary" bind:value={subject} />
			</label>

			<label class="grid gap-2">
				<span class="text-sm font-medium text-foreground">Message</span>
				<Textarea
					placeholder="What happened? What should change?"
					bind:value={message}
					rows={8}
					class="min-h-32"
				/>
			</label>

			<p class="text-xs text-muted-foreground">
				Submitted from <span class="break-all">{page.url.href}</span>
			</p>

			{#if submitError}
				<p class="rounded border border-destructive/60 bg-destructive/10 p-3 text-sm text-destructive">
					{submitError}
				</p>
			{/if}
			{#if submitMessage}
				<p class="rounded border border-emerald-500/60 bg-emerald-500/10 p-3 text-sm text-emerald-100">
					{submitMessage}
				</p>
			{/if}

			<Dialog.Footer class="flex gap-3">
				<Dialog.Close>
					<Button type="button" variant="outline">Close</Button>
				</Dialog.Close>
				<Button
					type="submit"
					disabled={isSubmitting || subject.trim().length < 3 || message.trim().length < 10}
				>
					{isSubmitting ? 'Submitting...' : 'Submit Feedback'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
