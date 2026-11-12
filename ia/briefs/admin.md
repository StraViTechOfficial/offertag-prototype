# Experience brief — admin and sub-admin
AGREED v1 · 2026-11-09 (D-053) · v2 additions AGREED (D-059) after the parity pass (`../feature-parity.md`), marked [P] · Law 12. Shell per D-057.

## Who
1. Deal poster (admin, role 1) — posts tens of deals a day, mostly from a browser bookmarklet/scraper hand-off that lands on `/admin/deal/direct-post` with fields prefilled. Works fast, often on a laptop, sometimes from a phone when a loot appears. Wants: publish in under 30 seconds, no re-typing, instant confirmation, short link ready to paste in Telegram/WhatsApp.
2. Sub-admin (role 3) — same posting job, restricted menu (Deals only once member posting is gone; Q-023). Wants: nothing in the way, nothing they cannot use.
3. Owner / manager (admin) — checks what is live, pins and reorders featured deals, sends Instant Alerts, reads feedback and "report a problem", looks at users and reports. Wants: overview first, detail on demand, undo.
4. Content editor (admin) — writes blog posts that embed live deals. Wants: a plain editor, deal picker, preview as the reader sees it.

## Jobs
- Post a deal from a scraped link: check image, title, prices, store, category; type auto-set by discount; display target; pin; publish now or schedule; push notification; copy short link.
- Find a deal fast: by title, link, store, status, type, pinned, date. Fix a price, clone for a variant, change status, unpin.
- Keep pinned slots (3, 6, 9, 13) deliberate: see what sits where today, reorder by drag or number.
- Broadcast an Instant Alert and pin it; see history.
- Maintain reference data: shops (icon, affiliate tag, status), categories, deal types/lookups, roles.
- Read feedback and reports; mark handled.
- Users: list, search, per-user deals report download, Amazon tag.
- Blog: write, embed deals, schedule, publish.
- Forced re-login: when sessions are invalidated, one clear screen (shared with the public F5).

## Behaviours
Shell
- Desktop-first: left sidebar (collapsible to icons), top bar with global search ("deal title, link, user…"), account, theme. Content max 1200 px. Phone: sidebar becomes a drawer; tables become cards; "Post deal" is the one screen tuned for one hand.
- Sub-admin sees only the menu items their role allows; no greyed-out items, no dead links.
Deals list
- Table with classic pagination (D-032), 25/50/100 per page, sortable columns (posted, price, discount, views, status), sticky header, column visibility.
- Filters as a toolbar (status, type, store, category, pinned, display target, date range) + search; applied-filter chips; count.
- Row: thumbnail, title (link to public page), store, price/MRP/%, type, status pill, pinned slot, posted, views, actions (edit, clone, pin, status, open public).
- Bulk select → change status, unpin, set type. Confirm with count; undo toast for 10 s.
- Pinned view: a small board showing slots 3/6/9/13 with the deal in each, drag to reorder.
Post / edit deal
- One form, single column, fields in the order a poster thinks: link → fetched image (replace/upload) → title → store (auto from link) → category → price → MRP → discount (computed, editable) → type (auto, editable) → steps/caption/description → display target → pin + slot → publish now / schedule → notify (push on/off).
- Live preview of the public card beside the form (desktop) or below (phone), in both densities.
- Duplicate detection on link or title: warn, link to the existing deal, allow override.
- Save states: autosave draft; explicit Publish; after publish → success panel with public link, short link copy, WhatsApp share, "Post another".
- Validation inline (red reserved for errors); never lose typed data on error.
Instant Alerts
- Compose (text, optional deal), preview as the app shows it, send, pin/unpin, history with delivery time.
Reference data (shops, categories, types, lookups, roles)
- One generic pattern: list with search + status toggle + edit drawer. No separate page per record unless the form is long.
Feedback and reports
- Inbox list: type (feedback / report a problem), deal link, user, time, handled toggle; filter by unhandled.
Users
- List with search, role, joined, deals count; per-user report download; Amazon tag field.
Blog
- Posts list (draft/scheduled/published), editor with headings, images, deal embed (search → insert card), SEO fields, preview, schedule.
Cross-cutting
- Keyboard: `/` focuses search, `n` new deal, Esc closes drawers. Every destructive action confirms and offers undo where the data model allows.
- Audit: show "edited by X at T" on records (creator_id/updater_id exist).
- Dark mode supported, same tokens; admin defaults to system preference.

## Feel
Dense, fast, legible. Nothing decorative. The poster never waits for the UI; the manager always knows what is live.

## Never
No modal chains. No hidden menu items for roles that lack access (hide, not disable). No "Are you sure?" without saying what and how many. No pagination games (page size and total always visible). No marketing colour.

