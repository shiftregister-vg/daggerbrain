import {
	DEFAULT_OPERATIONS_SETTINGS,
	getSystemOperationsSettings
} from '$lib/server/app/repository';

export async function load() {
	try {
		return {
			operations: await getSystemOperationsSettings()
		};
	} catch {
		return {
			operations: DEFAULT_OPERATIONS_SETTINGS
		};
	}
}
