# Normalized definition schemas

All runtime definitions live under `window.CharacterHub.rules.catalog`.

Common fields:

```js
{
  id: "stable-kebab-case-id",
  name: "Display name",
  edition: "2014",
  source: { name: "SRD 5.1 (Creative Commons)", url: "https://…" },
  status: "coverage" | "verified" | "enabled"
}
```

`RaceDefinition` adds Ability Score bonuses and choices, size, movement, senses, languages, proficiencies, traits, custom choices and optional subraces.

`ClassDefinition` adds Hit Die, saving throws, armor/weapon/tool/skill proficiencies, level 1 features, equipment packages, spellcasting metadata and the SRD subclass selection point.

`FeatureDefinition`, `SubclassDefinition`, and `SpellDefinition` use the common identity/source fields. Coverage-only spell records deliberately contain only identity and missing-field metadata; they are not registered as enabled spells.

Characters store selections in `characterBuild` and rule policy in `rulesProfile`. Resolvers calculate race/class results without mutating the catalog. Manual overrides are read only when `rulesProfile.mode === "manual"`.
