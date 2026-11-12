# Experience brief — the deal feed (Home, type tabs, search, category, shop)
AGREED v2 · 2026-11-09 (D-045, D-046) · v3 additions AGREED (D-058) after the parity pass (`../feature-parity.md`), marked [P] · Law 12. One component family serves all listing pages. v2 changes marked [R].

## Who
1. Daily loot hunter — opens Fresh several times a day, scans fast, shares to Telegram/WhatsApp groups. Wants: newest first, time posted, nothing hidden.
2. Casual browser — came from a chat link or search, no fixed goal. Wants: scan, be surprised, low effort.
3. Intent shopper — "I need earphones under ₹1,500". Wants: category + price + discount filters, sort by price, compare quickly.
4. Shop-loyal — "What's on Amazon today?". Wants: shop route, shop filter.
5. Returning once a day — Fresh tab is their habit. Wants: what changed since yesterday.
6. Older / low-literacy — reads slower, taps bigger. Wants: labelled numbers, big targets, no icon-only controls.
7. Admin checking the live site — wants to see pinned deals in position and the posted time.

## Jobs
- Find a worthwhile deal in under 10 seconds of scanning.
- Narrow 52k deals to the few that matter: by type, category, shop, discount, price.
- Judge a deal from the card alone: what, where, how much, how much saved, how fresh.
- Act: open the shop, or share.
- Return tomorrow and see only what is new.

## Behaviours the feed must support
Ordering
- Each tab states its rule (Fresh = posted today; Loot = highest discount; Top = editorial/pinned mix; New = last 7 days; Pantry = grocery).
- [R] Sort set: Recommended · Newest · Discount (high→low) · Price (low→high) · Price (high→low) · Most viewed. "Recommended" = pins first, then freshness × discount, diversified across categories in the first 10 cards. Research: a curated default beats pure Newest (hides the best) or pure Popular (clusters one category).
- [R] Defaults: Fresh = Newest (its promise is time; a daily returner wants "since yesterday"). All other tabs, search, category and shop pages = Recommended. User override kept for the session and in the URL.
- [R] The active sort is shown in the trigger ("Sort: Discount"); the label sits outside the control, never as a placeholder option.
Filtering
- [R] Group order, general → specific: Category → Store → Discount band → Price band → Deal type → Posted (24 h / 7 d). Max 6 groups expanded.
- [R] Discount bands ≥50 / ≥70 / ≥90 and price bands ≤499 / ≤999 / ≤2,499 / ≤4,999 / 5,000+ are placeholders: final bands come from the catalogue distribution at build time (dev task).
- [R] A match count beside every filter value; zero-count values greyed, not hidden. Value lists truncate at 8 with "Show all N"; Store gets an inline search box.
- [R] Applied filters as a removable chip row above the list, with the numeric result count ("1,284 deals", capped "10,000+") and "Clear all" as a chip. A badge on the Filter button is supplementary only.
- [R] Desktop: filter panel visible, instant apply. Phone: bottom sheet ~85 % height, list faintly visible behind, fixed header carrying the live count, batch apply with one "Show N deals" button.
- [R] Phone quick row under the type tabs: Filter · Sort · Store · Category · Discount · Price · Type (max 7; Filter and Sort styled apart from value chips). Needs discussion: it is a second chip row.
- Filters and sort live in the URL (`?cat=&shop=&disc=&price=&type=&posted=&sort=`) and the session; canonical points to the unfiltered page.
Loading and paging
- Hybrid loading (D-032). Page size stays 16 (existing API and pinned-slot positions 3/6/9/13; Law 4). Auto-load twice, then "Show more deals"; URL per batch; position restored on back.
- [R] Static skeleton card grid on first load only (no shimmer); inline loader for later batches; fixed-ratio image boxes.
- [R] Sticky behaviour: compact header (search + Sort | Filter) returns on scroll-up only; nothing sticks on scroll-down. This amends D-043 (which said sticky top bar + tabs) — needs the user's yes.
- "Updated X min ago" line; manual refresh on Fresh. Back-to-top after one screen. End state with a next step ("See Top deals").
Card
- Image (white well), discount badge, type + shop label, title (2 lines), current price, labelled MRP, "Save ₹x", posted time, "Buy at Store", share.
- [R] Density: Comfortable (image-led, 1 column) ↔ Compact (text-led, 2 columns or list), remembered per device. Research default: Comfortable on phone, Compact on desktop. Needs discussion (my earlier draft had 2-up on phone).
- [R] View count is used for "Most viewed" sort only; the number is not shown on the card (low numbers read as low interest).
- [R] Pinned deals are not marked for users; "Recommended" order absorbs them (as today).
States
- [R] Empty filter result: "No deals match" + the applied chips repeated + "Clear all" + three nearest-category links. Never blank.
- Empty Fresh before the first post of the day: say so, show Top.
- Error loading a chunk: inline retry, keep what is loaded. Slow network: skeleton on first load, never spinners over content.
- Deal withdrawn after load: "No longer available" on click, not a 404.
- [R] "Only live deals" toggle from research does not apply: no expiry data (D-040).

## Feel
Calm, in control, fast. The user always knows what list they are on, why it is ordered that way, how many items match, and where a tap will take them. No pressure, no noise.

## Never
No countdowns or urgency copy. No votes or fake counters. No modal interruptions, no app-install banners over content. No login to browse, filter, or click out. No colour-only meaning. No horizontal image rails above the feed. Nothing that depends on hover.

## Open for discussion (v2)
1. Sort defaults: Fresh = Newest, everything else = Recommended. Agree?
2. Filter groups and placeholder bands, final bands from data at build time. Agree?
3. Phone quick-filter chip row under the type tabs (two chip rows) — yes, or Filter/Sort buttons only?
4. Density: research default Comfortable 1-column on phone, Compact on desktop, toggle remembered. Agree, or 2-up default on phone?
5. Sticky on scroll-up only (amends D-043). Agree?
6. View count: sort only, never shown. Pinned: invisible to users. Agree?

## v3 — parity additions [P]
Shell elements on listing pages (D-055): Hottest strip (Home only, admin toggle, default off) above the community bar; community bar above the count line; alerts card once after the first batch on the second visit. None of them sticky, none repeated on later batches.
Filters: Category facet gets the same inline search as Store (50 categories, W13). Zero-count rule unchanged.
Rules carried from today: pinned deals are excluded when a search term is present (W14); listings respect display type, publish time, active shop/category (W17) — dev rules, stated in the spec.
Card additions: optional `deal_caption` label under the title (W20, A3); "Coupon" tag when a coupon exists (B05); category in the meta line, Comfortable only (Q-032, recommended). Role-1 copy checkboxes leave the public site (DEV-011).
Logged deviations the brief already carried: hybrid "Show more" (DEV-008), sort on all tabs (DEV-009).
