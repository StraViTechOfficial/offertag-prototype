# Research → brand: what changed and why
Written 2026-11-09. Each line is a research finding and the palette or type consequence it forces. Proposals until the user picks (Q-007, Q-008).

| # | Finding (source) | Consequence for brand |
|---|---|---|
| 1 | Product photos from Amazon/Flipkart have white backgrounds (competitor cards, every site) | The image well stays light in dark mode. A white photo on a navy card is a glare box; a light well with a soft edge is calm. New token `--img-well`. |
| 2 | Store logos sit on every card: Amazon orange/yellow, Flipkart blue/yellow, Myntra pink, WhatsApp green (audience §2, competitors) | Accent must not collide with those. Gold sits next to Amazon's orange and muddies; teal and navy stay clear of all of them. Weighs against Royal, for Lagoon. |
| 3 | "Limited-time deal" is the second most common scam lure; 88% report dark patterns (audience §3) | No red or orange for marketing. Red is reserved for form errors only. Expiry is neutral, informational text with an icon. Discount badge uses the accent, never red. |
| 4 | Older users, 80.9% literacy, 10% English speakers, presbyopia tail (audience §4) | Body 16 px minimum, 44 px targets, labelled price pair, rupee saving in words. Type must have a high x-height, open apertures and unambiguous 1/7, 0/O. Geometric display faces (Jost, Outfit) fail this at small sizes; dropped. |
| 5 | Mid-range Android on 4G, JS and image weight decide LCP (audience §1, §6) | One font family, variable, self-hosted, or the system stack with zero download. Two-family pairings dropped. |
| 6 | 2–5% colour-vision deficiency; red/green as the only cue fails (audience §5) | Expired state is text + icon + greyscale, never colour alone. Savings colour never pairs with a red counterpart on the card. |
| 7 | 50–70% of Android users estimated to run dark mode (audience §5) | Dark mode is a first-grade token set, shown beside light on every sample, badges re-checked at 4.5:1 on dark surfaces. Done. |
| 8 | Unlabelled price pairs and "₹0" cards are the observed failure (competitors India) | Price hierarchy by colour and weight: current price strongest, MRP muted strike-through, "Save ₹x" in the accent. This is the accent's main job. |
| 9 | Nobody occupies calm, trustworthy, quick (competitors) | Navy-led, one accent used only for savings/type, no emoji, no gradients, no counters. Confirms the direction. |
| 10 | Pure monochrome risks cards that do not scan (brand page note, confirmed by #4 and #8) | Ink (A) kept for comparison but flagged weakest for scanning at 360 px. |
| 11 | Links open in Telegram/WhatsApp in-app browsers; no hover (audience §1) | Pressed states defined and visible; focus ring 3:1 on both modes; nothing depends on hover. |
| 12 | Festive weeks multiply volume and reprices (audience §2) | Reserve one `--campaign` accent slot in tokens for a sale window. Not designed now (DEV-006 unapproved). |
| 13 | Fonts must render ₹ and tabular numerals for aligned prices | Manrope, Inter and the system stack (Roboto, Segoe UI, SF) all carry ₹ and `tnum`. |

## Theme scoring against the research
| Criterion | A Ink | B Royal | C Lagoon |
|---|---|---|---|
| Card scan-ability at 360 px (#4, #8) | Weak | Good | Good |
| Clear of store-logo colours (#2) | Best | Weak (Amazon orange) | Good |
| Reads calm, not urgent (#3, #9) | Best | Good | Good |
| AA in both modes without special cases (#7) | Yes | Yes, gold text needs the 800 step on light | Yes |
| Premium / royal signal (client brief, D-014) | Medium | Strongest | Medium |
| CVD safety (#6) | Best | Good | Good |

Decision 2026-11-09: **B Royal** chosen by the user (D-037); the Amazon-orange caveat is accepted and mitigated by keeping gold off the store row and buttons.

## Type options (revised)
| Option | What | Cost on 4G | Note |
|---|---|---|---|
| 1 Manrope | One variable family, 400–800 | ~35 KB woff2 self-hosted | Geometric-humanist, high x-height, good ₹ and numerals. Pairs with the logo's geometry without copying it. |
| 2 Inter | One variable family | ~40 KB (Latin subset) | Most neutral; ubiquitous. |
| 3 System stack | Roboto / Segoe UI / SF, no download | 0 KB | Fastest; brand feel comes from colour and spacing only. |
Decision 2026-11-09: Jost (headings, prices) + Inter (body) chosen by the user (D-038); Jost kept out of text under 20 px.
