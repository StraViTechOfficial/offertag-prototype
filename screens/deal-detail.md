# Deal detail — ASCII mockups (Law 11)
AGREED v3 · 2026-11-11 (D-077–D-081; v3 section at the end) · v2 2026-11-09 (D-058) · v1 approved in D-051 (S08 chat); v2 adds coupon, caption, comment link, comments with replies and likes, "More from store", alerts row, Amazon/Flipkart links ⟨Q-034⟩. View counter not shown ⟨Q-033⟩. Brief: `../ia/briefs/deal-detail.md`.

## Phone
```
┌──────────────────────────────────┐
│ ‹ Deals        [Offertag]     ⤴ │ top bar: back to feed (position restored) · share
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │                              │ │ image, white well, tap → zoom
│ │            img      [75%]    │ │
│ └──────────────────────────────┘ │
│ Loot · Amazon (logo) · 2 h ago   │ type · store · posted
│ boAt Airdopes 141 TWS Earbuds    │ title (H1)
│ with 42H Playback                │
│ Lowest ever                      │ caption label (when present)
│ ₹1,099                           │ price, Jost
│ MRP ₹4,490   Save ₹3,391 (75%)   │
│ ┌ Code SAVE20 ──────── Copy ┐    │ coupon chip (when present) · tap → "Copied"
│ Opens Amazon in a new tab.       │ disclosure line (D-050)
│ We may earn a commission.        │
│ [WhatsApp] [Telegram] [Copy link]│ share row
│ 12 comments ↓                    │ jumps to comments
├──────────────────────────────────┤
│ How to get it                    │
│ 1. Open the deal page            │ deal_step as numbered steps
│ 2. Apply code SAVE20 at checkout │ links = styled anchors (B06)
│ Description                      │
│ …                                │
├──────────────────────────────────┤
│ Related deals                    │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐      │ 6–8, same category then store
│ See all in Electronics ›         │
│ More from Amazon ›               │
│ Search this on Amazon · Flipkart │ ⟨Q-034⟩ quiet text links
├──────────────────────────────────┤
│ Never miss a loot                │
│ 🔔 Browser alerts · WA · TG      │ replaces today's static notice
├──────────────────────────────────┤
│ Comments (12)                    │
│ ┌──────────────────────────────┐ │
│ │ Write a comment…             │ │ signed in · else [Sign in to comment]
│ └──────────────────────────────┘ │
│ (R) Rahul · 1 h                  │
│ Price back to ₹1,299 now         │
│ ♡ 3   Reply                      │
│   └ (A) Admin · 40 min           │ reply, one level
│     Still ₹1,099 for me, try app │
│     ♡ 1   Reply                  │
│ (P) Priya · 3 h                  │
│ Got it, thanks!                  │
│ ♡ 0   Reply                      │
│ [ Show more comments ]           │
├──────────────────────────────────┤
│ Report a problem                 │ link dead / price changed → feedback (DEV-013)
├──────────────────────────────────┤
│ footer (D-056)                   │
└──────────────────────────────────┘
sticky bar (phone):
┌──────────────────────────────────┐
│ SAVE20 ⧉  ₹1,099  [ Buy at Amazon ]│ coupon chip only when present
└──────────────────────────────────┘
```
## Desktop (two columns; right panel sticky)
```
┌────────────────────────────────────────────────────────────────────────────┐
│ header (D-047)                                                             │
│ Home › Electronics › boAt Airdopes 141                                     │ breadcrumb
├───────────────────────────────────┬────────────────────────────────────────┤
│ ┌───────────────────────────────┐ │ Loot · Amazon (logo) · 2 h ago         │
│ │                               │ │ boAt Airdopes 141 TWS Earbuds with     │
│ │           img                 │ │ 42H Playback                           │
│ │                      [75%]    │ │ Lowest ever                            │
│ └───────────────────────────────┘ │ ₹1,099                                 │
│                                   │ MRP ₹4,490 · Save ₹3,391 (75%)         │
│ How to get it                     │ ┌ Code SAVE20 ─────────────── Copy ┐   │
│ 1. …  2. …                        │ [        Buy at Amazon          ]      │
│ Description                       │ Opens Amazon in a new tab. We may earn │
│ …                                 │ a commission.                          │
│                                   │ [WhatsApp] [Telegram] [Copy link]      │
│ Comments (12)                     │ 12 comments ↓                          │
│ [ Write a comment… ]              │                                        │
│ (R) Rahul · 1 h  …  ♡ 3  Reply    │ Never miss a loot                      │
│   └ (A) Admin · 40 min … ♡ 1      │ 🔔 Browser alerts · WhatsApp · Telegram│
│ [ Show more comments ]            │                                        │
│ Report a problem                  │                                        │
├───────────────────────────────────┴────────────────────────────────────────┤
│ Related deals                                                              │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                                  │
│ See all in Electronics ›   More from Amazon ›   Search on Amazon · Flipkart│
├────────────────────────────────────────────────────────────────────────────┤
│ footer (D-056)                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```
Slide-over (D-050) shows the right panel content plus image at the top, with "Open full page ↗"; comments load inside the slide-over below the steps.

