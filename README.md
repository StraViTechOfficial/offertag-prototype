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
