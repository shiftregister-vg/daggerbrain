import type { Subclass } from '../../../../convex/schemas/compendium';

export const SUBCLASSES = {
	assassin_executioners_guild: {
		source_key: 'HAF',
		class_id: 'assassin',
		title: "Executioner's Guild",
		description_html:
			'Play the Executioner\'s Guild if you want to focus on direct, decisive kills.',
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
	blood_hunter_order_of_the_lycan: {
		source_key: 'HAF',
		class_id: 'blood_hunter',
		title: 'Order of the Lycan',
		description_html:
			'Play the Order of the Lycan if you want to combine hemocraft with bestial transformation.',
		image_url: '',
		artist_name: '',
		spellcast_trait: 'agility',
		foundation_card: {
			features: [
				{
					title: 'Hybrid Form',
					description_html:
						'You can take on a lupine Hybrid Form. **Mark a Stress** to enter that form until all your Stress is marked or the scene ends. While in the form, you gain **1d4** bonus to your action and damage rolls.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'The Beast Within',
					description_html: 'When you gain a Hope while in Hybrid Form, you also mark a Stress.',
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
			options: []
		},
		specialization_card: {
			features: [
				{
					title: 'Bestial Focus',
					description_html:
						'Once per rest, you can place a domain card into your vault, then clear a number of Stress equal to the card\'s Recall Cost.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Feral Empowerment',
					description_html: 'The bonus die from your Hybrid Form increases to **1d6**.',
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
			options: []
		},
		mastery_card: {
			features: [
				{
					title: 'Apex Hunter',
					description_html: 'The bonus die from your Hybrid Form increases to **1d8**.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Regeneration',
					description_html:
						'When you succeed with Hope while in your Hybrid Form, roll a **d4**. If the result is higher than your current number of unmarked Hit Points, clear a Hit Point.',
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
			options: []
		}
	},
	blood_hunter_order_of_the_mutant: {
		source_key: 'HAF',
		class_id: 'blood_hunter',
		title: 'Order of the Mutant',
		description_html:
			'Play the Order of the Mutant if you want to alter your body through alchemy and blood magic.',
		image_url: '',
		artist_name: '',
		spellcast_trait: 'agility',
		foundation_card: {
			features: [
				{
					title: 'Mutagens',
					description_html: `You employ mutagenic toxins created to enhance your abilities. WHen you finish a rest, you can drink one such toxin to gain its effects, which last until you finish your next rest. These effects include a +1 bonus to one trait of your choice, and your choice of one of the following benefits:
- **Celerity**. If you are _Restrained_ or _Vulnerable_, you can **mark a Stress** to end the condition on yourself.
- **Durable**. Your Armor Score increases by 2.
- **Hunter's Senses**. You have advantage on any action roll you make to track a creature, and you can see in complete darkness.`,
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
			options: []
		},
		specialization_card: {
			features: [
				{
					title: 'Improved Mutagens',
					description_html: `When you choose a mutagen benefit, your options also include the following:
- **Nerves of Steel**. Whenever you must mark a Stress, you can **spend 2 Hope** instead.
- **Rapidity**. Your Evasion increases by 1.
- **Ironskin**. Your Severe damage threshold increases by a number equal to your Proficiency.`,
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Volatile Toxins',
					description_html:
						'You can choose two mutagen benefits instead of one. If you do, **mark a Hit Point** that can\'t be cleared until you finish your next rest.',
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
			options: []
		},
		mastery_card: {
			features: [
				{
					title: 'Mastered Mutagens',
					description_html: `The trait bonus and penalty you get from your Mutagens feature changes to +2 and -2, respectively. When you choose a mutagen benefit, your options also include the following:
- **Aetherblood**. Within your line of sight, you can see creatures and objects that are invisible, and visual illusions appear transparent to you. If a creature or an object within your line of sight has been transformed by magic, you can see its true form.
- **Steelflesh**. Your Major damage threshold gains a bonus equal to your Proficiency.`,
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
			options: []
		}
	},
	blood_hunter_order_of_the_specter: {
		source_key: 'HAF',
		class_id: 'blood_hunter',
		title: 'Order of the Specter',
		description_html:
			'Play the Order of the Specter if you want to hunt the dead and wield ghostly hemocraft.',
		image_url: '',
		artist_name: '',
		spellcast_trait: 'agility',
		foundation_card: {
			features: [
				{
					title: 'Shadowed Grit',
					description_html: 'When you succeed on an Action Roll with Fear, you can spend a Hope to clear a Stress.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Veilwalker',
					description_html:
						'You can breiefly slip into the realm between the living and the dead. **Mark a Stress** to move up to Close range through creatures and objects.',
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
			options: []
		},
		specialization_card: {
			features: [
				{
					title: 'Veilstalker',
					description_html:
						'When you use your Veilwalker feature, you can now move to a location within Far range, and you have advantage on the next action roll you make in this scene.',
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
			options: []
		},
		mastery_card: {
			features: [
				{
					title: 'Horror Honed',
					description_html: 'You cannot be made Vulnerable unless all your Stress is marked.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Spectral Form',
					description_html:
						'Once per long rest, when you would mark your last Hit Point, you can mark a Stress and enter your Spectral Form instead. While in this form, you can move through physical matter and have resistance to physical damage. Additionally, when you would mark a Hit Point, you may mark a Stress instead. You drop out of this form if your last Stress is marked or you clear a Hit Point.',
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
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
	summoner_necromancy: {
		source_key: 'HAF',
		class_id: 'summoner',
		title: 'Necromancy',
		description_html:
			'Play Necromancy if you want to call on the dead and bind spirits to your will.',
		image_url: '',
		artist_name: '',
		spellcast_trait: 'knowledge',
		foundation_card: {
			features: [
				{
					title: 'Second Circle — Shambling Corpse',
					description_html: 'You can summon Shambling Corpses using your Second Circle.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Hunger of the Grave',
					description_html:
						'Make a Spellcast Roll against a target within Far range. On a success, your Shambling Corpses attack, dealing 5 physical damage for each corpse, then one Shambling Corpse disappears.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Grim Harvest',
					description_html:
						'When an adversary within Far range marks their last Hit Point, summon one Shambling Corpse without marking a Stress.',
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
			options: []
		},
		specialization_card: {
			features: [
				{
					title: 'Third Circle — Ghosts',
					description_html: 'You can summon Ghosts using your Third Circle.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Ghostly Protectors',
					description_html: 'While you have any Ghosts summoned, gain +1 Evasion.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Spectral Terror',
					description_html:
						'Make a Spellcast Roll against a target within Far range. On a success, one Ghost scares the target, causing it to mark a Stress, then disappears.',
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
			options: []
		},
		mastery_card: {
			features: [
				{
					title: 'Fourth Circle — Death Knight',
					description_html: 'You can summon one Death Knight at a time using your Fourth Circle.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Deathly Warrior',
					description_html:
						'When you succeed on an attack roll with Hope, you can instead succeed with Fear to have your Death Knight rush the target, add **2d12** to the attack damage, then return to you.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Knightly Bulwark',
					description_html:
						'When you take Severe damage, your Death Knight can take one of the Hit Points instead, then disappears.',
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
			options: []
		}
	},
	summoner_theurgy: {
		source_key: 'HAF',
		class_id: 'summoner',
		title: 'Theurgy',
		description_html:
			'Play Theurgy if you want to summon and bargain with divine or celestial entities.',
		image_url: '',
		artist_name: '',
		spellcast_trait: 'knowledge',
		foundation_card: {
			features: [
				{
					title: 'Second Circle — Angel',
					description_html: 'You can summon Angels using your Second Circle.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Angelic Presence',
					description_html:
						'While you have any Angels summoned, gain advantage on Presence rolls to influence others.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Hopeful Strike',
					description_html:
						'When you succeed with Hope on an attack roll, command one Angel to deal an extra **1d10** magic damage to the target. The Angel then disappears.',
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
			options: []
		},
		specialization_card: {
			features: [
				{
					title: 'Third Circle — Archangel',
					description_html: 'You can summon Archangels using your Third Circle.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Divine Commander',
					description_html: 'While you have any Archangels summoned, Hopeful Strike deals **1d12** extra damage instead of **1d10**.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Heavenly Aid',
					description_html:
						'Command an Archangel to either fly you or an ally within Very Close range to a location within Far range, or Help an Ally within Close range without spending Hope. The Archangel then disappears.',
					character_modifiers: [],
					weapon_modifiers: []
				}
			],
			options: []
		},
		mastery_card: {
			features: [
				{
					title: 'Fourth Circle — Divine Manifestation',
					description_html:
						'You can summon one Divine Manifestation at a time using your Fourth Circle.',
					character_modifiers: [],
					weapon_modifiers: []
				},
				{
					title: 'Hallowed Hope',
					description_html:
						'When you summon a Divine Manifestation, place three extra Hope dice on this card. When you make an action or reaction roll, expend one of these dice and roll it alongside your normal Hope die, using the highest Hope result. When no dice remain, the Divine Manifestation disappears.',
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
