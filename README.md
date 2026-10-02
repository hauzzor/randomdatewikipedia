# Random Date — Browser App

A browser app that shows a random date from the last century, then finds a Wikipedia article linked to that date.

## What it does

- **Random date** within the last 100 years, shown on load with no network requests at all.
- **Random article** — searches the language's Wikipedia for articles that mention the displayed date and picks one at random.
- **New link** — a different article for the *same* date. If that date only has one match, it says so and keeps the current link rather than silently repeating it.
- **New random date** — draws a new date and clears the link.

## Language

Use the **Language** switch at the top to choose English or Deutsch. The choice is remembered in `localStorage`, and switching does not fetch anything — articles appear on the next search.

The selected language changes three things:

1. **Which Wikipedia is queried** — `en.wikipedia.org` or `de.wikipedia.org`, and the article link points at that same wiki.
2. **The search phrase**, because dates are written differently. English searches `"March 14, 1927"`, German searches `"14. März 1927"`. The phrase is built with `Intl.DateTimeFormat` in the target locale, so no date format is hardcoded.
3. **The interface text** — headings, buttons and status messages are translated.

## Excellent articles only (English only)

For English, searches are restricted to featured articles by adding `incategory:"Featured articles"` to the query, and matching results get an "Excellent" badge. Roughly 7 in 10 random dates have at least one featured article mentioning them.

German Wikipedia has no equivalent: it does not mark excellent articles in a way that can be searched. Its featured articles ("Hauptauswahlartikel") exist only as pages in the `Wikipedia:` namespace, about one per week, so they almost never line up with a random date. Rather than guess, the app applies no quality filter in German and shows a note explaining why. If German Wikipedia ever gains a searchable marker, add `qualityCategory` for `de` in `i18n.js` and the filter switches on by itself.

## When a date has no matching article

For **Random article** the app quietly moves on: it draws up to 10 new dates, updating the date on screen as it goes, until it finds one. If all 10 fail it says so instead of showing something unrelated.

## Run locally

Open `index.html` in a browser — double-clicking the file works, no server needed.

If you prefer a local server, start Python's built-in one from this folder:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000>. Press `Ctrl+C` in the terminal to stop it.

## Deploy

The app is published with GitHub Pages, serving the repository root as the site root:

1. Create an empty **public** repository (Pages on the free plan requires a public repo).
2. Push these files to the `main` branch.
3. In the repo, go to **Settings → Pages**, set **Source** to *Deploy from a branch*, branch `main`, folder `/ (root)`, and save.

Every push to `main` redeploys the site automatically; GitHub runs an internal Pages build for the new commit, which usually finishes in a minute or two. No workflow file is needed in this repo.

## Files

`i18n.js` holds the per-language config (wiki host, locale, quality category) and every translated string. `random-date.js` produces a date between now and exactly 100 years ago. `wikipedia.js` builds the search phrase, queries the right wiki, strips snippets to plain text, and picks a random result. `app.js` wires it to the UI. The markup and styles are in `index.html` and `styles.css`. No packages or build step are required.

All scripts are plain `<script defer>` tags sharing a `window.RandomDateApp` namespace, so the page also works when opened directly from disk.
