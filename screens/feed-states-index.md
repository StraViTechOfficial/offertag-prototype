# Desktop slide-over, categories/stores index, report-a-problem sheet, feed states (Law 11)
AGREED v1 · 2026-11-09 (D-065) · From D-032, D-045, D-050, D-058, DEV-013.

## 1. Desktop slide-over detail (card tap on a listing page; URL → /deal/{slug})
```
┌──────────────────────────────────────────────────┬───────────────────────────────────┐
│ listing stays, dimmed 20 %, scroll locked        │ ✕                 Open full page ↗│ 480 px, full height
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │ ┌───────────────────────────────┐ │
│ │      │ │ ▣    │ │      │ │      │              │ │            img         [75%]  │ │ click → zoom
│ └──────┘ └──────┘ └──────┘ └──────┘              │ └───────────────────────────────┘ │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │ Loot · Amazon (logo) · 2 h ago    │
│ │      │ │      │ │      │ │      │              │ boAt Airdopes 141 TWS Earbuds…    │
│ └──────┘ └──────┘ └──────┘ └──────┘              │ Lowest ever                       │
│                                                  │ ₹1,099                            │
│                                                  │ MRP ₹4,490 · Save ₹3,391 (75%)    │
│                                                  │ ┌ Code SAVE20 ────────── Copy ┐   │
│                                                  │ [       Buy at Amazon         ]   │ sticky while the panel scrolls
│                                                  │ Opens Amazon in a new tab…        │
│                                                  │ [WhatsApp] [Telegram] [Copy link] │
│                                                  │ 12 comments ↓                     │
│                                                  │ How to get it  1. … 2. …          │
│                                                  │ Description …                     │
│                                                  │ Related  ┌──┐┌──┐┌──┐             │ 3 compact, "See all"
│                                                  │ Comments (12) …                   │ same component, 5 then "Show more"
│                                                  │ Report a problem                  │
└──────────────────────────────────────────────────┴───────────────────────────────────┘
```
Rules: opens from the right in 200 ms; ✕, Esc, or clicking the dimmed area closes and restores the listing URL and scroll; browser Back closes it too; the selected card shows a ring (▣) while open. Direct visits to /deal/{slug} render the full page (no slide-over without a listing behind). "Open full page" → the two-column page. Chat launcher hidden while open (D-055).

## 2. Categories index (phone; desktop shows the same as a 3-column list at 1200 px) — from menu "Categories ›" and search "All categories ›"
```
┌──────────────────────────────────┐
│ ‹  Categories                    │
│ [🔍 Find a category           ]  │
│ Electronics                 412 ›│  count = live deals
│ Fashion                     301 ›│
│ Grocery                     188 ›│
│ Home & Kitchen              140 ›│
│ Beauty                       96 ›│
│ …                                │
│ Travel                        0 ›│  zero shown greyed, still a link (SEO)
└──────────────────────────────────┘
```
Alphabetical after the top 8 by count; tap → /products/{cat}-deals. Stores index identical: logo · name · count · › → /shops/{shop}; the 19 stores fit one screen, no search box. No icons grid, no hero images (D-031 spirit).

## 3. Report-a-problem sheet (from detail; DEV-013)
```
┌──────────────────────────────────┐
│ ──                               │
│ Report a problem               ✕ │
│ boAt Airdopes 141 TWS…           │  deal title, read-only
│ ○ Link not working               │
│ ○ Price has changed              │
│ ○ Out of stock                   │
│ ○ Something else                 │
│ Note (optional)                  │
│ [                              ] │
│ ( turnstile when signed out )    │
│ [          Send report         ] │
└──────────────────────────────────┘
```
Success replaces the sheet body: "Thanks, we'll check it." and closes after 2 s. One report per deal per device per day (then "Already reported, thanks"). Goes to admin Inbox → Reports with the deal link. Desktop: same as a small centred dialog.

## 4. Feed states (phone shown; desktop same in grid)
First load, static skeleton (no shimmer), 4 cards:
```
│ 312 deals · updated —            │
│ ┌──────────────────────────────┐ │
│ │ ┌────────┐  ▭▭▭▭▭ · ▭▭       │ │
│ │ │ ▭▭▭▭▭▭ │  ▭▭▭▭▭▭▭▭▭▭▭▭▭    │ │
│ │ │        │  ▭▭▭▭▭  ▭▭▭▭▭▭    │ │
│ │ └────────┘  ▭▭▭▭▭▭▭          │ │
│ │  ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭      │ │
│ └──────────────────────────────┘ │
```
Later batch loading: a 24 px inline loader row under the last card; cards keep their place (fixed-ratio image boxes).
Empty filter result:
```
│ [Electronics ×] [≥90% ×] [Croma ×]  Clear all │
│                                  │
│ No deals match these filters.    │
│ [ Clear all filters ]            │
│ Try nearby: Electronics ≥70% ·   │
│ Croma all deals · Audio          │
```
Empty Fresh before the first post:
```
│ No deals posted yet today.       │
│ The first loot usually lands by  │
│ 9 am. Meanwhile:                 │
│ Top picks                        │
│ ┌ card ┐ ┌ card ┐ …              │
```
End of list:
```
│ ┌ card ┐                         │
│ That's all for now.              │
│ [ See Top picks ]    ↑ Back to top│
│ footer (D-056)                   │
```
Chunk failed:
```
│ ┌ card ┐  (16 loaded)            │
│ Couldn't load more deals.        │
│ [ Try again ]                    │
```
"Show more deals" stop (after batches 2–3, D-032):
```
│ ┌ card ┐                         │
│ [      Show more deals        ]  │  page 4 URL on the button
│ footer reachable below           │
```
Deal withdrawn after load: card stays until tap → detail with "No longer available" banner (D-040); never a 404.
