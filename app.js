(() => {
  const bootError = (message) => {
    if (typeof window.showBootError === "function") {
      window.showBootError(message);
      return;
    }
    throw new Error(message);
  };

  const app = window.RandomDateApp ?? {};
  const { RandomDate, fetchArticlesForDate, pickRandomArticle, languageConfig, resolveLanguage, translate } = app;

  if (!RandomDate || !fetchArticlesForDate || !pickRandomArticle || !languageConfig || !translate) {
    bootError("i18n.js, random-date.js and wikipedia.js did not load.");
    return;
  }

  const dateElement = document.querySelector("#date");
  const articleRegion = document.querySelector("#article");
  const statusElement = document.querySelector("#article-status");
  const linkElement = document.querySelector("#article-link");
  const badgeElement = document.querySelector("#article-badge");
  const snippetElement = document.querySelector("#article-snippet");
  const qualityNote = document.querySelector("#quality-note");
  const languageGroup = document.querySelector("#lang-group");
  const languageButtons = Array.from(document.querySelectorAll("[data-lang]"));
  const randomArticleButton = document.querySelector("#random-article");
  const newLinkButton = document.querySelector("#new-link");
  const randomDateButton = document.querySelector("#random-date");

  if (
    !dateElement ||
    !articleRegion ||
    !statusElement ||
    !linkElement ||
    !badgeElement ||
    !snippetElement ||
    !qualityNote ||
    !languageGroup ||
    languageButtons.length === 0 ||
    !randomArticleButton ||
    !newLinkButton ||
    !randomDateButton
  ) {
    bootError("The page is missing a required element.");
    return;
  }

  const STORAGE_KEY = "randomDate.language";
  const MAX_DATE_ATTEMPTS = 10;

  const readStoredLanguage = () => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? resolveLanguage(stored) : app.DEFAULT_LANGUAGE;
    } catch {
      return app.DEFAULT_LANGUAGE;
    }
  };

  const storeLanguage = (code) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      return;
    }
  };

  let language = readStoredLanguage();
  const randomDate = new RandomDate();
  let currentTitle = null;
  let inFlightRequest = null;

  function formatDisplayDate(date) {
    return new Intl.DateTimeFormat(languageConfig(language).locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  function renderDate(date) {
    dateElement.textContent = formatDisplayDate(date);
  }

  function setStatus(message) {
    statusElement.textContent = message;
  }

  function renderArticle({ title, url, snippet }) {
    currentTitle = title;
    linkElement.textContent = title;
    linkElement.href = url;
    linkElement.hidden = false;
    badgeElement.hidden = !languageConfig(language).qualityCategory;
    snippetElement.textContent = snippet;
    setStatus("");
  }

  function clearArticle(message) {
    currentTitle = null;
    linkElement.hidden = true;
    linkElement.removeAttribute("href");
    linkElement.textContent = "";
    badgeElement.hidden = true;
    snippetElement.textContent = "";
    setStatus(message);
  }

  function setBusy(isBusy) {
    randomArticleButton.disabled = isBusy;
    newLinkButton.disabled = isBusy;
    articleRegion.setAttribute("aria-busy", String(isBusy));
    randomArticleButton.textContent = translate(language, isBusy ? "finding" : "randomArticle");
  }

  function applyLanguage() {
    document.documentElement.lang = language;
    document.title = translate(language, "documentTitle");
    languageGroup.setAttribute("aria-label", translate(language, "language"));
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = translate(language, node.dataset.i18n);
    });
    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === language));
    });
    qualityNote.hidden = Boolean(languageConfig(language).qualityCategory);
    renderDate(randomDate.currentDate);
  }

  function cancelInFlight() {
    inFlightRequest?.abort();
    inFlightRequest = null;
    setBusy(false);
  }

  async function showArticle({ allowReroll }) {
    inFlightRequest?.abort();
    const controller = new AbortController();
    inFlightRequest = controller;

    const previousTitle = currentTitle;
    const hadArticle = Boolean(previousTitle);
    const maxAttempts = allowReroll ? MAX_DATE_ATTEMPTS : 1;

    setBusy(true);
    setStatus(
      translate(language, "looking", { date: formatDisplayDate(randomDate.currentDate) }),
    );

    try {
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const results = await fetchArticlesForDate(randomDate.currentDate, {
          language,
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        const article = pickRandomArticle(results, {
          excludeTitle: previousTitle,
          strictExclude: !allowReroll,
        });

        if (article) {
          renderArticle(article);
          return;
        }

        if (attempt < maxAttempts - 1) {
          renderDate(randomDate.randomize());
          setStatus(
            translate(language, "rerolling", { date: formatDisplayDate(randomDate.currentDate) }),
          );
        }
      }

      if (hadArticle && !allowReroll) {
        setStatus(translate(language, "onlyOne"));
      } else {
        clearArticle(translate(language, "gaveUp"));
      }
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }
      clearArticle(error.message);
    } finally {
      if (inFlightRequest === controller) {
        inFlightRequest = null;
        setBusy(false);
      }
    }
  }

  function showNewDate() {
    cancelInFlight();
    renderDate(randomDate.randomize());
    clearArticle(translate(language, "pickPrompt"));
  }

  function setLanguage(code) {
    const next = resolveLanguage(code);
    if (next === language) {
      return;
    }

    cancelInFlight();
    language = next;
    storeLanguage(next);
    applyLanguage();
    clearArticle(translate(language, "pickPrompt"));
  }

  randomArticleButton.addEventListener("click", () => {
    showArticle({ allowReroll: true });
  });

  newLinkButton.addEventListener("click", () => {
    showArticle({ allowReroll: false });
  });

  randomDateButton.addEventListener("click", () => {
    showNewDate();
  });

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.lang);
    });
  });

  applyLanguage();
  clearArticle(translate(language, "pickPrompt"));
})();
