# OfferTag brand foundation
Approved 2026-11-09 (D-013, D-014, D-017, D-037, D-038). Source of truth for P3 tokens.

## Logo
- Asset: `assets/offertag-logo.png`, used exactly as supplied (D-013). Navy bag mark, geometric "Offertag" wordmark, tagline "Bachat Har Shopping Par".
- Clear space: half the mark's height on all sides. Minimum height 24 px in a phone header, 32 px on desktop.
- On dark surfaces: white plate with 6 px radius behind the logo until a reversed logo arrives (Q-006).
- Never recolour, stretch, crop the tagline off without approval, add shadows or effects. Favicon and crisp scaling wait for a vector master (Q-009).

## Colour
Measured logo navy: #082454 (navy-800). All scales derive from it; neutrals are navy-tinted.

Navy: 50 #EEF3FC · 100 #DCE5F7 · 200 #B3C6EE · 300 #7FA0E0 · 400 #4A78CC · 500 #2254AD · 600 #16418F · 700 #0E3270 · **800 #082454** · 900 #061A42 · 950 #04112D
Neutral: 0 #FFFFFF · 50 #F5F7FB · 100 #E9EDF4 · 200 #D6DCE8 · 300 #B4BDCF · 400 #8A96AE · 450 #7C889F · 500 #66738F · 600 #475473 · 700 #2B3752 · 800 #1B2640 · 900 #111A2E · 950 #0A1022
Gold (accent): 100 #F7EDD3 · 300 #E6CC8D · 400 #D6B35E · 500 #C49A3C · 700 #8A6A1E · 800 #6E5316 · 950 #2A2412
Gold usage: badge = gold-500 bg / navy-900 text (light), gold-400 bg / navy-950 text (dark). Gold as text = gold-800 on light, gold-400 on dark. Never gold-500 as text on white (fails AA).
Semantic: ok 100 #DCF5E7 / 300 #4CC38A / 800 #166A41 · warn 300 #F5B84A / 700 #8A5200 · err 100 #FDE3E1 / 300 #F97066 / 700 #B42318
Third-party: WhatsApp #25D366 (icon only, never as text colour).

Rules
- Accent appears only on: discount badge, savings line, type label, nav rule, and the "Buy at {Store}" button (D-070, 2026-11-09; client checkpoint pending). Nowhere else; never adjacent to a store logo (Amazon orange), never on any other button, never as large fills.
- Red/orange never for marketing, urgency or discounts. Red = form errors and destructive admin actions only.
- Expired = text + icon + greyscale, never colour alone.
- Image well is white in both modes (product photos have white backgrounds).
- Every text pair ≥ 4.5:1, UI boundaries ≥ 3:1, in both modes. Verified in `palette-themes.html` live table.
- One reserved slot `--campaign` for a sale window; unused until DEV-006 is approved.

## Type
Two families, both self-hosted woff2, Latin subset, `font-display: swap`. Fallback: system-ui.
- Jost 600 / 700: headings 20 px and above, and prices. Echoes the logo's geometric wordmark. Never for body or labels under 20 px.
- Inter 400 / 500 / 600: body, labels, buttons, inputs, meta. Body 16 px / 1.5. Never below 13 px except uppercase meta labels at 11–12 px with letter-spacing.
- Prices: Jost 700, `font-variant-numeric: tabular-nums`. Headings: tight tracking at 24 px and above.
- Scale and line heights are fixed in `../tokens/tokens.css`.

## Tone (principles, not copy; D-034)
Calm, trustworthy, quick. Say where a link goes. State facts (posted time, MRP, saving) and let them persuade. No exclamation marks, emoji, countdown pressure or "hurry". Short labels, plain English, Hinglish brand and product names as they are.

## Reference
Theme comparison and live contrast: `palette-themes.html` (tab B, type option 1). Research mapping: `research-to-brand.md`.
