# Admin — Alerts, Social sharing, Affiliate tags, Inbox, Site & app settings, Users, Catalogue, Overview (Law 11)
AGREED v1 · 2026-11-09 (D-060) · Brief: `../ia/briefs/admin.md` v2. Shell per `shells.md` §4. Desktop shown; phone stacks each panel full-width, tables become cards.

## 1. Alerts (push compose + history; D-059, no inbox, no pin)
```
┌──────────────┬──────────────────────────────────────────────────────────────────────┐
│ sidebar      │ Alerts                                                               │
│  Alerts      │ ┌ New alert ───────────────────────────┐ ┌ Preview ─────────────────┐│
│              │ │ Deal or link  [🔍 search deals / URL]│ │ 🔔 OfferTag               ││
│              │ │   ┌──┐ boAt Airdopes 141… ₹1,099  ✕  │ │ boAt Airdopes 141 TWS…    ││
│              │ │   └──┘                               │ │ @ ₹1,099 (75% off)        ││
│              │ │ Message                              │ │ ┌──────┐                  ││
│              │ │ [75% off boAt Airdopes, lowest ever ]│ │ │ img  │                  ││
│              │ │ 0/120                                │ │ └──────┘                  ││
│              │ │ Send to  ☑ Web (OneSignal)  ☑ App    │ └──────────────────────────┘│
│              │ │ [ Send alert ]                       │                              │
│              │ └──────────────────────────────────────┘                              │
│              │ Sent                                                                  │
│              │ ┌────────────────────────────────────────────────────────────────────┐│
│              │ │ 14:02  boAt Airdopes 141… @ ₹1,099       Web ✓ App ✓   Resend ⋯    ││
│              │ │ 11:40  Fortune oil 5 L @ ₹649            Web ✓ App ✗   Retry app   ││
│              │ │ Yesterday                                                          ││
│              │ │ 21:15  Big Billion Day live — top loots  Web ✓ App ✓               ││
│              │ └────────────────────────────────────────────────────────────────────┘│
│              │ ‹ 1 2 3 ›                                                             │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```
Send → confirm "Send to all subscribers now?" with counts if available. "Send push" on a deal row opens this with the deal attached.

## 2. Social sharing
Tabs: Channels · Formats · History.
```
│ Social sharing      (Channels)  Formats  History                                   │
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ f  Facebook Page   OfferTag.in            ● Connected · expires in 52 days      │ │
│ │                                           [Reconnect] [Disconnect]              │ │
│ │ p  Pinterest       board: Loot deals ▾    ● Connected                           │ │
│ │ @  Threads         @offertag              ○ Not connected   [Connect]           │ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
│ Meta and Pinterest app approval is pending until week 7 (BRD); channels stay greyed │
│ with "Awaiting platform approval" until then.                                      │
```
Formats (one card per platform, same layout):
```
│ Channels  (Formats)  History                                                        │
│ ┌ Facebook Page ──────────────────────────────┐ ┌ Preview (sample deal) ───────────┐│
│ │ Image     ☑ include deal image              │ │ ┌──────────────────────────────┐ ││
│ │ Text                                        │ │ │ img                          │ ││
│ │ [🔥 {pct}% off · {title}                   ]│ │ └──────────────────────────────┘ ││
│ │ [₹{price} (MRP ₹{mrp}) at {store}          ]│ │ 🔥 75% off · boAt Airdopes 141   ││
│ │ [{coupon_line}                             ]│ │ ₹1,099 (MRP ₹4,490) at Amazon    ││
│ │ [{short_link}                              ]│ │ Code: SAVE20                     ││
│ │ Insert: {title}{price}{mrp}{pct}{store}     │ │ oftg.in/ABCDE                    ││
│ │         {coupon_line}{short_link}           │ │ link carries tag: offertagfb-21  ││
│ │ Amazon tag for this platform: offertagfb-21 │ └──────────────────────────────────┘│
│ │ (from Affiliate tags)                       │                                     │
│ │ [ Save format ]                             │                                     │
│ └─────────────────────────────────────────────┘                                     │
│ ▸ Pinterest   ▸ Threads                                                             │
```
`{coupon_line}` renders "Code: X" or nothing. History:
```
│ Channels  Formats  (History)      Platform ▾  Status ▾                              │
│ 14:05  boAt Airdopes 141…   Facebook  ✓ view post    Adil                           │
│ 14:05  boAt Airdopes 141…   Threads   ✗ token expired  [Retry]   Adil               │
│ 13:10  Fortune oil 5 L…     Pinterest ✓ view pin      Sub-admin 2                    │
```

## 3. Settings → Affiliate tags (B16)
```
│ Affiliate tags                                                                      │
│ Which tag goes on each link, so sales can be traced to where they came from.        │
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Where the link is used        Amazon tag        Flipkart id      Used on        │ │
│ │ Website (deal page)           offertag-21       offertag         Buy buttons    │ │
│ │ Short links / WhatsApp (/d/)  offertag1-21      offertag         Share copies   │ │
│ │ Google / ?source=             offertag2-21      offertag         Search traffic │ │
│ │ Facebook (?fbclid, FB posts)  offertagfb-21     offertag         FB, Formats    │ │
│ │ Pinterest                     [            ]    [          ]     Formats        │ │
│ │ Threads                       [            ]    [          ]     Formats        │ │
│ │ Android app                   offertag-21       offertag         App buy button │ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
│ Inline edit · [Save]                                                                │
│ Per-poster tags: set on each user in Users → Amazon tag. A poster's tag replaces     │
│ the website tag on links they share from the admin. (W53)                           │
```

