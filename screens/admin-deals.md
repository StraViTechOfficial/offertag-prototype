# Admin — Incoming deals, Deals list, Post/edit deal (Law 11)
v2 2026-11-11: §3 post form carries the content contract blocks (D-077, D-081); Incoming rows show source and hold reason (D-079). Contract: `../ia/deal-content-contract.md`.
AGREED v1 · 2026-11-09 (D-059) · Brief: `../ia/briefs/admin.md` v2. Shell per `shells.md` §4. Labels are placeholders (D-034).

## 1. Incoming deals — desktop
```
┌──────────────┬──────────────────────────────────────────────────────────────────────┐
│ sidebar      │ Incoming deals                                  [Approve all 3 ▾]    │
│  Incoming  3 │ (Pending 3)  Approved today 41   Rejected 2                           │
│              │ ┌────────────────────────────────────────────────────────────────────┐│
│              │ │ ☐ [TG] ┌──┐ boAt Airdopes 141 TWS…          Amazon · Electronics   ││
│              │ │        │im│ ₹1,099 · MRP ₹4,490 · 75%   Loot, Top   ⚠ similar posted ││
│              │ │        └──┘ received 2 min ago                 [Approve] Edit Reject││
│              │ ├────────────────────────────────────────────────────────────────────┤│
│              │ │ ☐ [Quick] ┌──┐ Fortune Sunflower Oil 5 L…  BigBasket · Grocery     ││
│              │ │           │im│ ₹649 · MRP ₹899 · 28%       Top, Pantry              ││
│              │ │           └──┘ received 14 min ago            [Approve] Edit Reject││
│              │ ├────────────────────────────────────────────────────────────────────┤│
│              │ │ ☐ [TG] ┌──┐ (no image fetched)  Samsung 25W…  — store? · — category ││
│              │ │        └──┘ ₹1,299 · MRP — · —%             New                     ││
│              │ │             received 1 h ago                  [Approve] Edit Reject││
│              │ └────────────────────────────────────────────────────────────────────┘│
│              │ Approve = publish now with auto types; ≥90 % also sends a push.       │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```
Reject → small popover: reason (optional) · [Reject]. Approve on a row with missing store/category → opens Edit instead, fields highlighted.

## 1b. Incoming deals — phone
```
┌──────────────────────────────────┐
│ ≡   Incoming (3)        🔍 + Post│
│ (Pending 3)  Approved  Rejected  │
│ ┌──────────────────────────────┐ │
│ │ [TG] 2 min ago   ⚠ similar   │ │
│ │ ┌────┐ boAt Airdopes 141 TWS │ │
│ │ │ im │ Amazon · Electronics  │ │
│ │ └────┘ ₹1,099 · ₹4,490 · 75% │ │
│ │        Loot, Top             │ │
│ │ [     Approve     ] [ Edit ] │ │ 48 px, thumb reach
│ │ Reject                       │ │
│ └──────────────────────────────┘ │
```

## 2. Deals list — desktop
```
┌──────────────┬──────────────────────────────────────────────────────────────────────┐
│ sidebar      │ All deals                                          [+ Post a deal]   │
│              │ [🔍 title, link…] Status ▾  Type ▾  Store ▾  Category ▾  Pinned ▾  Date ▾│
│              │ [Approved ×] [Amazon ×] Clear all · 12,480 deals · 25 ▾ per page       │
│              │ ┌────────────────────────────────────────────────────────────────────┐│
│              │ │☐ img Title                     Store    ₹ / MRP / %  Type  Status Pin Posted ↓ Views ⋯││
│              │ │☐ ┌─┐ boAt Airdopes 141 TWS…    Amazon   1,099/4,490/75 Loot  ●Live  3   2 h   412  ⋯││
│              │ │☐ └─┘                                                                  ││
│              │ │☐ ┌─┐ Fortune Sunflower Oil 5 L  BigBasket 649/899/28    Top   ●Live  —   3 h    88  ⋯││
│              │ │☐ ┌─┐ Samsung 25W charger…       Flipkart 1,299/1,999/35 New  ○Sched —   tmrw   —   ⋯││
│              │ │☐ ┌─┐ Pigeon 1.5 L kettle…       Amazon   599/1,245/52   Top   ●Live  —   1 d   1.2k ⋯││
│              │ └────────────────────────────────────────────────────────────────────┘│
│              │ ‹ 1 2 3 … 500 ›                                                       │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
⋯ row menu: Edit · Clone · Copy for WhatsApp · Copy buy link · Share… · Bump to top · Pin/unpin · Send push · Change status ▸ · Delete
```
Bulk bar (appears when ≥1 selected):
```
│ 3 selected   [Edit…] [Bump to top] [Copy for WhatsApp] [Share to…] [Change status ▾] [Delete]   ✕ │
```
Bulk edit drawer (right, 420 px):
```
┌──────────────────────────────┐
│ Edit 3 deals              ✕  │
│ Only ticked fields change.   │
│ ☐ Status        [Approved ▾] │
│ ☐ Deal types    [Loot][Top]  │
│ ☐ Category      [        ▾]  │
│ ☐ Store         [        ▾]  │
│ ☐ Display       [Web+App ▾]  │
│ ☐ Pinned        [off]        │
│ ☐ Send push     [off]        │
│ [ Apply to 3 deals ]         │
└──────────────────────────────┘
```
After any bulk action: toast "3 deals bumped to top · Undo" (10 s).

