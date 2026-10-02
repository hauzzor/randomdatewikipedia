(() => {
  const API_ENDPOINT = "https://en.wikipedia.org/w/api.php";
  const RESULTS_PER_REQUEST = 50;

  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" });

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

  function monthName(date) {
    return monthFormatter.format(date);
  }

  function dayPageTitle(date) {
    return `${monthName(date)} ${date.getDate()}`;
  }

  function articleUrl(title) {
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  }

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

  function dayPageFallback(date) {
    const title = dayPageTitle(date);

    return {
      title,
      url: articleUrl(title),
      snippet: `No article was indexed for ${monthName(date)} ${date.getFullYear()}, so here is the Wikipedia day page.`,
    };
  }

  async function fetchRandomArticleForDate(date, { excludeTitle, signal } = {}) {
    const phrase = `"${dayPageTitle(date)}, ${date.getFullYear()}"`;
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      list: "search",
      srsearch: phrase,
      srnamespace: "0",
      srlimit: String(RESULTS_PER_REQUEST),
      srprop: "snippet",
    });

    let payload;
    try {
      const response = await fetch(`${API_ENDPOINT}?${params}`, { signal });
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

    const results = (payload?.query?.search ?? []).filter(
      (result) => typeof result.title === "string" && result.title !== dayPageTitle(date),
    );
    const freshResults = results.filter((result) => result.title !== excludeTitle);
    const pool = freshResults.length > 0 ? freshResults : results;

    if (pool.length === 0) {
      return dayPageFallback(date);
    }

    const match = pool[Math.floor(Math.random() * pool.length)];

    return {
      title: match.title,
      url: articleUrl(match.title),
      snippet: toPlainText(match.snippet ?? ""),
    };
  }

  window.RandomDateApp = Object.assign(window.RandomDateApp ?? {}, {
    fetchRandomArticleForDate,
    articleUrl,
    monthName,
    dayPageTitle,
  });
})();
