# Deal content contract — what a deal is made of, who writes it, how the page renders it
AGREED v1 · 2026-11-11 · D-077 (contract), D-078 (auto-clean), D-079 (publish rule), D-080 (steps), D-081 (coupon + offer fields). Source audit: `docs/research/deal-content-audit.md`. Page: `../screens/deal-detail.md` v3. Form: `../screens/admin-deals.md` §3. Reference implementation of §4–§6: `../prototype/build/build.py` (functions `clean_html`, `split_blocks`, `steps_split`).

Principle: the scraper is the main author. Every field below can arrive from a machine, be blank, or be edited by a person later. The page is complete with the six required fields; nothing else may leave an empty heading, box or line.

## 1. Fields
| # | Field | Column (today → new) | Required | Type / limit | Filled by | Page use |
|---|---|---|---|---|---|---|
| 1 | title | `title` | yes | text ≤ 200; first segment before " \| " shown, full text in `<title>` | scraper | H1, card, share text |
| 2 | link | `deal_link` | yes | URL; affiliate params stripped on save, store tag added on render (`shop.affiliate_value`) | scraper | Buy, step 1, card Buy |
| 3 | price | `discount_amount` | yes | integer ₹; 0 = sale post (no single price): page shows "Up to {pct}% off" instead of the price block and MRP line, bar and share text follow | scraper | price block, bar, card |
| 4 | mrp | `actual_amount` | yes* | integer ₹ ≥ price; *missing → page shows price only, no saving, no % badge | scraper | struck MRP, Save badge, % badge |
| 5 | image | `image_name` | yes | one image; 300 px original + 200 px thumb today; new: keep original up to 1200 px | scraper (external URL fetched) or upload | image well, card, OG card |
| 6 | store | `shop_id` | yes | from catalogue; auto from link host when absent | scraper / host match | kicker, Buy label, steps default, related |
| 7 | category | `category_id` | no (default "Others") | from catalogue | scraper / form | breadcrumb, related, filters |
| 8 | types | `deal_type` rows | auto | Fresh (posted today) · Top ≥ 25 % · New < 25 % · Loot ≥ 75 % · Pantry by category (W44) | derived, editable | badges, list tabs |
| 9 | caption | `deal_caption` | no | text ≤ 40 | form | label under title, card ribbon |
| 10 | coupon | new `coupon_code` | no | text ≤ 20, upper-case | scraper (store page) · cleaner detection · form | chip with Copy, bar chip, card tag |
| 11 | coupon_terms | new `coupon_terms` | no | text ≤ 80 | scraper / form | small line under chip |
| 12 | offers | new `offers` (JSON list of lines ≤ 100) | no | 0–4 lines: bank offer, exchange, min cart | scraper / form | "Offer details" lines under the price block |
| 13 | highlights | new `highlights` (JSON list) | no | 2–6 bullets ≤ 120 each | split from template / form | "Highlights" bullets, first block under the panel |
| 14 | links | new `links` (JSON list of {label, url}) | no | 1–20 rows; label ≤ 40 | split from multi-link posts / form | "Links" rows, each tagged, new tab |
| 15 | note | new `note` | no | one line ≤ 140 | split ("Note …" line) / form | alert line under Buy |
| 16 | description | `description` | no | cleaned HTML, allowed tags only (§4) | scraper (cleaned) / form (plain editor) | "Description" |
| 17 | specs | new `specs` (JSON list of {label, value}) | no | 0–12 rows | split from template / form | "Specs" rows |
| 18 | step_exceptions | `deal_step` (now exceptions only) | no | 0–5 lines ≤ 120 | form / split from legacy steps | first lines of "How to get it", opens the block |
| 19 | display | `deal_display_type` | auto (Web + App) | 1/2/3 | form | — |
| 20 | pinned, pinned_order | as today | no | | form | hero, pinned board |
| 21 | publish_at | as today | no | datetime | form | scheduled state |
| 22 | notify | `sendNotification` | auto (≥ 90 % off) | bool | derived, editable | push |
| 23 | source | new `source` | auto | scraper · telegram · form · clone | system | Incoming badge, publish rule |
| 24 | status | `deal_status` | auto | pending · approved · rejected · withdrawn · held(reason) | D-079 rule | banner (withdrawn), Incoming |
Store defaults (Catalogue → Shops): `shop_steps` (default steps, 3–6 lines), `affiliate_value`, logo, card label.