## 4. Inbox (Feedback · Reports · Deletion requests)
```
│ Inbox            (Feedback 3)   Reports 2   Deletion requests 1      ☑ Unhandled only │
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Issue       rahul@…      2 h    Shop Now on boAt deal goes to 404     ☐ Handled │ │
│ │ Suggestion  priya@…      5 h    Add a dark mode to the app            ☐ Handled │ │
│ │ Appreciation —           1 d    Saved ₹3,000 on my TV, thanks!        ☑ Handled │ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
Reports tab row:
│ │ Price changed  boAt Airdopes 141… ↗   anon · 40 min   "Now ₹1,299"  [Edit deal] ☐ │
│ │ Link dead      Fortune oil 5 L… ↗     rahul@… · 3 h                 [Edit deal] ☐ │
Deletion requests row:
│ │ Rahul S. · rahul@… · 98xxxxxx21 · "Not using anymore" · 1 d   [Mark deleted] Dismiss │
```
"Mark deleted" is recorded after the dev-side deletion; it does not delete by itself (Law 4).

## 5. Settings → Site & app (B33)
```
│ Site & app settings                                                                 │
│ Home                                                                                │
│   Hottest strip            [on ●]   Source (●) Pinned deals ( ) Top 8 by % today   │
│   Community bar            [on ●]   WhatsApp [https://chat.whatsapp.com/…]          │
│                                     Telegram [https://t.me/OffertagLoot]            │
│   Blog "New" badge         [on ●]                                                   │
│ Links (footer, menu, app)                                                           │
│   WhatsApp group [ ]  Telegram [ ]  Facebook [ ]  Instagram [ ]  LinkedIn [ ]       │
│   Play Store [https://play.google.com/store/apps/details?id=app.offertag]           │
│   Support email  [support@offertag.in]                                              │
│ Help                                                                                │
│   Live chat (Tawk.to)      [on ●]                                                   │
│ [ Save ]   Changes apply to the website at once and to the app on next open.        │
```

## 6. Users
```
│ Users                     [🔍 name, email, phone]   Role ▾                          │
│ Name          Email             Phone        Role       Joined     Amazon tag       │
│ Rahul S.      rahul@…           98xxxxxx21   Member     2024-03    —                │
│ Sub-admin 2   posts@…           —            Sub-admin  2025-01    offertag3-21 ✎   │
│ Adil          adil@…            —            Admin      2019-06    offertag-21  ✎   │
│ ‹ 1 2 … 1,926 ›                                                                     │
```
No points, no export (DEV-014). Role change and block are not in scope unless asked (not in BRD or today).

## 7. Catalogue (Shops · Categories · Deal types · Types) — one list + edit drawer pattern
```
│ Catalogue     (Shops 19)  Categories 50  Deal types 5  Types 1        [+ Add shop]  │
│ [🔍]  ☑ Active only                                                                 │
│ Logo  Name        Card label  Affiliate value     Order  Active                     │
│ [a]   Amazon      Amazon      tag=offertag-21     1      [●]   Edit                 │
│ [f]   Flipkart    Flipkart    affid=offertag      2      [●]   Edit                 │
│ [b]   BigBasket   BigBasket   —                   3      [●]   Edit                 │
Edit drawer (shop):
│ Name [Amazon]  Card label [Amazon] (≤13)  Logo ┌──┐ Replace                         │
│ Affiliate value [tag=offertag-21]  Order [1]  Active [●]                            │
│ Default "How to get it" steps [ … ]  (pre-fills new deals from this shop)           │
│ SEO description (shop page footer) [ … ]                                            │
│ [Save]   Delete (blocked while deals exist)                                         │
Deal types tab: Name · Order (1 = Home tab, Q-021) · Active · Edit. Types tab: read-only list.
```

## 8. Overview (admin only)
```
│ Overview · Sunday 9 Nov                                  [+ Post a deal] [Review incoming 3] │
│ ┌ Posted today ┐ ┌ Incoming ┐ ┌ Alerts sent ┐ ┌ Inbox unhandled ┐ ┌ Pinned slots ┐          │
│ │     41       │ │    3     │ │     2       │ │       5          │ │  3 of 4      │          │
│ └──────────────┘ └──────────┘ └─────────────┘ └──────────────────┘ └──────────────┘          │
│ Latest live deals (5)                              Recent shares (5)                        │
│ 14:02 boAt Airdopes… Loot ●Live                    14:05 boAt… Facebook ✓ · Threads ✗        │
│ …                                                  …                                         │
```
Sub-admin lands on All deals instead.

## 9. Settings → Security (Muiz, 22 Nov; `/admin/security`, admin only)
Built in the prototype: `build/admin_e.py`, `js/admin-e.js`, `bc-*` / `fl-*` rules in `css/admin.css`. APIs #77–80; rules in `offertag-backend/docs/project/features/security.md`.
- **Bot check first.** One switch, "Bot check for all visitors" (never "panic" or "block"). Turning on asks first; turning off does not. Pill Off / Turning on… / On, plus who changed it last and when. While on: orange edge and a warning to turn it off once the site is normal. State is read from Cloudflare every time the screen loads.
- **Flagged IPs below.** Live rows only, newest first: IP (an IPv6 /64 shown as one), status (Flagged · Always allowed), why and by whom (the click counter or a staff name), added, until. "Let back in" for flagged rows, "Remove" for others, both with a confirm. Phone: one card per IP, the button on its own row.
- No Block button (no API).
