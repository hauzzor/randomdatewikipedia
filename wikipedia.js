(() => {
  const { languageConfig } = window.RandomDateApp ?? {};

  const RESULTS_PER_REQUEST = 50;

  const NAMED_ENTITIES = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    hellip: "…",
  };

  function decodeEntities(value) {
    return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code) => {
      if (code[0] === "#") {
        const isHex = code[1] === "x" || code[1] === "X";
        const value = Number.parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10);
        if (Number.isNaN(value) || value > 0x10ffff) {
          return match;
        }
        return String.fromCodePoint(value);
      }

      return NAMED_ENTITIES[code.toLowerCase()] ?? match;
    });
  }

  function toPlainText(html) {
    return decodeEntities(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
  }

  function formatDatePhrase(date, locale) {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  function dayPageTitle(date, locale) {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(date);
  }

  function articleUrl(wiki, title) {
    return `https://${wiki}/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  }

  async function fetchArticlesForDate(date, { language = "en", signal } = {}) {
    const config = languageConfig(language);
    const phrase = `"${formatDatePhrase(date, config.locale)}"`;
    const filters = config.qualityCategory ? [`incategory:"${config.qualityCategory}"`] : [];
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      list: "search",
      srsearch: [phrase, ...filters].join(" "),
      srnamespace: "0",
      srlimit: String(RESULTS_PER_REQUEST),
      srprop: "snippet",
    });

    let payload;
    try {
      const response = await fetch(`https://${config.wiki}/w/api.php?${params}`, { signal });
      if (!response.ok) {
        throw new Error(`Wikipedia responded with ${response.status}.`);
      }
      payload = await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        throw error;
      }
      throw new Error("Could not reach Wikipedia. Check your connection and try again.", { cause: error });
    }

    const dayPage = dayPageTitle(date, config.locale);

    return (payload?.query?.search ?? [])
      .filter((result) => typeof result.title === "string" && result.title !== dayPage)
      .map((result) => ({
        title: result.title,
        url: articleUrl(config.wiki, result.title),
        snippet: toPlainText(result.snippet ?? ""),
      }));
  }

  function pickRandomArticle(results, { excludeTitle = null, strictExclude = false } = {}) {
    const fresh = excludeTitle ? results.filter((result) => result.title !== excludeTitle) : results;
    const pool = strictExclude ? fresh : fresh.length > 0 ? fresh : results;

    if (pool.length === 0) {
      return null;
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  window.RandomDateApp = Object.assign(window.RandomDateApp ?? {}, {
    fetchArticlesForDate,
    pickRandomArticle,
    articleUrl,
    formatDatePhrase,
    dayPageTitle,
  });
})();