## 2. Inputs
- Scraper tool (today's `direct-post` call, kept): sends fields 1–7 and either structured 10–17 (preferred) or one `description` HTML (legacy mode). `auto_post=1` keeps meaning "publish now" (D-079).
- Telegram bot (BRD B17): same fields; always lands in Incoming as pending.
- Admin form: same fields as inputs in the §1 order; every block collapsed when blank with an "+ Add" control; Description editor allows bold, italic, lists, links only (no colour, font, alignment, HTML source).
- Clone: copies 1–18 except link and image unless chosen.

## 3. Publish rule (D-079)
```
on receive →  missing any of 1–3, 5, 6  → HELD "missing {field}"
              mrp < price or mrp missing → HELD "check MRP" (mrp missing alone is allowed when flagged by source as "no MRP")
              duplicate: same cleaned link today, or same title today → HELD "duplicate of #id"
              source = telegram → PENDING (approve / edit / reject on Incoming)
              source = scraper, form, clone → APPROVED (live), types + notify derived
```
Held and pending rows carry the reason; "Approve" publishes with derived values; "Edit" opens the form prefilled.

## 4. Clean (`clean_html`) — applied on save for new content and on render for legacy rows, same function
1. Drop `<script> <style> <iframe> <form> <input>` with content.
2. Remove any element that wraps an anchor to `whatsapp.com`, `chat.whatsapp.com`, `t.me` (pasted channel buttons) and any paragraph containing "Associates Program" or "affiliate advertising".
3. Allowed tags: `p br ul ol li strong em a h3 img`. Map `b→strong`, `i→em`, `h1 h2 h4 h5 h6→h3`, `div span section font→unwrapped`, `table→p per row`. Every other tag unwrapped. All attributes dropped except `a[href]`, `img[src alt]`.
4. Drop a leading `h3` whose text equals the title (case/space-insensitive) or equals the first 60 characters of it.
5. Drop empty paragraphs (`&nbsp;`, whitespace) and collapse runs of `<br>` to one paragraph break.
6. Links: strip `tag, ascsubtag, affid, affExtParam1`; add the store tag by host (amazon.in → `tag=`, flipkart → `affid=`, else none); `target=_blank rel="nofollow sponsored noopener"`; link text that is a URL becomes its domain ("amazon.in"); link text "click here / buy now / link / here" keeps its text (the Links block gives it a label, §5).
7. Images: keep, lazy, max width 100 %; external hosts allowed only from the store domains and offertag storage.
8. Output: UTF-8 string, max 20 000 characters, no leading/trailing whitespace.

## 5. Split (`split_blocks`) — runs after clean, only for fields the source left blank
```
highlights ← first h3 titled "Key Practical Uses" | "Highlights" | "Key Features" + following ul  → li texts; remove both
specs      ← h3 titled "Specifications" | "Specs" + following ul → li texts; "Label: value" splits on the first colon, else label = "" value = text; remove both
links      ← if ≥ 3 anchors whose text ∈ {click here, buy now, link, here, shop now} or is a URL:
             each anchor → {label, url}; label = text before the anchor on the same line/paragraph, trailing ":" "-" "–" and list numbers removed; blank label → anchor's domain; remove those lines
note       ← first paragraph/line starting "Note" (any case, optional ":" or "-") → text after the marker, ≤ 140; remove
coupon     ← if coupon blank and text matches /\b(?:code|coupon)[:\s]+([A-Z0-9]{4,15})\b/ → group 1; text stays
description ← whatever remains; blank if only whitespace
```
Order matters: links before note before coupon. Nothing is split when the source sent the structured field.

## 6. Steps (`steps_split`, D-080)
- Default = store's `shop_steps` lines; step 1 is always "Open the deal page" with the Buy link.
- Legacy `deal_step` HTML → clean → lines; drop affiliate paragraphs; drop lines equal to a default line (case-insensitive, "Click on " prefix ignored); remainder = `step_exceptions`.
- Render: `<details>` titled "How to get it · {n} steps at {Store}"; open when exceptions exist; exceptions first (bold), then the defaults.

## 7. Page mapping (phone order; desktop: 1–12 in the sticky panel, 13–17 left column, 18–20 full width)
| Order | Block | Shows when | Component |
|---|---|---|---|
| 1 | image + % badge + zoom | always; % only with mrp | image well |
| 2 | types · store · posted | always | kicker |
| 3 | title | always | H1 |
| 4 | caption | caption | label with trending-down icon |
| 5 | price · MRP · Save | always; MRP/Save only with mrp | price block |
| 6 | coupon chip + terms | coupon | dashed chip, Copy, toast |
| 7 | offer details | offers | lines with badge-percent icon |
| 8 | Buy at {Store} + disclosure | always | primary button |
| 9 | note | note | alert line (circle-alert) |
| 10 | share row · comment link | always | buttons |
| 11 | Never miss a loot | always | card |
| 12 | (phone sticky bar: coupon · price · Buy) | always | bar |
| 13 | Highlights | highlights | bullets |
| 14 | Links | links | rows: label › domain, chevron |
| 15 | Description | description | prose |
| 16 | Specs | specs | two-column rows |
| 17 | How to get it | always (collapsed unless exceptions) | details |
| 18 | Related · See all · More from · Search on | always | carousel + links |
| 19 | Comments | always | list |
| 20 | Report a problem | always | link |
Withdrawn (D-040): banner, price block muted, Buy → "See similar deals", coupon and disclosure hidden, note kept.

## 8. Dev notes
- One sanitiser, one splitter, shared by API intake, admin save and a one-off migration of the 52k rows (store the cleaned result; keep the raw HTML in `description_raw` for a rollback window).
- Escape all user and machine text at render; comments remain `varchar(191)` with the same escaping (W28).
- Search indexes title, highlights, description text, specs values.
- The prototype's `build.py` runs §4–§6 on the 42 live pages plus three multi-link pages; compare its output with the live page to validate a port.
