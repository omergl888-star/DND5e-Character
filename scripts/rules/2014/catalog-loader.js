(function loadExpanded2014Catalog(global) {
  "use strict";

  const hub = global.CharacterHub;
  const rules = hub.rules;
  const generated = rules.generated2014 || {};
  const progressionCatalog = generated.progressionCatalog || { progressions: {}, subclasses: [] };

  const source = (name, url, type = "community-reference") => ({
    name: name || "Official 2014-compatible source",
    book: name || "Official 2014-compatible source",
    url,
    type
  });

  rules.progressions = progressionCatalog.progressions || {};
  rules.expandedSubclasses = progressionCatalog.subclasses || [];

  const array = value => Array.isArray(value) ? value : value == null || value === "" || value === "None" ? [] : [value];
  const choices = value => Array.isArray(value) ? value : value && typeof value === "object" && Object.keys(value).length ? [value] : [];
  const normalizeExpandedRace = race => ({
    ...race,
    abilityBonuses: {
      fixed: race.abilityBonuses?.fixed || {},
      choices: choices(race.abilityBonuses?.choices),
      patterns: array(race.abilityBonuses?.patterns)
    },
    languages: {
      fixed: array(race.languages?.fixed),
      choices: choices(race.languages?.choices)
    },
    proficiencies: {
      skills: { fixed: array(race.proficiencies?.skills?.fixed), choices: choices(race.proficiencies?.skills?.choices) },
      armor: array(race.proficiencies?.armor),
      weapons: array(race.proficiencies?.weapons),
      tools: { fixed: array(race.proficiencies?.tools?.fixed), choices: choices(race.proficiencies?.tools?.choices) }
    },
    traits: array(race.traits).map(item => ({ ...item, source: item.source || race.source })),
    subraces: array(race.subraces).map(subrace => ({ ...subrace, traits: array(subrace.traits).map(item => ({ ...item, source: item.source || race.source })) })),
    choices: choices(race.choices)
  });

  const expandedRaces = (generated.expandedRaces || []).map(normalizeExpandedRace);
  if (expandedRaces.length) {
    rules.upsert("races", expandedRaces);
    const racialFeatures = expandedRaces.flatMap(race => [
      ...(race.traits || []).map(item => ({ ...item, id: `race-${race.id}-${item.id}`, parentId: race.id, source: race.source })),
      ...(race.subraces || []).flatMap(subrace => (subrace.traits || []).map(item => ({ ...item, id: `race-${subrace.id}-${item.id}`, parentId: subrace.id, source: race.source })))
    ].map(item => ({ ...item, featureType: "racial", edition: "2014", status: "enabled" })));
    if (racialFeatures.length) rules.upsert("features", racialFeatures);
  }

  const subclassDefinitions = rules.expandedSubclasses.map(item => {
    const featureLevels = item.features.map(feature => Number(feature.level)).filter(level => level > 0);
    return {
      id: item.id,
      name: item.name,
      classId: item.classId,
      selectionLevel: featureLevels.length ? Math.min(...featureLevels) : 1,
      features: item.features.map(feature => ({
        ...feature,
        summary: `${feature.name} is unlocked by this subclass at level ${feature.level}. Use the linked source to verify its full table rule.`,
        edition: "2014",
        status: "enabled",
        source: source(item.source, item.communityUrl)
      })),
      edition: "2014",
      source: source(item.source, item.communityUrl),
      links: { community: item.communityUrl },
      status: "enabled"
    };
  });
  rules.remove("subclasses", "ranger-hunter");
  rules.remove("subclasses", "warlock-the-fiend");
  if (subclassDefinitions.length) rules.upsert("subclasses", subclassDefinitions);

  const spellDefinitions = (generated.spells || []).map(item => ({
    ...item,
    name: String(item.name || "").replace(/^`+/, ""),
    edition: "2014",
    source: source("Community spell index for 2014 rules", item.communityUrl),
    links: { community: item.communityUrl },
    status: "enabled"
  }));
  if (spellDefinitions.length) rules.upsert("spells", spellDefinitions);

  const backgroundFeatureFallbacks = {
    "athlete": "Echoes of Victory", "fisher": "Harvest the Water", "guild-artisan": "Guild Membership", "guild-merchant": "Guild Membership",
    "shipwright": "I'll Patch It!", "smuggler": "Down Low", "celebrity-adventurer-s-scion": "Name Dropping", "failed-merchant": "Supply Chain",
    "gambler": "Never Tell Me the Odds", "plaintiff": "Legalese", "rival-intern": "Inside Informant"
  };
  const backgroundDefinitions = (generated.backgrounds || []).map(item => {
    const communityUrl = item.id === "guild-merchant" ? "https://dnd5e.wikidot.com/background:guild-artisan" : item.communityUrl;
    const fallbackName = backgroundFeatureFallbacks[item.id];
    const feature = item.feature || (fallbackName ? { id: fallbackName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), name: fallbackName } : null);
    return {
    ...item,
    feature,
    communityUrl,
    edition: "2014",
    source: source(item.source, communityUrl),
    links: { community: communityUrl },
    status: item.requiresFeat || item.id === "dissenter" || !(item.skills?.fixed?.length || item.skills?.choices?.length) || !feature ? "coverage" : "enabled"
  };
  });
  if (backgroundDefinitions.length) rules.upsert("backgrounds", backgroundDefinitions);

  rules.sourceLinks = definition => {
    const links = [];
    const officialUrl = definition?.links?.official || definition?.source?.officialUrl;
    const communityUrl = definition?.links?.community || (definition?.source?.type === "community-reference" ? definition.source.url : "");
    if (officialUrl) links.push({ label: "Official Source", kind: "official", url: officialUrl });
    if (communityUrl) links.push({ label: "Community Reference", kind: "community", url: communityUrl });
    if (!links.length && definition?.source?.url) links.push({ label: "Official Source", kind: "official", url: definition.source.url });
    return links;
  };
})(window);
