import type { Adversary } from '@domain/schemas/compendium';

export const TIER_2_ADVERSARIES = {
	doppelhund: {
		source_key: 'HAF',
		title: 'Doppelhund',
		tier: 2,
		type: 'Standard',
		image_url: '',
		artist_name: '',
		description: 'A two-bodied hound that hunts with eerie coordination.',
		motives_tactics: 'Flank, track, split attention, drag prey down',
		difficulty: 13,
		thresholds: { major: 8, severe: 15 },
		max_hp: 4,
		max_stress: 3,
		attack_modifier: 3,
		standard_attack: {
			name: 'Bite',
			range: 'Melee',
			damage_dice: '2d6',
			damage_bonus: 4,
			damage_type: 'phy'
		},
		experiences: ['Keen Senses', 'Stealth'],
		experience_modifiers: [2, 2],
		features: [
			{
				type: 'Passive',
				name: 'Two Bodies',
				max_uses: null,
				description_html:
					'The Doppelhund can threaten multiple nearby targets and coordinate its movement as if it were one creature in two places.'
			}
		]
	},
	dragon_knight: {
		source_key: 'HAF',
		title: 'Dragon Knight',
		tier: 2,
		type: 'Leader',
		image_url: '',
		artist_name: '',
		description: 'A disciplined knight empowered by draconic flame.',
		motives_tactics: 'Command, duel, burn, protect their charge',
		difficulty: 14,
		thresholds: { major: 9, severe: 18 },
		max_hp: 6,
		max_stress: 4,
		attack_modifier: 2,
		standard_attack: {
			name: 'Fiery Greatsword',
			range: 'Melee',
			damage_dice: '2d10',
			damage_bonus: 3,
			damage_type: 'phy'
		},
		experiences: ['Battlemaster'],
		experience_modifiers: [2],
		features: [
			{
				type: 'Action',
				name: 'Draconic Command',
				max_uses: null,
				description_html:
					'Spend a Fear to order an ally into position and empower their next attack with draconic force.'
			}
		]
	},
	gobstalker: {
		source_key: 'HAF',
		title: 'Gobstalker',
		tier: 2,
		type: 'Skulk',
		image_url: '',
		artist_name: '',
		description: 'A lurking tracker that spits caustic mucus at fleeing prey.',
		motives_tactics: 'Ambush, corrode, track, vanish',
		difficulty: 15,
		thresholds: { major: 7, severe: 14 },
		max_hp: 4,
		max_stress: 2,
		attack_modifier: 3,
		standard_attack: {
			name: 'Acidic Snot',
			range: 'Close',
			damage_dice: '2d8',
			damage_bonus: 3,
			damage_type: 'mag'
		},
		experiences: ['Tracker'],
		experience_modifiers: [3],
		features: [
			{
				type: 'Reaction',
				name: 'Slip Away',
				max_uses: null,
				description_html:
					'When threatened, the Gobstalker can mark Stress to reposition into cover or concealment.'
			}
		]
	},
	gargoyle: {
		source_key: 'HAF',
		title: 'Gargoyle',
		tier: 2,
		type: 'Standard',
		image_url: '',
		artist_name: '',
		description: 'A winged stone sentinel that waits motionless before striking.',
		motives_tactics: 'Ambush, guard, dive, petrify the battlefield',
		difficulty: 13,
		thresholds: { major: 7, severe: 14 },
		max_hp: 4,
		max_stress: 3,
		attack_modifier: 2,
		standard_attack: {
			name: 'Claws',
			range: 'Melee',
			damage_dice: '2d8',
			damage_bonus: 4,
			damage_type: 'phy'
		},
		experiences: ['Flying'],
		experience_modifiers: [2],
		features: [
			{
				type: 'Passive',
				name: 'Stone Stillness',
				max_uses: null,
				description_html:
					'While motionless, the Gargoyle is difficult to distinguish from carved stone until it attacks.'
			}
		]
	}
} as const satisfies Record<string, Adversary>;
