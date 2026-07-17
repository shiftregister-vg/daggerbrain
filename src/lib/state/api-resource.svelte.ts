import { onDestroy } from 'svelte';

export function createApiResource<T>(load: () => Promise<T>, options: { intervalMs?: number } = {}) {
	let data: T | undefined = $state();
	let error: Error | null = $state(null);
	let isLoading = $state(false);
	let generation = 0;
	let interval: ReturnType<typeof setInterval> | undefined;

	async function refresh() {
		const currentGeneration = ++generation;
		const initialLoad = data === undefined;
		if (initialLoad) {
			isLoading = true;
		}
		try {
			const next = await load();
			if (currentGeneration === generation) {
				data = next;
				error = null;
			}
		} catch (caught) {
			if (currentGeneration === generation) {
				error = caught instanceof Error ? caught : new Error('Request failed');
			}
		} finally {
			if (currentGeneration === generation) {
				isLoading = false;
			}
		}
	}

	if (options.intervalMs) {
		interval = setInterval(() => {
			void refresh();
		}, options.intervalMs);
	}

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	void refresh();

	return {
		get data() {
			return data;
		},
		get error() {
			return error;
		},
		get isLoading() {
			return isLoading;
		},
		refresh
	};
}
