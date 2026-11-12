# Contact, error pages, Blog — ASCII (Law 11)
AGREED v1 · 2026-11-09 (D-061) · Brief: `../ia/briefs/static-blog.md`.

## Contact & feedback `/contact` (phone)
```
┌──────────────────────────────────┐
│ ‹ Contact                        │
│ support@offertag.in              │
│ [Chat with us]  WhatsApp Telegram│
├──────────────────────────────────┤
│ Send feedback                    │
│ (Issue) Suggestion  Appreciation │ segmented
│ Email  [ you@example.com       ] │ prefilled if signed in
│ Message                          │
│ [                              ] │
│ ( turnstile )                    │
│ [ Send ]                         │
│ ✓ Thanks, we read every message. │ inline success
└──────────────────────────────────┘
```

## Error family (phone; desktop same, centred)
```
┌──────────────────────────────────┐
│ ≡      [Offertag logo]        🔍 │
│                                  │
│ We couldn't find that page.      │ 404 · 403: "You don't have access to this."
│ [ Go to Fresh deals ]            │ 500: "Something broke on our side." [Try again]
│ [🔍 Search deals…              ] │ offline: "You're offline" [Retry]
├──────────────────────────────────┤
│ Fresh deals                      │
│ ┌ card ┐ ┌ card ┐ …              │ never a dead end
└──────────────────────────────────┘
```
Deal no longer available: detail layout with banner (see `deal-detail.md` § Withdrawn).

## Blog index `/blog` (desktop)
```
│ header (D-047)                                                     │
│ Blog                                                               │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │ ┌──────┐ Best TWS earbuds under ₹1,500 this week             │   │
│ │ │cover │ Five picks with live prices, updated daily.          │   │
│ │ └──────┘ 9 Nov · 4 min read                                   │   │
│ ├──────────────────────────────────────────────────────────────┤   │
│ │ ┌──────┐ How to stack bank offers on Flipkart                 │   │
│ │ └──────┘ 6 Nov · 3 min read                                   │   │
│ └──────────────────────────────────────────────────────────────┘   │
│ ‹ 1 2 3 ›                                                          │
```
## Blog post `/blog/{post-name}` (desktop; phone stacks, deals rail becomes inline cards)
```
│ Home › Blog › Best TWS earbuds under ₹1,500                          │
├──────────────────────────────────────┬──────────────────────────────┤
│ Best TWS earbuds under ₹1,500        │ Deals in this post   (sticky)│
│ OfferTag · 9 Nov · 4 min read        │ ┌──────┐ boAt Airdopes 141   │
│ ┌──────────────────────────────────┐ │ │ img  │ ₹1,099 · 75% off    │
│ │ cover                            │ │ └──────┘ [Buy at Amazon]     │
│ └──────────────────────────────────┘ │ ┌──────┐ Noise Buds VS104    │
│ Body text at 65ch…                   │ └──────┘ ₹999 · 60% off      │
│ ## 1. boAt Airdopes 141              │                              │
│ ┌ embedded Compact card ───────────┐ │ Share  WA · TG · Copy        │
│ │ img · Amazon · ₹1,099 · [Buy]    │ │                              │
│ └──────────────────────────────────┘ │                              │
│ …                                    │                              │
│ Deals mentioned (5)                  │                              │
│ More in Electronics  ┌──┐┌──┐┌──┐    │                              │
│ Related posts (3)                    │                              │
├──────────────────────────────────────┴──────────────────────────────┤
│ footer                                                              │
```
