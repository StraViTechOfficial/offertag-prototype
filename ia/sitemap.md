# Sitemap
AGREED · 2026-11-09 · Rewritten from D-043–D-061 after the parity pass. Existing URLs unchanged (Law 4); NEW URLs need Q-022-style approval; REMOVED per BRD (D-008, DEV-010/014/016). Depth per D-034.

## Customer site
| URL | Page | Spec |
|---|---|---|
| `/` | Home: Fresh tab, hottest strip (admin toggle), community bar, feed; filter/sort sheets; feed states | `screens/shells.md`, `sheets-phone.md`, `feed-states-index.md` |
| categories index · stores index (menu, search) | Lists with counts | `screens/feed-states-index.md` |
| `/{dealType}` | Type feed (Top, Loot, New, Pantry, …) | same component |
| `/deals/search?q=` | Search results; phone search sheet | same component · `screens/sheets-phone.md` |
| `/products/{cat}-deals` · `/shops/{shop}` · `/shops/{shop}/{cat}` | Category / shop feeds with one-line header and collapsed SEO text in footer | same component |
| `/deal/{slug}` | Deal detail (coupon, comments, related, alerts row, report sheet) · desktop slide-over | `screens/deal-detail.md`, `feed-states-index.md` |
| `/v/{alpha}` · `/d/{id}` · `/o/t/r/{slug}` | Short link → detail · click-out redirect with tags · legacy | no UI (redirect page keeps OG tags) |
| `/login` | Sign in: Google or email code; also a bottom sheet | `screens/auth-account.md` |
| forced re-login (route by dev) | One-time card after go-live | `screens/auth-account.md` |
| `/user/profile` | Account: display name, email, mobile, alerts, delete | `screens/auth-account.md` |
| `/delete-account` | Public deletion request form (Turnstile) | `screens/auth-account.md` |
| `/contact` | Support links + feedback form (Turnstile) | `screens/static-blog.md` |
| `/privacy` · `/disclaimer` · Terms (NEW URL, dev) | Legal; `/disclaimer` carries the Amazon Associates text | intent |
| 404 · 403 · 500 · offline | Error family with Fresh feed | `screens/static-blog.md` |
| `/blog` · `/blog/{post-name}` (NEW, D-093) | Blog index · post with live deal embeds | `screens/static-blog.md` |
| `/register`, `/password/*`, `/user/change-password`, `/user/deals`, `/deal/post-deal`, forum, slider, `m.offertag.in` | REMOVED (BRD; DEV-010) | — |

## Admin (role 1) — `/admin/*`, existing routes kept, new screens need routes in dev
Overview · Deals: All deals, Incoming (NEW), Post a deal (`create`, `direct-post`, `{id}/edit`, `{id}/clone`), Pinned board (NEW view) · Alerts (`admin-notifications`) · Social sharing (NEW: channels, formats, history) · Blog (NEW) · Inbox (`feedback` + reports + deletion requests) · Catalogue (`shop`, `category`, `lookup`, `type`) · Users (`users`) · Settings (Affiliate tags NEW, Site & app NEW, `role`) · View site. Specs: `screens/shells.md` §4, `admin-deals.md`, `admin-tools.md`, `admin-pinned-blog.md`.
REMOVED: `admin/user-deals`, `admin/slider`, `admin/deal/import`, `admin/deal-points/*`, `admin/users/deals-report/*`, per-admin bitly.

## Sub-admin (role 3)
Deals: All deals · Incoming · Post a deal · View site. Nothing else rendered (D-057).

## Mobile API
Unchanged (Law 4). Features removed by the BRD are simply not called; the app upgrade is parked (D-005).
