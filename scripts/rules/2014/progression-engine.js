(function initialize2014ProgressionEngine(global) {
  "use strict";

  const hub = global.CharacterHub;
  const rules = hub.rules;
  const { abilities: ABILITIES, skills: SKILLS } = hub.constants;
  const { clone, slug } = hub.util;
  const engine = rules.progressionEngine = rules.progressionEngine || {};
  const SUBCLASS_MARKERS = /^(Primal Path|Bard College|Divine Domain|Druid Circle|Martial Archetype|Monastic Tradition|Sacred Oath|Ranger Archetype|Ranger Conclave|Roguish Archetype|Sorcerous Origin|Otherworldly Patron|Arcane Tradition|Artificer Specialist)$/i;
  const SUBCLASS_PLACEHOLDER = /(?:path|college|domain|circle|archetype|tradition|oath|conclave|patron|specialist) feature/i;
  const TRACKER_LABELS = {
    "rages": "Rages", "rage-damage": "Rage Damage", "martial-arts": "Martial Arts Die",
    "ki-points": "Ki Points", "unarmored-movement": "Unarmored Movement", "sneak-attack": "Sneak Attack",
    "sorcery-points": "Sorcery Points", "cantrips-known": "Cantrips Known", "spells-known": "Spells Known",
    "spell-slots": "Pact Magic Slots", "slot-level": "Pact Slot Level", "invocations-known": "Invocations Known",
    "infusions-known": "Infusions Known", "infused-items": "Infused Items"
  };
  const RESOURCE_TRACKERS = {
    "rages": { name: "Rages", recharge: "Long Rest", action: "Bonus Action" },
    "ki-points": { name: "Ki Points", recharge: "Short Rest", action: "Special" },
    "sorcery-points": { name: "Sorcery Points", recharge: "Long Rest", action: "Special" },
    "spell-slots": { name: "Pact Magic Slots", recharge: "Short Rest", action: "Special" }
  };
  const FIGHTING_STYLES = ["Archery", "Blind Fighting", "Defense", "Dueling", "Great Weapon Fighting", "Interception", "Protection", "Superior Technique", "Thrown Weapon Fighting", "Two-Weapon Fighting", "Unarmed Fighting"];
  const METAMAGIC = ["Careful Spell", "Distant Spell", "Empowered Spell", "Extended Spell", "Heightened Spell", "Quickened Spell", "Seeking Spell", "Subtle Spell", "Transmuted Spell", "Twinned Spell"];
  const PACT_BOONS = ["Pact of the Chain", "Pact of the Blade", "Pact of the Talisman", "Pact of the Tome"];
  const INVOCATIONS = ["Agonizing Blast", "Armor of Shadows", "Ascendant Step", "Aspect of the Moon", "Beast Speech", "Beguiling Influence", "Bewitching Whispers", "Bond of the Talisman", "Book of Ancient Secrets", "Chains of Carceri", "Cloak of Flies", "Devil's Sight", "Dreadful Word", "Eldritch Mind", "Eldritch Sight", "Eldritch Smite", "Eldritch Spear", "Eyes of the Rune Keeper", "Far Scribe", "Fiendish Vigor", "Gaze of Two Minds", "Ghostly Gaze", "Gift of the Depths", "Gift of the Ever-Living Ones", "Gift of the Protectors", "Grasp of Hadar", "Improved Pact Weapon", "Investment of the Chain Master", "Lance of Lethargy", "Lifedrinker", "Maddening Hex", "Mask of Many Faces", "Master of Myriad Forms", "Minions of Chaos", "Mire the Mind", "Misty Visions", "One with Shadows", "Otherworldly Leap", "Protection of the Talisman", "Rebuke of the Talisman", "Relentless Hex", "Repelling Blast", "Sculptor of Flesh", "Shroud of Shadow", "Sign of Ill Omen", "Thief of Five Fates", "Thirsting Blade", "Tomb of Levistus", "Trickster's Escape", "Undying Servitude", "Visions of Distant Realms", "Voice of the Chain Master", "Whispers of the Grave", "Witch Sight"];
  const INFUSIONS = ["Arcane Propulsion Armor", "Armor of Magical Strength", "Boots of the Winding Path", "Enhanced Arcane Focus", "Enhanced Defense", "Enhanced Weapon", "Helm of Awareness", "Homunculus Servant", "Mind Sharpener", "Radiant Weapon", "Repeating Shot", "Replicate Magic Item", "Repulsion Shield", "Resistant Armor", "Returning Weapon", "Spell-Refueling Ring"];
  const INVOCATION_MIN_LEVEL = { "ascendant-step": 9, "bewitching-whispers": 7, "chains-of-carceri": 15, "cloak-of-flies": 5, "dreadful-word": 7, "eldritch-smite": 5, "far-scribe": 5, "ghostly-gaze": 7, "gift-of-the-depths": 5, "gift-of-the-protectors": 9, "lifedrinker": 12, "maddening-hex": 5, "master-of-myriad-forms": 15, "minions-of-chaos": 9, "mire-the-mind": 5, "one-with-shadows": 5, "otherworldly-leap": 9, "relentless-hex": 7, "sculptor-of-flesh": 7, "shroud-of-shadow": 15, "sign-of-ill-omen": 5, "thirsting-blade": 5, "tricksters-escape": 7, "visions-of-distant-realms": 15, "whispers-of-the-grave": 9, "witch-sight": 15 };
  const INVOCATION_PACT = { "aspect-of-the-moon": "pact-of-the-tome", "bond-of-the-talisman": "pact-of-the-talisman", "book-of-ancient-secrets": "pact-of-the-tome", "far-scribe": "pact-of-the-tome", "gift-of-the-ever-living-ones": "pact-of-the-chain", "gift-of-the-protectors": "pact-of-the-tome", "improved-pact-weapon": "pact-of-the-blade", "investment-of-the-chain-master": "pact-of-the-chain", "lifedrinker": "pact-of-the-blade", "protection-of-the-talisman": "pact-of-the-talisman", "rebuke-of-the-talisman": "pact-of-the-talisman", "thirsting-blade": "pact-of-the-blade", "voice-of-the-chain-master": "pact-of-the-chain" };

  const numeric = value => {
    const match = String(value ?? "").match(/-?\d+/);
    return match ? Number(match[0]) : null;
  };
  const proficiencyBonus = level => 2 + Math.floor((Math.max(1, Number(level) || 1) - 1) / 4);
  const scoreModifier = score => Math.floor((Number(score) - 10) / 2);
  const unique = values => [...new Set((values || []).filter(Boolean))];
  const classIdFor = character => character?.characterBuild?.classId || rules.list("classes").find(item => slug(item.name) === slug(character?.className))?.id || "";
  const raceIdFor = character => character?.characterBuild?.raceId || rules.list("races").find(item => slug(item.name) === slug(character?.race))?.id || "";
  const rowFor = (classId, level) => rules.progressions?.[classId]?.levels?.find(row => Number(row.level) === Number(level)) || null;
  const sourceForClass = classId => {
    const progression = rules.progressions?.[classId];
    const definitionSource = rules.get("classes", classId)?.source;
    if (definitionSource?.url) return {
      name: definitionSource.name || progression?.source || "2014 class rules",
      book: definitionSource.book || definitionSource.name || progression?.source || "2014 class rules",
      url: definitionSource.url,
      type: definitionSource.type || "official"
    };
    return {
      name: progression?.source || "2014 class rules",
      book: progression?.source || "2014 class rules",
      url: progression?.communityUrl || `https://dnd5e.wikidot.com/${classId}`,
      type: "community-reference"
    };
  };
  const sourceLink = source => ({ label: source?.type === "community-reference" ? "Community Reference" : "Official Source", kind: source?.type === "community-reference" ? "community" : "official", url: source?.url || "" });
  const spellSlots = row => Array.from({ length: 9 }, (_, index) => {
    const raw = row?.trackers?.[`${index + 1}${index === 0 ? "st" : index === 1 ? "nd" : index === 2 ? "rd" : "th"}`];
    return raw == null || raw === "-" ? 0 : Math.max(0, Number(raw) || 0);
  });
  const maxSpellLevel = row => {
    const slots = spellSlots(row);
    for (let index = slots.length - 1; index >= 0; index--) if (slots[index] > 0) return index + 1;
    const pact = numeric(row?.trackers?.["slot-level"]);
    return pact || 0;
  };
  const baseFeatureName = name => String(name || "").replace(/\s*\([^)]*(?:Optional|d\d+|CR|x\d+|\d+ dice?)[^)]*\)\s*/gi, " ").replace(/\s+/g, " ").trim();

  function hpPerLevelBonus(character) {
    const parentRace = rules.get("races", raceIdFor(character));
    const race = hub.state?.mergeRace?.(parentRace, character.characterBuild?.subraceId) || parentRace;
    const racial = (race?.traits || []).reduce((sum, trait) => sum + Number(trait.mechanics?.hpPerLevel || 0), 0);
    const subclass = currentSubclass(character, ensureProgression(character));
    return racial + (subclass?.name === "Draconic Bloodline" ? 1 : 0);
  }

  function ensureProgression(character) {
    const classId = classIdFor(character);
    character.progression = character.progression && typeof character.progression === "object" ? character.progression : {};
    character.progression.version = 1;
    character.progression.classId = character.progression.classId || classId;
    character.progression.classLevel = Math.max(1, Number(character.progression.classLevel) || Number(character.level) || 1);
    character.progression.subclassId = String(character.progression.subclassId || "");
    character.progression.levelHistory = Array.isArray(character.progression.levelHistory) ? character.progression.levelHistory : [];
    character.progression.trackers = character.progression.trackers && typeof character.progression.trackers === "object" ? character.progression.trackers : clone(rowFor(classId, character.level)?.trackers || {});
    character.progression.spells = character.progression.spells && typeof character.progression.spells === "object" ? character.progression.spells : {};
    for (const key of ["cantrips", "known", "spellbook", "prepared"]) character.progression.spells[key] = unique(character.progression.spells[key]);
    character.progression.abilityIncreases = character.progression.abilityIncreases && typeof character.progression.abilityIncreases === "object" ? character.progression.abilityIncreases : {};
    return character.progression;
  }

  function subclassesFor(classId) {
    return rules.list("subclasses").filter(item => item.classId === classId).sort((a, b) => a.name.localeCompare(b.name));
  }

  function currentSubclass(character, progression) {
    if (progression.subclassId) return rules.get("subclasses", progression.subclassId);
    const named = String(character?.subclass || "").trim();
    return subclassesFor(progression.classId).find(item => slug(item.name) === slug(named)) || null;
  }

  function featureGrant(name, level, source, kind = "class") {
    return {
      id: `${kind}-${slug(name)}-${level}`,
      name,
      baseName: baseFeatureName(name),
      level,
      kind,
      source,
      summary: `${name} is gained at level ${level}. Open the source reference for the complete 2014 rule.`
    };
  }

  function spellChoice(classId, level, count, kind, row) {
    if (count <= 0) return null;
    const available = rules.list("spells").filter(spell => spell.classes?.includes(classId) && Number(spell.level) <= maxSpellLevel(row));
    return { id: `spells-${kind}`, type: "spells", kind, label: kind === "cantrips" ? "Choose new cantrips" : kind === "spellbook" ? "Choose spells to add to the spellbook" : "Choose new spells known", count, options: available.map(spell => ({ id: spell.id, label: `${spell.name} · ${spell.level ? `Level ${spell.level}` : "Cantrip"}`, level: spell.level, source: spell.source, links: spell.links })) };
  }

  function featureOptions(id, label, count, names, source, extra = {}) {
    return { id, type: "feature-options", label, count, source, options: names.map(name => ({ id: slug(name), label: name })), ...extra };
  }

  function planLevelUp(character) {
    const progression = ensureProgression(character);
    const fromLevel = Math.max(1, Number(character.level) || 1);
    if (fromLevel >= 20) return { error: "This character is already level 20." };
    const toLevel = fromLevel + 1;
    const classId = progression.classId || classIdFor(character);
    const classDefinition = rules.get("classes", classId);
    const before = rowFor(classId, fromLevel);
    const after = rowFor(classId, toLevel);
    if (!classDefinition || !after) return { error: "This character does not have a complete 2014 class progression." };
    const classSource = sourceForClass(classId);
    const automaticChanges = [];
    const grants = [];
    const choices = [{ id: "hp-roll", type: "hp", label: `Roll one d${classDefinition.hitDie} Hit Die`, die: classDefinition.hitDie, required: true }];
    const ownedFeatureNames = new Set((character.traits || []).map(item => baseFeatureName(item.name)));
    const unowned = names => names.filter(name => !ownedFeatureNames.has(baseFeatureName(name)));
    const ownedPactBoon = ["Pact of the Chain", "Pact of the Blade", "Pact of the Talisman", "Pact of the Tome"].find(name => ownedFeatureNames.has(name));
    const availableInvocations = unowned(INVOCATIONS).filter(name => {
      const id = slug(name);
      const minimumLevel = INVOCATION_MIN_LEVEL[id] || 1;
      const requiredPact = INVOCATION_PACT[id];
      return toLevel >= minimumLevel && (!requiredPact || slug(ownedPactBoon) === requiredPact || toLevel === 3);
    });

    const oldProficiency = proficiencyBonus(fromLevel);
    const newProficiency = proficiencyBonus(toLevel);
    if (oldProficiency !== newProficiency) automaticChanges.push({ id: "proficiency", label: "Proficiency Bonus", before: `+${oldProficiency}`, after: `+${newProficiency}`, source: classSource });
    automaticChanges.push({ id: "hit-dice", label: "Hit Dice Maximum", before: String(fromLevel), after: String(toLevel), source: classSource });

    const trackerKeys = unique([...Object.keys(before?.trackers || {}), ...Object.keys(after.trackers || {})]);
    for (const key of trackerKeys) {
      const oldValue = before?.trackers?.[key] ?? "-";
      const newValue = after.trackers?.[key] ?? "-";
      if (String(oldValue) !== String(newValue)) automaticChanges.push({ id: `tracker-${key}`, key, label: TRACKER_LABELS[key] || key.replace(/-/g, " ").replace(/\b\w/g, letter => letter.toUpperCase()), before: oldValue, after: newValue, source: classSource });
    }

    const rowFeatures = after.features || [];
    const hasSubclassChoice = rowFeatures.some(name => SUBCLASS_MARKERS.test(baseFeatureName(name))) || toLevel === Number(classDefinition.subclass?.selectionLevel);
    let subclass = currentSubclass(character, progression);
    if (!subclass && hasSubclassChoice) {
      choices.push({ id: "subclass", type: "subclass", label: "Choose a subclass", count: 1, options: subclassesFor(classId).map(item => ({ id: item.id, label: item.name, source: item.source, links: item.links })) });
    }

    for (const name of rowFeatures) {
      const clean = baseFeatureName(name);
      if (!clean || SUBCLASS_MARKERS.test(clean) || SUBCLASS_PLACEHOLDER.test(clean)) continue;
      if (/^Ability Score Improvement$/i.test(clean)) {
        choices.push({ id: "ability-score-improvement", type: "asi", label: "Ability Score Improvement", count: 1 });
        continue;
      }
      if (/Fighting Style/i.test(clean)) choices.push(featureOptions(`fighting-style-${toLevel}`, "Choose a Fighting Style", 1, unowned(FIGHTING_STYLES), classSource));
      if (/^Metamagic$/i.test(clean)) choices.push(featureOptions(`metamagic-${toLevel}`, "Choose Metamagic options", toLevel === 3 ? 2 : 1, unowned(METAMAGIC), classSource));
      if (/^Pact Boon$/i.test(clean)) choices.push(featureOptions("pact-boon", "Choose a Pact Boon", 1, PACT_BOONS, classSource));
      if (/\(Optional\)/i.test(name)) {
        choices.push({ id: `optional-${slug(clean)}`, type: "optional-feature", label: clean, count: 1, source: classSource });
        continue;
      }
      grants.push(featureGrant(name, toLevel, classSource, "class"));
    }

    const invocationDelta = Math.max(0, (numeric(after.trackers?.["invocations-known"]) || 0) - (numeric(before?.trackers?.["invocations-known"]) || 0));
    if (invocationDelta) choices.push(featureOptions(`eldritch-invocations-${toLevel}`, "Choose Eldritch Invocations", invocationDelta, availableInvocations, { name: "Warlock Eldritch Invocations", book: "2014 Warlock rules", url: "https://dnd5e.wikidot.com/warlock:eldritch-invocations", type: "community-reference" }));
    const infusionDelta = Math.max(0, (numeric(after.trackers?.["infusions-known"]) || 0) - (numeric(before?.trackers?.["infusions-known"]) || 0));
    if (infusionDelta) choices.push(featureOptions(`artificer-infusions-${toLevel}`, "Choose Artificer Infusions", infusionDelta, unowned(INFUSIONS), { name: "Artificer Infusions", book: "Tasha's Cauldron of Everything", url: "https://dnd5e.wikidot.com/artificer:infusions", type: "community-reference" }));

    if (subclass) {
      for (const feature of subclass.features || []) if (Number(feature.level) === toLevel) grants.push(featureGrant(feature.name, toLevel, subclass.source, "subclass"));
    }

    const parentRace = rules.get("races", raceIdFor(character));
    const race = hub.state?.mergeRace?.(parentRace, character.characterBuild?.subraceId) || parentRace;
    for (const trait of race?.traits || []) {
      const levelMatch = `${trait.name || ""} ${trait.summary || ""}`.match(/(?:(?:starting at|at|reach)\s+)?(\d+)(?:st|nd|rd|th)?\s+level/i);
      if (levelMatch && Number(levelMatch[1]) === toLevel) grants.push(featureGrant(trait.name, toLevel, trait.source || parentRace?.source, "racial"));
    }

    if ((classId === "bard" && [3, 10].includes(toLevel)) || (classId === "rogue" && toLevel === 6)) {
      choices.push({ id: "expertise", type: "skills", mode: "expertise", label: "Choose skills for Expertise", count: 2, options: Object.entries(character.skillProficiencies || {}).filter(([, value]) => value === "proficient").map(([id]) => ({ id, label: SKILLS.find(([key]) => key === id)?.[1] || id })) });
    }

    const cantripDelta = Math.max(0, (numeric(after.trackers?.["cantrips-known"]) || 0) - (numeric(before?.trackers?.["cantrips-known"]) || 0));
    const knownDelta = Math.max(0, (numeric(after.trackers?.["spells-known"]) || 0) - (numeric(before?.trackers?.["spells-known"]) || 0));
    const cantripChoice = spellChoice(classId, toLevel, cantripDelta, "cantrips", after);
    const knownChoice = spellChoice(classId, toLevel, knownDelta, "known", after);
    if (cantripChoice) {
      const existing = new Set(progression.spells.cantrips || []);
      cantripChoice.options = cantripChoice.options.filter(option => Number(option.level) === 0 && !existing.has(option.id));
      choices.push(cantripChoice);
    }
    if (knownChoice) {
      const existing = new Set(progression.spells.known || []);
      knownChoice.options = knownChoice.options.filter(option => Number(option.level) > 0 && !existing.has(option.id));
      choices.push(knownChoice);
    }
    if (classId === "wizard") {
      const spellbookChoice = spellChoice(classId, toLevel, 2, "spellbook", after);
      if (spellbookChoice) {
        const existing = new Set(progression.spells.spellbook || []);
        spellbookChoice.options = spellbookChoice.options.filter(option => Number(option.level) > 0 && !existing.has(option.id));
        choices.push(spellbookChoice);
      }
    }

    return {
      id: `${classId}-${fromLevel}-${toLevel}`,
      classId, classDefinition, fromLevel, toLevel, before, after, subclass,
      automaticChanges, grants, choices,
      sources: unique([classSource, subclass?.source].filter(Boolean).map(item => JSON.stringify(item))).map(item => JSON.parse(item))
    };
  }

  function validateSelections(plan, selections, character) {
    const errors = [];
    const roll = Number(selections.hpRoll);
    if (!Number.isInteger(roll) || roll < 1 || roll > Number(plan.classDefinition.hitDie)) errors.push(`Enter a Hit Die result from 1 to ${plan.classDefinition.hitDie}.`);
    for (const choice of plan.choices) {
      if (choice.type === "hp" || choice.type === "optional-feature") continue;
      if (choice.type === "subclass" && !choice.options.some(option => option.id === selections.subclassId)) errors.push("Choose a subclass.");
      if (choice.type === "asi") {
        const picked = selections.asiMode === "single" ? [selections.asiPrimary, selections.asiPrimary] : [selections.asiPrimary, selections.asiSecondary];
        if (picked.some(value => !ABILITIES.includes(value))) errors.push("Complete the Ability Score Improvement choice.");
        if (selections.asiMode !== "single" && picked[0] === picked[1]) errors.push("Choose two different Ability Scores for +1 / +1.");
        const increments = Object.fromEntries(ABILITIES.map(key => [key, picked.filter(value => value === key).length]));
        if (ABILITIES.some(key => Number(character.abilities?.[key]?.[0] || 10) + increments[key] > 20)) errors.push("Ability Score Improvement cannot raise a score above 20.");
      }
      if (["spells", "skills", "feature-options"].includes(choice.type)) {
        const values = unique(selections[choice.id] || []);
        if (values.length !== Number(choice.count)) errors.push(`${choice.label}: choose ${choice.count}.`);
        const allowed = new Set(choice.options.map(option => option.id));
        if (values.some(value => !allowed.has(value))) errors.push(`${choice.label}: an unavailable option was selected.`);
      }
    }
    return unique(errors);
  }

  function addOrUpgradeTrait(character, grant) {
    const same = (character.traits || []).find(item => baseFeatureName(item.name) === grant.baseName);
    if (same) {
      same.name = grant.name;
      same.shortDesc = grant.summary;
      same.description = grant.summary;
      same.unlockLevel = Math.min(Number(same.unlockLevel) || grant.level, grant.level);
      return;
    }
    const raw = {
      id: `progression_${grant.kind}_${slug(grant.name)}_${grant.level}`,
      name: grant.name,
      category: grant.kind === "racial" ? "Racial Trait" : grant.kind === "subclass" ? "Subclass Feature" : "Class Feature",
      activation: "Special",
      shortDesc: grant.summary,
      description: grant.summary,
      trigger: "See the linked source for timing and full rules.",
      showInCombat: false,
      sourceType: grant.kind === "racial" ? "Race" : grant.kind === "subclass" ? "Subclass" : "Class",
      sourceName: grant.source?.book || grant.source?.name || "2014 rules",
      sourceUrl: grant.source?.url || "",
      unlockLevel: grant.level,
      resourceId: ""
    };
    character.traits ||= [];
    character.traits.push(typeof normalizeTrait === "function" ? normalizeTrait(raw) : raw);
  }

  function updateResource(character, key, rawValue) {
    const config = RESOURCE_TRACKERS[key];
    const max = numeric(rawValue);
    if (!config || max == null) return;
    character.resources ||= [];
    let resource = character.resources.find(item => item.systemKey === `progression-${key}` || slug(item.name) === slug(config.name));
    if (!resource) {
      resource = { id: `progression_resource_${key}`, systemKey: `progression-${key}`, name: config.name, current: max, max, useCost: 1, recharge: config.recharge, rechargeMode: "All", rechargeValue: max, action: config.action, showInCombat: true, desc: `${config.name} from class progression.`, sourceType: "Class", sourceName: character.className, unlockLevel: character.level, upgradeLevels: "" };
      character.resources.push(resource);
      return;
    }
    const increase = Math.max(0, max - Number(resource.max || 0));
    resource.max = max;
    resource.current = Math.min(max, Number(resource.current || 0) + increase);
    resource.rechargeValue = max;
  }

  function applyLevelUp(character, plan, selections) {
    const progression = ensureProgression(character);
    if (progression.levelHistory.some(entry => entry.transactionId === plan.id)) throw new Error("This level-up was already applied.");
    const errors = validateSelections(plan, selections, character);
    if (errors.length) throw new Error(errors.join("\n"));
    const conModifier = Number(character.abilities?.CON?.[1] ?? scoreModifier(character.abilities?.CON?.[0] || 10));
    const traitHpBonus = hpPerLevelBonus(character);
    let hpGain = Math.max(1, Number(selections.hpRoll) + conModifier) + traitHpBonus;
    const previousHpMax = Math.max(1, Number(character.hpMax) || 1);
    const previousDexModifier = Number(character.abilities?.DEX?.[1] || 0);
    const previousArmorClass = Number(character.ac || 10);
    const previousInitiative = Number(character.initiative || 0);
    const derivedChanges = [];
    const appliedChoices = [];

    character.level = plan.toLevel;
    character.hpMax = Math.max(1, Number(character.hpMax) + hpGain);
    character.hpCurrent = Math.min(character.hpMax, Number(character.hpCurrent) + hpGain);
    character.proficiency = proficiencyBonus(plan.toLevel);
    const hitDice = (character.resources || []).find(item => item.systemKey === "hitDice");
    if (hitDice) { hitDice.max = plan.toLevel; hitDice.current = Math.min(hitDice.max, Number(hitDice.current || 0) + 1); }

    const grants = [...plan.grants];
    for (const choice of plan.choices) {
      if (choice.type === "subclass") {
        progression.subclassId = selections.subclassId;
        const selected = rules.get("subclasses", selections.subclassId);
        character.subclass = selected?.name || "";
        appliedChoices.push({ label: "Subclass", value: character.subclass });
        for (const feature of selected?.features || []) if (Number(feature.level) === plan.toLevel) grants.push(featureGrant(feature.name, plan.toLevel, selected.source, "subclass"));
      }
      if (choice.type === "asi") {
        const picked = selections.asiMode === "single" ? [selections.asiPrimary, selections.asiPrimary] : [selections.asiPrimary, selections.asiSecondary];
        for (const ability of picked) {
          character.abilities[ability][0] += 1;
          character.abilities[ability][1] = scoreModifier(character.abilities[ability][0]);
          progression.abilityIncreases[ability] = Number(progression.abilityIncreases[ability] || 0) + 1;
          if (character.characterBuild?.baseAbilities?.[ability] != null) character.characterBuild.baseAbilities[ability] += 1;
        }
        appliedChoices.push({ label: "Ability Score Improvement", value: picked[0] === picked[1] ? `${picked[0]} +2` : `${picked[0]} +1, ${picked[1]} +1` });
      }
      if (choice.type === "optional-feature" && selections.optionalFeatures?.includes(choice.id)) {
        grants.push(featureGrant(choice.label, plan.toLevel, choice.source, "class"));
        appliedChoices.push({ label: "Optional Feature", value: choice.label });
      }
      if (choice.type === "skills") {
        const selected = unique(selections[choice.id] || []);
        for (const skillId of selected) character.skillProficiencies[skillId] = choice.mode === "expertise" ? "expertise" : "proficient";
        appliedChoices.push({ label: choice.label, value: selected.map(id => SKILLS.find(([key]) => key === id)?.[1] || id).join(", ") });
      }
      if (choice.type === "spells") {
        const selected = unique(selections[choice.id] || []);
        progression.spells[choice.kind] = unique([...(progression.spells[choice.kind] || []), ...selected]);
        appliedChoices.push({ label: choice.label, value: selected.map(id => rules.get("spells", id)?.name || id).join(", ") });
      }
      if (choice.type === "feature-options") {
        const selected = unique(selections[choice.id] || []);
        for (const optionId of selected) {
          const option = choice.options.find(item => item.id === optionId);
          if (option) grants.push(featureGrant(option.label, plan.toLevel, choice.source, "class-choice"));
        }
        appliedChoices.push({ label: choice.label, value: selected.map(id => choice.options.find(item => item.id === id)?.label || id).join(", ") });
      }
    }

    const newConModifier = Number(character.abilities?.CON?.[1] ?? conModifier);
    const constitutionHpAdjustment = Math.max(0, newConModifier - conModifier) * plan.toLevel;
    if (constitutionHpAdjustment) {
      character.hpMax += constitutionHpAdjustment;
      character.hpCurrent = Math.min(character.hpMax, character.hpCurrent + constitutionHpAdjustment);
      hpGain += constitutionHpAdjustment;
      appliedChoices.push({ label: "Constitution HP adjustment", value: `+${constitutionHpAdjustment} maximum HP across ${plan.toLevel} levels` });
    }
    const newDexModifier = Number(character.abilities?.DEX?.[1] || 0);
    if (newDexModifier !== previousDexModifier) {
      character.initiative = newDexModifier;
      derivedChanges.push({ id: "initiative", label: "Initiative", before: `${previousInitiative >= 0 ? "+" : ""}${previousInitiative}`, after: `${newDexModifier >= 0 ? "+" : ""}${newDexModifier}` });
      const bodyArmor = (character.inventory || []).find(item => item.armor && item.armor.armorType !== "Shield" && !item.destroyed);
      const oldContribution = bodyArmor?.armor?.armorType === "Heavy" ? 0 : bodyArmor?.armor?.armorType === "Medium" ? Math.min(2, previousDexModifier) : previousDexModifier;
      const newContribution = bodyArmor?.armor?.armorType === "Heavy" ? 0 : bodyArmor?.armor?.armorType === "Medium" ? Math.min(2, newDexModifier) : newDexModifier;
      character.ac = previousArmorClass + newContribution - oldContribution;
      if (character.ac !== previousArmorClass) derivedChanges.push({ id: "armor-class", label: "Armor Class", before: String(previousArmorClass), after: String(character.ac) });
    }

    for (const grant of grants) addOrUpgradeTrait(character, grant);
    progression.classLevel = plan.toLevel;
    progression.trackers = clone(plan.after.trackers || {});
    for (const [key, value] of Object.entries(progression.trackers)) updateResource(character, key, value);
    character.rulesData ||= {};
    character.rulesData.spellcasting ||= {};
    character.rulesData.spellcasting.slots = spellSlots(plan.after);
    character.rulesData.spellcasting.maxSpellLevel = maxSpellLevel(plan.after);
    character.rulesData.spellcasting.cantripsKnown = numeric(plan.after.trackers?.["cantrips-known"]);
    character.rulesData.spellcasting.spellsKnown = numeric(plan.after.trackers?.["spells-known"]);
    character.rulesData.spellcasting.pactSlots = numeric(plan.after.trackers?.["spell-slots"]);
    character.rulesData.spellcasting.pactSlotLevel = numeric(plan.after.trackers?.["slot-level"]);

    const history = {
      id: `level_${Date.now().toString(36)}`,
      transactionId: plan.id,
      fromLevel: plan.fromLevel,
      toLevel: plan.toLevel,
      createdAt: new Date().toISOString(),
      hpRoll: Number(selections.hpRoll),
      hpTraitBonus: traitHpBonus,
      hpGain,
      automaticChanges: [{ id: "maximum-hp", label: `Maximum HP (roll ${Number(selections.hpRoll)}${traitHpBonus ? `, trait bonus +${traitHpBonus}` : ""})`, before: String(previousHpMax), after: String(character.hpMax) }, ...derivedChanges, ...clone(plan.automaticChanges)],
      grants: grants.map(grant => ({ name: grant.name, kind: grant.kind, source: clone(grant.source) })),
      choices: appliedChoices,
      sources: unique([...plan.sources, ...grants.map(grant => grant.source)].filter(Boolean).map(item => JSON.stringify(item))).map(item => JSON.parse(item))
    };
    progression.levelHistory.unshift(history);
    return history;
  }

  engine.proficiencyBonus = proficiencyBonus;
  engine.hpPerLevelBonus = hpPerLevelBonus;
  engine.ensure = ensureProgression;
  engine.rowFor = rowFor;
  engine.subclassesFor = subclassesFor;
  engine.plan = planLevelUp;
  engine.validate = validateSelections;
  engine.apply = applyLevelUp;
  engine.spellSlots = spellSlots;
  engine.maxSpellLevel = maxSpellLevel;
  engine.sourceLink = sourceLink;
})(window);
