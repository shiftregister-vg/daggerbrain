import type { Domain } from '@domain/schemas/compendium';

export const DOMAINS = {
	blood: {
		source_key: 'The Void',
		title: 'Blood',
		description_html:
			'Blood is the domain of lifeforce, sacrifice, curses, and power drawn from the body.',
		color: '#8f1d24',
		foreground_color: '#ffffff',
		image_url: '/images/svgs/domains/blood.svg',
		artist_name: ''
	}
} as const satisfies Record<string, Domain>;
