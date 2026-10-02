(() => {
  const LANGUAGES = {
    en: {
      code: "en",
      wiki: "en.wikipedia.org",
      locale: "en-US",
      qualityCategory: "Featured articles",
      label: "English",
    },
    de: {
      code: "de",
      wiki: "de.wikipedia.org",
      locale: "de-DE",
      qualityCategory: null,
      label: "Deutsch",
    },
  };

  const DEFAULT_LANGUAGE = "en";

  const STRINGS = {
    en: {
      documentTitle: "Random Date",
      language: "Language",
      eyebrow: "RANDOM HISTORY",
      title: "Random Date",
      randomArticle: "Random article",
      newLink: "New link",
      newDate: "New random date",
      finding: "Finding an article…",
      pickPrompt: "Pick a random article for this date.",
      looking: "Looking for articles from {date}…",
      rerolling: "No article found for {date} — trying another date…",
      onlyOne: "This date has only one matching article.",
      gaveUp: "Could not find a matching article. Try another date.",
      qualityOff:
        "German Wikipedia does not mark excellent articles in a searchable way, so quality filtering is off.",
      excellent: "Excellent",
      loadFailed: "The app could not start. Press Ctrl+Shift+R to force a fresh reload.",
    },
    de: {
      documentTitle: "Zufälliges Datum",
      language: "Sprache",
      eyebrow: "ZUFÄLLIGE GESCHICHTE",
      title: "Zufälliges Datum",
      randomArticle: "Zufälliger Artikel",
      newLink: "Neuer Link",
      newDate: "Neues Zufallsdatum",
      finding: "Artikel wird gesucht…",
      pickPrompt: "Wähle einen zufälligen Artikel für dieses Datum.",
      looking: "Suche Artikel vom {date}…",
      rerolling: "Kein Artikel vom {date} gefunden — ein anderes Datum wird gesucht…",
      onlyOne: "Für dieses Datum gibt es nur einen passenden Artikel.",
      gaveUp: "Es wurde kein passender Artikel gefunden. Versuche ein anderes Datum.",
      qualityOff:
        "Die deutsche Wikipedia kennzeichnet ausgezeichnete Artikel nicht in einer durchsuchbaren Weise, daher ist die Qualitätsfilterung deaktiviert.",
      excellent: "Ausgezeichnet",
      loadFailed: "Die App konnte nicht starten. Drücke Strg+Umschalt+R für eine Neu laden.",
    },
  };

  function resolveLanguage(code) {
    return Object.prototype.hasOwnProperty.call(LANGUAGES, code) ? code : DEFAULT_LANGUAGE;
  }

  function languageConfig(code) {
    return LANGUAGES[resolveLanguage(code)];
  }

  function translate(code, key, values = {}) {
    const table = STRINGS[resolveLanguage(code)];
    const template = Object.prototype.hasOwnProperty.call(table, key) ? table[key] : key;

    return template.replace(/\{(\w+)\}/g, (match, name) =>
      Object.prototype.hasOwnProperty.call(values, name) ? values[name] : match,
    );
  }

  window.RandomDateApp = Object.assign(window.RandomDateApp ?? {}, {
    LANGUAGES,
    DEFAULT_LANGUAGE,
    resolveLanguage,
    languageConfig,
    translate,
  });
})();
