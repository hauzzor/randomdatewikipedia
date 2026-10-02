(() => {
  const bootError = (message) => {
    if (typeof window.showBootError === "function") {
      window.showBootError(message);
      return;
    }
    throw new Error(message);
  };

  const { RandomDate, fetchRandomArticleForDate } = window.RandomDateApp ?? {};

  if (!RandomDate || !fetchRandomArticleForDate) {
    bootError("random-date.js and wikipedia.js did not load.");
    return;
  }

  const dateElement = document.querySelector("#date");
  const articleRegion = document.querySelector("#article");
  const statusElement = document.querySelector("#article-status");
  const linkElement = document.querySelector("#article-link");
  const snippetElement = document.querySelector("#article-snippet");
  const randomArticleButton = document.querySelector("#random-article");
  const newLinkButton = document.querySelector("#new-link");
  const randomDateButton = document.querySelector("#random-date");

  if (
    !dateElement ||
    !articleRegion ||
    !statusElement ||
    !linkElement ||
    !snippetElement ||
    !randomArticleButton ||
    !newLinkButton ||
    !randomDateButton
  ) {
    bootError("The page is missing a required element.");
    return;
  }

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const randomDate = new RandomDate();
  let currentTitle = null;
  let inFlightRequest = null;

  function renderDate(date) {
    dateElement.textContent = dateFormatter.format(date);
  }

  function setStatus(message) {
    statusElement.textContent = message;
  }

  function renderArticle({ title, url, snippet }) {
    currentTitle = title;
    linkElement.textContent = title;
    linkElement.href = url;
    linkElement.hidden = false;
    snippetElement.textContent = snippet;
    setStatus("");
  }

  function clearArticle(message) {
    currentTitle = null;
    linkElement.hidden = true;
    linkElement.removeAttribute("href");
    linkElement.textContent = "";
    snippetElement.textContent = "";
    setStatus(message);
  }

  function setBusy(isBusy) {
    randomArticleButton.disabled = isBusy;
    newLinkButton.disabled = isBusy;
    articleRegion.setAttribute("aria-busy", String(isBusy));
    randomArticleButton.textContent = isBusy ? "Finding an article…" : "Random article";
  }

  async function showArticle() {
    inFlightRequest?.abort();
    const controller = new AbortController();
    inFlightRequest = controller;

    const date = randomDate.currentDate;
    const previousTitle = currentTitle;
    setBusy(true);
    clearArticle(`Looking up articles from ${dateFormatter.format(date)}…`);

    try {
      const article = await fetchRandomArticleForDate(date, {
        excludeTitle: previousTitle,
        signal: controller.signal,
      });

      if (controller.signal.aborted) {
        return;
      }

      renderArticle(article);
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
    inFlightRequest?.abort();
    inFlightRequest = null;
    setBusy(false);
    renderDate(randomDate.randomize());
    clearArticle("Pick a random article for this date.");
  }

  randomArticleButton.addEventListener("click", () => {
    showArticle();
  });

  newLinkButton.addEventListener("click", () => {
    showArticle();
  });

  randomDateButton.addEventListener("click", () => {
    showNewDate();
  });

  renderDate(randomDate.currentDate);
  clearArticle("Pick a random article for this date.");
})();
