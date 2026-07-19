import type { Adversary } from '@domain/schemas/compendium';

export const TIER_3_ADVERSARIES = {
	chimera: {
		source_key: 'HAF',
		title: 'Chimera',
		tier: 3,
		type: 'Solo',
		image_url: '',
		artist_name: '',
		description: 'A violent hybrid monster with multiple predatory instincts.',
		motives_tactics: 'Destroy, fly, savage, separate prey',
		difficulty: 16,
		thresholds: { major: 20, severe: 35 },
		max_hp: 7,
		max_stress: 5,
		attack_modifier: 5,
		standard_attack: {
			name: 'Bite',
			range: 'Melee',
			damage_dice: '3d10',
			damage_bonus: 3,
			damage_type: 'phy'
		},
		experiences: ['Flying', 'Demolition'],
		experience_modifiers: [3, 3],
		features: [
			{
				type: 'Action',
				name: 'Many-Headed Assault',
				max_uses: null,
				description_html:
					'Spend a Fear to let the Chimera press multiple nearby targets with different parts of its monstrous body.'
			}
		]
	},
	whisper_wraith: {
		source_key: 'HAF',
		title: 'Whisper Wraith',
		tier: 3,
		type: 'Skulk',
		image_url: '',
		artist_name: '',
		description: 'An incorporeal predator that speaks in stolen voices.',
		motives_tactics: 'Isolate, drain life, pass through walls, whisper lies',
		difficulty: 17,
		thresholds: { major: 21, severe: 35 },
		max_hp: 4,
		max_stress: 4,
		attack_modifier: 5,
		standard_attack: {
			name: 'Life Drain',
			range: 'Close',
			damage_dice: '3d8',
			damage_bonus: 4,
			damage_type: 'mag'
		},
		experiences: ['Incorporeal', 'Stealth'],
		experience_modifiers: [3, 3],
		features: [
			{
				type: 'Passive',
				name: 'Incorporeal',
				max_uses: null,
				description_html:
					'The Whisper Wraith can pass through solid obstacles and is difficult to pin down without magic.'
			}
		]
	},
	shadow_king: {
		source_key: 'HAF',
		title: 'Shadow King',
		tier: 3,
		type: 'Leader',
		image_url: '',
		artist_name: '',
		description: 'A sovereign of living darkness attended by loyal shadows.',
		motives_tactics: 'Command, deceive, dominate, smother light',
		difficulty: 18,
		thresholds: { major: 25, severe: 45 },
		max_hp: 7,
		max_stress: 5,
		attack_modifier: 6,
		standard_attack: {
			name: 'Shadowblade',
			range: 'Melee',
			damage_dice: '3d10',
			damage_bonus: 8,
			damage_type: 'mag'
		},
		experiences: ['Royalty', 'Shadows'],
		experience_modifiers: [3, 3],
		features: [
			{
				type: 'Action',
				name: 'Royal Decree',
				max_uses: null,
				description_html:
					'Spend a Fear to command a shadow or subordinate to move, strike, or shield the Shadow King.'
			}
		]
	},
	lamplight_beguiler: {
		source_key: 'HAF',
		title: 'Lamplight Beguiler',
		tier: 3,
		type: 'Social',
		image_url: '',
		artist_name: '',
		description: 'A charming manipulator wrapped in warm, hypnotic light.',
		motives_tactics: 'Charm, confuse, isolate, rewrite memory',
		difficulty: 18,
		thresholds: { major: 18, severe: 30 },
		max_hp: 5,
		max_stress: 6,
		attack_modifier: 6,
		standard_attack: {
			name: 'Brain Fry',
			range: 'Far',
			damage_dice: '3d8',
			damage_bonus: 6,
			damage_type: 'mag'
		},
		experiences: ['Illusion', 'Manipulation'],
		experience_modifiers: [4, 4],
		features: [
			{
				type: 'Action',
				name: 'Beguiling Glow',
				max_uses: null,
				description_html:
					'Spend a Fear to dazzle a nearby target with lamplight, leaving them open to manipulation or misdirection.'
			}
		]
	}
} as const satisfies Record<string, Adversary>;
