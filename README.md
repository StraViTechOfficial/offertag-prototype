# OfferTag prototype (UAT playground)

A clickable prototype of the whole OfferTag site, public pages and admin, on phone and desktop. It's for user acceptance testing: open the admin, add and edit deals, posters, sponsored ads, pins, categories, blog posts and settings, and see them on the public site straight away. Comments, reports and contact messages sent from the public pages show up in the admin inbox.

This repo is the built site only. It's generated from the `offertag-design` repo (`prototype/`, `python3 build/build.py`), so make changes there, rebuild, and copy the output here.

## How it behaves

- **Sample data** sits in `data/*.json`: 115 live deals from offertag.in (fetched 11 and 24 Nov 2026), the catalogue, the Home lists, blog posts and community items.
- **What a person changes is kept in their own browser** (localStorage, keys starting `pg:`). Other people, other browsers and other devices see only the sample data. A private window or cleared site data starts fresh.
- **Reset:** Admin → sidebar → Playground → Reset, or add `?pg=reset` to any address.
- **Sign-in is simulated.** Google signs in the sample member; any 6-digit code works except `000000`. Add `?user=1` to any page to see it signed in, or `?user=admin` to moderate comments on a deal page.
- **"Fetch from link" never works** in the post-a-deal form: there's no backend. Upload a photo instead.
- Pages the playground creates (a new deal, category, store or blog post) are served from `_shell/` by `_redirects`, or by `404.html` on hosts without redirect rules.

## Run locally

Needs Python 3.

```sh
python3 serve.py          # http://localhost:8090 (this computer only)
```

Opening the HTML files directly doesn't work, because the pages load their data over HTTP.

Environment variables: none.

## Host

Any static host works. On Cloudflare Pages or Netlify, connect this repo with **no build command** and **`/` as the output folder**. `_redirects` and `_headers` are read automatically.

- Kept out of search engines: every page has `noindex, nofollow`, `robots.txt` blocks all crawlers, and `_headers` sends `X-Robots-Tag: noindex`.
- No third-party requests: the icons (Lucide), carousel (Embla), emoji picker and Geist font are served from `vendor/`.
- After a redeploy, `data/`, `js/` and `css/` are fetched fresh (`no-cache`). A visitor's own changes survive a redeploy.

## Folders

| Folder | What |
|---|---|
| `/` (pages in folders) | Every page at its real address, e.g. `/top-deals/index.html`, `/deal/<slug>/index.html`, `/admin/...` |
| `css/`, `js/` | Styles and scripts. `js/db.js` is the playground's data layer, `js/render.js` draws public pages from the data, `js/admin-db.js` feeds the admin |
| `data/` | Sample data the playground starts from |
| `assets/` | Deal photos, store logos, category and poster artwork (sample artwork until the owner supplies the real ones; see `assets/MANIFEST.md`) |
| `vendor/` | Self-hosted libraries and font |
| `_shell/` | Templates for pages the playground creates |

Not for public release: this is a prototype for the OfferTag team and client. Store logos are trademarks of their owners, used only to identify each store.
