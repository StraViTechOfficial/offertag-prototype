# OfferTag design

The OfferTag design system and the clickable HTML prototype of the whole site (public and admin, phone and desktop). The prototype is the spec the website is ported from, pixel by pixel. Plain HTML, CSS and JS: no Node, no backend.

Sibling repos (same parent folder):
- `../offertag-website`: the Next.js site (`web/`) and the design decisions, rules and session notes (`docs/`, `STATUS.md`, `RESUME.md`). Its pixel check serves this repo's `prototype/` and compares every page against it, so keep the folder next to it.
- `../offertag-backend`: the API and the project home (`STATUS.md`, `RESUME.md`, open items, acceptance).

## Run the prototype

Needs Python 3.

```sh
cd prototype
python3 build/build.py   # rebuild the pages from build/*.template.html and build/*.json
python3 build/serve.py   # serves http://localhost:8090 (this PC only)
```

Environment variables: none.

## UAT playground (S25, D-152)

The prototype works as a small app for the client to try: add, edit and delete deals, posters, sponsored ads, pins, categories, blog posts and settings in the admin, and see them on the public site at once. Comments, reactions, reports and contact messages from the public pages reach the admin inbox.

- Sample data: `prototype/data/*.json` (deals, catalogue, home, blog, community), written by `build/build.py` from the same files the pages are built from.
- Changes: kept in the visitor's own browser (localStorage, keys starting `pg:`). Seed + changes is what every page shows. Other people, other browsers and other devices see the sample data only.
- Uploaded pictures are shrunk in the browser (600 px JPEG for deals) and kept with the data.
- Reset: Admin → sidebar → Playground → Reset, or add `?pg=reset` to any address.
- Code: `prototype/js/db.js` (data), `js/render.js` (public pages drawn from the data), `js/admin-db.js` (admin reads and saves). The page scripts wait for the data (`build/routes.py` marks them `type="ot/defer"`).
- Pages the playground creates (a new deal, category, store or blog post) have no built file: `build/serve.py`, `prototype/_redirects` (Netlify, Cloudflare Pages) and `404.html` (any other static host) serve a shell from `prototype/_shell/`.

To share it as a link: upload the `prototype/` folder (after `python3 build/build.py`) to Netlify or Cloudflare Pages. Any static host works; one with `_redirects` support gives new pages clean addresses.

## Folders

| Folder | Contents | State |
|---|---|---|
| `prototype/` | The HTML prototype: built pages at their real addresses, `css/`, `js/`, sample `assets/`, and the page builder in `build/` | In progress |
| `brand/` | `brand.md` (final), logo copy, theme comparison page, research mapping | Approved |
| `tokens/` | `tokens.css`, `tailwind.css`, README, preview | v0.1 |
| `ia/` | Sitemap, navigation, flows, routes, briefs, data sheets, the deal content contract | Delivered |
| `components/` | Component canvases (history; the prototype's CSS is the live source) | History |
| `screens/` | Per-screen specs | Delivered |

Decisions and rules: `../offertag-website/docs/` (`DECISIONS.md`, `RULES.md`). Anti-copy law (RULES Law 1) applies to every file here: nothing is derived from a competitor.

Posters, store logos and deal photos in the prototype are sample artwork until the owner supplies the real ones.
