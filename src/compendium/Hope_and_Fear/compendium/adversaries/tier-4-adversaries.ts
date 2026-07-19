import type { Adversary } from '@domain/schemas/compendium';

export const TIER_4_ADVERSARIES = {
	hallowed_choir: {
		source_key: 'HAF',
		title: 'Hallowed Choir',
		tier: 4,
		type: 'Horde',
		image_url: '',
		artist_name: '',
		description: 'A radiant chorus whose harmonies overwhelm body and spirit.',
		motives_tactics: 'Sing hymns, overwhelm, uplift zealots, punish doubt',
		difficulty: 19,
		thresholds: { major: 30, severe: 50 },
		max_hp: 8,
		max_stress: 6,
		attack_modifier: 7,
		standard_attack: {
			name: 'Psychic Chorus',
			range: 'Far',
			damage_dice: '4d8',
			damage_bonus: 8,
			damage_type: 'mag'
		},
		experiences: ['Religion'],
		experience_modifiers: [4],
		features: [
			{
				type: 'Passive',
				name: 'Holy Chorus',
				max_uses: null,
				description_html:
					'The choir projects a shared hymn that pressures minds and can bolster allied zealots.'
			}
		]
	},
	owl_witch: {
		source_key: 'HAF',
		title: 'Owl Witch',
		tier: 4,
		type: 'Solo',
		image_url: '',
		artist_name: '',
		description: 'A nocturnal witch with razor talons and a voice that lures victims to doom.',
		motives_tactics: 'Consume essence, curse, mimic voices, predict death',
		difficulty: 19,
		thresholds: { major: 27, severe: 47 },
		max_hp: 4,
		max_stress: 3,
		attack_modifier: 7,
		standard_attack: {
			name: 'Razor Talons',
			range: 'Very Close',
			damage_dice: '4d8',
			damage_bonus: 5,
			damage_type: 'phy'
		},
		experiences: ['Magic', 'Night Stalker'],
		experience_modifiers: [2, 2],
		features: [
			{
				type: 'Passive',
				name: 'Ill Omen',
				max_uses: null,
				description_html:
					'When nearby PCs make action rolls, the Owl Witch twists fear against them based on the GM Fear available.'
			},
			{
				type: 'Action',
				name: 'Nightmare Stare',
				max_uses: null,
				description_html:
					'Spend a Fear to afflict a target with waking nightmares that prevent ordinary recovery until comforted during downtime.'
			}
		]
	},
	xero_castle_killer: {
		source_key: 'HAF',
		title: 'Xero, Castle Killer',
		tier: 4,
		type: 'Solo',
		image_url: '',
		artist_name: '',
		description: 'A castle-sized bipedal reptile that levels settlements in its path.',
		motives_tactics: 'Destroy landmarks, level buildings, stomp through settlements',
		difficulty: 20,
		thresholds: { major: 35, severe: 70 },
		max_hp: 12,
		max_stress: 10,
		attack_modifier: 8,
		standard_attack: {
			name: 'Tail Swipe',
			range: 'Close',
			damage_dice: '4d12',
			damage_bonus: 6,
			damage_type: 'phy'
		},
		experiences: ['Destruction'],
		experience_modifiers: [5],
		features: [
			{
				type: 'Passive',
				name: 'Relentless',
				max_uses: null,
				description_html:
					'Xero can take multiple spotlights each GM turn based on the number of PCs in the scene.'
			},
			{
				type: 'Action',
				name: 'Radioactive Breath',
				max_uses: null,
				description_html:
					'Spend a Fear to charge a devastating beam, then unleash it on the next spotlight in a wide line across the battlefield.'
			}
		]
	},
	cephilith_priest: {
		source_key: 'HAF',
		title: 'Cephilith Priest',
		tier: 4,
		type: 'Leader',
		image_url: '',
		artist_name: '',
		description: 'A robe-wearing, squid-headed priest from the Outer Realms.',
		motives_tactics: 'Attack the weak-minded, avoid melee, oppress, command followers',
		difficulty: 20,
		thresholds: { major: 37, severe: 70 },
		max_hp: 7,
		max_stress: 5,
		attack_modifier: 8,
		standard_attack: {
			name: 'Psychic Strike',
			range: 'Far',
			damage_dice: '4d10',
			damage_bonus: 10,
			damage_type: 'mag'
		},
		experiences: ['Outer Realms'],
		experience_modifiers: [3],
		features: [
			{
				type: 'Action',
				name: 'Psychic Blast',
				max_uses: null,
				description_html:
					'Spend a Fear to force several nearby targets to resist a punishing wave of direct psychic damage.'
			}
		]
	}
} as const satisfies Record<string, Adversary>;