Phone row (card):
```
│ ┌──────────────────────────────┐ │
│ │ ┌──┐ boAt Airdopes 141 TWS…  │ │
│ │ │im│ Amazon · ₹1,099 · 75%    │ │
│ │ └──┘ ●Live · Pin 3 · 2 h     │ │
│ │ [ Edit ]  Copy for WhatsApp ⋯ │ │
│ └──────────────────────────────┘ │
```

## 3. Post / edit deal — desktop (edit state shown)
```
┌──────────────┬──────────────────────────────────────────────────────────────────────┐
│ sidebar      │ ‹ All deals     Edit deal · last edited by Adil, 2 h ago              │
│              │ ┌─────────────────────────────────────┐ ┌──────────────────────────┐ │
│              │ │ Deal link                            │ │ Preview                  │ │
│              │ │ [https://amzn.in/d/abc…          ] │ │ ┌──────────────────────┐ │ │
│              │ │ ☐ Clean URL (strip query string)     │ │ │ Amazon · Electronics │ │ │
│              │ │ ⚠ Similar deal posted today → view   │ │ │ boAt Airdopes 141…   │ │ │
│              │ │ Image      ┌────┐ [Replace] [Upload] │ │ │ ₹1,099  MRP ₹4,490   │ │ │
│              │ │            └────┘                    │ │ │ Save ₹3,391  [Buy]   │ │ │
│              │ │ Title                                │ │ └──────────────────────┘ │ │
│              │ │ [boAt Airdopes 141 TWS Earbuds…    ] │ │ Comfortable ○ Compact    │ │
│              │ │ Store [Amazon ▾]  Category [Electr ▾]│ │ Open public page ↗       │ │
│              │ │ Price [1099]  MRP [4490]  Off [75]%  │ ├──────────────────────────┤ │
│              │ │ Deal types  [Loot ✓][Top ✓][New][Pan]│ │ Share                    │ │
│              │ │ Caption [Lowest ever ]  Source: scraper│ │ ☑ Facebook Page          │ │
│              │ │ Coupon [SAVE20 ] Terms [above ₹999  ]│ │ ☐ Pinterest              │ │
│              │ │ Offer details  + add                 │ │ ☑ Threads                │ │
│              │ │   [10% off with HDFC cards      ] ✕  │ │ preview: FB ▾            │ │
│              │ │ Highlights · Links · Note · Specs    │ │ ┌──────────────────────┐ │ │
│              │ │   (collapsed when blank, + add each) │ │ │ img · 75% off boAt…  │ │ │
│              │ │ Description [B I • ≡ 🔗 only       ] │ │ │ ₹1,099 · oftg.in/ABC │ │ │
│              │ │ Steps: Amazon default (5) ▸ edit     │ │ └──────────────────────┘ │ │
│              │ │   Exceptions [Apply code at checkout]│ │ [ Share now ]            │ │
│              │ │ Display [Web + App ▾]                │ │ │ ₹1,099 · oftg.in/ABC │ │ │
│              │ │ Pin ☐  Slot [3 ▾]                    │ │ └──────────────────────┘ │ │
│              │ │ Publish  (●) Now  ( ) Schedule [date]│ │ [ Share now ]            │ │
│              │ │ Notify push ☑ (auto at ≥90 %)        │ ├──────────────────────────┤ │
│              │ │                                      │ │ Share history            │ │
│              │ │ [ Save changes ]  [Bump to top] Delete│ │ Threads · 2 h · ✓ view   │ │
│              │ └─────────────────────────────────────┘ │ Facebook · 2 h · ✗ Retry │ │
│              │                                          └──────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```
New-deal state: header "Post a deal"; right column shows Preview only (Share appears after publish). After Publish → success panel: public link · short link [Copy] · [Copy for WhatsApp] · [Share to…] · [Post another].

## 3b. Post / edit — phone (stacked, one column)
```
┌──────────────────────────────────┐
│ ‹   Post a deal                  │
│ Deal link [                    ] │
│ ☐ Clean URL                      │
│ Image  ┌────┐ Replace · Upload   │
│ Title  [                       ] │
│ Store [▾]   Category [▾]         │
│ Price [    ] MRP [    ] Off [ ]% │
│ Types [Loot✓][Top✓][New][Pantry] │
│ Caption [          ]             │
│ Coupon [      ] Terms [        ] │
│ ▸ Offer details · Highlights ·   │ blocks collapsed when blank
│   Links · Note · Specs  (+ add)  │
│ Description [B I • ≡ 🔗        ] │
│ Steps: store default ▸ Exceptions│
│ Display [Web+App ▾]  Pin ☐ [3▾]  │
│ Publish (●)Now ( )Schedule       │
│ Notify push ☑                    │
│ ▸ Preview                        │ collapsed
├──────────────────────────────────┤
│ [          Publish            ]  │ sticky
└──────────────────────────────────┘
```
