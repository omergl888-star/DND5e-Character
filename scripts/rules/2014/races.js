(function register2014Races(global) {
  "use strict";

  const rules = global.CharacterHub.rules;
  const SOURCE = Object.freeze({
    name: "SRD 5.1 (Creative Commons)",
    url: "https://media.wizards.com/2023/downloads/dnd/SRD_CC_v5.1.pdf"
  });
  const base = { edition: "2014", source: SOURCE, status: "enabled" };
  const trait = (id, name, summary, mechanics = {}) => ({
    id, name, summary, mechanics, edition: "2014", source: SOURCE, status: "enabled"
  });
  const languageChoice = (count = 1) => ({ id: "bonus-languages", label: count === 1 ? "Additional language" : "Additional languages", type: "language", count });
  const skillChoice = (id, label, count, options = "all") => ({ id, label, type: "skill", count, options });

  rules.register("races", [
    {
      ...base,
      id: "dwarf", name: "Dwarf", description: "Sturdy folk with resilient bodies and deep craft traditions.",
      abilityBonuses: { fixed: { CON: 2 }, choices: [] }, size: { value: "Medium" }, speed: { walk: 25, armorDoesNotReduce: true },
      senses: { darkvision: 60 }, languages: { fixed: ["Common", "Dwarvish"], choices: [] },
      proficiencies: {
        skills: { fixed: [], choices: [] }, armor: [],
        weapons: ["Battleaxe", "Handaxe", "Light Hammer", "Warhammer"],
        tools: { fixed: [], choices: [{ id: "dwarf-tool", label: "Artisan's tool", type: "tool", count: 1, options: ["Smith's Tools", "Brewer's Supplies", "Mason's Tools"] }] }
      },
      traits: [
        trait("dwarven-resilience", "Dwarven Resilience", "Advantage on saves against poison and resistance to poison damage."),
        trait("stonecunning", "Stonecunning", "Double proficiency on Intelligence (History) checks about stonework.")
      ],
      subraces: [{
        ...base, id: "hill-dwarf", name: "Hill Dwarf", abilityBonuses: { fixed: { WIS: 1 }, choices: [] },
        traits: [trait("dwarven-toughness", "Dwarven Toughness", "Maximum HP increases by 1 at each character level.", { hpPerLevel: 1 })]
      }]
    },
    {
      ...base,
      id: "elf", name: "Elf", description: "Graceful, perceptive people with fey ancestry.",
      abilityBonuses: { fixed: { DEX: 2 }, choices: [] }, size: { value: "Medium" }, speed: { walk: 30 },
      senses: { darkvision: 60 }, languages: { fixed: ["Common", "Elvish"], choices: [] },
      proficiencies: { skills: { fixed: ["perception"], choices: [] }, armor: [], weapons: [], tools: { fixed: [], choices: [] } },
      traits: [
        trait("keen-senses", "Keen Senses", "Proficiency in Perception."),
        trait("fey-ancestry", "Fey Ancestry", "Advantage on saves against being charmed; magic cannot put you to sleep."),
        trait("trance", "Trance", "A four-hour trance supplies the benefit of an eight-hour sleep.")
      ],
      subraces: [{
        ...base, id: "high-elf", name: "High Elf", abilityBonuses: { fixed: { INT: 1 }, choices: [] },
        languages: { fixed: [], choices: [languageChoice()] },
        proficiencies: { weapons: ["Longsword", "Shortsword", "Shortbow", "Longbow"] },
        choices: [{
          id: "wizard-cantrip", label: "Wizard cantrip", type: "select", count: 1,
          options: ["Acid Splash", "Chill Touch", "Dancing Lights", "Fire Bolt", "Light", "Mage Hand", "Mending", "Message", "Minor Illusion", "Poison Spray", "Prestidigitation", "Ray of Frost", "Shocking Grasp", "True Strike"]
        }],
        traits: [trait("elf-weapon-training", "Elf Weapon Training", "Proficiency with longsword, shortsword, shortbow, and longbow."), trait("cantrip", "Cantrip", "Know one wizard cantrip; Intelligence is its spellcasting ability.")]
      }]
    },
    {
      ...base,
      id: "halfling", name: "Halfling", description: "Small, brave adventurers with uncanny good fortune.",
      abilityBonuses: { fixed: { DEX: 2 }, choices: [] }, size: { value: "Small" }, speed: { walk: 25 }, senses: {},
      languages: { fixed: ["Common", "Halfling"], choices: [] },
      proficiencies: { skills: { fixed: [], choices: [] }, armor: [], weapons: [], tools: { fixed: [], choices: [] } },
      traits: [
        trait("lucky", "Lucky", "Reroll a natural 1 on an attack roll, ability check, or saving throw."),
        trait("brave", "Brave", "Advantage on saving throws against being frightened."),
        trait("halfling-nimbleness", "Halfling Nimbleness", "Move through the space of a creature larger than you.")
      ],
      subraces: [{
        ...base, id: "lightfoot", name: "Lightfoot Halfling", abilityBonuses: { fixed: { CHA: 1 }, choices: [] },
        traits: [trait("naturally-stealthy", "Naturally Stealthy", "Can attempt to hide behind a creature at least one size larger.")]
      }]
    },
    {
      ...base,
      id: "human", name: "Human", description: "Adaptable and broadly capable.",
      abilityBonuses: { fixed: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 }, choices: [] },
      size: { value: "Medium" }, speed: { walk: 30 }, senses: {},
      languages: { fixed: ["Common"], choices: [languageChoice()] },
      proficiencies: { skills: { fixed: [], choices: [] }, armor: [], weapons: [], tools: { fixed: [], choices: [] } },
      traits: [trait("human-versatility", "Human Versatility", "Each Ability Score increases by 1.")], subraces: []
    },
    {
      ...base,
      id: "dragonborn", name: "Dragonborn", description: "Draconic humanoids with an elemental breath weapon.",
      abilityBonuses: { fixed: { STR: 2, CHA: 1 }, choices: [] }, size: { value: "Medium" }, speed: { walk: 30 }, senses: {},
      languages: { fixed: ["Common", "Draconic"], choices: [] },
      proficiencies: { skills: { fixed: [], choices: [] }, armor: [], weapons: [], tools: { fixed: [], choices: [] } },
      choices: [{
        id: "draconic-ancestry", label: "Draconic ancestry", type: "select", count: 1,
        options: [
          { id: "black", label: "Black — Acid, 5×30 ft. line", damageType: "Acid", shape: "5 by 30 ft. line", save: "DEX" },
          { id: "blue", label: "Blue — Lightning, 5×30 ft. line", damageType: "Lightning", shape: "5 by 30 ft. line", save: "DEX" },
          { id: "brass", label: "Brass — Fire, 5×30 ft. line", damageType: "Fire", shape: "5 by 30 ft. line", save: "DEX" },
          { id: "bronze", label: "Bronze — Lightning, 5×30 ft. line", damageType: "Lightning", shape: "5 by 30 ft. line", save: "DEX" },
          { id: "copper", label: "Copper — Acid, 5×30 ft. line", damageType: "Acid", shape: "5 by 30 ft. line", save: "DEX" },
          { id: "gold", label: "Gold — Fire, 15 ft. cone", damageType: "Fire", shape: "15 ft. cone", save: "DEX" },
          { id: "green", label: "Green — Poison, 15 ft. cone", damageType: "Poison", shape: "15 ft. cone", save: "CON" },
          { id: "red", label: "Red — Fire, 15 ft. cone", damageType: "Fire", shape: "15 ft. cone", save: "DEX" },
          { id: "silver", label: "Silver — Cold, 15 ft. cone", damageType: "Cold", shape: "15 ft. cone", save: "CON" },
          { id: "white", label: "White — Cold, 15 ft. cone", damageType: "Cold", shape: "15 ft. cone", save: "CON" }
        ]
      }],
      traits: [
        trait("draconic-ancestry", "Draconic Ancestry", "Select a dragon type that determines breath damage and resistance."),
        trait("breath-weapon", "Breath Weapon", "Once per short or long rest, exhale damaging energy; DC uses Constitution.", { resource: { max: 1, recharge: "Short Rest", action: "Action" } }),
        trait("damage-resistance", "Damage Resistance", "Resistance to the damage type of the selected ancestry.")
      ], subraces: []
    },
    {
      ...base,
      id: "gnome", name: "Gnome", description: "Small, inventive folk with sharp magical minds.",
      abilityBonuses: { fixed: { INT: 2 }, choices: [] }, size: { value: "Small" }, speed: { walk: 25 }, senses: { darkvision: 60 },
      languages: { fixed: ["Common", "Gnomish"], choices: [] },
      proficiencies: { skills: { fixed: [], choices: [] }, armor: [], weapons: [], tools: { fixed: [], choices: [] } },
      traits: [trait("gnome-cunning", "Gnome Cunning", "Advantage on Intelligence, Wisdom, and Charisma saves against magic.")],
      subraces: [{
        ...base, id: "rock-gnome", name: "Rock Gnome", abilityBonuses: { fixed: { CON: 1 }, choices: [] },
        proficiencies: { tools: { fixed: ["Tinker's Tools"], choices: [] } },
        traits: [
          trait("artificers-lore", "Artificer's Lore", "Double proficiency on History checks about magic items, alchemy, or technology."),
          trait("tinker", "Tinker", "Use tinker's tools to build a Tiny clockwork device.")
        ]
      }]
    },
    {
      ...base,
      id: "half-elf", name: "Half-Elf", description: "Versatile people who combine human adaptability and elven ancestry.",
      abilityBonuses: { fixed: { CHA: 2 }, choices: [{ id: "ability-increases", label: "Two other Ability Scores", type: "ability", count: 2, amount: 1, exclude: ["CHA"], distinct: true }] },
      size: { value: "Medium" }, speed: { walk: 30 }, senses: { darkvision: 60 },
      languages: { fixed: ["Common", "Elvish"], choices: [languageChoice()] },
      proficiencies: { skills: { fixed: [], choices: [skillChoice("skill-versatility", "Skill Versatility", 2)] }, armor: [], weapons: [], tools: { fixed: [], choices: [] } },
      traits: [
        trait("fey-ancestry", "Fey Ancestry", "Advantage on saves against being charmed; magic cannot put you to sleep."),
        trait("skill-versatility", "Skill Versatility", "Proficiency in two skills of your choice.")
      ], subraces: []
    },
    {
      ...base,
      id: "half-orc", name: "Half-Orc", description: "Powerful survivors with relentless endurance.",
      abilityBonuses: { fixed: { STR: 2, CON: 1 }, choices: [] }, size: { value: "Medium" }, speed: { walk: 30 }, senses: { darkvision: 60 },
      languages: { fixed: ["Common", "Orc"], choices: [] },
      proficiencies: { skills: { fixed: ["intimidation"], choices: [] }, armor: [], weapons: [], tools: { fixed: [], choices: [] } },
      traits: [
        trait("menacing", "Menacing", "Proficiency in Intimidation."),
        trait("relentless-endurance", "Relentless Endurance", "Once per long rest, drop to 1 HP instead of 0 when not killed outright.", { resource: { max: 1, recharge: "Long Rest", action: "Special" } }),
        trait("savage-attacks", "Savage Attacks", "On a melee weapon critical hit, roll one extra weapon damage die.")
      ], subraces: []
    },
    {
      ...base,
      id: "tiefling", name: "Tiefling", description: "People with an infernal legacy and innate magic.",
      abilityBonuses: { fixed: { INT: 1, CHA: 2 }, choices: [] }, size: { value: "Medium" }, speed: { walk: 30 }, senses: { darkvision: 60 },
      languages: { fixed: ["Common", "Infernal"], choices: [] },
      proficiencies: { skills: { fixed: [], choices: [] }, armor: [], weapons: [], tools: { fixed: [], choices: [] } },
      traits: [
        trait("hellish-resistance", "Hellish Resistance", "Resistance to fire damage."),
        trait("infernal-legacy", "Infernal Legacy", "Know Thaumaturgy; later gain Hellish Rebuke and Darkness using Charisma.")
      ], subraces: []
    }
  ]);

  rules.register("features", rules.list("races").flatMap(race => [
    ...(race.traits || []).map(item => ({ ...item, id: `race-${race.id}-${item.id}`, featureType: "racial", parentId: race.id })),
    ...(race.subraces || []).flatMap(subrace => (subrace.traits || []).map(item => ({ ...item, id: `race-${subrace.id}-${item.id}`, featureType: "racial", parentId: subrace.id })))
  ]));
})(window);
