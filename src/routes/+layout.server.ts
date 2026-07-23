import {
	DEFAULT_OPERATIONS_SETTINGS,
	getSystemOperationsSettings
} from '$lib/server/app/repository';

export const load = async (event) => {
	let operations = DEFAULT_OPERATIONS_SETTINGS;
	try {
		operations = await getSystemOperationsSettings();
	} catch {
		operations = DEFAULT_OPERATIONS_SETTINGS;
	}

	return {
		session: await event.locals.auth(),
		system_settings: { operations }
	};
};
