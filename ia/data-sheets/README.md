# Data sheets (Law 15)
One file per screen group, written before the group is built. Every element the screen shows, filters on, sorts by or links to gets exactly one source:
- `table.column` — a column in `old-code/schema.sql` (live data)
- `old-code: …` — a route, controller rule or formula in `/mnt/d/PC-Downloads/old-code`
- `BRD …` — a line in `docs/brd/brd.txt`
- `D-xxx` — a decision that derives the value (types from discount %, etc.)
- `SAMPLE` — the real store is empty today; the README names it; never for counts, names, prices or lists that exist live
Lists come from the catalogue as stored (active rows, `order_no`, slugs, spelling). Counts say whether they are live totals or the prototype snapshot.

| Sheet | Screens | Session |
|---|---|---|
| `search-category-store-index.md` | search results + sheet, category / store / store+category feeds, categories and stores index, desktop slide-over, Home add-ons; retro-audit of Home, listings, detail | S13 |
| `auth-account.md` | sign in (page + pop-up / sheet), forced re-login, account, public delete request, signed-in header and menu | S14 |

Old code moved on 2026-11-11 to `offer-tag/` in this repo; it has no `schema.sql`, so columns come from `offer-tag/database/migrations/`.