## Withdrawn (D-040)
Banner under the top bar "This deal is no longer available"; price block greyed; button → "See similar deals" (scrolls to related); coupon hidden; comments stay.

## v3 — content blocks (D-077–D-081, contract `../ia/deal-content-contract.md`)
Phone; every line marked ⟨opt⟩ disappears when the field is blank. Desktop keeps the two-column layout of v2 with 1–11 in the sticky panel.
```
┌──────────────────────────────────┐
│ ‹ Deals        [Offertag]     ⤴ │
│ ┌──────────────────────────────┐ │
│ │            img      [75%]  ⌕ │ │ % only when MRP exists
│ └──────────────────────────────┘ │
│ Loot · Amazon · 2 h ago          │
│ iQOO Z11x 5G (Eclipse Black…)    │ H1
│ ↘ Lowest ever                    │ ⟨opt⟩ caption
│ ₹14,999                          │
│ MRP ₹19,999   Save ₹5,000 (25%)  │ MRP line only when MRP exists
│ ┌ Code SAVE20 ────────── Copy ┐  │ ⟨opt⟩ coupon
│   on orders above ₹999           │ ⟨opt⟩ coupon terms
│ % 10% off with HDFC cards, ≤₹1,500│ ⟨opt⟩ offer details, 1–4 lines
│ % Exchange up to ₹3,000          │
│ [        Buy at Amazon        ]  │
│ Opens Amazon in a new tab. We may│
│ earn a commission.               │
│ ⚠ Location specific, first order │ ⟨opt⟩ note
│ [WhatsApp] [Telegram] [Copy link]│
│ 12 comments ↓                    │
│ Never miss a loot  🔔 · WA · TG  │
├──────────────────────────────────┤
│ Highlights                       │ ⟨opt⟩
│ • 8GB RAM, 256GB storage         │
│ • 5G, 50 MP camera               │
│ Links                            │ ⟨opt⟩ multi-link posts
│ Men        myntr.it            › │
│ Women      myntr.it            › │
│ Description                      │ ⟨opt⟩ cleaned prose
│ …                                │
│ Specs                            │ ⟨opt⟩
│ RAM            8GB               │
│ Storage        256GB             │
│ ▸ How to get it · 5 steps at Amazon│ collapsed (D-080)
│   1. Apply code SAVE20 at checkout│ exception lines open the block, bold
│   2. Open the deal page …        │
├──────────────────────────────────┤
│ Related deals · See all · More from · Search on Amazon · Flipkart │
│ Comments (12) … Report a problem · footer │
└──────────────────────────────────┘
sticky bar:  SAVE20 ⧉  ₹14,999  [ Buy at Amazon ]     (coupon chip ⟨opt⟩)
```
Minimum page (only the six required fields): image, kicker, title, price, Buy, disclosure, share, alerts, collapsed steps, related, comments, report. No empty headings.
