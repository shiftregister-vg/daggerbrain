<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as Popover from '$lib/components/ui/popover';
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Settings from '@lucide/svelte/icons/settings';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { signOut } from '@auth/sveltekit/client';

	const session = $derived(page.data.session);
	const user = $derived(session?.user);
	const userImageUrl = $derived(user?.image || '/images/art/portrait-placeholder.webp');
	const userName = $derived(user?.name || user?.email || 'Profile');

	let open = $state(false);

	async function handleManageAccount() {
		open = false;
		await goto('/profile');
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
			<Button variant="ghost" class="w-full justify-start gap-2" onclick={handleManageAccount}>
				<Settings class="size-4" />
				Manage Account
			</Button>
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
