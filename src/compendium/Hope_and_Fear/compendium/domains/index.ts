import type { Domain } from '../../../../convex/schemas/compendium';
export const DOMAINS = {
	blood: {
		source_key: 'HAF',
		title: 'Blood',
		description_html:
			'Blood is the domain of lifeforce, sacrifice, curses, and power drawn from the body.',
		color: '#8f1d24',
		foreground_color: '#ffffff',
		image_url: '',
		artist_name: ''
	},
	dread: {
		source_key: 'HAF',
		title: 'Dread',
		description_html:
			'Dread is the domain of fear, curses, pacts, and powers from beyond ordinary mortal experience.',
		color: '#31203f',
		foreground_color: '#ffffff',
		image_url: '',
		artist_name: ''
	}
} as const satisfies Record<string, Domain>;
