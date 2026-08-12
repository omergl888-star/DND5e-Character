(function initializeRulesRegistry(global) {
  "use strict";

  const hub = global.CharacterHub = global.CharacterHub || {};
  const STATUS = new Set(["coverage", "verified", "enabled"]);
  const KINDS = ["races", "classes", "subclasses", "features", "spells", "backgrounds"];
  const catalog = hub.rules?.catalog || Object.fromEntries(KINDS.map(kind => [kind, Object.create(null)]));
  const rules = hub.rules = Object.assign(hub.rules || {}, { catalog });

  function validateCommon(definition, kind) {
    const errors = [];
    if (!definition || typeof definition !== "object") return [`${kind}: definition must be an object`];
    if (!/^[a-z0-9][a-z0-9-]*$/.test(definition.id || "")) errors.push(`${kind}: invalid id`);
    if (!String(definition.name || "").trim()) errors.push(`${kind}/${definition.id || "?"}: missing name`);
    if (!String(definition.edition || "").trim()) errors.push(`${kind}/${definition.id || "?"}: missing edition`);
    if (!definition.source?.name || !definition.source?.url) errors.push(`${kind}/${definition.id || "?"}: missing source`);
    if (!STATUS.has(definition.status)) errors.push(`${kind}/${definition.id || "?"}: invalid status`);
    return errors;
  }

  function validateEnabledRace(race) {
    const errors = [];
    if (!race.size?.value) errors.push(`races/${race.id}: missing size`);
    if (!Number.isFinite(Number(race.speed?.walk))) errors.push(`races/${race.id}: missing walking speed`);
    if (!race.abilityBonuses?.fixed) errors.push(`races/${race.id}: missing ability bonuses`);
    if (!race.languages || !Array.isArray(race.languages.fixed)) errors.push(`races/${race.id}: missing languages`);
    if (!Array.isArray(race.traits) || !race.traits.length) errors.push(`races/${race.id}: missing traits`);
    return errors;
  }

  function validateEnabledClass(classDefinition) {
    const errors = [];
    if (![6, 8, 10, 12].includes(Number(classDefinition.hitDie))) errors.push(`classes/${classDefinition.id}: invalid Hit Die`);
    if (!Array.isArray(classDefinition.savingThrows) || classDefinition.savingThrows.length !== 2) errors.push(`classes/${classDefinition.id}: requires two saving throws`);
    if (!classDefinition.proficiencies?.skills?.count) errors.push(`classes/${classDefinition.id}: missing skill choices`);
    if (!Array.isArray(classDefinition.level1Features) || !classDefinition.level1Features.length) errors.push(`classes/${classDefinition.id}: missing level 1 features`);
    if (!Array.isArray(classDefinition.equipmentPackages) || !classDefinition.equipmentPackages.length) errors.push(`classes/${classDefinition.id}: missing starting equipment`);
    if (!classDefinition.subclass?.selectionLevel || !classDefinition.subclass?.srdOption) errors.push(`classes/${classDefinition.id}: missing SRD subclass path`);
    return errors;
  }

  rules.register = function register(kind, definitions) {
    if (!KINDS.includes(kind)) throw new Error(`Unknown catalog kind: ${kind}`);
    const list = Array.isArray(definitions) ? definitions : [definitions];
    for (const definition of list) {
      const errors = validateCommon(definition, kind);
      if (definition?.status === "enabled") {
        if (kind === "races") errors.push(...validateEnabledRace(definition));
        if (kind === "classes") errors.push(...validateEnabledClass(definition));
      }
      if (errors.length) throw new Error(errors.join("\n"));
      if (catalog[kind][definition.id]) throw new Error(`Duplicate ${kind} id: ${definition.id}`);
      catalog[kind][definition.id] = Object.freeze(definition);
    }
  };

  rules.upsert = function upsert(kind, definitions) {
    if (!KINDS.includes(kind)) throw new Error(`Unknown catalog kind: ${kind}`);
    const list = Array.isArray(definitions) ? definitions : [definitions];
    for (const definition of list) {
      delete catalog[kind][definition?.id];
      rules.register(kind, definition);
    }
  };

  rules.get = (kind, id) => catalog[kind]?.[id] || null;
  rules.remove = (kind, id) => { if (catalog[kind]) delete catalog[kind][id]; };
  rules.list = (kind, status = "enabled") => Object.values(catalog[kind] || {}).filter(item => !status || item.status === status);
  rules.validateCatalog = function validateCatalog() {
    const errors = [];
    for (const kind of KINDS) {
      const ids = new Set();
      for (const definition of Object.values(catalog[kind])) {
        errors.push(...validateCommon(definition, kind));
        if (ids.has(definition.id)) errors.push(`Duplicate ${kind} id: ${definition.id}`);
        ids.add(definition.id);
        if (definition.status === "enabled" && kind === "races") errors.push(...validateEnabledRace(definition));
        if (definition.status === "enabled" && kind === "classes") errors.push(...validateEnabledClass(definition));
      }
    }
    return { valid: errors.length === 0, errors };
  };
})(window);
