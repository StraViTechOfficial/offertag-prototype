# Data sheet — admin batch A: shell, Overview, Incoming deals, Deals list (S16)
Law 15. Old code: `offer-tag/` (read-only); columns from `offer-tag/database/migrations/`. ASCII: `screens/shells.md` §4, `screens/admin-tools.md` §8, `screens/admin-deals.md` §1–2. Brief: `briefs/admin.md` v2–v3. Look: D-098.

## Routes
| Screen | Live route | Prototype file | Source |
|---|---|---|---|
| Overview | `/admin` (new) | `admin.html` | brief v2 Overview, admin-tools §8 |
| Incoming deals | `/admin/incoming` (new) | `admin-incoming.html` | BRD B17, D-059 |
| All deals | `/admin/deals` (today `admin/deals`) | `admin-deals.html` | `routes/web.php` admin group, D-059 |
| Not yet built (batch B–D) | — | `admin-soon.html?s=…` | Placeholder, removed when each screen lands |
Review state: `?role=sub` shows the sub-admin shell on every admin page; on Overview it shows the "Sub-admins start on All deals" note in place of the dashboard.

## Shell
| Element | Source | Note |
|---|---|---|
| Sidebar groups and order | D-057 | Sale posters added under Deals' neighbours as its own item (DEV-019, D-098 §5) |
| Sub-admin menu: All deals, Incoming, Post a deal, View site | D-057, `AdminAuthorization.php:20` (role 1 admin, role 3 sub-admin) | Hidden, not disabled (brief Never) |
| Incoming count badge | Count of rows in the Incoming Pending tab | Prototype counts the SAMPLE rows below |
| Inbox count badge | `feedback` rows unhandled + reports + deletion requests | SAMPLE 5 (no handled column today; Inbox is batch C) |
| Signed-in name "Adil", role label | `users.name`, `users.role_id` | Name from the agreed ASCII (shells §4) |
| Global search "Search deals, links, users…" | brief Shell | Searches title and link in the prototype; users come with screen 31 |
| "+ Post a deal" | D-057 phone top bar; brief | Goes to Post form (screen 24, batch B) |
| View site ↗ | D-057 | `index.html` |
| Dark only | D-098, D-069 | No theme toggle in v1 |

## Overview (admin only)
| Element | Source | Note |
|---|---|---|
| Date line | today | |
| Posted today | Snapshot deals with age ≤ 24 h (`deals.updated_at`) | Same number as the public "N deals posted today" |
| Incoming pending | Incoming SAMPLE rows | Live: `deals.deal_status = pending` |
| Alerts sent today | `notifications` rows created today | SAMPLE 2: the table exists but the prototype has no copy of its rows |
| Inbox unhandled | as the sidebar badge | SAMPLE 5 |
| Pinned on Fresh (count) | `deals.is_pinned`, `pinned_order` | The 8 SAMPLE pinned deals the public site uses (build.py `pinned`); D-104 |
| Latest live deals (5) | Snapshot, newest first | Title, type, store, posted |
| Recent shares (5) | `share history` (new, B15) | SAMPLE: sharing is new, no rows exist |
| Quick actions Post a deal · Review incoming | brief v2 | |

## Incoming deals (SAMPLE rows, declared)
The Telegram source (BRD B17) and the hold rule (D-079) are new, so no incoming row exists anywhere. The prototype builds five rows from snapshot deals and marks each with a source and, where the rule would hold it, a reason.
| Element | Source |
|---|---|
| Tabs Pending · Approved today · Rejected (kept 30 days) | brief v2 |
| Source badge Telegram · Scraper · Form | contract field 23 `source` (new), D-079 |
| Hold reason: missing store or category · check MRP · similar deal posted | contract §4 publish rule, D-079 |
| Image, title, store, category, price, MRP, % | `image_name`, `title`, `shop_id`, `category_id`, `discount_amount` (price), `actual_amount` (MRP), `discount_percent` |
| Auto types | W44 rule, same as build.py: < 25 % New, ≥ 25 % Top, ≥ 75 % + Loot, Grocery/Kitchen + Pantry |
| Received time | `created_at` |
| Approve · Edit · Reject (optional reason), bulk approve / reject | D-059 |
| "≥ 90 % also sends a push" | brief v2 notify rule |
| Approve on a row missing store or category opens Edit instead | admin-deals §1 |
Approved today / Rejected tabs show the counts the user acts on in the session (start 0); live they read `deal_status` and the 30-day window.

## Deals list
| Element | Source | Note |
|---|---|---|
| Rows | 42 snapshot deals (`build/deals-clean.json`), newest first | Same data as the public cards |
| Total "N deals" | `catalogue.json` `all_total` (live all-time total) | Pagination shows the snapshot rows; the total line says so |
| Columns: image, title, store, price / MRP / %, type, status, pin, posted, views | `image_name`, `title`, `shop_id`, `discount_amount`, `actual_amount`, `discount_percent`, `deal_type`, `deal_status`, `pinned_order`, `updated_at`, `view_counter` | Views are admin only (D-058 hides them on the public site) |
| Status pill Live · Scheduled · Pending · Rejected · Withdrawn | `deal_status` enum (pending, approved, rejected) + `publish_at` + contract field 24 (withdrawn) | Live = approved and `publish_at` past |
| SAMPLE statuses | one Scheduled, one Withdrawn | Snapshot has only live deals |
| Pin slot 1, 2, 3… (open-ended; Pin takes the next slot) | D-104, `pinned_order` | The 8 SAMPLE pinned deals |
| Filters: search, status, type, store, category, pinned, posted | brief Deals list | Store and category lists from the catalogue as stored (Law 15) |
| Display target filter | `deal_display_type` 1 Web + Mobile App · 2 Web · 3 Mobile App | `deal-form.blade.php:163` |
| Sort: posted, price, %, views, status | brief | |
| 25 · 50 · 100 per page | D-032 | |
| Row menu: Edit · Clone · Copy for WhatsApp · Copy buy link · Share… · Bump to top · Pin/unpin · Send push · Change status · Delete | D-059 | Edit, Clone, Share and Send push go to batch B screens |
| Copy for WhatsApp text | DEV-011, D-058 share template: title, price, MRP, % off, short link | Short link `short_url`; prototype uses the deal page |
| Bulk bar and bulk-edit drawer (status, deal types, category, store, display, pinned, push) | D-059, B10 | "Only ticked fields change" |
| Undo toast 10 s | brief Cross-cutting | |
| Points column, Excel import, per-admin bitly | removed (DEV-014, DEV-016, DEV-015) | Not drawn |

## Added in the S16 BRD audit (D-102)
| Element | Source | Note |
|---|---|---|
| Bulk "Share to…" on All deals: Facebook Page, Pinterest, Threads; live deals only | BRD B13, `admin-deals.md` bulk bar | Channel names and Threads "not connected" match the SAMPLE states on Social sharing (data sheet C) |
