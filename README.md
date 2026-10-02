# Random Date — Browser App

A browser app that shows a random date from the last century. Select **Random article** to get a Wikipedia article linked to that date, and **New link** to swap in a different article for the same date. **New random date** draws a new date and clears the current link.

Articles are never fetched ahead of time: the page only picks a date on load, and each click queries the Wikipedia API and picks one of the returned articles at random.

## Run locally

Open `index.html` in a browser — double-clicking the file works, no server needed.

If you prefer a local server, start Python's built-in one from this folder:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000>. Keep the server running while you use the app; press `Ctrl+C` in the terminal to stop it.

## Deploy

The app is published with GitHub Pages, serving the repository root as the site root:

1. Create an empty **public** repository (Pages on the free plan requires a public repo).
2. Push these files to the `main` branch.
3. In the repo, go to **Settings → Pages**, set **Source** to *Deploy from a branch*, branch `main`, folder `/ (root)`, and save.

The live site is then served from `https://<user>.github.io/<repo>/`. Nothing else is required — there is no build step, and Wikipedia is called directly from the browser.

## How it works

`random-date.js` holds the `RandomDate` class, which produces a date between now and exactly 100 years ago. `wikipedia.js` queries the MediaWiki search API for the phrase `"March 14, 1927"` (matching articles that mention that exact date), then picks one result at random. If a date has no indexed articles, it falls back to the Wikipedia day page for that month and day. Requests are cancelled when a newer click supersedes them, and in-flight requests are aborted if the date changes.

`app.js` connects the UI to both modules and is loaded last; all three scripts are plain `<script defer>` tags sharing a `window.RandomDateApp` namespace, which keeps the page working when it is opened directly from disk. The UI is in `index.html` and `styles.css`. No packages or build step are required.