## Open for discussion
1. Sub-admin scope = Deals only (Q-023). Confirm.
2. Pinned board (drag to reorder slots) — in, or number field only?
3. Live card preview beside the post form — in, or skip to keep the form light?
4. Blog editor: in design scope (list + editor screen), or intent only?
5. Keyboard shortcuts and undo toasts: in the spec, or development-phase detail?

## v2 — parity additions [P]
Incoming deals (B17, new). Sources: Telegram bot, quick-post tool (`direct-post`, `auto_post` now lands here instead of publishing), any poster's draft. Tabs Pending · Approved today · Rejected (kept 30 days). Row: source badge, fetched image, title, store (auto), category (auto or blank), price / MRP / %, auto type(s), duplicate flag with link, received time. Actions per row: Approve (one tap; publishes with auto type, notify per the ≥90 % rule), Edit (opens the post form prefilled, Approve from there), Reject (optional reason). Bulk approve / reject with count. Phone: card rows, Approve and Reject as full-width buttons, swipe not required (B34). Sub-admin has access (D-057).
Deals list additions. Status pill (approved / pending / rejected / withdrawn). Row actions: Edit · Clone · Copy for WhatsApp (formatted text, W42) · Copy buy link · Share… (channel picker, B13) · Bump to top (B11; today a silent effect of saving) · Pin/unpin · Send push (confirm "Send alert to all subscribers?", W42) · Change status · Delete (confirm, 10 s undo; removes image files). Bulk bar: Edit (drawer: status, deal types, category, store, display target, pin, notify) (B10) · Bump to top · Copy for WhatsApp/Telegram (B27, DEV-011) · Share to… (B13) · Change status · Delete. Points column removed (DEV-014). Per-admin bitly removed (DEV-015). Excel import removed (Q-036, DEV-016).
Post / edit form additions. Deal types as multi-select chips, auto-set from discount and editable (W43/44). "Clean URL" toggle (strip query string; default off; existing tag stripping is automatic). Caption field. Coupon code field (B05). Store choice pre-fills steps from `shop_steps` if steps are empty (W43). Publish now / Schedule (`publish_at`). Notify push toggle, pre-ticked at ≥90 %. Side panel (desktop) / below (phone): live card preview (both densities) + public-page preview link; on edit: Share panel (Facebook Page · Pinterest · Threads checkboxes, per-platform preview from the saved format, "Share now"; nothing automatic) (B13) and Share history (platform, time, status ok/failed, link or Retry) (B15). Duplicate warning as before.
Alerts (W55, Q-029 recommended). Compose: text + optional deal or URL (preview card from OG data); send to web and app subscribers; history list with time, text, link, result. No pinned message, no per-user inbox, no clear-all (removed with "login-based notifications inside the app"). "Send push" from a deal row prefills this composer.
Social sharing (B13–B15, new). Channels: Facebook Page, Pinterest (board), Threads — connect / status / disconnect. Formats: one editor per platform with placeholders {title} {price} {mrp} {pct} {coupon} {short_link} {store}, image on/off, live preview on sample deal, Save; every share uses the saved format. History: all shares, filter by platform and status, retry failed.
Affiliate tags (B16, new). Table of platforms (Website, App, WhatsApp/short link, Google/source, Facebook, Pinterest, Threads) with the Amazon tag and Flipkart id for each, inline edit; link to per-poster tags on Users.
Inbox (B30, B31, W54). Tabs Feedback · Reports (report-a-problem, with deal link) · Deletion requests (name, email, mobile, reason, date). Row: type, who, when, message, Handled toggle; default filter unhandled. Deletion request actions: Mark deleted (after dev-side action) · Dismiss.
Catalogue. Shops form carries all of W48: name, card label (`icon_name`), logo, SEO description, affiliate value, default steps, order, active. Categories per W49. Deal types (lookups): name, order (1 = Home tab; Q-021), active. Types: list only.
Users (W53). Search, name, email, phone, role, joined, Amazon tag (inline edit). No points report, no export.
Settings → Site & app (B33). Hottest strip on/off + source (pinned deals, or top N by discount today); community bar on/off + WhatsApp/Telegram links; Blog "New" badge on/off; social links (WhatsApp, Telegram, Facebook, Instagram, LinkedIn, Play Store); support email; live chat on/off. Settings → Roles: read-only list of the three roles.
Overview (new, admin only). Today: posted, incoming pending, alerts sent, unhandled inbox, pinned slots filled; quick actions "Post a deal", "Review incoming". Classic list pagination everywhere (D-032).

## v3 — machine-first posting (D-077–D-079, 2026-11-11)
The scraper is the main author; the form edits the same fields (`../deal-content-contract.md`). Post form: required six on top, optional blocks collapsed with "+ add", Description editor limited to bold/italic/lists/links, steps as store default + exceptions. Incoming: source badge (scraper · telegram · form), hold reasons (missing field, MRP check, duplicate); scraper deals publish directly, Telegram waits (D-079).
