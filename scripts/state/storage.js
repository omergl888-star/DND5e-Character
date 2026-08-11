(function initializeStorage(global) {
  "use strict";

  const hub = global.CharacterHub = global.CharacterHub || {};
  hub.storage = Object.assign(hub.storage || {}, {
    keys: Object.freeze({
      character: "characterHubState",
      library: "characterHubCharacterLibraryV1001",
      activeCharacter: "characterHubActiveCharacterV1001",
      theme: "characterHubTheme"
    }),
    get(key, fallback = null) {
      try {
        const value = localStorage.getItem(key);
        return value == null ? fallback : value;
      } catch (error) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        return false;
      }
    },
    readJson(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value == null ? fallback : JSON.parse(value);
      } catch (error) {
        return fallback;
      }
    },
    writeJson(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        return false;
      }
    }
  });
})(window);
