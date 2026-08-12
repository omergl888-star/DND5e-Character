(function initializeRulesProfiles(global) {
  "use strict";

  const hub = global.CharacterHub;
  const { abilities, skills } = hub.constants;
  const { clone, slug } = hub.util;
  const stateApi = hub.state = hub.state || {};

  function emptyRulesProfile() {
    return { edition: "2014", mode: "standard", catalogVersion: hub.catalogVersion, overrides: {} };
  }

  function normalizeRulesProfile(profile) {
    const normalized = profile && typeof profile === "object" ? profile : emptyRulesProfile();
    normalized.edition = String(normalized.edition || "2014");
    normalized.mode = normalized.mode === "manual" ? "manual" : "standard";
    normalized.catalogVersion = Math.max(1, Number(normalized.catalogVersion) || hub.catalogVersion);
    normalized.overrides = normalized.overrides && typeof normalized.overrides === "object" ? normalized.overrides : {};
    return normalized;
  }

  function matchCatalogId(kind, value) {
    const normalized = slug(value);
    const direct = hub.rules.get(kind, normalized);
    if (direct) return direct.id;
    return hub.rules.list(kind).find(item => slug(item.name) === normalized)?.id || "";
  }

  function migrateCharacter(character) {
    if (!character || typeof character !== "object") return character;
    character.rulesProfile = normalizeRulesProfile(character.rulesProfile || {
      edition: character.v10?.rulesEdition || "2014",
      mode: character.v10?.race?.id === "manual" ? "manual" : "standard",
      catalogVersion: hub.catalogVersion,
      overrides: {}
    });

    if (!character.characterBuild) {
      const legacyRace = character.v10?.race || {};
      const baseAbilities = legacyRace.baseAbilities || Object.fromEntries(abilities.map(key => [key, Number(character.abilities?.[key]?.[0]) || 10]));
      const raceId = legacyRace.id === "half-elf" ? "half-elf" : matchCatalogId("races", character.race);
      const classId = matchCatalogId("classes", character.className);
      const legacyChoices = legacyRace.choices || {};
      character.characterBuild = {
        version: 2,
        baseAbilities: Object.fromEntries(abilities.map(key => [key, Number(baseAbilities[key]) || 10])),
        raceId,
        subraceId: "",
        raceChoices: {
          "ability-increases": [legacyChoices.asi1, legacyChoices.asi2].filter(Boolean),
          "bonus-languages": [legacyChoices.language].filter(Boolean),
          "skill-versatility": [legacyChoices.skill1, legacyChoices.skill2].filter(Boolean)
        },
        backgroundId: matchCatalogId("backgrounds", character.v911?.background || ""),
        backgroundChoices: {},
        classId,
        classChoices: {
          "class-skills": Object.entries(character.skillProficiencies || {}).filter(([, status]) => status !== "none").map(([id]) => id)
        },
        subclassId: matchCatalogId("subclasses", character.subclass),
        equipmentPackageId: "",
        spellChoices: { cantrips: [], known: [], spellbook: [], prepared: [] }
      };
    }
    character.characterBuild.version = Math.max(2, Number(character.characterBuild.version) || 1);
    character.characterBuild.backgroundChoices ||= {};
    character.characterBuild.spellChoices ||= { cantrips: [], known: [], spellbook: [], prepared: [] };
    return character;
  }

  function mergeRace(race, subraceId) {
    if (!race) return null;
    const subrace = (race.subraces || []).find(item => item.id === subraceId) || null;
    const mergeArray = (first, second) => [...new Set([...(first || []), ...(second || [])])];
    const mergeChoiceGroups = (first, second) => [...(first || []), ...(second || [])];
    const parentProficiencies = race.proficiencies || {};
    const childProficiencies = subrace?.proficiencies || {};
    return {
      ...race,
      displayName: subrace?.name || race.name,
      selectedSubrace: subrace,
      size: { ...(race.size || {}), ...(subrace?.size || {}) },
      speed: { ...(race.speed || {}), ...(subrace?.speed || {}) },
      senses: { ...(race.senses || {}), ...(subrace?.senses || {}) },
      abilityBonuses: {
        fixed: Object.fromEntries(abilities.map(key => [key, Number(race.abilityBonuses?.fixed?.[key] || 0) + Number(subrace?.abilityBonuses?.fixed?.[key] || 0)])),
        choices: mergeChoiceGroups(race.abilityBonuses?.choices, subrace?.abilityBonuses?.choices),
        patterns: mergeChoiceGroups(race.abilityBonuses?.patterns, subrace?.abilityBonuses?.patterns)
      },
      languages: {
        fixed: mergeArray(race.languages?.fixed, subrace?.languages?.fixed),
        choices: mergeChoiceGroups(race.languages?.choices, subrace?.languages?.choices)
      },
      proficiencies: {
        skills: {
          fixed: mergeArray(parentProficiencies.skills?.fixed, childProficiencies.skills?.fixed),
          choices: mergeChoiceGroups(parentProficiencies.skills?.choices, childProficiencies.skills?.choices)
        },
        armor: mergeArray(parentProficiencies.armor, childProficiencies.armor),
        weapons: mergeArray(parentProficiencies.weapons, childProficiencies.weapons),
        tools: {
          fixed: mergeArray(parentProficiencies.tools?.fixed, childProficiencies.tools?.fixed),
          choices: mergeChoiceGroups(parentProficiencies.tools?.choices, childProficiencies.tools?.choices)
        }
      },
      traits: [...(race.traits || []), ...(subrace?.traits || [])],
      choices: [...(race.choices || []), ...(subrace?.choices || [])]
    };
  }

  function selectedValues(choices, id) {
    const value = choices?.[id];
    if (Array.isArray(value)) return value.filter(Boolean);
    return value == null || value === "" ? [] : [value];
  }

  function resolveRace(build, profile) {
    const race = mergeRace(hub.rules.get("races", build.raceId), build.subraceId);
    if (!race) return null;
    const bonuses = { ...race.abilityBonuses.fixed };
    const patterns = race.abilityBonuses.patterns || [];
    const selectedPattern = patterns.find(pattern => pattern.id === build.raceChoices?.["ability-pattern"]) || patterns[0];
    for (const allocation of selectedPattern?.allocations || []) {
      for (const ability of selectedValues(build.raceChoices, allocation.id)) bonuses[ability] = Number(bonuses[ability] || 0) + Number(allocation.amount || 0);
    }
    for (const choice of race.abilityBonuses.choices || []) {
      for (const ability of selectedValues(build.raceChoices, choice.id)) bonuses[ability] = Number(bonuses[ability] || 0) + Number(choice.amount || 0);
    }
    const modeOverrides = profile.mode === "manual" ? profile.overrides || {} : {};
    for (const [ability, value] of Object.entries(modeOverrides.abilityBonuses || {})) {
      if (abilities.includes(ability) && Number.isFinite(Number(value))) bonuses[ability] = Number(value);
    }
    const finalAbilities = Object.fromEntries(abilities.map(key => [key, Math.max(1, Math.min(30, Number(build.baseAbilities?.[key] || 10) + Number(bonuses[key] || 0)))]));
    const languageChoices = (race.languages.choices || []).flatMap(choice => selectedValues(build.raceChoices, choice.id));
    const skillChoices = (race.proficiencies.skills.choices || []).flatMap(choice => selectedValues(build.raceChoices, choice.id));
    const toolChoices = (race.proficiencies.tools.choices || []).flatMap(choice => selectedValues(build.raceChoices, choice.id));
    const resolved = {
      definition: race,
      name: race.displayName,
      bonuses,
      finalAbilities,
      size: modeOverrides.size || race.size.value,
      speed: Number.isFinite(Number(modeOverrides.speed)) ? Number(modeOverrides.speed) : Number(race.speed.walk),
      senses: { ...race.senses, ...(modeOverrides.senses || {}) },
      languages: [...new Set(modeOverrides.languages || [...race.languages.fixed, ...languageChoices])],
      skills: [...new Set(modeOverrides.skills || [...race.proficiencies.skills.fixed, ...skillChoices])],
      armor: [...new Set(modeOverrides.armorProficiencies || race.proficiencies.armor)],
      weapons: [...new Set(modeOverrides.weaponProficiencies || race.proficiencies.weapons)],
      tools: [...new Set(modeOverrides.toolProficiencies || [...race.proficiencies.tools.fixed, ...toolChoices])],
      traits: [...race.traits]
    };
    const removedTraits = new Set((modeOverrides.removeTraits || []).flatMap(value => [String(value), slug(value)]));
    resolved.traits = resolved.traits.filter(item => !removedTraits.has(item.id) && !removedTraits.has(slug(item.name)));
    for (const name of modeOverrides.addTraits || []) {
      if (String(name).trim()) resolved.traits.push({ id: `manual-${slug(name)}`, name: String(name).trim(), summary: "Custom racial trait.", status: "enabled", edition: profile.edition, source: { name: "Manual override", url: "" } });
    }
    return resolved;
  }

  function resolveClass(build, profile, finalAbilities) {
    const classDefinition = hub.rules.get("classes", build.classId);
    if (!classDefinition) return null;
    const selectedSubclass = hub.rules.get("subclasses", build.subclassId);
    const subclassName = selectedSubclass?.name || "";
    const subclassArmor = [];
    const subclassWeapons = [];
    const subclassTools = [];
    if (["Life Domain", "Forge Domain", "Nature Domain", "Order Domain"].includes(subclassName)) subclassArmor.push("Heavy Armor");
    if (["Tempest Domain", "Twilight Domain", "War Domain"].includes(subclassName)) { subclassArmor.push("Heavy Armor"); subclassWeapons.push("Martial Weapons"); }
    if (subclassName === "Death Domain") subclassWeapons.push("Martial Weapons");
    if (subclassName === "Forge Domain") subclassTools.push("Smith's Tools");
    if (subclassName === "Hexblade") { subclassArmor.push("Medium Armor", "Shields"); subclassWeapons.push("Martial Weapons"); }
    const modeOverrides = profile.mode === "manual" ? profile.overrides || {} : {};
    const classSkills = selectedValues(build.classChoices, "class-skills");
    const toolChoices = (classDefinition.proficiencies.tools?.choices || []).flatMap(choice => selectedValues(build.classChoices, choice.id));
    const selectedPackage = classDefinition.equipmentPackages.find(item => item.id === build.equipmentPackageId) || classDefinition.equipmentPackages[0];
    const spellcasting = modeOverrides.spellcasting ? { startsAt: classDefinition.spellcasting?.startsAt || 1, ...(classDefinition.spellcasting || {}), ...modeOverrides.spellcasting } : classDefinition.spellcasting;
    const features = [...classDefinition.level1Features];
    const removedFeatures = new Set((modeOverrides.removeFeatures || []).flatMap(value => [String(value), slug(value)]));
    const filteredFeatures = features.filter(item => !removedFeatures.has(item.id) && !removedFeatures.has(slug(item.name)));
    for (const name of modeOverrides.addFeatures || []) {
      if (String(name).trim()) filteredFeatures.push({ id: `manual-${slug(name)}`, name: String(name).trim(), summary: "Custom class feature.", status: "enabled", edition: profile.edition, source: { name: "Manual override", url: "" } });
    }
    return {
      definition: classDefinition,
      name: classDefinition.name,
      hitDie: Number(modeOverrides.hitDie || classDefinition.hitDie),
      savingThrows: modeOverrides.savingThrows || classDefinition.savingThrows,
      armor: modeOverrides.classArmorProficiencies || [...new Set([...classDefinition.proficiencies.armor, ...subclassArmor])],
      weapons: modeOverrides.classWeaponProficiencies || [...new Set([...classDefinition.proficiencies.weapons, ...subclassWeapons])],
      tools: modeOverrides.classToolProficiencies || [...new Set([...(classDefinition.proficiencies.tools?.fixed || []), ...toolChoices, ...subclassTools])],
      skills: modeOverrides.classSkills || classSkills,
      features: filteredFeatures,
      equipmentPackage: selectedPackage,
      spellcasting,
      subclass: classDefinition.subclass,
      abilityModifiers: Object.fromEntries(abilities.map(key => [key, Math.floor((Number(finalAbilities?.[key] || 10) - 10) / 2)]))
    };
  }

  function resolveBackground(build) {
    const definition = hub.rules.get("backgrounds", build.backgroundId);
    if (!definition) return null;
    const languageChoice = definition.languages?.choices;
    const languages = [
      ...(definition.languages?.fixed || []),
      ...(languageChoice ? selectedValues(build.backgroundChoices, languageChoice.id) : [])
    ];
    const skillChoices = Array.isArray(definition.skills?.choices) ? definition.skills.choices : definition.skills?.choices ? [definition.skills.choices] : [];
    const selectedSkills = skillChoices.flatMap(choice => selectedValues(build.backgroundChoices, choice.id));
    const chosenTools = selectedValues(build.backgroundChoices, "background-tools");
    const fixedTools = !definition.tools || definition.tools === "None" || /choice|choose|one type|two proficiencies/i.test(definition.tools) ? [] : String(definition.tools).split(",").map(value => value.trim()).filter(Boolean);
    return {
      definition,
      name: definition.name,
      skills: [...new Set([...(definition.skills?.fixed || []), ...selectedSkills])],
      languages: [...new Set(languages)],
      tools: [...new Set([...fixedTools, ...chosenTools])],
      feature: definition.feature || null,
      equipment: definition.equipment || ""
    };
  }

  function validateBuild(build) {
    const errors = [];
    const race = mergeRace(hub.rules.get("races", build.raceId), build.subraceId);
    const classDefinition = hub.rules.get("classes", build.classId);
    if (!race) errors.push("Choose an enabled race.");
    if (race?.subraces?.length && !race.selectedSubrace) errors.push("Choose a subrace.");
    if (race) {
      const groups = [
        ...(race.abilityBonuses.choices || []), ...(race.languages.choices || []),
        ...(race.proficiencies.skills.choices || []), ...(race.proficiencies.tools.choices || []), ...(race.choices || [])
      ];
      for (const choice of groups) {
        const values = selectedValues(build.raceChoices, choice.id);
        if (values.length !== Number(choice.count || 1)) errors.push(`${choice.label}: choose ${choice.count || 1}.`);
        if (choice.distinct && new Set(values).size !== values.length) errors.push(`${choice.label}: choices must be different.`);
        if (choice.type === "ability" && values.some(value => choice.exclude?.includes(value))) errors.push(`${choice.label}: an excluded Ability Score was selected.`);
        let options = choice.options;
        if (choice.type === "ability") options = abilities.filter(value => !choice.exclude?.includes(value));
        if (choice.type === "language") options = hub.constants.languages.filter(value => !race.languages.fixed.includes(value));
        if (choice.type === "skill" && options === "all") options = skills.map(([id]) => id);
        if (Array.isArray(options)) {
          const valid = new Set(options.map(item => String(typeof item === "object" ? item.id || item.label : item)));
          if (values.some(value => !valid.has(String(value)))) errors.push(`${choice.label}: contains an unavailable choice.`);
        }
      }
      const patterns = race.abilityBonuses.patterns || [];
      if (patterns.length) {
        const pattern = patterns.find(item => item.id === build.raceChoices?.["ability-pattern"]);
        if (!pattern) errors.push("Choose an Ability Score increase pattern.");
        else {
          const allAbilities = [];
          for (const allocation of pattern.allocations || []) {
            const values = selectedValues(build.raceChoices, allocation.id);
            if (values.length !== Number(allocation.count || 1)) errors.push(`${pattern.label}: choose ${allocation.count || 1} Ability Score${Number(allocation.count || 1) === 1 ? "" : "s"} for +${allocation.amount}.`);
            allAbilities.push(...values);
          }
          if (new Set(allAbilities).size !== allAbilities.length) errors.push("Flexible Ability Score increases must use different scores.");
        }
      }
    }
    const background = hub.rules.get("backgrounds", build.backgroundId);
    if (!background) errors.push("Choose an enabled background.");
    if (background) {
      const groups = [
        ...(Array.isArray(background.skills?.choices) ? background.skills.choices : background.skills?.choices ? [background.skills.choices] : []),
        ...(background.languages?.choices ? [background.languages.choices] : [])
      ];
      for (const choice of groups) {
        const values = selectedValues(build.backgroundChoices, choice.id);
        if (values.length !== Number(choice.count || 1)) errors.push(`${choice.label}: choose ${choice.count || 1}.`);
        if (choice.distinct && new Set(values).size !== values.length) errors.push(`${choice.label}: choices must be different.`);
      }
      if (/choice|choose|one type|two proficiencies/i.test(background.tools || "") && !selectedValues(build.backgroundChoices, "background-tools").length) errors.push("Enter your background tool proficiency choice.");
    }
    if (!classDefinition) errors.push("Choose an enabled class.");
    if (classDefinition) {
      const selectedSkills = selectedValues(build.classChoices, "class-skills");
      const resolvedRace = resolveRace(build, emptyRulesProfile());
      const resolvedBackground = resolveBackground(build);
      const occupiedSkills = [...new Set([...(resolvedRace?.skills || []), ...(resolvedBackground?.skills || [])])];
      const duplicateGrant = classDefinition.proficiencies.skills.options.some(value => occupiedSkills.includes(value));
      const availableClassSkills = (duplicateGrant ? skills.map(([id]) => id) : classDefinition.proficiencies.skills.options).filter(value => !occupiedSkills.includes(value));
      if (selectedSkills.length !== classDefinition.proficiencies.skills.count) errors.push(`Class skills: choose ${classDefinition.proficiencies.skills.count}.`);
      if (new Set(selectedSkills).size !== selectedSkills.length) errors.push("Class skills must be different.");
      if (selectedSkills.some(value => !availableClassSkills.includes(value))) errors.push("Class skills contain an unavailable choice.");
      for (const choice of [...(classDefinition.proficiencies.tools?.choices || []), ...(classDefinition.choices || [])]) {
        const values = selectedValues(build.classChoices, choice.id);
        if (values.length !== Number(choice.count || 1)) errors.push(`${choice.label}: choose ${choice.count || 1}.`);
        if (new Set(values).size !== values.length) errors.push(`${choice.label}: choices must be different.`);
        let options = choice.options;
        if (options === "class-selected") options = selectedSkills;
        if (options === "rogue-expertise") options = [...selectedSkills, "thieves-tools"];
        if (Array.isArray(options)) {
          const valid = new Set(options.map(item => String(typeof item === "object" ? item.id || item.label : item)));
          if (values.some(value => !valid.has(String(value)))) errors.push(`${choice.label}: contains an unavailable choice.`);
        }
      }
      if (!classDefinition.equipmentPackages.some(item => item.id === build.equipmentPackageId)) errors.push("Choose a starting equipment package.");
    }
    for (const key of abilities) {
      const value = Number(build.baseAbilities?.[key]);
      if (!Number.isFinite(value) || value < 1 || value > 20) errors.push(`${key} must be between 1 and 20 before bonuses.`);
    }
    return [...new Set(errors)];
  }

  stateApi.emptyRulesProfile = emptyRulesProfile;
  stateApi.normalizeRulesProfile = normalizeRulesProfile;
  stateApi.migrateCharacter = migrateCharacter;
  stateApi.mergeRace = mergeRace;
  stateApi.resolveRace = resolveRace;
  stateApi.resolveClass = resolveClass;
  stateApi.resolveBackground = resolveBackground;
  stateApi.validateBuild = validateBuild;
  stateApi.selectedValues = selectedValues;
  stateApi.migrateCharacter(typeof state !== "undefined" ? state : null);
})(window);
