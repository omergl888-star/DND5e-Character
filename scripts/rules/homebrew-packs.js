(function initialize2014ContentPacks(global) {
  "use strict";

  const hub = global.CharacterHub;
  const rules = hub.rules;
  const storageKey = "characterHub2014ContentPacksV1";
  const kinds = ["races", "classes", "subclasses", "features", "spells", "backgrounds"];
  const contentKeys = [...kinds, "progressions"];

  function readPacks() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) { return []; }
  }

  function validatePack(pack) {
    const errors = [];
    if (!pack || typeof pack !== "object") return ["The content pack must be a JSON object."];
    if (Number(pack.characterHubPackVersion) !== 1) errors.push("characterHubPackVersion must be 1.");
    if (String(pack.edition) !== "2014") errors.push("Only 2014-rules content packs are supported.");
    if (!/^[a-z0-9][a-z0-9-]*$/.test(pack.id || "")) errors.push("The pack needs a lowercase id.");
    if (!String(pack.name || "").trim()) errors.push("The pack needs a name.");
    if (!pack.source?.name || !/^https?:\/\//.test(pack.source?.url || "")) errors.push("The pack needs a source name and source URL.");
    if (!pack.content || typeof pack.content !== "object") errors.push("The pack needs a content object.");
    for (const key of Object.keys(pack.content || {})) if (!contentKeys.includes(key)) errors.push(`Unsupported content kind: ${key}.`);
    for (const kind of contentKeys) if (pack.content?.[kind] != null && !Array.isArray(pack.content[kind])) errors.push(`${kind} must be an array.`);
    return [...new Set(errors)];
  }

  function install(pack) {
    const errors = validatePack(pack);
    if (errors.length) throw new Error(errors.join("\n"));
    for (const kind of kinds) for (const definition of pack.content[kind] || []) {
      if (rules.get(kind, definition.id)) throw new Error(`${kind}/${definition.id} already exists. Choose a unique id.`);
    }
    for (const progression of pack.content.progressions || []) {
      if (!progression?.id || !Array.isArray(progression.levels) || progression.levels.length !== 20) throw new Error("Each class progression needs an id and exactly 20 level rows.");
      if (rules.progressions?.[progression.id]) throw new Error(`progressions/${progression.id} already exists. Choose a unique id.`);
    }
    for (const kind of kinds) {
      const definitions = (pack.content[kind] || []).map(definition => ({
        ...definition,
        edition: "2014",
        status: "enabled",
        source: definition.source || pack.source,
        homebrewPackId: pack.id
      }));
      if (definitions.length) rules.register(kind, definitions);
    }
    rules.progressions ||= {};
    for (const progression of pack.content.progressions || []) rules.progressions[progression.id] = { ...progression, source: progression.source || pack.source.name, communityUrl: progression.communityUrl || pack.source.url };
    return pack;
  }

  function persist(pack) {
    const packs = readPacks().filter(item => item.id !== pack.id);
    packs.push(pack);
    localStorage.setItem(storageKey, JSON.stringify(packs));
  }

  async function importFile(file) {
    const pack = JSON.parse(await file.text());
    install(pack);
    persist(pack);
    return pack;
  }

  function pickAndImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = async () => {
      try {
        const pack = await importFile(input.files?.[0]);
        alert(`${pack.name} was imported. Character Hub will reload the 2014 catalog.`);
        location.reload();
      } catch (error) {
        alert(`The content pack could not be imported:\n${error.message || error}`);
      }
    };
    input.click();
  }

  for (const pack of readPacks()) {
    try { install(pack); }
    catch (error) { console.error(`Content pack ${pack?.id || "unknown"} was skipped`, error); }
  }

  rules.homebrew = { storageKey, validatePack, importFile, pickAndImport, installed: readPacks };
})(window);
