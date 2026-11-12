# Phone sheets — filter, sort, search (Law 11)
AGREED v1 · 2026-11-09 (D-064) · From D-043, D-045, D-048, D-062. All sheets: bottom sheet ~85 % height, list faintly visible behind, drag handle, Esc/back closes, focus trapped, scroll inside the sheet only.

## 1. Filter sheet (batch apply)
```
┌──────────────────────────────────┐
│ feed faintly visible             │
├──────────────────────────────────┤  sheet top
│ ──                               │  handle
│ Filters            Clear all   ✕ │  fixed header
│ 1,284 deals match                │  live count, updates on every tick
├──────────────────────────────────┤  scrolls ↓
│ Category                       ˄ │  open by default
│ ☑ Electronics               412  │
│ ☐ Fashion                   301  │
│ ☐ Grocery                   188  │
│ ☐ Home & Kitchen            140  │
│ ☐ Beauty                     96  │
│ ☐ Toys                       61  │
│ ☐ Books                      40  │
│ ☐ Sports                     22  │
│ Show all 50 ›                    │  truncation at 8 (D-045)
│                                  │
│ Store                          ˄ │
│ [🔍 Find a store             ]   │  inline search (D-045)
│ ☑ Amazon                    620  │
│ ☐ Flipkart                  455  │
│ ☐ BigBasket                  88  │
│ ☐ Myntra                     70  │
│ ☐ Croma                       0  │  zero-count greyed, not hidden
│ Show all 19 ›                    │
│                                  │
│ Discount                       ˅ │  collapsed groups show chosen value
│ Price                          ˅ │
│ Deal type                      ˅ │
│ Posted                         ˅ │
├──────────────────────────────────┤
│ [       Show 1,284 deals       ] │  fixed footer, one button (D-045)
└──────────────────────────────────┘
```
Discount open:
```
│ Discount                       ˄ │
│ ○ Any                            │
│ ○ 50 % or more             640   │  bands are placeholders; final from data (D-045)
│ ● 70 % or more             212   │
│ ○ 90 % or more              31   │
```
Price open: ○ Any · ○ Under ₹499 · ○ Under ₹999 · ○ Under ₹2,499 · ○ Under ₹4,999 · ○ ₹5,000 and above (single choice).
Deal type open: ☐ Top picks · ☐ Loot · ☐ New · ☐ Pantry (multi; Fresh is not a type).
Posted open: ○ Any time · ○ Last 24 hours · ○ Last 7 days.
"Show all 50 ›" → the group expands in place to the full list with its own search box; "Show fewer" returns.
Rules: nothing applies until "Show N deals"; count in header and button update live; "Clear all" resets the sheet, not the page, until applied; closing with ✕ discards changes (chips on the page unchanged). Selected values are mirrored to the quick-filter row and the chip row after apply; URL updated.

## 2. Sort sheet
```
┌──────────────────────────────────┐
│ ──                               │
│ Sort by                        ✕ │
│ ● Recommended                    │  default everywhere except Fresh
│ ○ Newest                         │  default on Fresh
│ ○ Discount: high to low          │
│ ○ Price: low to high             │
│ ○ Price: high to low             │
│ ○ Most viewed                    │
└──────────────────────────────────┘
```
Tap applies at once and closes (single choice, no footer). The trigger on the page then reads "Sort: Discount". On Fresh the first row is "Newest (default)". Recommended's one-line help under the title: "Pinned first, then fresh and big discounts, mixed across categories."

## 3. Search sheet (full screen)
```
┌──────────────────────────────────┐
│ ‹  [🔍 Search deals, stores…  ✕] │  keyboard up on open
├──────────────────────────────────┤
│ Recent                   Clear   │  only when there are any
│ 🕘 earbuds under 1500            │
│ 🕘 boAt                          │
│ 🕘 atta 10 kg                    │
│                                  │
│ Stores                           │
│ [Amazon] [Flipkart] [BigBasket]  │  chips, scroll →
│ [Myntra] [Croma] [Ajio] …        │
│                                  │
│ Categories                       │
│ Electronics                    › │
│ Fashion                        › │
│ Grocery                        › │
│ Home & Kitchen                 › │
│ All categories                 › │  → categories index
└──────────────────────────────────┘
```
While typing (≥2 chars), the lists are replaced by suggestions:
```
│ ‹  [🔍 boat air               ✕] │
│ 🔍 boat airdopes                 │  query completion
│ 🔍 boat airdopes 141             │
│ Store · boAt                     │  store match → /shops/boat
│ Deals                            │
│ ┌──┐ boAt Airdopes 141… ₹1,099   │  top 3 live deals, compact rows
│ ┌──┐ boAt Airdopes 161… ₹999     │
│ See all results for "boat air" › │  → /deals/search?q=
```
Submit (keyboard search or "See all results") → search results page using the feed component with facets. Empty results page: "No deals for 'xyz'" + chips + nearby categories + Fresh feed (feed brief). Desktop: the header field shows the same suggestion list as a dropdown; Enter submits.
