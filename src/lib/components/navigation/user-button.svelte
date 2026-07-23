<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import FeedbackDialog from '$lib/components/feedback/feedback-dialog.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import LogOut from '@lucide/svelte/icons/log-out';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Settings from '@lucide/svelte/icons/settings';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { signOut } from '@auth/sveltekit/client';
	import { getUserContext } from '$lib/state/user.svelte';

	const userContext = getUserContext();
	const session = $derived(page.data.session);
	const user = $derived(session?.user);
	const userImageUrl = $derived(user?.image || '/images/art/portrait-placeholder.webp');
	const userName = $derived(user?.name || user?.email || 'Profile');
	const isAdmin = $derived(userContext.user?.is_admin ?? false);
	const contactEnabled = $derived(
		page.data.system_settings?.operations.community.contact_enabled ?? true
	);

	let open = $state(false);

	async function handleManageAccount() {
		open = false;
		await goto('/profile');
	}

	async function handleAdminDashboard() {
		open = false;
		await goto('/admin');
	}

	async function handleSignOut() {
		open = false;
		await goto('/');
		await signOut({ redirectTo: '/' });
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		class={cn(buttonVariants({ variant: 'ghost' }), 'h-full gap-3 rounded-none px-3')}
	>
		<div class="size-7 overflow-hidden rounded-full border-2 border-accent">
			<img src={userImageUrl} alt={userName} class="size-full object-cover" />
		</div>
		<span class="max-w-28 truncate text-sm font-medium">{userName}</span>
		<!-- <ChevronDown class={cn('size-4 transition-transform', open && 'rotate-180')} /> -->
	</Popover.Trigger>

	<Popover.Content
		sideOffset={-6}
		collisionPadding={4}
		align="center"
		class="rounded-t-0 z-40 w-56 bg-primary-muted p-2 pt-4 shadow-lg"
	>
		<div class="flex flex-col gap-1">
			{#if isAdmin}
				<Button variant="ghost" class="w-full justify-start gap-2" onclick={handleAdminDashboard}>
					<ShieldCheck class="size-4" />
					Admin Dashboard
				</Button>
			{/if}
			<Button variant="ghost" class="w-full justify-start gap-2" onclick={handleManageAccount}>
				<Settings class="size-4" />
				Manage Account
			</Button>
			{#if contactEnabled}
				<FeedbackDialog variant="ghost" class="w-full justify-start gap-2">
					<MessageSquare class="size-4" />
					Contact / Feedback
				</FeedbackDialog>
			{/if}
			<Button
				variant="ghost"
				class="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
				onclick={handleSignOut}
			>
				<LogOut class="size-4" />
				Sign Out
			</Button>
		</div>
	</Popover.Content>
</Popover.Root>
