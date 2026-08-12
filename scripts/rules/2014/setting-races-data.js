(function load2014SettingRaces(global) {
  "use strict";

  const hub = global.CharacterHub;
  const generated = hub.rules.generated2014 = hub.rules.generated2014 || {};
  const flexible = () => ({ fixed: {}, choices: [], patterns: [
    { id: "plus-two-plus-one", label: "One +2 and a different +1", allocations: [{ id: "flex-plus-two", amount: 2, count: 1 }, { id: "flex-plus-one", amount: 1, count: 1 }] },
    { id: "three-ones", label: "Three different +1 increases", allocations: [{ id: "flex-three-ones", amount: 1, count: 3 }] }
  ] });
  const fixed = values => ({ fixed: values, choices: [], patterns: [] });
  const trait = (id, name, summary, mechanics = {}) => ({ id, name, summary, mechanics });
  const source = (book, id) => ({ name: `${book} (2014 rules)`, book, url: `https://dnd5e.wikidot.com/lineage:${id}`, type: "community-reference" });
  const languageChoice = count => ({ id: "bonus-languages", label: count === 1 ? "Additional language" : "Additional languages", type: "language", count, distinct: true });
  const skillChoice = (id, label, count, options = "all") => ({ id, label, type: "skill", count, options, distinct: true });
  const race = (id, name, book, config) => ({
    id, name, group: "Setting Specific", description: "An official setting lineage compatible with the 2014 rules.",
    abilityBonuses: config.abilityBonuses || flexible(), size: { value: config.size || "Medium" },
    speed: { walk: config.walk || 30, ...(config.movement || {}) }, senses: { darkvision: config.darkvision || 0 },
    languages: { fixed: config.languages || ["Common"], choices: config.languageChoices || [] },
    proficiencies: { skills: { fixed: config.skills || [], choices: config.skillChoices || [] }, armor: config.armor || [], weapons: config.weapons || [], tools: { fixed: config.tools || [], choices: config.toolChoices || [] } },
    traits: config.traits || [], subraces: config.subraces || [], choices: config.choices || [], edition: "2014",
    source: source(book, id), links: { community: `https://dnd5e.wikidot.com/lineage:${id}` }, status: "enabled"
  });

  const additions = [
    race("kalashtar", "Kalashtar", "Eberron: Rising from the Last War", {
      abilityBonuses: fixed({ WIS: 2, CHA: 1 }), languages: ["Common", "Quori"], languageChoices: [languageChoice(1)],
      traits: [trait("dual-mind", "Dual Mind", "Gain advantage on Wisdom saving throws."), trait("mental-discipline", "Mental Discipline", "Gain resistance to psychic damage."), trait("mind-link", "Mind Link", "Speak telepathically to a creature within a distance based on your level."), trait("severed-from-dreams", "Severed from Dreams", "You sleep without dreaming and resist effects that rely on dreams.")]
    }),
    race("warforged", "Warforged", "Eberron: Rising from the Last War", {
      abilityBonuses: { fixed: { CON: 2 }, choices: [{ id: "warforged-ability", label: "Additional Ability Score increase", type: "ability", amount: 1, count: 1, exclude: ["CON"] }], patterns: [] }, languageChoices: [languageChoice(1)],
      skillChoices: [skillChoice("warforged-skill", "Specialized Design skill", 1)], toolChoices: [{ id: "warforged-tool", label: "Specialized Design tool", type: "text", count: 1, placeholder: "Enter a tool proficiency" }],
      traits: [trait("constructed-resilience", "Constructed Resilience", "Resist poison, disease, magical sleep, and the need to eat, drink, or breathe."), trait("sentrys-rest", "Sentry's Rest", "Remain conscious and motionless during a six-hour long rest."), trait("integrated-protection", "Integrated Protection", "Gain +1 AC and integrate proficient armor into your body.", { armoredAcBonus: 1 }), trait("specialized-design", "Specialized Design", "Gain one skill and one tool proficiency.")]
    }),
    race("kender", "Kender", "Dragonlance: Shadow of the Dragon Queen", {
      size: "Small", languageChoices: [languageChoice(1)], skillChoices: [skillChoice("kender-aptitude", "Kender Aptitude", 1, ["insight", "investigation", "sleightOfHand", "stealth", "survival"])],
      traits: [trait("fearless", "Fearless", "Gain advantage against being frightened and can end the condition once per long rest."), trait("kender-aptitude", "Kender Aptitude", "Gain one listed skill proficiency."), trait("taunt", "Taunt", "Distract a nearby creature as a bonus action a proficiency-based number of times per long rest.")]
    }),
    race("aetherborn", "Aetherborn", "Plane Shift: Kaladesh", {
      abilityBonuses: { fixed: { CHA: 2 }, choices: [{ id: "aetherborn-abilities", label: "Two other Ability Score increases", type: "ability", amount: 1, count: 2, exclude: ["CHA"], distinct: true }], patterns: [] }, darkvision: 60, languageChoices: [languageChoice(2)],
      traits: [trait("born-of-aether", "Born of Aether", "Your unusual physiology removes the need to eat or sleep."), trait("menacing", "Menacing", "Gain proficiency in Intimidation."), trait("necrotic-resistance", "Necrotic Resistance", "Gain resistance to necrotic damage.")], skills: ["intimidation"]
    }),
    race("aven", "Aven", "Plane Shift: Amonkhet", {
      abilityBonuses: fixed({ DEX: 2 }), walk: 25, movement: { fly: 30 }, languages: ["Common", "Aven"],
      traits: [trait("flight", "Flight", "Gain a 30-foot flying speed while not wearing medium or heavy armor.")],
      subraces: [
        { id: "ibis-headed-aven", name: "Ibis-Headed Aven", abilityBonuses: { fixed: { INT: 1 }, choices: [] }, traits: [trait("kefnets-blessing", "Kefnet's Blessing", "Add half your proficiency bonus to Intelligence checks that do not already include it.")] },
        { id: "hawk-headed-aven", name: "Hawk-Headed Aven", abilityBonuses: { fixed: { WIS: 2 }, choices: [] }, proficiencies: { skills: { fixed: ["perception"], choices: [] } }, traits: [trait("hawkeyed", "Hawkeyed", "Gain proficiency in Perception and ignore long-range disadvantage with ranged weapon attacks.")] }
      ]
    }),
    race("khenra", "Khenra", "Plane Shift: Amonkhet", {
      abilityBonuses: fixed({ DEX: 2, STR: 1 }), walk: 35, languages: ["Common", "Khenra"], weapons: ["Khopesh", "Spear", "Javelin"],
      traits: [trait("khenra-weapon-training", "Khenra Weapon Training", "Gain proficiency with the khopesh, spear, and javelin."), trait("khnera-twins", "Khenra Twins", "A bonded twin can protect you from fear; a twinless khenra becomes immune to fear.")]
    }),
    race("kor", "Kor", "Plane Shift: Zendikar", {
      abilityBonuses: fixed({ DEX: 2, WIS: 1 }), movement: { climb: 30 }, languages: ["Common", "Kor"], skills: ["athletics", "acrobatics"],
      traits: [trait("kor-climbing", "Kor Climbing", "Gain a climbing speed of 30 feet."), trait("kor-training", "Kor Training", "Gain proficiency in Athletics and Acrobatics."), trait("lucky", "Lucky", "Reroll a natural 1 on an attack roll, ability check, or saving throw."), trait("brave", "Brave", "Gain advantage on saves against being frightened.")]
    }),
    race("merfolk", "Merfolk", "Plane Shift: Zendikar", {
      abilityBonuses: fixed({ CHA: 1 }), movement: { swim: 30 }, languages: ["Common", "Merfolk"], languageChoices: [languageChoice(1)],
      traits: [trait("amphibious", "Amphibious", "Breathe air and water."), trait("swim", "Swim", "Gain a 30-foot swimming speed.")],
      subraces: [
        { id: "green-merfolk", name: "Green Merfolk", abilityBonuses: { fixed: { WIS: 2 }, choices: [] }, choices: [{ id: "green-merfolk-cantrip", label: "Druid cantrip", type: "text", count: 1, placeholder: "Enter a Druid cantrip" }], traits: [trait("mask-of-the-wild", "Mask of the Wild", "Hide while lightly obscured by natural phenomena."), trait("merfolk-cantrip", "Cantrip", "Learn one Druid cantrip using Wisdom.")] },
        { id: "blue-merfolk", name: "Blue Merfolk", abilityBonuses: { fixed: { INT: 2 }, choices: [] }, proficiencies: { skills: { fixed: ["history", "nature"], choices: [] } }, choices: [{ id: "blue-merfolk-cantrip", label: "Wizard cantrip", type: "text", count: 1, placeholder: "Enter a Wizard cantrip" }], traits: [trait("lore-of-the-waters", "Lore of the Waters", "Gain proficiency in History and Nature."), trait("merfolk-cantrip", "Cantrip", "Learn one Wizard cantrip using Intelligence.")] }
      ]
    }),
    race("naga", "Naga", "Plane Shift: Amonkhet", {
      abilityBonuses: fixed({ CON: 2, INT: 1 }), languages: ["Common", "Naga"],
      traits: [trait("speed-burst", "Speed Burst", "Move faster when you use the Dash action."), trait("natural-weapons", "Natural Weapons", "Use your bite and constricting body as natural weapons."), trait("poison-immunity", "Poison Immunity", "Become immune to poison damage and the poisoned condition."), trait("poison-affinity", "Poison Affinity", "Gain proficiency with the poisoner's kit." )], tools: ["Poisoner's Kit"]
    }),
    race("siren", "Siren", "Plane Shift: Ixalan", {
      abilityBonuses: fixed({ CHA: 2, DEX: 1 }), movement: { fly: 30 }, languages: ["Common", "Siren"], skills: ["performance"],
      traits: [trait("flight", "Flight", "Gain a 30-foot flying speed while not wearing medium or heavy armor."), trait("siren-song", "Siren Song", "Use your voice and Charisma to influence creatures."), trait("musical-training", "Musical Training", "Gain proficiency in Performance and one musical instrument.")], toolChoices: [{ id: "siren-instrument", label: "Musical instrument", type: "text", count: 1, placeholder: "Enter a musical instrument" }]
    }),
    race("vampire", "Vampire", "Plane Shift: Zendikar", {
      abilityBonuses: fixed({ CHA: 2, INT: 1 }), darkvision: 60, languages: ["Common", "Vampire"],
      traits: [trait("darkvision", "Darkvision", "See in darkness out to 60 feet."), trait("vampiric-resistance", "Vampiric Resistance", "Gain resistance to necrotic damage."), trait("vampiric-thirst", "Vampiric Thirst", "Use a life-draining bite as a natural weapon."), trait("bloodthirst", "Bloodthirst", "Drain a restrained or incapacitated creature to gain a temporary benefit.")]
    }),
    race("dhampir", "Dhampir", "Van Richten's Guide to Ravenloft", {
      size: "Small or Medium", walk: 35, darkvision: 60, languageChoices: [languageChoice(1)],
      traits: [trait("darkvision", "Darkvision", "See in darkness out to 60 feet."), trait("deathless-nature", "Deathless Nature", "You do not need to breathe."), trait("spider-climb", "Spider Climb", "Climb at your walking speed; at 3rd level move across walls and ceilings hands-free."), trait("vampiric-bite", "Vampiric Bite", "Use a Constitution-based bite to empower yourself a proficiency-based number of times per long rest.")]
    }),
    race("hexblood", "Hexblood", "Van Richten's Guide to Ravenloft", {
      size: "Small or Medium", darkvision: 60, languageChoices: [languageChoice(1)],
      traits: [trait("darkvision", "Darkvision", "See in darkness out to 60 feet."), trait("fey", "Fey", "Your creature type is Fey."), trait("eerie-token", "Eerie Token", "Create a token for telepathic messages or remote viewing once per long rest."), trait("hex-magic", "Hex Magic", "Cast disguise self and hex using a chosen mental Ability Score.")]
    }),
    race("reborn", "Reborn", "Van Richten's Guide to Ravenloft", {
      size: "Small or Medium", languageChoices: [languageChoice(1)],
      traits: [trait("deathless-nature", "Deathless Nature", "Resist disease and poison, avoid breathing, and rest without sleep."), trait("knowledge-from-a-past-life", "Knowledge from a Past Life", "Add a d6 to a skill check a proficiency-based number of times per long rest.")]
    }),
    race("loxodon", "Loxodon", "Guildmasters' Guide to Ravnica", {
      abilityBonuses: fixed({ CON: 2, WIS: 1 }), languages: ["Common", "Loxodon"],
      traits: [trait("powerful-build", "Powerful Build", "Count as one size larger for carrying, pushing, dragging, and lifting."), trait("loxodon-serenity", "Loxodon Serenity", "Gain advantage against being charmed or frightened."), trait("natural-armor", "Natural Armor", "Without armor, AC equals 12 + Constitution modifier.", { armorFormula: "12+CON" }), trait("trunk", "Trunk", "Use your trunk to lift, manipulate, grapple, and make unarmed strikes."), trait("keen-smell", "Keen Smell", "Gain advantage on smell-based Perception, Survival, and Investigation checks.")]
    }),
    race("simic-hybrid", "Simic Hybrid", "Guildmasters' Guide to Ravnica", {
      abilityBonuses: { fixed: { CON: 2 }, choices: [{ id: "simic-ability", label: "Additional Ability Score increase", type: "ability", amount: 1, count: 1, exclude: ["CON"] }], patterns: [] }, darkvision: 60, languages: ["Common", "Elvish"],
      choices: [{ id: "animal-enhancement-1", label: "Level 1 Animal Enhancement", type: "select", count: 1, options: ["Manta Glide", "Nimble Climber", "Underwater Adaptation"] }],
      traits: [trait("darkvision", "Darkvision", "See in darkness out to 60 feet."), trait("animal-enhancement", "Animal Enhancement", "Choose a biological adaptation at 1st level and another at 5th level.")]
    }),
    race("vedalken", "Vedalken", "Guildmasters' Guide to Ravnica", {
      abilityBonuses: fixed({ INT: 2, WIS: 1 }), languages: ["Common", "Vedalken"], languageChoices: [languageChoice(1)], movement: { swim: 30 },
      skillChoices: [skillChoice("vedalken-discipline", "Tireless Precision skill", 1, ["arcana", "history", "investigation", "medicine", "performance", "sleightOfHand"])], toolChoices: [{ id: "vedalken-tool", label: "Tireless Precision tool", type: "text", count: 1, placeholder: "Enter a tool proficiency" }],
      traits: [trait("vedalken-dispassion", "Vedalken Dispassion", "Gain advantage on Intelligence, Wisdom, and Charisma saving throws."), trait("tireless-precision", "Tireless Precision", "Gain a skill and tool proficiency and add a d4 to their checks."), trait("partially-amphibious", "Partially Amphibious", "Breathe underwater for up to one hour per long rest.")]
    }),
    race("elf-astral", "Astral Elf", "Spelljammer: Adventures in Space", {
      size: "Medium", darkvision: 60, languages: ["Common", "Elvish"], languageChoices: [languageChoice(1)], skills: ["perception"],
      traits: [trait("astral-fire", "Astral Fire", "Choose one light-producing cantrip using a selected mental Ability Score."), trait("darkvision", "Darkvision", "See in darkness out to 60 feet."), trait("fey-ancestry", "Fey Ancestry", "Gain advantage against charm and immunity to magical sleep."), trait("keen-senses", "Keen Senses", "Gain proficiency in Perception."), trait("starlight-step", "Starlight Step", "Teleport 30 feet as a bonus action a proficiency-based number of times per long rest."), trait("astral-trance", "Astral Trance", "Complete a long rest in four hours and temporarily gain two proficiencies.")]
    }),
    race("autognome", "Autognome", "Spelljammer: Adventures in Space", {
      size: "Small", languageChoices: [languageChoice(1)],
      traits: [trait("armored-casing", "Armored Casing", "Without armor, AC equals 13 + Dexterity modifier.", { armorFormula: "13+DEX" }), trait("built-for-success", "Built for Success", "Add a d4 after a failed roll a proficiency-based number of times per long rest."), trait("healing-machine", "Healing Machine", "Benefit from specified healing magic despite being a Construct."), trait("mechanical-nature", "Mechanical Nature", "Resist disease, poison, magical sleep, and the need to eat, drink, or breathe."), trait("sentrys-rest", "Sentry's Rest", "Remain conscious and motionless during a six-hour long rest."), trait("specialized-design", "Specialized Design", "Gain two tool proficiencies.")], toolChoices: [{ id: "autognome-tools", label: "Specialized Design tools", type: "text", count: 2, distinct: true, placeholder: "Enter a tool proficiency" }]
    }),
    race("giff", "Giff", "Spelljammer: Adventures in Space", {
      languageChoices: [languageChoice(1)],
      traits: [trait("astral-spark", "Astral Spark", "Deal extra force damage with a weapon attack a proficiency-based number of times per long rest."), trait("firearms-mastery", "Firearms Mastery", "Gain firearm proficiency and ignore the Loading property and long-range disadvantage."), trait("hippo-build", "Hippo Build", "Gain advantage on Strength checks and saves and count as one size larger for carrying.")]
    }),
    race("hadozee", "Hadozee", "Spelljammer: Adventures in Space", {
      size: "Small or Medium", movement: { climb: 30 }, languageChoices: [languageChoice(1)],
      traits: [trait("dexterous-feet", "Dexterous Feet", "Manipulate objects and use certain bonus-action interactions with your feet."), trait("glide", "Glide", "Use your wing membranes to reduce falling damage and move horizontally while falling."), trait("hadozee-resilience", "Hadozee Resilience", "Reduce incoming damage a proficiency-based number of times per long rest.")]
    }),
    race("plasmoid", "Plasmoid", "Spelljammer: Adventures in Space", {
      size: "Small or Medium", darkvision: 60, languageChoices: [languageChoice(1)],
      traits: [trait("amorphous", "Amorphous", "Squeeze through narrow spaces and gain advantage to escape grapples."), trait("darkvision", "Darkvision", "See in darkness out to 60 feet."), trait("hold-breath", "Hold Breath", "Hold your breath for one hour."), trait("natural-resilience", "Natural Resilience", "Resist acid and poison and gain advantage against poison."), trait("shape-self", "Shape Self", "Reshape your body and form temporary limbs as an action or bonus action.")]
    }),
    race("thri-kreen", "Thri-kreen", "Spelljammer: Adventures in Space", {
      darkvision: 60, languageChoices: [languageChoice(1)],
      traits: [trait("chameleon-carapace", "Chameleon Carapace", "Without armor, AC equals 13 + Dexterity modifier and you can hide by changing color.", { armorFormula: "13+DEX" }), trait("darkvision", "Darkvision", "See in darkness out to 60 feet."), trait("secondary-arms", "Secondary Arms", "Use two smaller arms to manipulate light objects and wield light weapons."), trait("sleepless", "Sleepless", "Remain conscious while resting and do not require sleep."), trait("thri-kreen-telepathy", "Thri-kreen Telepathy", "Communicate telepathically with willing nearby creatures.")]
    }),
    race("leonin", "Leonin", "Mythic Odysseys of Theros", {
      abilityBonuses: fixed({ CON: 2, STR: 1 }), walk: 35, darkvision: 60, languages: ["Common", "Leonin"], skillChoices: [skillChoice("hunters-instincts", "Hunter's Instincts", 1, ["athletics", "intimidation", "perception", "survival"])],
      traits: [trait("darkvision", "Darkvision", "See in darkness out to 60 feet."), trait("claws", "Claws", "Use your claws for 1d4 slashing unarmed strikes."), trait("hunters-instincts", "Hunter's Instincts", "Gain one listed skill proficiency."), trait("daunting-roar", "Daunting Roar", "Frighten nearby creatures as a bonus action once per short or long rest.")]
    })
  ];

  generated.expandedRaces = [...(generated.expandedRaces || []), ...additions];
})(window);
