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

### Hosting the UAT link (D-153)

The deployable copy lives in the private repo `git@github.com:StraViTechOfficial/offertag-prototype.git`: the built `prototype/` folder as the repo root, without `build/` and the internal review sheets. Connect it to Cloudflare Pages or Netlify with no build command and `/` as the output folder. To update it: `python3 build/build.py`, then copy the built files over that repo and push.

- Not indexed: every page carries `noindex, nofollow`; `robots.txt` blocks all crawlers; `_headers` sends `X-Robots-Tag: noindex` on every response.
- No CDN at runtime: Lucide 0.468.0, Embla 8.3.0, emoji-picker-element 1.29.1 (with its emoji data) and the Geist font are served from `prototype/vendor/`. `build/routes.py` swaps the CDN addresses in the templates for these at build time.
- `_headers` also marks `/data`, `/js` and `/css` `no-cache`, so a redeploy reaches people at once; a visitor's own changes survive a redeploy (they are merged over the new sample data by id).
- Icons: `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`, `site.webmanifest`. The logo PNGs are transparent and sized for the header (20–40 KB, down from 0.5–0.9 MB).
- Sample deals: 115 live deals from offertag.in (41 fetched 11 Nov, 74 fetched 24 Nov), so every store and every category page has deals. Innerwear, adult products, raw app screenshots and similar are screened out for the client demo.
- Admin → Inbox → Comments lists every comment from the deal pages, with Delete (and Undo).

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
