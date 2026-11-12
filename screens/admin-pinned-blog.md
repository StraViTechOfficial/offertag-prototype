# Admin — Pinned board, Blog list and editor, phone variants of admin tools (Law 11)
AGREED v1 · 2026-11-09 (D-066) · From D-053, D-057, D-059, D-060, B08.

## 1. Pinned board (Deals → Pinned board; admin only)
```
┌──────────────┬──────────────────────────────────────────────────────────────────────┐
│ sidebar      │ Pinned board                                 Preview on site ↗        │
│              │ Pinned deals take fixed slots in every list: positions 3, 6, 9, 13.   │
│              │ Drag to reorder. Empty slots are filled by the normal feed.           │
│              │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│              │ │ Slot 3    ⋮⋮ │ │ Slot 6    ⋮⋮ │ │ Slot 9    ⋮⋮ │ │ Slot 13      │  │
│              │ │ ┌──┐ boAt    │ │ ┌──┐ Fortune │ │ ┌──┐ Samsung │ │              │  │
│              │ │ │im│ Airdopes│ │ │im│ oil 5 L │ │ │im│ 25W     │ │   + Pin a    │  │
│              │ │ └──┘ ₹1,099  │ │ └──┘ ₹649    │ │ └──┘ ₹1,299  │ │     deal     │  │
│              │ │ pinned 2 h   │ │ pinned 1 d   │ │ pinned 3 d   │ │              │  │
│              │ │ Edit · Unpin │ │ Edit · Unpin │ │ Edit · Unpin │ │              │  │
│              │ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
│              │ Waiting (pinned, no slot)                                             │
│              │ ┌──┐ Pigeon kettle ₹599 · pinned 5 d      [Slot ▾] Unpin              │
│              │                                                                       │
│              │ Changes save on drop · toast "Slot order saved · Undo"                 │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```
"+ Pin a deal" → search popover (title/link) → picks and fills the slot. Dragging a card onto an occupied slot swaps them. Keyboard: focus a card, Space to lift, arrows to move, Space to drop. Phone: slots stack vertically, reorder by the [Slot ▾] number field instead of drag. Slot positions themselves come from config (`PINNED_DEALS_ORDER`), shown, not editable here (Law 4).

## 2. Blog — posts list (admin and content editor)
```
│ Blog                                             [+ New post]        │
│ (All 12)  Drafts 2   Scheduled 1   Published 9        [🔍 title]     │
│ Title                                  Status      Date        Deals  ⋯ │
│ Best TWS earbuds under ₹1,500          ●Published  9 Nov       5      ⋯ │
│ How to stack bank offers on Flipkart   ●Published  6 Nov       3      ⋯ │
│ Diwali TV buying guide                 ○Scheduled  12 Nov 09:00 8     ⋯ │
│ Atta price tracker                     ◌Draft      edited 1 h  2      ⋯ │
│ ‹ 1 2 ›                                                                  │
⋯ = Edit · View ↗ · Duplicate · Unpublish / Publish now · Delete
```
Phone: rows become cards (title, status pill, date, Edit).

## 3. Blog — editor
```
┌──────────────┬──────────────────────────────────────────────────────────────────────┐
│ sidebar      │ ‹ Blog   Draft · saved 10 s ago          [Preview ↗] [Schedule ▾] [Publish]│
│              │ ┌─────────────────────────────────────────┐ ┌────────────────────────┐│
│              │ │ Title                                    │ │ Post settings          ││
│              │ │ [Best TWS earbuds under ₹1,500         ] │ │ Slug  [best-tws-…]     ││
│              │ │ Summary (one line, shown on index + OG)  │ │ Cover  ┌────┐ Replace  ││
│              │ │ [Five picks with live prices…          ] │ │ Category [Electr ▾]    ││
│              │ │ ────────────────────────────────────────│ │ (for "More in …" strip)││
│              │ │ B I  H2 H3  • 1.  🔗  🖼  [+ Deal]       │ │ SEO title [        ]   ││
│              │ │                                          │ │ Meta description [  ]  ││
│              │ │ ## 1. boAt Airdopes 141                  │ │ Publish date [now ▾]   ││
│              │ │ Text…                                    │ │ Author  OfferTag       ││
│              │ │ ┌ Deal · live ──────────────────────┐    │ ├────────────────────────┤│
│              │ │ │ ┌──┐ boAt Airdopes 141  ₹1,099    │    │ │ Deals in this post (5) ││
│              │ │ │ └──┘ Amazon · 75% off     ✕ Change│    │ │ boAt Airdopes 141      ││
│              │ │ └───────────────────────────────────┘    │ │ Noise Buds VS104       ││
│              │ │ Paste an image anywhere → uploads inline │ │ …                      ││
│              │ │ (B08)                                    │ │                        ││
│              │ └─────────────────────────────────────────┘ └────────────────────────┘│
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```
"+ Deal" picker (popover):
```
┌────────────────────────────────────┐
│ Insert a deal                    ✕ │
│ [🔍 title, link, store           ] │
│ ┌──┐ boAt Airdopes 141  ₹1,099 ●Live│  ← Insert
│ ┌──┐ boAt Airdopes 161  ₹999   ●Live│
│ ┌──┐ Noise Buds VS104   ₹899  ○Withdrawn│ greyed, "withdrawn" tag, still insertable with warning
└────────────────────────────────────┘
```
Embedded deal renders live data on the public post (price, status); a withdrawn deal shows "No longer available" inline. Autosave every 10 s; Publish → confirm with the public URL; Schedule → date-time; Unpublish keeps the URL with a "not available" page. Phone editor: single column, settings behind a "Settings" button, toolbar sticky above the keyboard.

## 4. Admin tools — phone variants (pattern, applied to every `admin-tools.md` screen)
```
┌──────────────────────────────────┐
│ ≡   Inbox (5)             🔍  +  │  title = screen, + = primary action if any
│ (Feedback 3) Reports 2 Deletions 1│  tabs scroll horizontally
│ ☑ Unhandled only                 │  filters collapse into one row of chips
│ ┌──────────────────────────────┐ │
│ │ Issue · rahul@… · 2 h        │ │  table row → card: 2 lines + action
│ │ Shop Now on boAt deal → 404  │ │
│ │ [Handled ○]                  │ │
│ └──────────────────────────────┘ │
```
Rules: tables → cards with the first two columns as lines, primary action as a button, the rest in ⋯. Two-pane screens (Alerts compose + history, Formats editor + preview) → stacked, preview collapsed behind "▸ Preview". Drawers → full-screen sheets. Settings forms → single column, Save sticky at the bottom. Overview tiles → 2-up grid.
