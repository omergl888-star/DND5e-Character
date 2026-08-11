(function register2014Classes(global) {
  "use strict";

  const rules = global.CharacterHub.rules;
  const SOURCE = Object.freeze({
    name: "SRD 5.1 (Creative Commons)",
    url: "https://media.wizards.com/2023/downloads/dnd/SRD_CC_v5.1.pdf"
  });
  const ALL_SKILLS = global.CharacterHub.constants.skills.map(([id]) => id);
  const base = { edition: "2014", source: SOURCE, status: "enabled" };
  const feature = (id, name, summary, mechanics = {}) => ({ id, name, summary, mechanics, edition: "2014", source: SOURCE, status: "enabled" });
  const general = (name, qty = 1) => ({ name, qty, category: "General Item", weight: 0 });
  const tool = (name, qty = 1) => ({ name, qty, category: "Tool / Kit", weight: 0, tool: { ability: "None", proficient: true } });
  const focus = name => ({ name, qty: 1, category: "General Item", weight: 0 });
  const armor = (name, armorType, baseAC, addDex, maxDex = "", weight = 0) => ({
    name, qty: 1, category: "Armor", weight,
    armor: { armorType, baseAC, acBonus: 0, addDex, maxDex, strengthRequirement: 0, stealthDisadvantage: false }
  });
  const shield = () => ({ name: "Shield", qty: 1, category: "Armor", weight: 6, armor: { armorType: "Shield", baseAC: 0, acBonus: 2, addDex: false, maxDex: "", strengthRequirement: 0, stealthDisadvantage: false } });
  const weapon = (name, damageDice, damageType, properties = [], mode = "Melee", range = "5 ft.", qty = 1, weight = 0) => ({
    name, qty, category: "Weapon", weight,
    weapon: { mode, damageDice, damageType, ability: mode === "Ranged" ? "DEX" : "STR", attackBonus: 0, damageBonus: 0, range, properties }
  });
  const pack = (id, name, items) => ({ id, name, items });
  const skillProficiency = (count, options) => ({ count, options });
  const subclass = (selectionLevel, srdOption, highlights) => ({ selectionLevel, srdOption, highlights });

  rules.register("classes", [
    {
      ...base, id: "barbarian", name: "Barbarian", hitDie: 12, savingThrows: ["STR", "CON"],
      proficiencies: { armor: ["Light Armor", "Medium Armor", "Shields"], weapons: ["Simple Weapons", "Martial Weapons"], tools: { fixed: [], choices: [] }, skills: skillProficiency(2, ["animalHandling", "athletics", "intimidation", "nature", "perception", "survival"]) },
      level1Features: [
        feature("rage", "Rage", "Twice per long rest, gain melee damage, Strength advantages, and physical damage resistance while raging.", { resource: { max: 2, recharge: "Long Rest", action: "Bonus Action" } }),
        feature("unarmored-defense-barbarian", "Unarmored Defense", "While unarmored, AC equals 10 + Dexterity modifier + Constitution modifier.", { armorFormula: "10+DEX+CON" })
      ],
      equipmentPackages: [
        pack("greataxe", "Greataxe and explorer's pack", [weapon("Greataxe", "1d12", "Slashing", ["Heavy", "Two-Handed"], "Melee", "5 ft.", 1, 7), weapon("Handaxe", "1d6", "Slashing", ["Light", "Thrown"], "Melee or Ranged", "20/60 ft.", 2, 2), weapon("Javelin", "1d6", "Piercing", ["Thrown"], "Melee or Ranged", "30/120 ft.", 4, 2), general("Explorer's Pack")]),
        pack("greatsword", "Greatsword and explorer's pack", [weapon("Greatsword", "2d6", "Slashing", ["Heavy", "Two-Handed"], "Melee", "5 ft.", 1, 6), weapon("Handaxe", "1d6", "Slashing", ["Light", "Thrown"], "Melee or Ranged", "20/60 ft.", 2, 2), weapon("Javelin", "1d6", "Piercing", ["Thrown"], "Melee or Ranged", "30/120 ft.", 4, 2), general("Explorer's Pack")])
      ], spellcasting: null, subclass: subclass(3, "Path of the Berserker", ["Frenzy", "Mindless Rage", "Intimidating Presence", "Retaliation"])
    },
    {
      ...base, id: "bard", name: "Bard", hitDie: 8, savingThrows: ["DEX", "CHA"],
      proficiencies: { armor: ["Light Armor"], weapons: ["Simple Weapons", "Hand Crossbows", "Longswords", "Rapiers", "Shortswords"], tools: { fixed: [], choices: [{ id: "bard-instruments", label: "Musical instruments", type: "tool", count: 3, options: ["Bagpipes", "Drum", "Dulcimer", "Flute", "Lute", "Lyre", "Horn", "Pan Flute", "Shawm", "Viol"] }] }, skills: skillProficiency(3, ALL_SKILLS) },
      level1Features: [feature("spellcasting-bard", "Spellcasting", "Cast bard spells using Charisma."), feature("bardic-inspiration", "Bardic Inspiration", "Grant an ally a d6 inspiration die as a bonus action.", { resource: { maxFormula: "CHA", minimum: 1, recharge: "Long Rest", action: "Bonus Action" } })],
      equipmentPackages: [
        pack("rapier-diplomat", "Rapier, diplomat's pack, and lute", [weapon("Rapier", "1d8", "Piercing", ["Finesse"], "Melee", "5 ft.", 1, 2), armor("Leather Armor", "Light", 11, true, "", 10), weapon("Dagger", "1d4", "Piercing", ["Finesse", "Light", "Thrown"], "Melee or Ranged", "20/60 ft.", 1, 1), tool("Lute"), general("Diplomat's Pack")]),
        pack("shortsword-entertainer", "Shortsword, entertainer's pack, and flute", [weapon("Shortsword", "1d6", "Piercing", ["Finesse", "Light"], "Melee", "5 ft.", 1, 2), armor("Leather Armor", "Light", 11, true, "", 10), weapon("Dagger", "1d4", "Piercing", ["Finesse", "Light", "Thrown"], "Melee or Ranged", "20/60 ft.", 1, 1), tool("Flute"), general("Entertainer's Pack")])
      ],
      spellcasting: { startsAt: 1, ability: "CHA", kind: "known", cantripsKnown: 2, spellsKnown: 4, level1Slots: 2, ritualCasting: true, focus: "Musical instrument" },
      subclass: subclass(3, "College of Lore", ["Bonus Proficiencies", "Cutting Words", "Additional Magical Secrets", "Peerless Skill"])
    },
    {
      ...base, id: "cleric", name: "Cleric", hitDie: 8, savingThrows: ["WIS", "CHA"],
      proficiencies: { armor: ["Light Armor", "Medium Armor", "Heavy Armor (Life Domain)", "Shields"], weapons: ["Simple Weapons"], tools: { fixed: [], choices: [] }, skills: skillProficiency(2, ["history", "insight", "medicine", "persuasion", "religion"]) },
      level1Features: [feature("spellcasting-cleric", "Spellcasting", "Prepare and cast cleric spells using Wisdom."), feature("life-domain", "Divine Domain: Life", "The SRD domain grants heavy armor proficiency and improves healing magic.")],
      equipmentPackages: [
        pack("mace-scale", "Mace, scale mail, shield, and priest's pack", [weapon("Mace", "1d6", "Bludgeoning", [], "Melee", "5 ft.", 1, 4), armor("Scale Mail", "Medium", 14, true, 2, 45), shield(), weapon("Light Crossbow", "1d8", "Piercing", ["Ammunition", "Loading", "Two-Handed"], "Ranged", "80/320 ft.", 1, 5), general("Crossbow Bolts", 20), general("Priest's Pack"), focus("Holy Symbol")]),
        pack("mace-chain", "Mace, chain mail, shield, and explorer's pack", [weapon("Mace", "1d6", "Bludgeoning", [], "Melee", "5 ft.", 1, 4), armor("Chain Mail", "Heavy", 16, false, "", 55), shield(), weapon("Javelin", "1d6", "Piercing", ["Thrown"], "Melee or Ranged", "30/120 ft.", 2, 2), general("Explorer's Pack"), focus("Holy Symbol")])
      ],
      spellcasting: { startsAt: 1, ability: "WIS", kind: "prepared", cantripsKnown: 3, preparedFormula: "WIS modifier + cleric level", level1Slots: 2, ritualCasting: true, focus: "Holy symbol" },
      subclass: subclass(1, "Life Domain", ["Disciple of Life", "Channel Divinity: Preserve Life", "Blessed Healer", "Divine Strike", "Supreme Healing"])
    },
    {
      ...base, id: "druid", name: "Druid", hitDie: 8, savingThrows: ["INT", "WIS"],
      proficiencies: { armor: ["Light Armor (nonmetal)", "Medium Armor (nonmetal)", "Shields (nonmetal)"], weapons: ["Clubs", "Daggers", "Darts", "Javelins", "Maces", "Quarterstaffs", "Scimitars", "Sickles", "Slings", "Spears"], tools: { fixed: ["Herbalism Kit"], choices: [] }, skills: skillProficiency(2, ["arcana", "animalHandling", "insight", "medicine", "nature", "perception", "religion", "survival"]) },
      level1Features: [feature("druidic", "Druidic", "Know the secret language of druids."), feature("spellcasting-druid", "Spellcasting", "Prepare and cast druid spells using Wisdom.")],
      equipmentPackages: [
        pack("scimitar-shield", "Scimitar, wooden shield, leather armor, and explorer's pack", [weapon("Scimitar", "1d6", "Slashing", ["Finesse", "Light"], "Melee", "5 ft.", 1, 3), shield(), armor("Leather Armor", "Light", 11, true, "", 10), general("Explorer's Pack"), focus("Druidic Focus")]),
        pack("quarterstaff", "Quarterstaff, leather armor, and explorer's pack", [weapon("Quarterstaff", "1d6", "Bludgeoning", ["Versatile (1d8)"], "Melee", "5 ft.", 1, 4), armor("Leather Armor", "Light", 11, true, "", 10), general("Explorer's Pack"), focus("Druidic Focus")])
      ],
      spellcasting: { startsAt: 1, ability: "WIS", kind: "prepared", cantripsKnown: 2, preparedFormula: "WIS modifier + druid level", level1Slots: 2, ritualCasting: true, focus: "Druidic focus" },
      subclass: subclass(2, "Circle of the Land", ["Bonus Cantrip", "Natural Recovery", "Circle Spells", "Land's Stride", "Nature's Ward", "Nature's Sanctuary"])
    },
    {
      ...base, id: "fighter", name: "Fighter", hitDie: 10, savingThrows: ["STR", "CON"],
      proficiencies: { armor: ["All Armor", "Shields"], weapons: ["Simple Weapons", "Martial Weapons"], tools: { fixed: [], choices: [] }, skills: skillProficiency(2, ["acrobatics", "animalHandling", "athletics", "history", "insight", "intimidation", "perception", "survival"]) },
      choices: [{ id: "fighting-style", label: "Fighting Style", type: "select", count: 1, options: [
        { id: "archery", label: "Archery — +2 to ranged weapon attack rolls", summary: "+2 bonus to attack rolls with ranged weapons." },
        { id: "defense", label: "Defense — +1 AC while wearing armor", summary: "+1 AC while wearing armor.", mechanics: { armoredAcBonus: 1 } },
        { id: "dueling", label: "Dueling — +2 damage with one one-handed weapon", summary: "+2 damage while wielding one one-handed melee weapon and no other weapons." },
        { id: "great-weapon-fighting", label: "Great Weapon Fighting — reroll eligible 1s and 2s", summary: "Reroll eligible 1s and 2s on two-handed or versatile melee weapon damage dice." },
        { id: "protection", label: "Protection — shield reaction to impose disadvantage", summary: "While using a shield, use a reaction to impose disadvantage on an eligible nearby attack." },
        { id: "two-weapon-fighting", label: "Two-Weapon Fighting — add ability modifier to second-attack damage", summary: "Add the ability modifier to the damage of the second attack when two-weapon fighting." }
      ] }],
      level1Features: [feature("fighting-style", "Fighting Style", "Choose a specialized combat style."), feature("second-wind", "Second Wind", "Once per short rest, regain 1d10 + fighter level HP as a bonus action.", { resource: { max: 1, recharge: "Short Rest", action: "Bonus Action" } })],
      equipmentPackages: [
        pack("chain-shield", "Chain mail, longsword, shield, and crossbow", [armor("Chain Mail", "Heavy", 16, false, "", 55), weapon("Longsword", "1d8", "Slashing", ["Versatile (1d10)"], "Melee", "5 ft.", 1, 3), shield(), weapon("Light Crossbow", "1d8", "Piercing", ["Ammunition", "Loading", "Two-Handed"], "Ranged", "80/320 ft.", 1, 5), general("Crossbow Bolts", 20), general("Dungeoneer's Pack")]),
        pack("archer", "Leather armor, longbow, and two shortswords", [armor("Leather Armor", "Light", 11, true, "", 10), weapon("Longbow", "1d8", "Piercing", ["Ammunition", "Heavy", "Two-Handed"], "Ranged", "150/600 ft.", 1, 2), general("Arrows", 20), weapon("Shortsword", "1d6", "Piercing", ["Finesse", "Light"], "Melee", "5 ft.", 2, 2), general("Explorer's Pack")])
      ], spellcasting: null, subclass: subclass(3, "Champion", ["Improved Critical", "Remarkable Athlete", "Additional Fighting Style", "Superior Critical", "Survivor"])
    },
    {
      ...base, id: "monk", name: "Monk", hitDie: 8, savingThrows: ["STR", "DEX"],
      proficiencies: { armor: [], weapons: ["Simple Weapons", "Shortswords"], tools: { fixed: [], choices: [{ id: "monk-tool", label: "Artisan's tool or musical instrument", type: "tool", count: 1, options: ["Alchemist's Supplies", "Brewer's Supplies", "Calligrapher's Supplies", "Carpenter's Tools", "Cartographer's Tools", "Cobbler's Tools", "Cook's Utensils", "Glassblower's Tools", "Jeweler's Tools", "Leatherworker's Tools", "Mason's Tools", "Painter's Supplies", "Potter's Tools", "Smith's Tools", "Tinker's Tools", "Weaver's Tools", "Woodcarver's Tools", "Bagpipes", "Drum", "Dulcimer", "Flute", "Lute", "Lyre", "Horn", "Pan Flute", "Shawm", "Viol"] }] }, skills: skillProficiency(2, ["acrobatics", "athletics", "history", "insight", "religion", "stealth"]) },
      level1Features: [feature("unarmored-defense-monk", "Unarmored Defense", "While unarmored and without a shield, AC equals 10 + Dexterity modifier + Wisdom modifier.", { armorFormula: "10+DEX+WIS" }), feature("martial-arts", "Martial Arts", "Use Dexterity and a d4 for eligible unarmed strikes and monk weapons; gain a bonus-action unarmed strike.")],
      equipmentPackages: [
        pack("shortsword", "Shortsword and dungeoneer's pack", [weapon("Shortsword", "1d6", "Piercing", ["Finesse", "Light"], "Melee", "5 ft.", 1, 2), weapon("Dart", "1d4", "Piercing", ["Finesse", "Thrown"], "Ranged", "20/60 ft.", 10, 0.25), general("Dungeoneer's Pack")]),
        pack("quarterstaff", "Quarterstaff and explorer's pack", [weapon("Quarterstaff", "1d6", "Bludgeoning", ["Versatile (1d8)"], "Melee", "5 ft.", 1, 4), weapon("Dart", "1d4", "Piercing", ["Finesse", "Thrown"], "Ranged", "20/60 ft.", 10, 0.25), general("Explorer's Pack")])
      ], spellcasting: null, subclass: subclass(3, "Way of the Open Hand", ["Open Hand Technique", "Wholeness of Body", "Tranquility", "Quivering Palm"])
    },
    {
      ...base, id: "paladin", name: "Paladin", hitDie: 10, savingThrows: ["WIS", "CHA"],
      proficiencies: { armor: ["All Armor", "Shields"], weapons: ["Simple Weapons", "Martial Weapons"], tools: { fixed: [], choices: [] }, skills: skillProficiency(2, ["athletics", "insight", "intimidation", "medicine", "persuasion", "religion"]) },
      level1Features: [feature("divine-sense", "Divine Sense", "Detect certain celestial, fiend, undead, consecrated, and desecrated presences.", { resource: { maxFormula: "1+CHA", minimum: 1, recharge: "Long Rest", action: "Action" } }), feature("lay-on-hands", "Lay on Hands", "A healing pool containing 5 HP per paladin level.", { resource: { max: 5, recharge: "Long Rest", action: "Action" } })],
      equipmentPackages: [
        pack("sword-shield", "Longsword, shield, chain mail, and priest's pack", [weapon("Longsword", "1d8", "Slashing", ["Versatile (1d10)"], "Melee", "5 ft.", 1, 3), shield(), armor("Chain Mail", "Heavy", 16, false, "", 55), weapon("Javelin", "1d6", "Piercing", ["Thrown"], "Melee or Ranged", "30/120 ft.", 5, 2), general("Priest's Pack"), focus("Holy Symbol")]),
        pack("greatsword", "Greatsword, chain mail, and explorer's pack", [weapon("Greatsword", "2d6", "Slashing", ["Heavy", "Two-Handed"], "Melee", "5 ft.", 1, 6), armor("Chain Mail", "Heavy", 16, false, "", 55), weapon("Javelin", "1d6", "Piercing", ["Thrown"], "Melee or Ranged", "30/120 ft.", 5, 2), general("Explorer's Pack"), focus("Holy Symbol")])
      ],
      spellcasting: { startsAt: 2, ability: "CHA", kind: "prepared", preparedFormula: "CHA modifier + half paladin level", ritualCasting: false, focus: "Holy symbol" },
      subclass: subclass(3, "Oath of Devotion", ["Sacred Weapon", "Turn the Unholy", "Aura of Devotion", "Purity of Spirit", "Holy Nimbus"])
    },
    {
      ...base, id: "ranger", name: "Ranger", hitDie: 10, savingThrows: ["STR", "DEX"],
      proficiencies: { armor: ["Light Armor", "Medium Armor", "Shields"], weapons: ["Simple Weapons", "Martial Weapons"], tools: { fixed: [], choices: [] }, skills: skillProficiency(3, ["animalHandling", "athletics", "insight", "investigation", "nature", "perception", "stealth", "survival"]) },
      choices: [
        { id: "favored-enemy", label: "Favored Enemy", type: "text", count: 1, placeholder: "Creature type or two humanoid peoples" },
        { id: "natural-explorer", label: "Favored Terrain", type: "select", count: 1, options: ["Arctic", "Coast", "Desert", "Forest", "Grassland", "Mountain", "Swamp", "Underdark"] }
      ],
      level1Features: [feature("favored-enemy", "Favored Enemy", "Gain tracking and knowledge benefits against a selected enemy type."), feature("natural-explorer", "Natural Explorer", "Gain travel and knowledge benefits in a selected terrain.")],
      equipmentPackages: [
        pack("scale-two-swords", "Scale mail, two shortswords, and longbow", [armor("Scale Mail", "Medium", 14, true, 2, 45), weapon("Shortsword", "1d6", "Piercing", ["Finesse", "Light"], "Melee", "5 ft.", 2, 2), weapon("Longbow", "1d8", "Piercing", ["Ammunition", "Heavy", "Two-Handed"], "Ranged", "150/600 ft.", 1, 2), general("Arrows", 20), general("Explorer's Pack")]),
        pack("leather-swords", "Leather armor, two shortswords, and longbow", [armor("Leather Armor", "Light", 11, true, "", 10), weapon("Shortsword", "1d6", "Piercing", ["Finesse", "Light"], "Melee", "5 ft.", 2, 2), weapon("Longbow", "1d8", "Piercing", ["Ammunition", "Heavy", "Two-Handed"], "Ranged", "150/600 ft.", 1, 2), general("Arrows", 20), general("Dungeoneer's Pack")])
      ],
      spellcasting: { startsAt: 2, ability: "WIS", kind: "known", ritualCasting: false, focus: "Component pouch" },
      subclass: subclass(3, "Hunter", ["Hunter's Prey", "Defensive Tactics", "Multiattack", "Superior Hunter's Defense"])
    },
    {
      ...base, id: "rogue", name: "Rogue", hitDie: 8, savingThrows: ["DEX", "INT"],
      proficiencies: { armor: ["Light Armor"], weapons: ["Simple Weapons", "Hand Crossbows", "Longswords", "Rapiers", "Shortswords"], tools: { fixed: ["Thieves' Tools"], choices: [] }, skills: skillProficiency(4, ["acrobatics", "athletics", "deception", "insight", "intimidation", "investigation", "perception", "performance", "persuasion", "sleightOfHand", "stealth"]) },
      choices: [{ id: "expertise", label: "Expertise", type: "skill", count: 2, options: "rogue-expertise" }],
      level1Features: [feature("expertise", "Expertise", "Double proficiency for two selected skill proficiencies or thieves' tools."), feature("sneak-attack", "Sneak Attack", "Once per turn, deal an extra 1d6 when the attack meets the feature's conditions."), feature("thieves-cant", "Thieves' Cant", "Know the secret cant of rogues.")],
      equipmentPackages: [
        pack("rapier-shortbow", "Rapier, shortbow, leather armor, and burglar's pack", [weapon("Rapier", "1d8", "Piercing", ["Finesse"], "Melee", "5 ft.", 1, 2), weapon("Shortbow", "1d6", "Piercing", ["Ammunition", "Two-Handed"], "Ranged", "80/320 ft.", 1, 2), general("Arrows", 20), armor("Leather Armor", "Light", 11, true, "", 10), weapon("Dagger", "1d4", "Piercing", ["Finesse", "Light", "Thrown"], "Melee or Ranged", "20/60 ft.", 2, 1), tool("Thieves' Tools"), general("Burglar's Pack")]),
        pack("shortsword-shortbow", "Shortsword, shortbow, leather armor, and dungeoneer's pack", [weapon("Shortsword", "1d6", "Piercing", ["Finesse", "Light"], "Melee", "5 ft.", 1, 2), weapon("Shortbow", "1d6", "Piercing", ["Ammunition", "Two-Handed"], "Ranged", "80/320 ft.", 1, 2), general("Arrows", 20), armor("Leather Armor", "Light", 11, true, "", 10), weapon("Dagger", "1d4", "Piercing", ["Finesse", "Light", "Thrown"], "Melee or Ranged", "20/60 ft.", 2, 1), tool("Thieves' Tools"), general("Dungeoneer's Pack")])
      ], spellcasting: null, subclass: subclass(3, "Thief", ["Fast Hands", "Second-Story Work", "Supreme Sneak", "Use Magic Device", "Thief's Reflexes"])
    },
    {
      ...base, id: "sorcerer", name: "Sorcerer", hitDie: 6, savingThrows: ["CON", "CHA"],
      proficiencies: { armor: [], weapons: ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light Crossbows"], tools: { fixed: [], choices: [] }, skills: skillProficiency(2, ["arcana", "deception", "insight", "intimidation", "persuasion", "religion"]) },
      level1Features: [feature("spellcasting-sorcerer", "Spellcasting", "Know and cast sorcerer spells using Charisma."), feature("draconic-bloodline", "Sorcerous Origin: Draconic Bloodline", "Choose a dragon ancestor; gain Draconic language, extra HP, and unarmored AC 13 + Dexterity.", { armorFormula: "13+DEX", hpPerLevel: 1 })],
      equipmentPackages: [
        pack("crossbow-focus", "Light crossbow, arcane focus, and dungeoneer's pack", [weapon("Light Crossbow", "1d8", "Piercing", ["Ammunition", "Loading", "Two-Handed"], "Ranged", "80/320 ft.", 1, 5), general("Crossbow Bolts", 20), weapon("Dagger", "1d4", "Piercing", ["Finesse", "Light", "Thrown"], "Melee or Ranged", "20/60 ft.", 2, 1), focus("Arcane Focus"), general("Dungeoneer's Pack")]),
        pack("daggers-pouch", "Daggers, component pouch, and explorer's pack", [weapon("Dagger", "1d4", "Piercing", ["Finesse", "Light", "Thrown"], "Melee or Ranged", "20/60 ft.", 2, 1), focus("Component Pouch"), general("Explorer's Pack")])
      ],
      spellcasting: { startsAt: 1, ability: "CHA", kind: "known", cantripsKnown: 4, spellsKnown: 2, level1Slots: 2, ritualCasting: false, focus: "Arcane focus" },
      subclass: subclass(1, "Draconic Bloodline", ["Dragon Ancestor", "Draconic Resilience", "Elemental Affinity", "Dragon Wings", "Draconic Presence"])
    },
    {
      ...base, id: "warlock", name: "Warlock", hitDie: 8, savingThrows: ["WIS", "CHA"],
      proficiencies: { armor: ["Light Armor"], weapons: ["Simple Weapons"], tools: { fixed: [], choices: [] }, skills: skillProficiency(2, ["arcana", "deception", "history", "intimidation", "investigation", "nature", "religion"]) },
      level1Features: [feature("fiend-patron", "Otherworldly Patron: The Fiend", "Gain temporary HP after reducing a hostile creature to 0 HP."), feature("pact-magic", "Pact Magic", "Know and cast warlock spells using Charisma; slots return on a short rest.")],
      equipmentPackages: [
        pack("crossbow-pouch", "Light crossbow, component pouch, and scholar's pack", [weapon("Light Crossbow", "1d8", "Piercing", ["Ammunition", "Loading", "Two-Handed"], "Ranged", "80/320 ft.", 1, 5), general("Crossbow Bolts", 20), armor("Leather Armor", "Light", 11, true, "", 10), weapon("Dagger", "1d4", "Piercing", ["Finesse", "Light", "Thrown"], "Melee or Ranged", "20/60 ft.", 2, 1), focus("Component Pouch"), general("Scholar's Pack")]),
        pack("mace-focus", "Mace, arcane focus, and dungeoneer's pack", [weapon("Mace", "1d6", "Bludgeoning", [], "Melee", "5 ft.", 1, 4), armor("Leather Armor", "Light", 11, true, "", 10), weapon("Dagger", "1d4", "Piercing", ["Finesse", "Light", "Thrown"], "Melee or Ranged", "20/60 ft.", 2, 1), focus("Arcane Focus"), general("Dungeoneer's Pack")])
      ],
      spellcasting: { startsAt: 1, ability: "CHA", kind: "known", cantripsKnown: 2, spellsKnown: 2, level1Slots: 1, slotLevel: 1, pactMagic: true, ritualCasting: false, focus: "Arcane focus" },
      subclass: subclass(1, "The Fiend", ["Dark One's Blessing", "Dark One's Own Luck", "Fiendish Resilience", "Hurl Through Hell"])
    },
    {
      ...base, id: "wizard", name: "Wizard", hitDie: 6, savingThrows: ["INT", "WIS"],
      proficiencies: { armor: [], weapons: ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light Crossbows"], tools: { fixed: [], choices: [] }, skills: skillProficiency(2, ["arcana", "history", "insight", "investigation", "medicine", "religion"]) },
      level1Features: [feature("spellcasting-wizard", "Spellcasting", "Prepare wizard spells from a spellbook using Intelligence."), feature("arcane-recovery", "Arcane Recovery", "Once per day after a short rest, recover spell slots totaling half wizard level, rounded up.", { resource: { max: 1, recharge: "Long Rest", action: "Short Rest" } })],
      equipmentPackages: [
        pack("quarterstaff-pouch", "Quarterstaff, component pouch, scholar's pack, and spellbook", [weapon("Quarterstaff", "1d6", "Bludgeoning", ["Versatile (1d8)"], "Melee", "5 ft.", 1, 4), focus("Component Pouch"), general("Scholar's Pack"), general("Spellbook")]),
        pack("dagger-focus", "Dagger, arcane focus, explorer's pack, and spellbook", [weapon("Dagger", "1d4", "Piercing", ["Finesse", "Light", "Thrown"], "Melee or Ranged", "20/60 ft.", 1, 1), focus("Arcane Focus"), general("Explorer's Pack"), general("Spellbook")])
      ],
      spellcasting: { startsAt: 1, ability: "INT", kind: "spellbook", cantripsKnown: 3, spellbookSpells: 6, preparedFormula: "INT modifier + wizard level", level1Slots: 2, ritualCasting: true, focus: "Arcane focus or component pouch" },
      subclass: subclass(2, "School of Evocation", ["Evocation Savant", "Sculpt Spells", "Potent Cantrip", "Empowered Evocation", "Overchannel"])
    }
  ]);

  rules.register("features", rules.list("classes").flatMap(classDefinition => classDefinition.level1Features.map(item => ({
    ...item, id: `class-${classDefinition.id}-${item.id}`, featureType: "class", parentId: classDefinition.id, level: 1
  }))));
  rules.register("subclasses", rules.list("classes").map(classDefinition => ({
    id: `${classDefinition.id}-${classDefinition.subclass.srdOption.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    name: classDefinition.subclass.srdOption,
    classId: classDefinition.id,
    selectionLevel: classDefinition.subclass.selectionLevel,
    highlights: classDefinition.subclass.highlights,
    edition: "2014",
    source: SOURCE,
    status: "enabled"
  })));
})(window);
