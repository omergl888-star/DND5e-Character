/* Character Hub v11 — local character library and SRD 5.1 creation flow. */
(function initializeCharacterBuilder(global) {
  "use strict";

  const hub = global.CharacterHub;
  const { abilities: ABILITIES, abilityNames: ABILITY_NAMES, skills: SKILLS, languages: LANGUAGES } = hub.constants;
  const { clone, escapeHtml: esc, slug } = hub.util;
  const rules = hub.rules;
  const stateApi = hub.state;
  const storage = hub.storage;
  const LIBRARY_KEY = storage.keys.library;
  const ACTIVE_KEY = storage.keys.activeCharacter;
  const BUILD_STEPS = [
    ["Identity", "Name and portrait"],
    ["Abilities", "Scores before ancestry"],
    ["Race", "Race and subrace"],
    ["Race Choices", "Bonuses and proficiencies"],
    ["Class", "Class and level 1 choices"],
    ["Equipment", "Gear and spellcasting"],
    ["Review", "Confirm every grant"]
  ];
  const skillName = id => id === "thieves-tools" ? "Thieves' Tools" : SKILLS.find(([key]) => key === id)?.[1] || id;
  const signed = value => Number(value) >= 0 ? `+${Number(value)}` : String(Number(value));
  const scoreModifier = score => Math.floor((Number(score) - 10) / 2);
  const option = (value, label, selected) => `<option value="${esc(value)}" ${String(value) === String(selected) ? "selected" : ""}>${esc(label)}</option>`;
  const unique = values => [...new Set((values || []).filter(value => String(value).trim()))];
  const csv = value => unique(String(value || "").split(",").map(item => item.trim()));
  const now = () => new Date().toISOString();
  const makeId = () => `character_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  let draft = defaultDraft();
  let currentView = "start";
  let suppressLibrarySync = false;

  function defaultBuild() {
    const firstRace = rules.list("races")[0];
    const firstClass = rules.list("classes")[0];
    return {
      version: 1,
      baseAbilities: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 },
      raceId: firstRace?.id || "", subraceId: firstRace?.subraces?.[0]?.id || "", raceChoices: {},
      classId: firstClass?.id || "", classChoices: {}, equipmentPackageId: firstClass?.equipmentPackages?.[0]?.id || ""
    };
  }

  function defaultDraft() {
    return { step: 1, editing: false, name: "", portraitImage: "", build: defaultBuild(), rulesProfile: stateApi.emptyRulesProfile() };
  }

  function idFromName(kind, name) {
    const normalized = slug(name);
    return rules.list(kind).find(item => slug(item.name) === normalized)?.id || "";
  }

  function draftFromState() {
    stateApi.migrateCharacter(state);
    const next = defaultDraft();
    next.editing = true;
    next.name = String(state.name || "");
    next.portraitImage = String(state.portraitImage || "");
    next.build = clone(state.characterBuild || defaultBuild());
    next.rulesProfile = clone(state.rulesProfile || stateApi.emptyRulesProfile());
    next.build.raceId ||= idFromName("races", state.race);
    next.build.classId ||= idFromName("classes", state.className);
    const race = rules.get("races", next.build.raceId);
    if (race?.subraces?.length && !next.build.subraceId) {
      next.build.subraceId = race.subraces.find(item => item.name === state.race)?.id || race.subraces[0].id;
    }
    const classDefinition = rules.get("classes", next.build.classId);
    if (classDefinition && !classDefinition.equipmentPackages.some(item => item.id === next.build.equipmentPackageId)) {
      next.build.equipmentPackageId = classDefinition.equipmentPackages[0]?.id || "";
    }
    next.step = 1;
    return next;
  }

  function metaFromState(source) {
    return {
      name: String(source?.name || "Unnamed Character"), race: String(source?.race || "Unassigned"),
      className: String(source?.className || "Class Pending"), level: Math.max(1, Number(source?.level) || 1),
      portraitImage: String(source?.portraitImage || ""), updatedAt: now()
    };
  }

  function readLibrary() {
    try {
      const parsed = storage.readJson(LIBRARY_KEY, null);
      if (parsed && parsed.version === 1 && Array.isArray(parsed.records)) return parsed;
    } catch (error) {}
    return { version: 1, records: [] };
  }

  function writeLibrary(library) {
    try {
      if (!storage.writeJson(LIBRARY_KEY, library)) throw new Error("Storage full");
      return true;
    } catch (error) {
      toast?.("The character library is full. Export a character before adding another.");
      return false;
    }
  }

  function activeId() { return storage.get(ACTIVE_KEY, ""); }
  function setActiveId(value) { storage.set(ACTIVE_KEY, value); }

  function ensureLibrary() {
    const library = readLibrary();
    let active = activeId();
    if (!active || !library.records.some(record => record.id === active)) {
      active = makeId();
      setActiveId(active);
      library.records.unshift({ id: active, ...metaFromState(state), snapshot: null });
      writeLibrary(library);
    }
    return library;
  }

  function syncActiveMeta() {
    if (suppressLibrarySync) return;
    const library = ensureLibrary();
    const record = library.records.find(item => item.id === activeId());
    if (record) Object.assign(record, metaFromState(state), { snapshot: null });
    writeLibrary(library);
  }

  function stashActive(library) {
    const record = library.records.find(item => item.id === activeId());
    if (record) Object.assign(record, metaFromState(state), { snapshot: clone(state) });
  }

  function activateSnapshot(record, library) {
    if (record.id === activeId()) {
      closeLauncher();
      navigateToPage("home");
      return;
    }
    if (!record.snapshot) return;
    stashActive(library);
    const next = stateApi.migrateCharacter(clone(record.snapshot));
    record.snapshot = null;
    setActiveId(record.id);
    writeLibrary(library);
    suppressLibrarySync = true;
    state = next;
    stabilizeStateData();
    localStorage.setItem("characterHubState", JSON.stringify(englishOnlySnapshot(state)));
    suppressLibrarySync = false;
    render();
    save();
    navigateToPage("home");
    closeLauncher();
  }

  function initials(name) {
    return String(name || "New Hero").split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "NH";
  }

  function placeholderPortrait(name) {
    const canvas = document.createElement("canvas");
    canvas.width = 420;
    canvas.height = 420;
    const context = canvas.getContext("2d");
    const gradient = context.createLinearGradient(0, 0, 420, 420);
    gradient.addColorStop(0, "#26393c");
    gradient.addColorStop(1, "#281617");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 420, 420);
    context.strokeStyle = "#c99432";
    context.lineWidth = 18;
    context.strokeRect(18, 18, 384, 384);
    context.fillStyle = "#f7e6bf";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "bold 132px Georgia";
    context.fillText(initials(name), 210, 214);
    return canvas.toDataURL("image/png");
  }

  function compressPortrait(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        try {
          const size = 640;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const context = canvas.getContext("2d");
          const scale = Math.max(size / image.width, size / image.height);
          const width = image.width * scale;
          const height = image.height * scale;
          context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL("image/jpeg", 0.86));
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image could not be read")); };
      image.src = url;
    });
  }

  function launcher() {
    let root = document.getElementById("v1001Launcher");
    if (!root) {
      root = document.createElement("div");
      root.id = "v1001Launcher";
      root.className = "v1001-launcher";
      document.body.appendChild(root);
    }
    return root;
  }

  function logo() {
    return `<div class="v1001-logo"><div class="v1001-logo-rings"><span>CH</span></div><div><b>Character Hub</b><small>V11.0.2 · 2014 RULES</small></div></div>`;
  }

  function launcherFrame(content, { back = false, close = false } = {}) {
    return `<div class="v1001-shell"><header>${logo()}<div class="v1001-head-actions">${back ? '<button class="v1001-text-btn" data-v1001-action="start">← Main Menu</button>' : ""}${close ? '<button class="v1001-close" data-v1001-action="close" aria-label="Close character menu">×</button>' : ""}</div></header>${content}<footer><span>Local character library · <a href="https://media.wizards.com/2023/downloads/dnd/SRD_CC_v5.1.pdf" target="_blank" rel="noreferrer">SRD 5.1</a> licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></span><span>English Only · Desktop Edition</span></footer></div>`;
  }

  function startHtml() {
    const library = ensureLibrary();
    const active = library.records.find(record => record.id === activeId());
    return launcherFrame(`<main class="v1001-start"><div class="v1001-start-copy"><span class="v1001-kicker">YOUR ADVENTURE BEGINS HERE</span><h1>Choose your character.</h1><p>Create a new SRD 5.1 hero or return to a character already saved in this browser.</p>${active ? `<div class="v1001-current"><span>Current character</span><b>${esc(active.name)}</b><small>${esc(active.race)} · ${esc(active.className)} · Level ${active.level}</small></div>` : ""}</div><div class="v1001-choice-grid"><button class="v1001-choice new" data-v1001-action="new"><span class="v1001-choice-icon">＋</span><strong>New Character</strong><small>Open the seven-step character builder</small><i>Begin creation →</i></button><button class="v1001-choice load" data-v1001-action="load"><span class="v1001-choice-icon">↗</span><strong>Load Character</strong><small>Open your local character library</small><i>Choose a character →</i></button></div></main>`);
  }

  function displayDate(value) {
    try { return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
    catch (error) { return "Recently"; }
  }

  function loadHtml() {
    const library = ensureLibrary();
    const active = activeId();
    const cards = library.records.map(record => `<article class="v1001-character-card ${record.id === active ? "active" : ""}"><div class="v1001-card-portrait">${record.portraitImage ? `<img src="${esc(record.portraitImage)}" alt="">` : `<span>${esc(initials(record.name))}</span>`}</div><div class="v1001-card-copy"><small>${record.id === active ? "CURRENT CHARACTER" : "SAVED CHARACTER"}</small><h3>${esc(record.name)}</h3><p>${esc(record.race)} · ${esc(record.className)} · Level ${record.level}</p><time>Saved ${esc(displayDate(record.updatedAt))}</time></div><button class="v1001-load-btn" data-v1001-action="activate" data-id="${esc(record.id)}">${record.id === active ? "Continue" : "Load"}</button></article>`).join("");
    return launcherFrame(`<main class="v1001-library"><div class="v1001-section-title"><span class="v1001-kicker">CHARACTER LIBRARY</span><h1>Load a character.</h1><p>Every character and rules profile is stored separately on this device.</p></div><section class="v1001-character-list">${cards || '<div class="v1001-empty">No saved characters yet.</div>'}</section><div class="v1001-import-row"><div><b>Have a Character Hub backup?</b><small>Import a previously exported JSON character file.</small></div><button class="v1001-secondary" data-v1001-action="import">Import Character</button><input id="v1001Import" type="file" accept="application/json,.json" hidden></div></main>`, { back: true, close: true });
  }

  function portraitHtml() {
    return draft.portraitImage ? `<img src="${esc(draft.portraitImage)}" alt="Portrait preview">` : `<span>${esc(initials(draft.name))}</span>`;
  }

  function identityStep() {
    return `<section class="v1001-wizard-pane"><div class="v1001-pane-copy"><span class="v1001-kicker">STEP 1 · IDENTITY</span><h1>Who is your character?</h1><p>Name your hero and optionally add a portrait stored only in this browser.</p></div><div class="v1001-form-card"><label>Character name<input id="v1001Name" value="${esc(draft.name)}" placeholder="Enter a character name" autocomplete="off"></label><div class="v1001-portrait-field"><div class="v1001-portrait-preview">${portraitHtml()}</div><div><b>Character portrait</b><p>Optional. The image is resized before it is saved locally.</p><label class="v1001-file-button">Choose Image<input id="v1001Portrait" type="file" accept="image/*" hidden></label></div></div></div></section>`;
  }

  function abilitiesStep() {
    return `<section class="v1001-wizard-pane"><div class="v1001-pane-copy"><span class="v1001-kicker">STEP 2 · ABILITY SCORES</span><h1>Set the foundation.</h1><p>Enter scores before racial bonuses. The race preview will show the final values.</p></div><div class="v1001-ability-builder">${ABILITIES.map(key => `<label><span>${key}</span><small>${ABILITY_NAMES[key]}</small><input data-v1001-base="${key}" type="number" min="1" max="20" value="${draft.build.baseAbilities[key]}"><b>${draft.build.baseAbilities[key]}</b><i>Base</i></label>`).join("")}</div><div class="v1001-rule-note"><b>Rules preset</b><span>2014 SRD rules are the default. Manual overrides remain available under Advanced on the Review step.</span></div></section>`;
  }

  function bonusText(race) {
    if (!race) return "—";
    const fixed = Object.entries(race.abilityBonuses.fixed || {}).filter(([, value]) => value).map(([key, value]) => `${key} +${value}`);
    const choices = (race.abilityBonuses.choices || []).map(choice => `${choice.count} choices × +${choice.amount}`);
    return [...fixed, ...choices].join(" · ") || "None";
  }

  function raceSummary(race) {
    if (!race) return "";
    const traits = race.traits.map(item => `<li><b>${esc(item.name)}</b><span>${esc(item.summary)}</span></li>`).join("");
    const proficiencyParts = [
      race.proficiencies.skills.fixed.length ? `Skills: ${race.proficiencies.skills.fixed.map(skillName).join(", ")}` : "",
      race.proficiencies.weapons.length ? `Weapons: ${race.proficiencies.weapons.join(", ")}` : "",
      race.proficiencies.tools.fixed.length ? `Tools: ${race.proficiencies.tools.fixed.join(", ")}` : ""
    ].filter(Boolean);
    return `<div class="v1001-definition-preview"><div class="v1001-preview-facts"><div><small>ABILITY BONUSES</small><b>${esc(bonusText(race))}</b></div><div><small>BODY</small><b>${esc(race.size.value)} · ${race.speed.walk} ft.</b></div><div><small>SENSES</small><b>${race.senses.darkvision ? `Darkvision ${race.senses.darkvision} ft.` : "Normal vision"}</b></div><div><small>LANGUAGES</small><b>${esc(race.languages.fixed.join(", "))}${race.languages.choices.length ? " + choice" : ""}</b></div></div>${proficiencyParts.length ? `<p class="v1001-proficiency-line">${esc(proficiencyParts.join(" · "))}</p>` : ""}<ul class="v1001-feature-list">${traits}</ul></div>`;
  }

  function raceStep() {
    const races = rules.list("races");
    const parent = rules.get("races", draft.build.raceId);
    const race = stateApi.mergeRace(parent, draft.build.subraceId);
    return `<section class="v1001-wizard-pane"><div class="v1001-pane-copy"><span class="v1001-kicker">STEP 3 · RACE & SUBRACE</span><h1>Choose your ancestry.</h1><p>Only complete, validated SRD 5.1 definitions are listed.</p></div><div class="v1001-form-card v1001-definition-card"><div class="v1001-two-fields"><label>Race<select id="v1001Race">${races.map(item => option(item.id, item.name, draft.build.raceId)).join("")}</select></label>${parent?.subraces?.length ? `<label>Subrace<select id="v1001Subrace"><option value="">Choose a subrace</option>${parent.subraces.map(item => option(item.id, item.name, draft.build.subraceId)).join("")}</select></label>` : ""}</div>${raceSummary(race)}</div></section>`;
  }

  function choicesForRace(race) {
    if (!race) return [];
    return [
      ...(race.abilityBonuses.choices || []), ...(race.languages.choices || []),
      ...(race.proficiencies.skills.choices || []), ...(race.proficiencies.tools.choices || []), ...(race.choices || [])
    ];
  }

  function choiceOptions(choice, scope, index) {
    const selected = stateApi.selectedValues(scope === "race" ? draft.build.raceChoices : draft.build.classChoices, choice.id)[index] || "";
    let values = choice.options;
    if (choice.type === "ability") values = ABILITIES.filter(key => !choice.exclude?.includes(key)).map(key => ({ id: key, label: `${ABILITY_NAMES[key]} (${key})` }));
    if (choice.type === "language") {
      const selectedRace = stateApi.mergeRace(rules.get("races", draft.build.raceId), draft.build.subraceId);
      values = LANGUAGES.filter(language => !selectedRace?.languages?.fixed?.includes(language));
    }
    if (choice.type === "skill" && values === "all") values = SKILLS.map(([id, name]) => ({ id, label: name }));
    if (choice.type === "skill" && values === "class-selected") values = stateApi.selectedValues(draft.build.classChoices, "class-skills").map(id => ({ id, label: skillName(id) }));
    if (choice.type === "skill" && values === "rogue-expertise") values = [...stateApi.selectedValues(draft.build.classChoices, "class-skills").map(id => ({ id, label: skillName(id) })), { id: "thieves-tools", label: "Thieves' Tools" }];
    if (choice.type === "text") return `<input data-v1001-choice-scope="${scope}" data-v1001-choice-id="${esc(choice.id)}" data-v1001-choice-index="${index}" value="${esc(selected)}" placeholder="${esc(choice.placeholder || "Enter a value")}">`;
    const normalized = (values || []).map(value => typeof value === "object" ? { id: value.id || value.label, label: value.label || value.name || value.id } : { id: value, label: value });
    return `<select data-v1001-choice-scope="${scope}" data-v1001-choice-id="${esc(choice.id)}" data-v1001-choice-index="${index}">${option("", "Choose…", selected)}${normalized.map(item => option(item.id, item.label, selected)).join("")}</select>`;
  }

  function renderChoice(choice, scope) {
    return `<section class="v1001-dynamic-choice"><h3>${esc(choice.label)}</h3><p>Select ${choice.count || 1}${choice.distinct ? " different" : ""} option${Number(choice.count || 1) === 1 ? "" : "s"}.</p><div class="v1001-two-fields">${Array.from({ length: Number(choice.count || 1) }, (_, index) => `<label>${Number(choice.count || 1) > 1 ? `Choice ${index + 1}` : choice.label}${choiceOptions(choice, scope, index)}</label>`).join("")}</div></section>`;
  }

  function raceChoicesStep() {
    const race = stateApi.mergeRace(rules.get("races", draft.build.raceId), draft.build.subraceId);
    const choices = choicesForRace(race);
    const resolved = stateApi.resolveRace(draft.build, draft.rulesProfile);
    return `<section class="v1001-wizard-pane"><div class="v1001-pane-copy"><span class="v1001-kicker">STEP 4 · RACIAL CHOICES</span><h1>Complete your ${esc(race?.displayName || "race")}.</h1><p>Every required racial decision is validated before creation.</p></div><div class="v1001-choice-form">${choices.length ? choices.map(choice => renderChoice(choice, "race")).join("") : '<section><h3>No required choices</h3><p>This race applies all of its level 1 benefits automatically.</p></section>'}</div>${resolved ? `<div class="v1001-final-ability-strip">${ABILITIES.map(key => `<div><small>${key}</small><b>${resolved.finalAbilities[key]}</b><span>${signed(scoreModifier(resolved.finalAbilities[key]))}</span></div>`).join("")}</div>` : ""}</section>`;
  }

  function classSummary(classDefinition) {
    if (!classDefinition) return "";
    const spell = classDefinition.spellcasting;
    return `<div class="v1001-definition-preview"><div class="v1001-preview-facts"><div><small>HIT DIE / STARTING HP</small><b>d${classDefinition.hitDie} · ${classDefinition.hitDie} + CON</b></div><div><small>SAVING THROWS</small><b>${classDefinition.savingThrows.join(", ")}</b></div><div><small>ARMOR</small><b>${esc(classDefinition.proficiencies.armor.join(", ") || "None")}</b></div><div><small>WEAPONS</small><b>${esc(classDefinition.proficiencies.weapons.join(", "))}</b></div><div><small>SPELLCASTING</small><b>${spell ? `${spell.startsAt === 1 ? "Level 1" : `Begins level ${spell.startsAt}`} · ${spell.ability}` : "None"}</b></div><div><small>SUBCLASS</small><b>Level ${classDefinition.subclass.selectionLevel} · ${esc(classDefinition.subclass.srdOption)}</b></div></div><ul class="v1001-feature-list">${classDefinition.level1Features.map(item => `<li><b>${esc(item.name)}</b><span>${esc(item.summary)}</span></li>`).join("")}</ul><p class="v1001-proficiency-line"><b>Future SRD path:</b> ${esc(classDefinition.subclass.highlights.join(" · "))}</p></div>`;
  }

  function classChoiceDefinitions(classDefinition) {
    if (!classDefinition) return [];
    return [
      { id: "class-skills", label: "Class skill proficiencies", type: "skill", count: classDefinition.proficiencies.skills.count, options: classDefinition.proficiencies.skills.options },
      ...(classDefinition.proficiencies.tools?.choices || []), ...(classDefinition.choices || [])
    ];
  }

  function classStep() {
    const classes = rules.list("classes");
    const classDefinition = rules.get("classes", draft.build.classId);
    return `<section class="v1001-wizard-pane"><div class="v1001-pane-copy"><span class="v1001-kicker">STEP 5 · CLASS</span><h1>Choose your calling.</h1><p>All twelve SRD classes include their level 1 rules and future subclass point.</p></div><div class="v1001-form-card v1001-definition-card"><label>Class<select id="v1001Class">${classes.map(item => option(item.id, item.name, draft.build.classId)).join("")}</select></label>${classSummary(classDefinition)}</div><div class="v1001-choice-form v1001-class-choices">${classChoiceDefinitions(classDefinition).map(choice => renderChoice(choice, "class")).join("")}</div></section>`;
  }

  function spellcastingSummary(spellcasting) {
    if (!spellcasting) return `<div class="v1001-rule-note"><b>No spellcasting at level 1</b><span>This class does not receive spellcasting at this level.</span></div>`;
    if (spellcasting.startsAt > 1) return `<div class="v1001-rule-note"><b>Spellcasting begins at level ${spellcasting.startsAt}</b><span>${spellcasting.ability} will be the spellcasting ability. No spell selections are added at level 1.</span></div>`;
    const facts = [
      `${spellcasting.ability} spellcasting`,
      spellcasting.cantripsKnown != null ? `${spellcasting.cantripsKnown} cantrips` : "",
      spellcasting.spellsKnown != null ? `${spellcasting.spellsKnown} spells known` : "",
      spellcasting.spellbookSpells != null ? `${spellcasting.spellbookSpells} spellbook spells` : "",
      spellcasting.preparedFormula || "",
      spellcasting.level1Slots != null ? `${spellcasting.level1Slots} level 1 slots` : ""
    ].filter(Boolean);
    return `<div class="v1001-spell-summary"><small>LEVEL 1 SPELLCASTING</small><b>${esc(facts.join(" · "))}</b><p>Spell slots and capacity are saved now. Individual spells remain unavailable until their class lists and complete casting rules are verified.</p></div>`;
  }

  function equipmentStep() {
    const classDefinition = rules.get("classes", draft.build.classId);
    if (!classDefinition) return "";
    return `<section class="v1001-wizard-pane"><div class="v1001-pane-copy"><span class="v1001-kicker">STEP 6 · EQUIPMENT & SPELLCASTING</span><h1>Prepare for the road.</h1><p>Select a complete starting package. Every item shown will be added to inventory.</p></div><div class="v1001-equipment-list">${classDefinition.equipmentPackages.map(packageDefinition => `<label class="v1001-equipment-option ${packageDefinition.id === draft.build.equipmentPackageId ? "selected" : ""}"><input type="radio" name="v1001Equipment" value="${esc(packageDefinition.id)}" ${packageDefinition.id === draft.build.equipmentPackageId ? "checked" : ""}><span><b>${esc(packageDefinition.name)}</b><small>${esc(packageDefinition.items.map(item => `${item.qty > 1 ? `${item.qty}× ` : ""}${item.name}`).join(" · "))}</small></span></label>`).join("")}</div>${spellcastingSummary(classDefinition.spellcasting)}<div class="v1001-definition-preview compact"><div class="v1001-preview-facts"><div><small>ARMOR PROFICIENCIES</small><b>${esc(classDefinition.proficiencies.armor.join(", ") || "None")}</b></div><div><small>WEAPON PROFICIENCIES</small><b>${esc(classDefinition.proficiencies.weapons.join(", "))}</b></div><div><small>TOOL PROFICIENCIES</small><b>${esc(classDefinition.proficiencies.tools.fixed.join(", ") || "From choices, if any")}</b></div></div></div></section>`;
  }

  function reviewData() {
    const race = stateApi.resolveRace(draft.build, draft.rulesProfile);
    const classDefinition = stateApi.resolveClass(draft.build, draft.rulesProfile, race?.finalAbilities);
    return { race, classDefinition };
  }

  function selectedChoiceLabel(choice, rawValue) {
    if (choice.type === "ability") return ABILITY_NAMES[rawValue] || rawValue;
    if (choice.type === "skill") return skillName(rawValue);
    const matching = Array.isArray(choice.options)
      ? choice.options.find(item => String(typeof item === "object" ? item.id || item.label : item) === String(rawValue))
      : null;
    return typeof matching === "object" ? matching.label || matching.name || rawValue : matching || rawValue;
  }

  function choiceSummary(definitions, selected) {
    return definitions.map(choice => {
      const values = stateApi.selectedValues(selected, choice.id).map(value => selectedChoiceLabel(choice, value));
      return values.length ? `${choice.label}: ${values.join(", ")}` : "";
    }).filter(Boolean).join(" · ");
  }

  function overrideValue(path, fallback = "") {
    let current = draft.rulesProfile.overrides;
    for (const part of path.split(".")) current = current?.[part];
    return current == null ? fallback : current;
  }

  function manualOverridesHtml() {
    const profile = draft.rulesProfile;
    return `<details class="v1001-advanced" ${profile.mode === "manual" ? "open" : ""}><summary><span><b>Advanced · Manual rules</b><small>Keep calculated 2014 rules and overrides separate.</small></span><i>${profile.mode === "manual" ? "MANUAL" : "STANDARD"}</i></summary><div class="v1001-advanced-body"><div class="v1001-mode-row"><label><input type="radio" name="v1001RulesMode" value="standard" ${profile.mode === "standard" ? "checked" : ""}> Standard 2014</label><label><input type="radio" name="v1001RulesMode" value="manual" ${profile.mode === "manual" ? "checked" : ""}> Manual overrides</label><button class="v1001-secondary" data-v1001-action="reset-all-overrides" type="button">Reset all overrides</button></div>${profile.mode === "manual" ? `<p class="v1001-manual-note">Blank fields inherit the 2014 result. Returning to Standard ignores these overrides without deleting the character.</p><section class="v1001-override-group"><div><h3>Race results</h3><button type="button" data-v1001-action="reset-override" data-group="race">Reset group</button></div><div class="v1001-manual-grid"><label>Size<input id="v1001ManualSize" value="${esc(overrideValue("size"))}" placeholder="Inherit"></label><label>Speed<input id="v1001ManualSpeed" type="number" min="0" value="${esc(overrideValue("speed"))}" placeholder="Inherit"></label><label>Darkvision<input id="v1001ManualDarkvision" type="number" min="0" value="${esc(overrideValue("senses.darkvision"))}" placeholder="Inherit"></label>${ABILITIES.map(key => `<label>${key} racial bonus<input data-v1001-manual-ability="${key}" type="number" value="${esc(overrideValue(`abilityBonuses.${key}`))}" placeholder="Inherit"></label>`).join("")}<label class="wide">Languages (comma separated)<input id="v1001ManualLanguages" value="${esc((overrideValue("languages", []) || []).join(", "))}" placeholder="Inherit"></label><label class="wide">Race skills<input id="v1001ManualSkills" value="${esc((overrideValue("skills", []) || []).map(skillName).join(", "))}" placeholder="Use skill IDs or names"></label><label class="wide">Race armor proficiencies<input id="v1001ManualRaceArmor" value="${esc((overrideValue("armorProficiencies", []) || []).join(", "))}" placeholder="Inherit"></label><label class="wide">Race weapon proficiencies<input id="v1001ManualRaceWeapons" value="${esc((overrideValue("weaponProficiencies", []) || []).join(", "))}" placeholder="Inherit"></label><label class="wide">Race tool proficiencies<input id="v1001ManualRaceTools" value="${esc((overrideValue("toolProficiencies", []) || []).join(", "))}" placeholder="Inherit"></label><label class="wide">Add racial traits<input id="v1001ManualAddTraits" value="${esc((overrideValue("addTraits", []) || []).join(", "))}" placeholder="Trait names"></label></div></section><section class="v1001-override-group"><div><h3>Class results</h3><button type="button" data-v1001-action="reset-override" data-group="class">Reset group</button></div><div class="v1001-manual-grid"><label>Hit Die<select id="v1001ManualHitDie">${option("", "Inherit", overrideValue("hitDie"))}${[6, 8, 10, 12].map(value => option(value, `d${value}`, overrideValue("hitDie"))).join("")}</select></label><label>Starting HP<input id="v1001ManualHp" type="number" min="1" value="${esc(overrideValue("hp"))}" placeholder="Inherit"></label><label class="wide">Saving Throws<input id="v1001ManualSaves" value="${esc((overrideValue("savingThrows", []) || []).join(", "))}" placeholder="Example: STR, CON"></label><label class="wide">Class armor proficiencies<input id="v1001ManualClassArmor" value="${esc((overrideValue("classArmorProficiencies", []) || []).join(", "))}" placeholder="Inherit"></label><label class="wide">Class weapon proficiencies<input id="v1001ManualClassWeapons" value="${esc((overrideValue("classWeaponProficiencies", []) || []).join(", "))}" placeholder="Inherit"></label><label class="wide">Class tool proficiencies<input id="v1001ManualClassTools" value="${esc((overrideValue("classToolProficiencies", []) || []).join(", "))}" placeholder="Inherit"></label><label>Spellcasting ability<select id="v1001ManualSpellAbility">${option("", "Inherit", overrideValue("spellcasting.ability"))}${ABILITIES.map(key => option(key, key, overrideValue("spellcasting.ability"))).join("")}</select></label><label>Level 1 spell slots<input id="v1001ManualSpellSlots" type="number" min="0" value="${esc(overrideValue("spellcasting.level1Slots"))}" placeholder="Inherit"></label><label class="wide">Add class features<input id="v1001ManualAddFeatures" value="${esc((overrideValue("addFeatures", []) || []).join(", "))}" placeholder="Feature names"></label><label class="wide">Add resources<input id="v1001ManualResources" value="${esc((overrideValue("addResources", []) || []).join(", "))}" placeholder="Resource names"></label></div></section>` : ""}</div></details>`;
  }

  function overrideEntries(value = draft.rulesProfile.overrides, prefix = "") {
    if (Array.isArray(value) || value == null || typeof value !== "object") return prefix ? [[prefix, value]] : [];
    return Object.entries(value).flatMap(([key, child]) => overrideEntries(child, prefix ? `${prefix}.${key}` : key));
  }

  function activeOverrideResetsHtml() {
    const entries = overrideEntries();
    if (!entries.length) return '<p class="v1001-manual-note">No manual overrides are currently stored.</p>';
    return `<div class="v1001-override-chips"><small>RESET ONE OVERRIDE</small>${entries.map(([path]) => `<button type="button" data-v1001-action="reset-one-override" data-path="${esc(path)}">${esc(path)} ×</button>`).join("")}</div>`;
  }

  function manualOverridesHtmlV2() {
    const profile = draft.rulesProfile;
    const listValue = path => (overrideValue(path, []) || []).join(", ");
    const scalar = (id, label, path, attributes = "") => `<label>${label}<input id="${id}" ${attributes} value="${esc(overrideValue(path))}" placeholder="Inherit"></label>`;
    const list = (id, label, path, placeholder = "Inherit") => `<label class="wide">${label}<input id="${id}" value="${esc(listValue(path))}" placeholder="${esc(placeholder)}"></label>`;
    return `<details class="v1001-advanced" ${profile.mode === "manual" ? "open" : ""}>
      <summary><span><b>Advanced · Manual rules</b><small>Calculated 2014 rules and overrides are stored separately.</small></span><i>${profile.mode === "manual" ? "MANUAL" : "STANDARD"}</i></summary>
      <div class="v1001-advanced-body">
        <div class="v1001-mode-row"><label><input type="radio" name="v1001RulesMode" value="standard" ${profile.mode === "standard" ? "checked" : ""}> Standard 2014</label><label><input type="radio" name="v1001RulesMode" value="manual" ${profile.mode === "manual" ? "checked" : ""}> Manual overrides</label><button class="v1001-secondary" data-v1001-action="reset-all-overrides" type="button">Reset all overrides</button></div>
        ${profile.mode === "manual" ? `<p class="v1001-manual-note">Blank fields inherit the 2014 result. Standard mode ignores these values without deleting the character.</p>${activeOverrideResetsHtml()}
        <section class="v1001-override-group"><div><h3>Race results</h3><button type="button" data-v1001-action="reset-override" data-group="race">Reset group</button></div><div class="v1001-manual-grid">
          ${scalar("v1001ManualSize", "Size", "size")}${scalar("v1001ManualSpeed", "Speed", "speed", 'type="number" min="0"')}${scalar("v1001ManualDarkvision", "Darkvision", "senses.darkvision", 'type="number" min="0"')}
          ${ABILITIES.map(key => `<label>${key} racial bonus<input data-v1001-manual-ability="${key}" type="number" value="${esc(overrideValue(`abilityBonuses.${key}`))}" placeholder="Inherit"></label>`).join("")}
          ${list("v1001ManualLanguages", "Languages", "languages")}${list("v1001ManualSkills", "Race skill proficiencies", "skills", "Use skill IDs or names")}
          ${list("v1001ManualRaceArmor", "Race armor proficiencies", "armorProficiencies")}${list("v1001ManualRaceWeapons", "Race weapon proficiencies", "weaponProficiencies")}${list("v1001ManualRaceTools", "Race tool proficiencies", "toolProficiencies")}
          ${list("v1001ManualAddTraits", "Add racial traits", "addTraits", "Trait names")}${list("v1001ManualRemoveTraits", "Remove racial traits", "removeTraits", "Trait names or IDs")}
        </div></section>
        <section class="v1001-override-group"><div><h3>Class results</h3><button type="button" data-v1001-action="reset-override" data-group="class">Reset group</button></div><div class="v1001-manual-grid">
          <label>Hit Die<select id="v1001ManualHitDie">${option("", "Inherit", overrideValue("hitDie"))}${[6, 8, 10, 12].map(value => option(value, `d${value}`, overrideValue("hitDie"))).join("")}</select></label>
          ${scalar("v1001ManualHp", "Starting HP", "hp", 'type="number" min="1"')}${list("v1001ManualSaves", "Saving Throws", "savingThrows", "Example: STR, CON")}${list("v1001ManualClassSkills", "Class skill proficiencies", "classSkills", "Use skill IDs or names")}
          ${list("v1001ManualClassArmor", "Class armor proficiencies", "classArmorProficiencies")}${list("v1001ManualClassWeapons", "Class weapon proficiencies", "classWeaponProficiencies")}${list("v1001ManualClassTools", "Class tool proficiencies", "classToolProficiencies")}
          <label>Spellcasting ability<select id="v1001ManualSpellAbility">${option("", "Inherit", overrideValue("spellcasting.ability"))}${ABILITIES.map(key => option(key, key, overrideValue("spellcasting.ability"))).join("")}</select></label>
          ${scalar("v1001ManualSpellSlots", "Level 1 spell slots", "spellcasting.level1Slots", 'type="number" min="0"')}${scalar("v1001ManualCantrips", "Cantrips known", "spellcasting.cantripsKnown", 'type="number" min="0"')}${scalar("v1001ManualSpellsKnown", "Spells known", "spellcasting.spellsKnown", 'type="number" min="0"')}${scalar("v1001ManualPreparedFormula", "Prepared-spell formula", "spellcasting.preparedFormula")}
          ${list("v1001ManualAddFeatures", "Add class features", "addFeatures", "Feature names")}${list("v1001ManualRemoveFeatures", "Remove class features", "removeFeatures", "Feature names or IDs")}${list("v1001ManualResources", "Add resources", "addResources", "Resource names")}${list("v1001ManualRemoveResources", "Remove resources", "removeResources", "Resource names or IDs")}
        </div></section>` : ""}
      </div>
    </details>`;
  }

  function reviewStep() {
    const { race, classDefinition } = reviewData();
    if (!race || !classDefinition) return "";
    const hpBonus = [...race.traits, ...classDefinition.features].reduce((sum, item) => sum + Number(item.mechanics?.hpPerLevel || 0), 0);
    const calculatedHp = Math.max(1, classDefinition.hitDie + scoreModifier(race.finalAbilities.CON) + hpBonus);
    const hp = draft.rulesProfile.mode === "manual" && Number(draft.rulesProfile.overrides.hp) > 0 ? Number(draft.rulesProfile.overrides.hp) : calculatedHp;
    const spellcasting = classDefinition.spellcasting;
    const armorClass = calculateArmorClass(classDefinition.equipmentPackage.items, classDefinition, classDefinition.abilityModifiers);
    const racialChoices = choiceSummary(choicesForRace(race.definition), draft.build.raceChoices);
    const classChoices = choiceSummary(classChoiceDefinitions(classDefinition.definition), draft.build.classChoices);
    return `<section class="v1001-wizard-pane review"><div class="v1001-pane-copy"><span class="v1001-kicker">STEP 7 · REVIEW</span><h1>${draft.editing ? "Review your changes." : "Your character is ready."}</h1><p>Everything listed below will be written to the character record.</p></div><div class="v1001-review-grid"><section class="v1001-review-identity"><div class="v1001-review-portrait">${portraitHtml()}</div><div><small>${draft.editing ? "EDITING CHARACTER" : "NEW CHARACTER"}</small><h2>${esc(draft.name)}</h2><p>${esc(race.name)} · ${esc(classDefinition.name)} · Level 1</p><span>${draft.rulesProfile.mode === "manual" ? "2014 rules with manual overrides" : "Standard 2014 SRD rules"}</span></div></section><section class="v1001-review-abilities">${ABILITIES.map(key => `<div><small>${key}</small><b>${race.finalAbilities[key]}</b><span>${signed(scoreModifier(race.finalAbilities[key]))}</span></div>`).join("")}</section><section class="v1001-review-rules"><div><small>VITALS</small><b>${esc(race.size)} · ${race.speed} ft. · AC ${armorClass} · d${classDefinition.hitDie} · ${hp} HP</b></div><div><small>SENSES & LANGUAGES</small><b>${race.senses.darkvision ? `Darkvision ${race.senses.darkvision} ft. · ` : ""}${esc(race.languages.join(" · "))}</b></div><div><small>SAVING THROWS</small><b>${classDefinition.savingThrows.join(" · ")}</b></div><div><small>SKILLS</small><b>${esc(unique([...race.skills, ...classDefinition.skills]).map(skillName).join(" · ") || "None")}</b></div><div><small>PROFICIENCIES</small><b>${esc(unique([...race.armor, ...classDefinition.armor, ...race.weapons, ...classDefinition.weapons, ...race.tools, ...classDefinition.tools]).join(" · ") || "None")}</b></div>${racialChoices ? `<div><small>RACE CHOICES</small><b>${esc(racialChoices)}</b></div>` : ""}${classChoices ? `<div><small>CLASS CHOICES</small><b>${esc(classChoices)}</b></div>` : ""}<div><small>RACIAL TRAITS</small><b>${esc(race.traits.map(item => item.name).join(" · "))}</b></div><div><small>LEVEL 1 CLASS FEATURES</small><b>${esc(classDefinition.features.map(item => item.name).join(" · "))}</b></div><div><small>STARTING EQUIPMENT</small><b>${esc(classDefinition.equipmentPackage.items.map(item => `${item.qty > 1 ? `${item.qty}× ` : ""}${item.name}`).join(" · "))}</b></div><div><small>SPELLCASTING</small><b>${spellcasting ? `${spellcasting.startsAt === 1 ? "Active" : `Begins level ${spellcasting.startsAt}`} · ${spellcasting.ability}` : "None"}</b></div><div><small>SRD SUBCLASS PATH</small><b>Level ${classDefinition.subclass.selectionLevel}: ${esc(classDefinition.subclass.srdOption)}</b></div></section>${manualOverridesHtmlV2()}</div></section>`;
  }

  function wizardStep() {
    return [identityStep, abilitiesStep, raceStep, raceChoicesStep, classStep, equipmentStep, reviewStep][draft.step - 1]();
  }

  function newHtml() {
    return launcherFrame(`<main class="v1001-wizard"><aside><span class="v1001-kicker">${draft.editing ? "EDIT CHARACTER" : "NEW CHARACTER"}</span><h2>Character Creation</h2><ol>${BUILD_STEPS.map(([label, description], index) => `<li class="${draft.step === index + 1 ? "active" : draft.step > index + 1 ? "done" : ""}"><span>${draft.step > index + 1 ? "✓" : index + 1}</span><div><b>${label}</b><small>${description}</small></div></li>`).join("")}</ol><div class="v1001-progress"><span style="width:${draft.step / BUILD_STEPS.length * 100}%"></span></div><small>${draft.step} of ${BUILD_STEPS.length} steps</small></aside><div class="v1001-wizard-main">${wizardStep()}<div class="v1001-wizard-errors" id="v1001Errors" hidden></div><nav><button class="v1001-secondary" data-v1001-action="${draft.step === 1 ? (draft.editing ? "close" : "start") : "previous"}">${draft.step === 1 ? "Cancel" : "← Back"}</button><button class="v1001-primary" data-v1001-action="${draft.step === BUILD_STEPS.length ? "create" : "next"}">${draft.step === BUILD_STEPS.length ? (draft.editing ? "Apply Changes" : "Create Character") : "Continue →"}</button></nav></div></main>`, { close: true });
  }

  function renderLauncher() {
    const root = launcher();
    root.innerHTML = currentView === "load" ? loadHtml() : currentView === "new" ? newHtml() : startHtml();
    root.classList.add("open");
    document.body.classList.add("v1001-launcher-open");
  }

  function openLauncher(view = "start") {
    currentView = view;
    if (view === "new") draft = defaultDraft();
    renderLauncher();
  }

  function openEditor() {
    currentView = "new";
    draft = draftFromState();
    renderLauncher();
  }

  function closeLauncher() {
    launcher().classList.remove("open");
    document.body.classList.remove("v1001-launcher-open");
  }

  function readChoiceInputs() {
    const grouped = { race: {}, class: {} };
    document.querySelectorAll("[data-v1001-choice-scope]").forEach(input => {
      const scope = input.dataset.v1001ChoiceScope;
      const id = input.dataset.v1001ChoiceId;
      const index = Number(input.dataset.v1001ChoiceIndex) || 0;
      grouped[scope][id] ||= [];
      grouped[scope][id][index] = input.value.trim();
    });
    for (const [scope, values] of Object.entries(grouped)) {
      const target = scope === "race" ? draft.build.raceChoices : draft.build.classChoices;
      for (const [id, selected] of Object.entries(values)) target[id] = selected.filter(Boolean);
    }
  }

  function mapSkillInput(value) {
    const normalized = slug(value);
    return SKILLS.find(([id, name]) => id === value || slug(id) === normalized || slug(name) === normalized)?.[0] || value;
  }

  function readManualOverrides() {
    if (draft.rulesProfile.mode !== "manual") return;
    const value = id => document.getElementById(id)?.value.trim() ?? "";
    const overrides = draft.rulesProfile.overrides;
    const setScalar = (key, raw, number = false, minimum = null) => {
      if (raw === "") delete overrides[key];
      else {
        const parsed = number ? Number(raw) : raw;
        overrides[key] = number && minimum != null ? Math.max(minimum, parsed) : parsed;
      }
    };
    setScalar("size", value("v1001ManualSize"));
    setScalar("speed", value("v1001ManualSpeed"), true, 0);
    overrides.senses ||= {};
    const darkvision = value("v1001ManualDarkvision");
    if (darkvision === "") delete overrides.senses.darkvision;
    else overrides.senses.darkvision = Math.max(0, Number(darkvision));
    if (!Object.keys(overrides.senses).length) delete overrides.senses;
    overrides.abilityBonuses ||= {};
    document.querySelectorAll("[data-v1001-manual-ability]").forEach(input => {
      if (input.value.trim() === "") delete overrides.abilityBonuses[input.dataset.v1001ManualAbility];
      else overrides.abilityBonuses[input.dataset.v1001ManualAbility] = Number(input.value);
    });
    if (!Object.keys(overrides.abilityBonuses).length) delete overrides.abilityBonuses;
    const listFields = {
      languages: "v1001ManualLanguages", skills: "v1001ManualSkills", armorProficiencies: "v1001ManualRaceArmor",
      weaponProficiencies: "v1001ManualRaceWeapons", toolProficiencies: "v1001ManualRaceTools", addTraits: "v1001ManualAddTraits",
      removeTraits: "v1001ManualRemoveTraits", classSkills: "v1001ManualClassSkills",
      savingThrows: "v1001ManualSaves", classArmorProficiencies: "v1001ManualClassArmor",
      classWeaponProficiencies: "v1001ManualClassWeapons", classToolProficiencies: "v1001ManualClassTools",
      addFeatures: "v1001ManualAddFeatures", removeFeatures: "v1001ManualRemoveFeatures",
      addResources: "v1001ManualResources", removeResources: "v1001ManualRemoveResources"
    };
    for (const [key, elementId] of Object.entries(listFields)) {
      const raw = value(elementId);
      if (!raw) delete overrides[key];
      else {
        let parsed = csv(raw).map(item => ["skills", "classSkills"].includes(key) ? mapSkillInput(item) : item);
        if (key === "savingThrows") parsed = parsed.map(item => item.toUpperCase()).filter(item => ABILITIES.includes(item));
        overrides[key] = parsed;
      }
    }
    setScalar("hitDie", value("v1001ManualHitDie"), true);
    setScalar("hp", value("v1001ManualHp"), true, 1);
    const spellAbility = value("v1001ManualSpellAbility");
    const spellSlots = value("v1001ManualSpellSlots");
    const spellCantrips = value("v1001ManualCantrips");
    const spellsKnown = value("v1001ManualSpellsKnown");
    const preparedFormula = value("v1001ManualPreparedFormula");
    if (spellAbility || spellSlots !== "" || spellCantrips !== "" || spellsKnown !== "" || preparedFormula) {
      overrides.spellcasting ||= {};
      if (spellAbility) overrides.spellcasting.ability = spellAbility; else delete overrides.spellcasting.ability;
      if (spellSlots !== "") overrides.spellcasting.level1Slots = Math.max(0, Number(spellSlots)); else delete overrides.spellcasting.level1Slots;
      if (spellCantrips !== "") overrides.spellcasting.cantripsKnown = Math.max(0, Number(spellCantrips)); else delete overrides.spellcasting.cantripsKnown;
      if (spellsKnown !== "") overrides.spellcasting.spellsKnown = Math.max(0, Number(spellsKnown)); else delete overrides.spellcasting.spellsKnown;
      if (preparedFormula) overrides.spellcasting.preparedFormula = preparedFormula; else delete overrides.spellcasting.preparedFormula;
    } else delete overrides.spellcasting;
  }

  function readVisibleDraft() {
    const name = document.getElementById("v1001Name");
    if (name) draft.name = name.value.trim();
    document.querySelectorAll("[data-v1001-base]").forEach(input => {
      draft.build.baseAbilities[input.dataset.v1001Base] = Math.max(1, Math.min(20, Number(input.value) || 10));
    });
    readChoiceInputs();
    const equipment = document.querySelector("input[name='v1001Equipment']:checked");
    if (equipment) draft.build.equipmentPackageId = equipment.value;
    readManualOverrides();
  }

  function validateRaceOnly() {
    const errors = [];
    const race = stateApi.mergeRace(rules.get("races", draft.build.raceId), draft.build.subraceId);
    if (!race) return ["Choose an enabled race."];
    if (race.subraces?.length && !race.selectedSubrace) errors.push("Choose a subrace.");
    for (const choice of choicesForRace(race)) {
      const values = stateApi.selectedValues(draft.build.raceChoices, choice.id);
      if (values.length !== Number(choice.count || 1)) errors.push(`${choice.label}: choose ${choice.count || 1}.`);
      if (choice.distinct && new Set(values).size !== values.length) errors.push(`${choice.label}: choices must be different.`);
      if (choice.type === "ability" && values.some(value => choice.exclude?.includes(value))) errors.push(`${choice.label}: an excluded score was selected.`);
    }
    return errors;
  }

  function validateClassOnly(includeEquipment = false) {
    const errors = [];
    const classDefinition = rules.get("classes", draft.build.classId);
    if (!classDefinition) return ["Choose an enabled class."];
    for (const choice of classChoiceDefinitions(classDefinition)) {
      const values = stateApi.selectedValues(draft.build.classChoices, choice.id);
      if (values.length !== Number(choice.count || 1)) errors.push(`${choice.label}: choose ${choice.count || 1}.`);
      if (new Set(values).size !== values.length) errors.push(`${choice.label}: choices must be different.`);
    }
    if (includeEquipment && !classDefinition.equipmentPackages.some(item => item.id === draft.build.equipmentPackageId)) errors.push("Choose starting equipment.");
    return errors;
  }

  function stepErrors() {
    readVisibleDraft();
    if (draft.step === 1) return draft.name ? [] : ["Enter a character name."];
    if (draft.step === 2) return ABILITIES.some(key => draft.build.baseAbilities[key] < 1 || draft.build.baseAbilities[key] > 20)
      ? ["Ability Scores must be between 1 and 20."]
      : [];
    if (draft.step === 3) {
      const race = rules.get("races", draft.build.raceId);
      if (!race) return ["Choose an enabled race."];
      if (race.subraces?.length && !draft.build.subraceId) return ["Choose a subrace."];
      return [];
    }
    if (draft.step === 4) return validateRaceOnly();
    if (draft.step === 5) return validateClassOnly(false);
    if (draft.step === 6) return validateClassOnly(true);
    if (draft.step === 7) return stateApi.validateBuild(draft.build);
    return [];
  }

  function showErrors(errors) {
    const box = document.getElementById("v1001Errors");
    if (!box) return;
    box.hidden = !errors.length;
    box.innerHTML = errors.map(error => `<span>${esc(error)}</span>`).join("");
    if (errors.length) box.scrollIntoView({ block: "nearest" });
  }

  function generatedTrait(item, category, sourceName, prefix) {
    return {
      id: `builder_${prefix}_${slug(item.id || item.name)}`, name: item.name, category, activation: item.mechanics?.resource?.action || "Passive",
      shortDesc: item.summary || "", description: item.summary || "", trigger: "Granted by the 2014 character builder.",
      showInCombat: Boolean(item.mechanics?.resource), sourceType: category === "Racial Trait" ? "Race" : "Class", sourceName, unlockLevel: 1,
      resourceId: item.mechanics?.resource ? `builder_resource_${slug(item.id || item.name)}` : ""
    };
  }

  function resourceMaximum(resource, modifiers) {
    if (Number.isFinite(Number(resource.max))) return Math.max(1, Number(resource.max));
    if (resource.maxFormula === "CHA") return Math.max(Number(resource.minimum || 1), Number(modifiers.CHA || 0));
    if (resource.maxFormula === "1+CHA") return Math.max(Number(resource.minimum || 1), 1 + Number(modifiers.CHA || 0));
    return 1;
  }

  function generatedResource(item, sourceName, modifiers, sourceType = "Class") {
    const specification = item.mechanics?.resource;
    if (!specification) return null;
    const maximum = resourceMaximum(specification, modifiers);
    return {
      id: `builder_resource_${slug(item.id || item.name)}`, name: item.name, current: maximum, max: maximum, useCost: 1,
      recharge: specification.recharge || "Long Rest", rechargeMode: "All", rechargeValue: maximum,
      action: specification.action || "Special", showInCombat: true, desc: item.summary || "",
      sourceType, sourceName, unlockLevel: 1, upgradeLevels: ""
    };
  }

  function calculateArmorClass(items, classDefinition, modifiers) {
    const shields = items.filter(item => item.armor?.armorType === "Shield").reduce((sum, item) => sum + Number(item.armor.acBonus || 0), 0);
    const bodyArmor = items.filter(item => item.armor && item.armor.armorType !== "Shield");
    let best = 10 + modifiers.DEX;
    for (const item of bodyArmor) {
      const dexterity = item.armor.addDex ? Math.min(modifiers.DEX, item.armor.maxDex === "" ? modifiers.DEX : Number(item.armor.maxDex)) : 0;
      best = Math.max(best, Number(item.armor.baseAC || 0) + dexterity + Number(item.armor.acBonus || 0));
    }
    if (!bodyArmor.length) {
      for (const feature of classDefinition.features) {
        if (feature.mechanics?.armorFormula === "10+DEX+CON") best = Math.max(best, 10 + modifiers.DEX + modifiers.CON);
        if (feature.mechanics?.armorFormula === "10+DEX+WIS") best = Math.max(best, 10 + modifiers.DEX + modifiers.WIS);
        if (feature.mechanics?.armorFormula === "13+DEX") best = Math.max(best, 13 + modifiers.DEX);
      }
    }
    const fightingStyle = stateApi.selectedValues(draft.build.classChoices, "fighting-style")[0];
    const style = classDefinition.definition?.choices?.find(choice => choice.id === "fighting-style")?.options?.find(item => item.id === fightingStyle);
    const styleBonus = bodyArmor.length ? Number(style?.mechanics?.armoredAcBonus || 0) : 0;
    return best + shields + styleBonus;
  }

  function buildCharacterState(existing = null) {
    const profile = stateApi.normalizeRulesProfile(clone(draft.rulesProfile));
    const race = stateApi.resolveRace(draft.build, profile);
    const classDefinition = stateApi.resolveClass(draft.build, profile, race.finalAbilities);
    const modifiers = classDefinition.abilityModifiers;
    const profileOverrides = profile.mode === "manual" ? profile.overrides : {};
    const hpPerLevel = [...race.traits, ...classDefinition.features].reduce((sum, item) => sum + Number(item.mechanics?.hpPerLevel || 0), 0);
    const calculatedHp = Math.max(1, classDefinition.hitDie + modifiers.CON + hpPerLevel);
    const hp = Math.max(1, Number(profileOverrides.hp || calculatedHp));
    const builderItems = classDefinition.equipmentPackage.items.map((item, index) => ({ ...clone(item), id: `builder_equipment_${slug(item.name)}_${index}`, desc: item.desc || "Starting equipment.", destroyed: false, isMagical: false, magicalProperties: [] }));
    const previousItems = existing ? (existing.inventory || []).filter(item => !String(item.id).startsWith("builder_equipment_")) : [];
    const previousTraits = existing ? (existing.traits || []).filter(item => !String(item.id).startsWith("builder_") && !String(item.id).startsWith("v10_half_elf_")) : [];
    const previousResources = existing ? (existing.resources || []).filter(item => !String(item.id).startsWith("builder_resource_")) : [];
    const raceTraits = race.traits.map(item => generatedTrait(item, "Racial Trait", race.name, "race"));
    const selectedClassChoiceTraits = (classDefinition.definition.choices || []).flatMap(choice => stateApi.selectedValues(draft.build.classChoices, choice.id).map(selected => {
      const selectedOption = Array.isArray(choice.options) ? choice.options.find(item => typeof item === "object" && String(item.id) === String(selected)) : null;
      return selectedOption?.summary ? generatedTrait({ id: `${choice.id}-${selected}`, name: selectedOption.label.split(" — ")[0], summary: selectedOption.summary, mechanics: selectedOption.mechanics || {} }, "Class Feature", classDefinition.name, "class-choice") : null;
    })).filter(Boolean);
    const classTraits = [...classDefinition.features.map(item => generatedTrait(item, "Class Feature", classDefinition.name, "class")), ...selectedClassChoiceTraits];
    const resources = [
      ...race.traits.map(item => generatedResource(item, race.name, modifiers, "Race")),
      ...classDefinition.features.map(item => generatedResource(item, classDefinition.name, modifiers, "Class"))
    ].filter(Boolean);
    resources.push({ id: "builder_resource_hit_dice", systemKey: "hitDice", name: "Hit Dice", current: 1, max: 1, useCost: 1, recharge: "Long Rest", rechargeMode: "Fixed", rechargeValue: 1, action: "Short Rest", showInCombat: false, desc: `Spend d${classDefinition.hitDie} Hit Dice during a short rest.`, sourceType: "Class", sourceName: classDefinition.name, unlockLevel: 1, upgradeLevels: "" });
    const removedResources = new Set((profileOverrides.removeResources || []).map(value => slug(value)));
    for (let index = resources.length - 1; index >= 0; index--) {
      if (removedResources.has(slug(resources[index].name)) || removedResources.has(slug(resources[index].id))) resources.splice(index, 1);
    }
    for (const name of profileOverrides.addResources || []) resources.push({ id: `builder_resource_manual_${slug(name)}`, name, current: 1, max: 1, useCost: 1, recharge: "Manual", rechargeMode: "All", rechargeValue: 1, action: "Special", showInCombat: false, desc: "Custom resource.", sourceType: "Other", sourceName: "Manual override", unlockLevel: 1, upgradeLevels: "" });

    const next = existing ? clone(existing) : clone(defaultState);
    Object.assign(next, {
      name: draft.name, race: race.name, className: classDefinition.name,
      subclass: classDefinition.subclass.selectionLevel === 1 ? classDefinition.subclass.srdOption : "", level: 1,
      hpCurrent: hp, hpMax: hp, tempHp: 0, ac: calculateArmorClass(builderItems, classDefinition, modifiers),
      initiative: modifiers.DEX, speed: race.speed, proficiency: 2, attackAbility: "STR",
      abilities: Object.fromEntries(ABILITIES.map(key => [key, [race.finalAbilities[key], modifiers[key]]])),
      inventory: [...previousItems, ...builderItems], traits: [...previousTraits, ...raceTraits, ...classTraits],
      resources: [...previousResources, ...resources],
      rulesProfile: profile, characterBuild: clone(draft.build),
      rulesData: {
        edition: profile.edition, catalogVersion: profile.catalogVersion, size: race.size, senses: clone(race.senses),
        languages: clone(race.languages), armorProficiencies: unique([...race.armor, ...classDefinition.armor]),
        weaponProficiencies: unique([...race.weapons, ...classDefinition.weapons]), toolProficiencies: unique([...race.tools, ...classDefinition.tools]),
        spellcasting: clone(classDefinition.spellcasting), subclassSelection: clone(classDefinition.subclass),
        raceChoices: clone(draft.build.raceChoices), classChoices: clone(draft.build.classChoices)
      },
      hitDieType: `d${classDefinition.hitDie}`, portraitImage: draft.portraitImage || existing?.portraitImage || placeholderPortrait(draft.name),
      extraActionActive: false, combatActive: false, shortRestSession: null, pendingZeroDamage: 0
    });
    next.skillProficiencies = Object.fromEntries(SKILLS.map(([id]) => [id, "none"]));
    for (const key of unique([...race.skills, ...classDefinition.skills])) if (Object.hasOwn(next.skillProficiencies, key)) next.skillProficiencies[key] = "proficient";
    for (const key of stateApi.selectedValues(draft.build.classChoices, "expertise")) if (Object.hasOwn(next.skillProficiencies, key)) next.skillProficiencies[key] = "expertise";
    next.saveProficiencies = Object.fromEntries(ABILITIES.map(key => [key, classDefinition.savingThrows.includes(key)]));
    next.skillOverrides = {};
    next.saveOverrides = {};
    next.v10 = {
      rulesEdition: profile.edition, languages: clone(race.languages), size: race.size, senses: clone(race.senses),
      race: { id: draft.build.raceId, configured: true, manualName: race.name, baseAbilities: clone(draft.build.baseAbilities), choices: clone(draft.build.raceChoices), manualAbilityOverrides: {}, manualSpeedOverride: 0, previousSkillStatuses: {} }
    };
    return next;
  }

  function createOrUpdateCharacter() {
    readVisibleDraft();
    const errors = stateApi.validateBuild(draft.build);
    if (!draft.name) errors.unshift("Enter a character name.");
    if (errors.length) return showErrors(errors);
    const editing = draft.editing;
    const library = ensureLibrary();
    if (!editing) {
      stashActive(library);
      const recordId = makeId();
      setActiveId(recordId);
      library.records.unshift({ id: recordId, ...metaFromState({ name: draft.name, race: "Pending", className: "Pending", level: 1, portraitImage: draft.portraitImage }), snapshot: null });
      writeLibrary(library);
    }
    suppressLibrarySync = true;
    state = buildCharacterState(editing ? state : null);
    stabilizeStateData();
    localStorage.setItem("characterHubState", JSON.stringify(englishOnlySnapshot(state)));
    suppressLibrarySync = false;
    render();
    save();
    navigateToPage("home");
    closeLauncher();
    toast(editing ? "Character rules updated" : `${state.race} ${state.className} created`);
  }

  async function importCharacter(file) {
    try {
      const parsed = stateApi.migrateCharacter(JSON.parse(await file.text()));
      if (!parsed || typeof parsed !== "object" || !parsed.name) throw new Error("Invalid character file");
      const library = ensureLibrary();
      stashActive(library);
      const recordId = makeId();
      setActiveId(recordId);
      library.records.unshift({ id: recordId, ...metaFromState(parsed), snapshot: null });
      writeLibrary(library);
      suppressLibrarySync = true;
      state = parsed;
      stabilizeStateData();
      localStorage.setItem("characterHubState", JSON.stringify(englishOnlySnapshot(state)));
      suppressLibrarySync = false;
      render();
      save();
      navigateToPage("home");
      closeLauncher();
      toast("Character imported");
    } catch (error) {
      toast("The selected character file could not be imported");
    }
  }

  function injectCharacterMenuButton() {
    const actions = document.querySelector(".v911-page-actions");
    if (!actions || actions.querySelector("[data-v1001-action='characters']")) return;
    const button = document.createElement("button");
    button.className = "v911-header-theme v1001-character-menu-button";
    button.dataset.v1001Action = "characters";
    button.innerHTML = "<span>♙</span>Characters";
    actions.insertBefore(button, actions.firstChild);
  }

  function deleteOverridePath(path) {
    const parts = String(path || "").split(".").filter(Boolean);
    if (!parts.length) return;
    const parents = [];
    let current = draft.rulesProfile.overrides;
    for (const part of parts.slice(0, -1)) {
      if (!current?.[part] || typeof current[part] !== "object") return;
      parents.push([current, part]);
      current = current[part];
    }
    delete current[parts.at(-1)];
    for (const [parent, key] of parents.reverse()) {
      if (!Object.keys(parent[key] || {}).length) delete parent[key];
    }
  }

  function resetOverrideGroup(group) {
    readManualOverrides();
    const overrides = draft.rulesProfile.overrides;
    const raceKeys = ["size", "speed", "senses", "abilityBonuses", "languages", "skills", "armorProficiencies", "weaponProficiencies", "toolProficiencies", "addTraits", "removeTraits"];
    const classKeys = ["hitDie", "hp", "savingThrows", "classSkills", "classArmorProficiencies", "classWeaponProficiencies", "classToolProficiencies", "spellcasting", "addFeatures", "removeFeatures", "addResources", "removeResources"];
    for (const key of group === "race" ? raceKeys : classKeys) delete overrides[key];
    renderLauncher();
  }

  const legacySave = save;
  save = function saveWithLibrarySync() {
    stateApi.migrateCharacter(state);
    const result = legacySave();
    syncActiveMeta();
    return result;
  };

  const validation = rules.validateCatalog();
  if (!validation.valid) console.error("Character Hub rules catalog failed validation", validation.errors);
  stateApi.migrateCharacter(state);
  ensureLibrary();
  save();
  const observer = new MutationObserver(() => queueMicrotask(injectCharacterMenuButton));
  observer.observe(document.getElementById("v911App"), { childList: true, subtree: true });
  injectCharacterMenuButton();

  document.addEventListener("click", event => {
    const editCharacter = event.target.closest('[data-action="edit-character"]');
    if (editCharacter) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return openEditor();
    }
    const button = event.target.closest("[data-v1001-action]");
    if (!button) return;
    const action = button.dataset.v1001Action;
    if (action === "characters" || action === "start") return openLauncher("start");
    if (action === "load") return openLauncher("load");
    if (action === "new") { draft = defaultDraft(); currentView = "new"; return renderLauncher(); }
    if (action === "close") return closeLauncher();
    if (action === "activate") {
      const library = ensureLibrary();
      const record = library.records.find(item => item.id === button.dataset.id);
      if (record) return activateSnapshot(record, library);
    }
    if (action === "import") return document.getElementById("v1001Import")?.click();
    if (action === "previous") { readVisibleDraft(); draft.step = Math.max(1, draft.step - 1); return renderLauncher(); }
    if (action === "next") {
      const errors = stepErrors();
      if (errors.length) return showErrors(errors);
      draft.step = Math.min(BUILD_STEPS.length, draft.step + 1);
      return renderLauncher();
    }
    if (action === "create") return createOrUpdateCharacter();
    if (action === "reset-all-overrides") { draft.rulesProfile.overrides = {}; return renderLauncher(); }
    if (action === "reset-one-override") { readManualOverrides(); deleteOverridePath(button.dataset.path); return renderLauncher(); }
    if (action === "reset-override") return resetOverrideGroup(button.dataset.group);
  }, true);

  document.addEventListener("input", event => {
    if (event.target.id === "v1001Name") draft.name = event.target.value;
    if (event.target.matches("[data-v1001-base]")) {
      draft.build.baseAbilities[event.target.dataset.v1001Base] = Math.max(1, Math.min(20, Number(event.target.value) || 10));
    }
    if (event.target.matches("[data-v1001-choice-scope]")) readChoiceInputs();
  });

  document.addEventListener("change", async event => {
    if (event.target.id === "v1001Portrait" && event.target.files?.[0]) {
      try { draft.portraitImage = await compressPortrait(event.target.files[0]); renderLauncher(); }
      catch (error) { toast("That portrait could not be loaded"); }
      return;
    }
    if (event.target.id === "v1001Race") {
      draft.build.raceId = event.target.value;
      const race = rules.get("races", draft.build.raceId);
      draft.build.subraceId = race?.subraces?.[0]?.id || "";
      draft.build.raceChoices = {};
      return renderLauncher();
    }
    if (event.target.id === "v1001Subrace") { draft.build.subraceId = event.target.value; draft.build.raceChoices = {}; return renderLauncher(); }
    if (event.target.id === "v1001Class") {
      draft.build.classId = event.target.value;
      const classDefinition = rules.get("classes", draft.build.classId);
      draft.build.classChoices = {};
      draft.build.equipmentPackageId = classDefinition?.equipmentPackages?.[0]?.id || "";
      return renderLauncher();
    }
    if (event.target.name === "v1001Equipment") { draft.build.equipmentPackageId = event.target.value; return renderLauncher(); }
    if (event.target.name === "v1001RulesMode") { readManualOverrides(); draft.rulesProfile.mode = event.target.value === "manual" ? "manual" : "standard"; return renderLauncher(); }
    if (event.target.matches("[data-v1001-choice-scope]")) {
      readChoiceInputs();
      if (event.target.dataset.v1001ChoiceId === "class-skills" && rules.get("classes", draft.build.classId)?.choices?.some(choice => ["class-selected", "rogue-expertise"].includes(choice.options))) return renderLauncher();
    }
    if (event.target.id?.startsWith("v1001Manual") || event.target.matches("[data-v1001-manual-ability]")) {
      readManualOverrides();
      return renderLauncher();
    }
    if (event.target.id === "v1001Import" && event.target.files?.[0]) await importCharacter(event.target.files[0]);
  });

  hub.builder = { open: () => openLauncher("new"), edit: openEditor, validate: stateApi.validateBuild };
  openLauncher("start");
})(window);
