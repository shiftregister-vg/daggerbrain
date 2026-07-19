import type { Domain } from '@domain/schemas/compendium';
export const DOMAINS = {
	dread: {
		source_key: 'HAF',
		title: 'Dread',
		description_html:
			'Dread is the domain of fear, curses, pacts, and powers from beyond ordinary mortal experience.',
		color: '#31203f',
		foreground_color: '#ffffff',
		image_url: '/images/svgs/domains/dread.svg',
		artist_name: ''
	}
} as const satisfies Record<string, Domain>;
