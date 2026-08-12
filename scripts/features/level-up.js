(function initializeLevelUpWizard(global) {
  "use strict";

  const hub = global.CharacterHub;
  const engine = hub.rules.progressionEngine;
  const { escapeHtml: esc } = hub.util;
  const modal = document.getElementById("levelModal");
  let activePlan = null;

  const signed = value => Number(value) >= 0 ? `+${Number(value)}` : String(Number(value));
  const sourceLink = source => {
    if (!source?.url) return "";
    const community = source.type === "community-reference";
    return `<a class="v111-source ${community ? "community" : "official"}" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${community ? "Community Reference" : "Official Source"} ↗</a>`;
  };
  const choiceSourceLink = option => {
    const url = option?.links?.official || option?.links?.community || option?.source?.url || "";
    if (!url) return "";
    const official = Boolean(option?.links?.official) || option?.source?.type !== "community-reference";
    return `<a class="v111-source ${official ? "official" : "community"}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${official ? "Official Source" : "Community Reference"} ↗</a>`;
  };
  const groupByLevel = options => options.reduce((groups, option) => {
    const key = Number(option.level) ? `Level ${option.level}` : "Cantrips";
    (groups[key] ||= []).push(option);
    return groups;
  }, {});

  function automaticHtml(plan) {
    const changes = plan.automaticChanges.length ? plan.automaticChanges.map(change => `
      <li><span><b>${esc(change.label)}</b><small>${sourceLink(change.source)}</small></span><strong>${esc(change.before)} <i>→</i> ${esc(change.after)}</strong></li>`).join("") : `<li><span><b>No numerical changes</b><small>New features are listed below.</small></span><strong>Verified</strong></li>`;
    const grants = plan.grants.length ? `<div class="v111-grants"><h3>Features unlocked automatically</h3>${plan.grants.map(grant => `<article><div><b>${esc(grant.name)}</b><p>${esc(grant.summary)}</p></div>${sourceLink(grant.source)}</article>`).join("")}</div>` : "";
    return `<section class="v111-level-card"><div class="v111-card-head"><span>1</span><div><small>AUTOMATIC UPDATES</small><h3>What changes at Level ${plan.toLevel}</h3></div></div><ul class="v111-change-list">${changes}</ul>${grants}</section>`;
  }

  function spellChoiceHtml(choice) {
    const groups = groupByLevel(choice.options);
    return `<section class="v111-choice-block" data-choice-id="${esc(choice.id)}"><div class="v111-choice-title"><div><b>${esc(choice.label)}</b><small>Choose exactly ${choice.count}. Selected: <span data-v111-count="${esc(choice.id)}">0</span>/${choice.count}</small></div></div><input class="v111-choice-search" data-v111-spell-search="${esc(choice.id)}" type="search" placeholder="Search spells…">` +
      `<div class="v111-spell-options">${Object.entries(groups).map(([group, options]) => `<div class="v111-spell-group"><h4>${esc(group)}</h4>${options.map(option => `<label data-v111-spell-row="${esc(choice.id)}" data-search="${esc(option.label.toLowerCase())}"><input type="checkbox" data-v111-list="${esc(choice.id)}" value="${esc(option.id)}"><span><b>${esc(option.label)}</b>${choiceSourceLink(option)}</span></label>`).join("")}</div>`).join("")}</div></section>`;
  }

  function listChoiceHtml(choice) {
    return `<section class="v111-choice-block"><div class="v111-choice-title"><div><b>${esc(choice.label)}</b><small>Choose exactly ${choice.count}. Selected: <span data-v111-count="${esc(choice.id)}">0</span>/${choice.count}</small></div></div><div class="v111-list-options">${choice.options.map(option => `<label><input type="checkbox" data-v111-list="${esc(choice.id)}" value="${esc(option.id)}"><span>${esc(option.label)}</span></label>`).join("")}</div></section>`;
  }

  function choiceHtml(choice) {
    if (choice.type === "hp") return "";
    if (choice.type === "subclass") return `<section class="v111-choice-block"><label><b>${esc(choice.label)}</b><select id="v111Subclass"><option value="">Choose…</option>${choice.options.map(option => `<option value="${esc(option.id)}">${esc(option.label)} · ${esc(option.source?.book || option.source?.name || "2014 source")}</option>`).join("")}</select></label><div class="v111-option-sources">${choice.options.map(choiceSourceLink).filter(Boolean).slice(0, 2).join("")}</div></section>`;
    if (choice.type === "asi") return `<section class="v111-choice-block v111-asi"><div class="v111-choice-title"><div><b>Ability Score Improvement</b><small>Feats are intentionally deferred. Scores cannot exceed 20.</small></div></div><div class="v111-asi-mode"><label><input type="radio" name="v111AsiMode" value="single" checked><span>One score +2</span></label><label><input type="radio" name="v111AsiMode" value="split"><span>Two different scores +1</span></label></div><div class="v111-asi-fields"><label>First score<select id="v111AsiPrimary">${hub.constants.abilities.map(key => `<option value="${key}">${hub.constants.abilityNames[key]} (${key}) · Current ${state.abilities[key][0]}</option>`).join("")}</select></label><label id="v111AsiSecondaryWrap" hidden>Second score<select id="v111AsiSecondary">${hub.constants.abilities.map(key => `<option value="${key}">${hub.constants.abilityNames[key]} (${key}) · Current ${state.abilities[key][0]}</option>`).join("")}</select></label></div></section>`;
    if (choice.type === "optional-feature") return `<section class="v111-choice-block optional"><label><input type="checkbox" data-v111-optional value="${esc(choice.id)}"><span><b>Add optional feature: ${esc(choice.label)}</b><small>This official optional rule is not applied unless selected.</small></span></label>${sourceLink(choice.source)}</section>`;
    if (choice.type === "spells") return spellChoiceHtml(choice);
    if (["skills", "feature-options"].includes(choice.type)) return `${listChoiceHtml(choice)}${sourceLink(choice.source)}`;
    return "";
  }

  function wizardHtml(plan) {
    const con = Number(state.abilities?.CON?.[1] || 0);
    const traitBonus = engine.hpPerLevelBonus(state);
    return `<section aria-modal="true" aria-labelledby="v111LevelTitle" class="modal v111-level-modal" role="dialog">
      <header class="v111-level-hero"><div><small>2014 RULES · ${esc(plan.classDefinition.name.toUpperCase())}</small><h2 id="v111LevelTitle">Congratulations — Level ${plan.toLevel}</h2><p>Review every automatic update and complete only the choices required at this level.</p></div><button class="close" data-v111-close aria-label="Close">×</button></header>
      <div class="v111-level-body">${automaticHtml(plan)}
        <section class="v111-level-card"><div class="v111-card-head"><span>2</span><div><small>HIT POINTS</small><h3>Enter your physical Hit Die roll</h3></div></div><div class="v111-hp-row"><label>Roll one d${plan.classDefinition.hitDie}<input id="v111HpRoll" type="number" inputmode="numeric" min="1" max="${plan.classDefinition.hitDie}" placeholder="1–${plan.classDefinition.hitDie}"></label><div class="v111-hp-preview"><small>HP gained</small><b id="v111HpGain">Roll + CON (${signed(con)})${traitBonus ? ` + Traits (+${traitBonus})` : ""}</b></div></div></section>
        ${plan.choices.some(choice => choice.type !== "hp") ? `<section class="v111-level-card"><div class="v111-card-head"><span>3</span><div><small>YOUR CHOICES</small><h3>Complete the decisions for this level</h3></div></div><div class="v111-choice-stack">${plan.choices.map(choiceHtml).join("")}</div></section>` : ""}
        <div class="v111-errors" id="v111Errors" hidden></div>
      </div>
      <footer class="v111-level-actions"><button class="v111-secondary" data-v111-close>Cancel</button><div><span>Nothing changes until you confirm.</span><button class="v111-primary" id="v111Confirm">Apply Level ${plan.toLevel}</button></div></footer>
    </section>`;
  }

  function collect() {
    const values = {
      hpRoll: document.getElementById("v111HpRoll")?.value,
      subclassId: document.getElementById("v111Subclass")?.value || "",
      asiMode: document.querySelector('input[name="v111AsiMode"]:checked')?.value || "single",
      asiPrimary: document.getElementById("v111AsiPrimary")?.value || "",
      asiSecondary: document.getElementById("v111AsiSecondary")?.value || "",
      optionalFeatures: [...document.querySelectorAll("[data-v111-optional]:checked")].map(input => input.value)
    };
    document.querySelectorAll("[data-v111-list]").forEach(input => {
      const id = input.dataset.v111List;
      values[id] ||= [];
      if (input.checked) values[id].push(input.value);
    });
    return values;
  }

  function showErrors(errors) {
    const target = document.getElementById("v111Errors");
    if (!target) return;
    target.hidden = !errors.length;
    target.innerHTML = errors.map(error => `<div>${esc(error)}</div>`).join("");
    if (errors.length) target.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function refreshCounts() {
    for (const output of document.querySelectorAll("[data-v111-count]")) output.textContent = String(document.querySelectorAll(`[data-v111-list="${CSS.escape(output.dataset.v111Count)}"]:checked`).length);
  }

  function successHtml(history) {
    const changes = history.automaticChanges.map(change => `<li><span>${esc(change.label)}</span><b>${esc(change.before)} → ${esc(change.after)}</b></li>`).join("");
    const grants = history.grants.map(grant => `<li><span>${esc(grant.name)}</span><b>${esc(grant.kind)}</b></li>`).join("");
    const choices = history.choices.map(choice => `<li><span>${esc(choice.label)}</span><b>${esc(choice.value)}</b></li>`).join("");
    return `<section aria-modal="true" class="modal v111-level-modal success" role="dialog"><div class="v111-success-mark">✓</div><h2>Level ${history.toLevel} applied successfully</h2><p>${esc(state.name)} has been updated. This summary is saved separately from Notes in Level History.</p><div class="v111-success-summary"><div><small>HP</small><b>+${history.hpGain}</b><span>Roll ${history.hpRoll} + CON${history.hpTraitBonus ? ` + trait bonus ${history.hpTraitBonus}` : ""}</span></div><div><small>LEVEL</small><b>${history.fromLevel} → ${history.toLevel}</b><span>All rules saved</span></div></div><ul class="v111-success-list">${changes}${grants}${choices}</ul><div class="v111-level-actions"><button class="v111-secondary" data-v111-close>Close</button><button class="v111-primary" data-v111-history>View Level History</button></div></section>`;
  }

  function openLevelWizard() {
    activePlan = engine.plan(state);
    if (activePlan.error) return toast(activePlan.error);
    modal.innerHTML = wizardHtml(activePlan);
    openEl("levelModal");
    document.getElementById("v111HpRoll")?.focus();
  }

  modal.addEventListener("input", event => {
    if (event.target.id === "v111HpRoll") {
      const roll = Number(event.target.value);
      const con = Number(state.abilities?.CON?.[1] || 0);
      const traitBonus = engine.hpPerLevelBonus(state);
      document.getElementById("v111HpGain").textContent = roll >= 1 ? `${roll} + CON (${signed(con)})${traitBonus ? ` + Traits (${signed(traitBonus)})` : ""} = ${Math.max(1, roll + con) + traitBonus} HP` : `Roll + CON (${signed(con)})${traitBonus ? ` + Traits (${signed(traitBonus)})` : ""}`;
    }
    if (event.target.matches('[name="v111AsiMode"]')) document.getElementById("v111AsiSecondaryWrap").hidden = event.target.value === "single";
    if (event.target.matches("[data-v111-spell-search]")) {
      const id = event.target.dataset.v111SpellSearch;
      const query = event.target.value.trim().toLowerCase();
      document.querySelectorAll(`[data-v111-spell-row="${CSS.escape(id)}"]`).forEach(row => row.hidden = Boolean(query) && !row.dataset.search.includes(query));
    }
    refreshCounts();
  });
  modal.addEventListener("change", refreshCounts);
  modal.addEventListener("click", event => {
    if (event.target.closest("[data-v111-close]")) { closeEl("levelModal"); return; }
    if (event.target.closest("[data-v111-history]")) {
      closeEl("levelModal");
      localStorage.setItem("characterHubV911Page", "more");
      global.dispatchEvent(new CustomEvent("characterhub:open-level-history"));
      if (typeof navigateToPage === "function") navigateToPage("more");
      return;
    }
    if (!event.target.closest("#v111Confirm") || !activePlan) return;
    const selections = collect();
    const errors = engine.validate(activePlan, selections, state);
    if (errors.length) return showErrors(errors);
    try {
      const history = engine.apply(state, activePlan, selections);
      save();
      render();
      modal.innerHTML = successHtml(history);
      toast(`Advanced to level ${history.toLevel}`);
    } catch (error) {
      showErrors(String(error.message || error).split("\n"));
    }
  });

  global.openLevel = openLevelWizard;
  hub.levelUp = { open: openLevelWizard, plan: () => engine.plan(state) };
})(window);
