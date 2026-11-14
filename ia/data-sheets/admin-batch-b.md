# Data sheet — admin batch B: Post / edit deal, Pinned board, Alerts, Sale posters (S16)
Law 15. Old code: `offer-tag/` (read-only); columns from `offer-tag/database/migrations/`. ASCII: `screens/admin-deals.md` §3–3b, `screens/admin-pinned-blog.md` §1, `screens/admin-tools.md` §1. Contract: `deal-content-contract.md`. Look: D-098. Posters: DEV-019.

## Routes
| Screen | Live route | Prototype file | Source |
|---|---|---|---|
| Post a deal | `/admin/deal/create` (today) | `admin-post.html` | D-059, admin-deals §3 |
| Edit deal | `/admin/deal/{id}/edit` (today) | `admin-post.html?id={id}` | same |
| Clone | new | `admin-post.html?clone={id}` | D-059, contract §2 Clone |
| Pinned board | `/admin/pinned` (new) | `admin-pinned.html` | D-053, D-066 |
| Alerts | `/admin/notifications` (today `admin-notifications`) | `admin-alerts.html`; `?deal={id}` attaches a deal | D-059, W55 |
| Sale posters | `/admin/posters` (new) | `admin-posters.html` | DEV-019 |

## Post / edit deal
Field order, limits and rules are the contract §1 (fields 1–22); this sheet names only what the screen adds.
| Element | Source | Note |
|---|---|---|
| Edit state values | the 42 snapshot deals, same as the cards and All deals | `deals[0]` carries the SAMPLE coupon, caption and offers already used on its public page |
| Clean URL toggle (default off) | D-059, brief v2 | Affiliate tags are stripped on save anyway (contract field 2) |
| Similar-deal warning | contract §3 duplicate rule: same cleaned link or same title today | Prototype checks the typed link and title against the snapshot |
| Store auto from link host | contract field 6 | amazon.in, flipkart.com, myntra.com, ajio.com, jiomart.com, bigbasket.com, meesho.com hosts; lists from the catalogue as stored |
| Off % | computed (MRP − price) ÷ MRP, editable | contract field 4 |
| Deal types auto | W44 rule (contract field 8), editable chips | |
| Optional blocks collapsed with "+ Add" | contract §2 | Offer details (≤ 4 lines), Highlights (2–6), Links (≤ 20), Note, Specs (≤ 12) |
| Description editor: bold, italic, lists, link | contract §2 | |
| Steps: store default + exceptions | D-080, `shops.shop_steps` | Default list = what the live site shows today (build.py `SHOP_STEPS`) |
| Display Web + App · Web · App | `deal_display_type` 1/2/3, `deal-form.blade.php:163` | |
| Pin + slot 3 / 6 / 9 / 13 | `is_pinned`, `pinned_order`, `PINNED_DEALS_ORDER` (`config/app.php`) | |
| Publish now / Schedule | `publish_at` | |
| Notify push, ticked at ≥ 90 % | contract field 22 | |
| "Last edited by Adil, 2 h ago" | `updater_id`, `updated_at` (brief: audit line) | Name from the agreed ASCII |
| Live preview, Comfortable / Compact | D-059; same card as the public site | |
| Share panel Facebook Page · Pinterest · Threads, per-platform preview | B13, D-059 | Text from the saved format (screen 27); prototype uses the D-058 share template |
| Share history | B15 | SAMPLE rows: sharing is new |
| Success panel: public link, short link, Copy for WhatsApp, Share to…, Post another | admin-deals §3 | Short link = `short_url` (`offertag.in/v/…`, `config/app.php` short_url); prototype shows the pattern |

## Pinned board
| Element | Source | Note |
|---|---|---|
| Slots 3, 6, 9, 13, shown not editable | `PINNED_DEALS_ORDER` default `3,6,9,13` (`config/app.php`), D-053 | |
| Deals in the slots | the 4 SAMPLE pinned deals (build.py `pinned`), same as All deals and Overview | |
| "pinned 2 h" ages | SAMPLE | No pinned-at column; live would use `updated_at` |
| Waiting list (pinned, no slot) | `is_pinned = 1`, `pinned_order` null | SAMPLE 1 row |
| "+ Pin a deal" search | snapshot deals, title or link | |
| Drag, swap on occupied slot, keyboard Space + arrows, phone Slot ▾ | D-066 | |
| Where pinned deals show on the public site | open (D-098 §4) | Board copy says "fixed slots in the lists" per D-053 until the user decides |

## Alerts
| Element | Source | Note |
|---|---|---|
| Message ≤ 120 | admin-tools §1 | `notifications.notification` is a string column (255) |
| Deal or link attached | `notification_url`, `notification_url_meta` (2021 migrations) | |
| Send to Web (OneSignal) · App | `config/onesignal.php`, FCM in `config/push-notification.php` | |
| History: time, text, Web ✓/✗, App ✓/✗, Resend / Retry | D-059 | Rows SAMPLE: the table exists but the prototype has no copy of its rows; delivery result per channel is new |
| No pin, no per-user inbox | D-059 (Q-029) | `is_pinned`, `user_notifications` retired |
| Subscriber counts in the confirm | admin-tools §1 "with counts if available" | Not shown: no count source in the prototype (Law 15) |

## Sale posters (DEV-019)
| Element | Source | Note |
|---|---|---|
| Fields: desktop image 1600 × 700, phone image (optional, falls back to desktop), link, title (used as alt text), start date, end date, on/off, order | DEV-019 | Old `image_sliders` table (image, caption, url_1, url_2, category_id) was retired by BRD p.1; new table in dev |
| Rows | the 4 SAMPLE posters on Home (build.py `POSTERS`, `assets/posters/`) | Prototype posters are drawn in HTML; live posters are single images from the owner |
| Dates | SAMPLE | |
| Status Live · Scheduled · Ended · Off | derived from dates and on/off | |
| Arrows + dots, no autoplay | D-072, DEV-019 | Stated on the screen |
