# Character Hub

Character Hub is an offline-first D&D 5e character manager with a local character library, combat and inventory tools, and a guided 2014 SRD character builder.

## Run locally

Open `index.html` directly in a modern desktop browser. No installation, server, package manager, or internet connection is required.

The existing localStorage keys are preserved:

- `characterHubState`
- `characterHubCharacterLibraryV1001`
- `characterHubActiveCharacterV1001`
- `characterHubTheme`

Existing characters are migrated in place with a default 2014 rules profile. Import and export continue to use JSON character files.

## Character Builder

The seven-step builder covers identity, Ability Scores, race/subrace, racial choices, class choices, starting equipment and Review. It enables the nine SRD race families (and their SRD subraces) plus all twelve SRD classes.

Every new character stores calculated rules separately from optional manual overrides:

```js
rulesProfile: {
  edition: "2014",
  mode: "standard",
  catalogVersion: 1,
  overrides: {}
}
```

Incomplete content is kept only in `data/coverage/catalog-coverage.json`; the Builder never displays coverage-only records.

## Standalone build

Run `build.cmd`. It creates `dist/index.html`, a single offline HTML file containing all CSS, JavaScript and image assets. The generated `dist` folder is ignored by Git.

## Project layout

- `index.html` — screen markup, theme boot, and ordered asset references.
- `assets/art` — extracted application artwork.
- `styles` — foundations, game UI, rules builder, and launcher styles.
- `scripts/core` — namespace and compatibility runtime.
- `scripts/state` — storage helpers and character/rules migrations.
- `scripts/rules` — schemas, registry, and normalized SRD 5.1 catalogs.
- `scripts/features` — the existing game workspace UI.
- `scripts/ui` — character library and Builder.
- `data/coverage` — names, IDs and missing-field tracking only.
- `tools` — coverage import and standalone build scripts.

See `THIRD_PARTY_NOTICES.md` for SRD attribution and `docs/rules-catalog.md` for the catalog policy.
