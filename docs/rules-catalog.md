# Rules catalog

## Status policy

Every normalized definition has an `edition`, `source`, and `status`.

- `coverage` means the name is known but required mechanics or source verification are missing. It is never shown in the Builder.
- `verified` means the source and fields were checked, but the record is not yet available to players.
- `enabled` means the record passed the catalog validator and can appear in the Builder.

The runtime registry rejects duplicate IDs, invalid statuses, missing sources, and incomplete enabled race/class records.

## Enabled 2014 content

The initial enabled catalog uses the official SRD 5.1:

- Race families: Dwarf, Elf, Halfling, Human, Dragonborn, Gnome, Half-Elf, Half-Orc and Tiefling.
- SRD subraces: Hill Dwarf, High Elf, Lightfoot Halfling and Rock Gnome.
- Classes: Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock and Wizard.
- SRD subclass paths: Berserker, Lore, Life, Land, Champion, Open Hand, Devotion, Hunter, Thief, Draconic Bloodline, Fiend and Evocation.

The Builder supplies level 1 mechanics, required race/class choices, starting-equipment packages, spellcasting capacity, and the future subclass selection level. Individual spell choices remain disabled until spell sources, class lists, and complete casting/upcasting rules are verified.

## Coverage import

`tools/import-coverage.ps1` reads the four user-supplied reference files without importing their descriptions or mechanical prose. The generated coverage file contains 46 race names, 12 class names, 522 spell names, 146 class/feat feature entries, 168 racial-trait entries, 77 feat names, 39 rule headings and 18 language names. Every record includes an explicit missing-field list.

Content such as Circle of the Moon and Gloom Stalker remains coverage-only. The enabled SRD paths are Circle of the Land and Hunter.
