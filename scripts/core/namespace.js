(function initializeCharacterHub(global) {
  "use strict";

  const hub = global.CharacterHub = global.CharacterHub || {};
  hub.version = "11.1.0";
  hub.catalogVersion = 2;
  hub.constants = Object.freeze({
    abilities: ["STR", "DEX", "CON", "INT", "WIS", "CHA"],
    abilityNames: {
      STR: "Strength", DEX: "Dexterity", CON: "Constitution",
      INT: "Intelligence", WIS: "Wisdom", CHA: "Charisma"
    },
    skills: [
      ["acrobatics", "Acrobatics"], ["animalHandling", "Animal Handling"],
      ["arcana", "Arcana"], ["athletics", "Athletics"], ["deception", "Deception"],
      ["history", "History"], ["insight", "Insight"], ["intimidation", "Intimidation"],
      ["investigation", "Investigation"], ["medicine", "Medicine"], ["nature", "Nature"],
      ["perception", "Perception"], ["performance", "Performance"],
      ["persuasion", "Persuasion"], ["religion", "Religion"],
      ["sleightOfHand", "Sleight of Hand"], ["stealth", "Stealth"], ["survival", "Survival"]
    ],
    languages: [
      "Common", "Dwarvish", "Elvish", "Giant", "Gnomish", "Goblin", "Halfling", "Orc",
      "Abyssal", "Celestial", "Draconic", "Deep Speech", "Infernal", "Primordial", "Sylvan",
      "Undercommon"
    ]
  });

  hub.util = Object.assign(hub.util || {}, {
    clone(value) {
      return typeof structuredClone === "function"
        ? structuredClone(value)
        : JSON.parse(JSON.stringify(value));
    },
    escapeHtml(value) {
      return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
      })[character]);
    },
    slug(value) {
      return String(value || "item").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }
  });
})(window);
