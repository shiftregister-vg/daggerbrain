import type { Adversary } from '@domain/schemas/compendium';

export const TIER_1_ADVERSARIES = {
	mountain_troll: {
		source_key: 'HAF',
		title: 'Mountain Troll',
		tier: 1,
		type: 'Bruiser',
		image_url: '',
		artist_name: '',
		description: 'A hulking, hungry troll from high mountain passes.',
		motives_tactics: 'Ambush, crush, devour, hurl debris',
		difficulty: 12,
		thresholds: { major: 5, severe: 10 },
		max_hp: 5,
		max_stress: 2,
		attack_modifier: 1,
		standard_attack: {
			name: 'Club',
			range: 'Melee',
			damage_dice: '1d10',
			damage_bonus: 3,
			damage_type: 'phy'
		},
		experiences: ['Climb'],
		experience_modifiers: [2],
		features: [
			{
				type: 'Action',
				name: 'Boulder Toss',
				max_uses: null,
				description_html:
					'Spend a Fear to make a Far-range attack with a thrown boulder. On a hit, the target also risks being knocked down or pinned by rubble.'
			}
		]
	},
	rabble_mawb: {
		source_key: 'HAF',
		title: 'Rabble Mawb',
		tier: 1,
		type: 'Horde',
		image_url: '',
		artist_name: '',
		description: 'A crowd of snapping, many-mouthed scavengers.',
		motives_tactics: 'Surround, swarm, bite, scatter',
		difficulty: 10,
		thresholds: { major: 4, severe: 8 },
		max_hp: 4,
		max_stress: 3,
		attack_modifier: 1,
		standard_attack: {
			name: 'Group Bite',
			range: 'Close',
			damage_dice: '2d6',
			damage_bonus: 3,
			damage_type: 'phy'
		},
		experiences: ['Swarm'],
		experience_modifiers: [2],
		features: [
			{
				type: 'Passive',
				name: 'Overwhelm',
				max_uses: null,
				description_html:
					'The Rabble Mawb is most dangerous while clustered together, pressing targets with many small attacks.'
			}
		]
	},
	redcap_candlemaker: {
		source_key: 'HAF',
		title: 'Redcap Candlemaker',
		tier: 1,
		type: 'Support',
		image_url: '',
		artist_name: '',
		description: 'A redcap artisan carrying cursed candles and scalding wax.',
		motives_tactics: 'Burn, distract, illuminate prey, empower allies',
		difficulty: 11,
		thresholds: { major: 4, severe: 8 },
		max_hp: 4,
		max_stress: 2,
		attack_modifier: 0,
		standard_attack: {
			name: 'Scalding Wax',
			range: 'Close',
			damage_dice: '1d8',
			damage_bonus: 2,
			damage_type: 'mag'
		},
		experiences: ['Candle Magic'],
		experience_modifiers: [2],
		features: [
			{
				type: 'Action',
				name: 'Wicklight Hex',
				max_uses: null,
				description_html:
					'Spend a Fear to light a cursed candle, hindering a nearby target or strengthening a redcap ally until the flame is snuffed.'
			}
		]
	},
	redcap_butcher: {
		source_key: 'HAF',
		title: 'Redcap Butcher',
		tier: 1,
		type: 'Bruiser',
		image_url: '',
		artist_name: '',
		description: 'A blood-soaked redcap with an oversized cleaver.',
		motives_tactics: 'Hack, chase, intimidate, revel in bloodshed',
		difficulty: 11,
		thresholds: { major: 5, severe: 10 },
		max_hp: 5,
		max_stress: 2,
		attack_modifier: 2,
		standard_attack: {
			name: 'Cleaver',
			range: 'Melee',
			damage_dice: '1d10',
			damage_bonus: 2,
			damage_type: 'phy'
		},
		experiences: ['Butchery'],
		experience_modifiers: [2],
		features: [
			{
				type: 'Reaction',
				name: 'Bloody Pursuit',
				max_uses: null,
				description_html:
					'When a nearby target marks Hit Points, the Redcap Butcher can press forward and keep the target from easily disengaging.'
			}
		]
	}
} as const satisfies Record<string, Adversary>;
