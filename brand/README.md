# Brand foundation — APPROVED 2026-11-09: B Royal + Jost/Inter (D-037, D-038). Final spec in `brand.md`; this file documents the comparison page.

## Source
- Logo: `assets/offertag-logo.png`, byte-identical copy of `/mnt/d/PC-Downloads/logo.png` (D-013). 1959×803 PNG, white background, raster only.
- Logo navy measured from the mark's pixels: dominant **#082454**, shadow side #00143C, weighted mean #062051. Canonical brand navy = **#082454** (navy-800).
- Tagline colour in the logo is pure black; wordmark and mark are the navy.

## What the page shows
`palette-themes.html` — open in a browser. Three themes (tabs), each in light and dark, same sample content: nav, deal-type chips, text roles, buttons, inputs, two deal cards, swatches, live contrast table.

| Theme | Idea | Accent role |
|---|---|---|
| A · Ink | Navy-led monochrome | None. Badge = navy tint. Emphasis by weight and size. Research: weakest scan-ability. |
| B · Royal | Navy + antique gold | Badge, savings, shop label, 2px nav rule. Research: clashes with Amazon orange on cards. |
| C · Lagoon | Navy + deep teal | Savings, badge, shop label, nav rule; price stays neutral. Research: recommended. |

Shared across all three: navy scale (50–950) from #082454, navy-tinted neutrals (0–950), semantic ok/warn/err, radii 6/8/12, type selectable (Manrope, Inter, system stack; one family each).

Research-driven rules baked into the page (see `research-to-brand.md`): image well stays white in dark mode; price hierarchy current → MRP → Save ₹x in the accent; CTA names the store; WhatsApp share on the card; expired = text + icon + greyscale; red for form errors only; pressed states visible; one font family.

## Contrast
Every text role, button label, badge, price and label pair passes WCAG AA (most AAA) in both modes. Input border and focus ring pass the 3:1 UI minimum. Decorative borders are exempt. Verified by script; the page recomputes live from its own CSS variables.

## Known gaps
- Dark mode has no reversed logo; page uses a white plate (Q-006).
- Logo is raster only; a vector master is needed for crisp rendering and favicon (Q-009).
- Palette will be formalised as tokens in P3 once a theme and the stack are chosen.
