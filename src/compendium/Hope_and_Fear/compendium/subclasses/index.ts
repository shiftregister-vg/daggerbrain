import type { Subclass } from '@domain/schemas/compendium';

export const SUBCLASSES = {
	assassin_executioners_guild: {
		source_key: 'HAF',
		class_id: 'assassin',
		title: "Executioner's Guild",
		description_html:
			"Play the Executioner's Guild if you want to focus on direct, decisive kills.",
		image_url: '',
		artist_name: '',
		foundation_card: {
			features: [],
			options: []
		},
		specialization_card: {
			features: [],
			options: []
		},
		mastery_card: {
			features: [],
			options: []
		}
	},
	assassin_poisoners_guild: {
		source_key: 'HAF',
		class_id: 'assassin',
		title: "Poisoner's Guild",
		description_html:
			"Play the Poisoner's Guild if you want to use toxins, patience, and preparation to finish your marks.",
		image_url: '',
		artist_name: '',
		foundation_card: {
			features: [],
			options: []
		},
		specialization_card: {
			features: [],
			options: []
		},
		mastery_card: {
			features: [],
			options: []
		}
	},
	brawler_juggernaut: {
		source_key: 'HAF',
		class_id: 'brawler',
		title: 'Juggernaut',
		description_html: 'Play the Juggernaut if you want to hit hard and weather punishment.',
		image_url: '',
		artist_name: '',
		foundation_card: {
			features: [],
			options: []
		},
		specialization_card: {
			features: [],
			options: []
		},
		mastery_card: {
			features: [],
			options: []
		}
	},
	brawler_martial_artist: {
		source_key: 'HAF',
		class_id: 'brawler',
		title: 'Martial Artist',
		description_html:
			'Play the Martial Artist if you want to rely on discipline, technique, and precise strikes.',
		image_url: '',
		artist_name: '',
		foundation_card: {
			features: [
				{
					title: 'Martial Form',
					description_html:
						'Spend a Focus to activate or shift into a martial stance. Your stance lasts until you mark your last Hit Point, take Severe damage, the scene ends, or you shift into another stance.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Tier 1 Stances',
					description_html: `Choose from Tier 1 stances:
- **Brutal:** When a damage die rolls its maximum, roll an additional damage die.
- **Defensive:** Attack rolls against you have disadvantage unless the adversary marks a Stress.
- **Grappling:** Spend a Focus on a successful attack to make the target temporarily Restrained.
- **Steady:** Take -1 Evasion; on a successful damage roll, roll an additional damage die and drop the lowest.
- **Precise:** Gain +1 to attack rolls.
- **Quick:** Spend a Focus when making an attack roll to include an additional target within range.`,
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
			options: []
		},
		specialization_card: {
			features: [
				{
					title: 'Tier 2 Stances',
					description_html: `Add Tier 2 stances:
- **Deadly:** When you deal Severe damage, the target marks an additional Hit Point.
- **Hindering:** Spend a Focus on a successful attack to make the target temporarily Hindered, giving them -2 to attack rolls.
- **Invigorating:** After a successful attack, roll a **d4**; on a 4, gain a Focus.
- **Immovable:** Gain +2 to damage thresholds and cannot be moved unwillingly.
- **Nimble:** Spend Focus after a successful attack against you to roll d6s; if any values match, take no damage.
- **Otherworldly:** Choose whether your attacks deal physical or magic damage.
- **Scary:** Successful attacks also make the target mark a Stress.`,
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
			options: []
		},
		mastery_card: {
			features: [
				{
					title: 'Tier 3 Stances',
					description_html: `Add Tier 3 stances:
- **Deflecting:** Spend 2 Focus when targeted to add your Armor Score to Evasion against the attack.
- **Devastating:** Spend a Focus before an attack roll to use d20s as your damage dice.
- **Dueling:** Gain advantage when no other adversaries or allies are within Very Close range of you or your target.
- **Compounding:** When a Combo Die rolls its maximum, increase the next Combo Die size, up to d12.
- **Inexorable:** Attacks against you have disadvantage if more than two adversaries are within Melee of you.
- **Favored:** Add a trait of your choice to your damage roll.
- **Sheltering:** When you mark Armor, reduce damage for you and allies within Melee range who took the same damage.`,
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Tier 4 Stances',
					description_html: `Add Tier 4 stances:
- **Crushing:** Treat damage dice results of 1 as the die’s highest value.
- **Infuriating:** On a successful attack, make the target Furious; while Furious, they are Vulnerable and take -2 to attack rolls until they hit you.
- **Sweeping:** Target all adversaries within Very Close range, dealing half damage to each target you succeed against.
- **Discerning:** Choose your attack target after rolling; the GM tells you who the roll would hit.`,
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
			options: []
		}
	},
	warlock_pact_of_the_endless: {
		source_key: 'HAF',
		class_id: 'warlock',
		title: 'Pact of the Endless',
		description_html:
			'Play the Pact of the Endless if your patron embodies infinity, inevitability, or the unknowable.',
		image_url: '',
		artist_name: '',
		spellcast_trait: 'presence',
		foundation_card: {
			features: [],
			options: []
		},
		specialization_card: {
			features: [],
			options: []
		},
		mastery_card: {
			features: [],
			options: []
		}
	},
	warlock_pact_of_the_wrathful: {
		source_key: 'HAF',
		class_id: 'warlock',
		title: 'Pact of the Wrathful',
		description_html:
			'Play the Pact of the Wrathful if your patron offers power through fury, vengeance, and ruin.',
		image_url: '',
		artist_name: '',
		spellcast_trait: 'presence',
		foundation_card: {
			features: [],
			options: []
		},
		specialization_card: {
			features: [],
			options: []
		},
		mastery_card: {
			features: [],
			options: []
		}
	},
	witch_hedge: {
		source_key: 'HAF',
		class_id: 'witch',
		title: 'Hedge',
		description_html:
			'Play the Hedge if you want to practice protective, practical, and liminal witchcraft.',
		image_url: '',
		artist_name: '',
		spellcast_trait: 'instinct',
		foundation_card: {
			features: [],
			options: []
		},
		specialization_card: {
			features: [],
			options: []
		},
		mastery_card: {
			features: [],
			options: []
		}
	},
	witch_moon: {
		source_key: 'HAF',
		class_id: 'witch',
		title: 'Moon',
		description_html:
			'Play the Moon if you want to draw on night, omens, and shifting lunar power.',
		image_url: '',
		artist_name: '',
		spellcast_trait: 'instinct',
		foundation_card: {
			features: [],
			options: []
		},
		specialization_card: {
			features: [],
			options: []
		},
		mastery_card: {
			features: [],
			options: []
		}
	}
} satisfies Record<string, Subclass>;
