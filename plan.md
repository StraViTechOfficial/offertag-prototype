# Plan: clickable UAT playground (S25)

Branch: `feat/client-requests-s25`. Each step is its own commit.

## Goal

Send the client one link to the prototype. The client opens the admin, adds and edits deals, sponsored slots, posters, blog posts and the rest, then sees them on the public site straight away. Everything the client does is kept in their own browser (localStorage). It's a front-end playground for UAT, with no real backend.

What it is not: shared data. Each browser sees the sample data plus only its own changes. Another person opening the link sees the plain sample data.

## Order

1. **Part A:** bring in Adil's retail visual pass (about 1 day). **Done 2026-11-24.** A8 needed no change: the prototype toolbar already matched.
2. **Part B:** the localStorage playground (about 5–6 days). **Done 2026-11-24** (D-152). Checked: every built page loads without script errors; an unchanged sample deal draws exactly as built; the 30-step client flow (post with photo → Home, lists, deal page → comment, report, contact → admin inbox → edit, approve incoming, poster, ad, pin, new category, blog post, site setting → delete → reset) passes in one browser.

Part A goes first so Part B builds the new card and deal page once, not twice.

**Hosting (D-153), done 2026-11-24:** UAT pass (every page at phone and desktop, light and dark, plus the client flow) found every non-Amazon store and 19 categories empty, a lingerie deal, CDN-only libraries, no noindex and no favicon. Fixed: 74 more live deals (screened for the client), self-hosted libraries and font, noindex + robots.txt + `_headers`, icons, Inbox → Comments, Undo on comment delete, and Reset that stays "nothing changed" while browsing. Deployable copy: `StraViTechOfficial/offertag-prototype` (see README "Hosting the UAT link").

**Adil's review (D-155), done 2026-11-24:** menu tabs Home · Top · Loot · New · Pantry; sign-in is an email code only (no Google); theme follows the device by default, no header icon (Light · Dark · Automatic stays in the side menu); the left join tab is a semicircle again and its fan has no live chat (Chat with us removed everywhere); no deal counts on stores or categories; Home lists every store (right column on desktop, a sideways row on phones) with no "All stores" detour; Incoming has no scraper, no "Approve all", no "Approved today" / "Rejected" tabs and no "Similar deal" / "Featured" badges (planned separately); Post a deal has no scheduling (blog posts and posters keep theirs). Admin sign-in still offers Google: to confirm.

**Admin declutter (D-160), done 2026-11-24:** user decision, BRD scope only, no new features. The operator found the admin too dense: the menu had 27 links and ran 1,277 px tall (needed its own scroll on a laptop), and the deals table scrolled sideways below 1366 px.
- Menu: nine flat links (Overview · Incoming · Deals · Promote · Alerts · Blog · Inbox · Catalogue · Settings). Grouped pages get section tabs: Deals (All deals · Pinned board), Promote (Sale posters · Sponsored, both screens unchanged), Settings (Site & app · Affiliate tags · Social sharing · Users · Roles · Security). Theme switch moved to the account menu. Catalogue hides Types (one internal row; `/admin/type` opens Shops). No address changed.
- Overview: four counts (Posted today · Incoming · Inbox unhandled · Pinned) and two panels (Latest live deals · Pinned on Top deals). Removed: Alerts-sent card, "Needs attention" (repeated the counts), "On Top deals now" (repeated Pinned), sample "Recent shares", second "Review incoming" button.
- All deals: status tabs with counts (All · Live · Pending · Withdrawn · Rejected), search, one Filters button (count badge) for Type, Store, Category, Pinned, Shows on, Posted. Columns 10 → 6: Deal (store · category · one type label under the title) · Price (price, MRP, %) · Status (+ pin slot) · Posted · Views · actions. Copy for WhatsApp and Bump to top sit on the row; the rest stay in the ⋯ menu; the title opens Edit. Cards below 1100 px.
- Post / edit: optional fields (caption, coupon, terms, extras, description, how to get it) under one "More details", open on its own when a deal uses any of them. Deal scheduling code removed everywhere (D-155 had hidden it); a deal saved as scheduled in an older playground goes live. Posters, ads and blog posts keep their dates.
- Blog and Security tables fit at 1024 px. Checked headless at 1440, 1280 × 720, 1024 and 390: no console errors, no sideways scroll, menu fits; 19 journeys pass (approve → Overview count, status tab, filter + chip + clear, quick copy and bump, title → edit, More details, publish, Promote tabs, Settings tabs, theme, old /admin/type, sub-admin menu).

**Deal search and Members (D-161), done 2026-11-24:** user decision.
- Deal search everywhere a deal is picked (Sale posters, Pinned board, Alerts): a search box, never a list of every deal. Empty box shows the 8 newest and the live total; typing matches every word against title, store, category, link and deal ID, highlights matches, shows 8 and says how many matched; a pasted deal link or ID finds that exact deal; full keyboard (↓ ↑ Enter Esc). Sale posters shows the chosen deal as a card with Change. In the build this is one search call with a limit of 8.
- Users vs Members: Settings → Users lists only admins and sub-admins (Amazon tag per poster); Members is a new menu item for people who signed up (sources: users.name, email, mobile, created_at, allow_notifications; comment count; open deletion request). Big search by name, email or phone; Joined, Deal alerts and Sort filters; 25/50/100 per page with numbered pages; read-only drawer with "See their comments" (opens Inbox → Comments filtered to them). States the live total (28,880, BRD p.1); the prototype holds 160 SAMPLE members. New address `/admin/members` (admin only); every other address unchanged.
- Checked headless at 1440, 1280 × 720, 1024 and 390: no console errors, nothing scrolls sideways, menu fits; 23 new steps and the 20 D-160 steps pass.

**Choose-a-deal window and blog editor (D-162), done 2026-11-24:** user decision, as recommended.
- Choose a deal: a large window over the page (full screen on phones) wherever a deal is picked: Sale posters ("Browse all" beside the quick search), Pinned board and Alerts ("Browse all deals" at the foot of the quick list), Blog "+ Deals" (tick several, "Insert N deals", kept in order; "Change" on a card swaps one). Search on every word, Store · Category · Posted filters, sort (newest, biggest discount, lowest price, most viewed), numbered pages with 25/50/100 per page, picked deal shown in the footer. Pasting a store link, offertag.in link, short link or deal ID finds and picks that deal; a link not on OfferTag says so and offers "Post it as a deal first" (opens Post a deal with the link filled, `?link=`). Esc closes only the window. In the build each change is one paged search call.
- Blog editor: undo/redo; Paragraph · Heading · Subheading · Small heading · Quote; bold, italic, underline, strikethrough, clear formatting; links (Ctrl+K, edit/remove by clicking, new-tab option, store links get rel="sponsored nofollow" automatically); bullet and numbered lists; align left/centre/right; image (upload, paste, drop) with caption, alt text and size (full, left or right with text beside) and a "No alt text" flag; table with + Row/+ Column/− Row/− Column/Delete; note box; divider; YouTube video; button block; live deal cards. "/" opens a block menu; ## / ### / - / 1. / > + space and --- + Enter as shortcuts; floating bar on selected text; paste from Google Docs/Word keeps headings, lists, bold, links and tables and drops fonts, colours and scripts. Word count, read time, outline of headings. Edit · Preview (computer or phone, as readers see it). Missing alt text, an empty heading or a long post with no headings are named inside the one Publish confirm ("Publish anyway"). No text colour, font size or font choice (keeps the site consistent). The public post page renders every block (captions, floated images, tables, note, video via youtube-nocookie, button).
- Comments stay light: Bold and Italic (*x*), emoji, 300 characters; links stay plain text (D-149).
- Hand-off: build the editor on Tiptap (ProseMirror) for Next.js; the saved format is HTML with small markers for deals, images, video and buttons (see admin-d.js serial()).
- Checked headless: 37 new steps pass, plus every D-160 and D-161 step; no console errors, nothing scrolls sideways.

Not in this plan, for later: the deal-content rework (Key Practical Uses / Specifications as on the live site).

---

## Part A: Adil's retail pass, brought into the prototype

Source: `../offertag-website`, branch `design/retail-pass`, commits `1abb3b3` (retail pass, logged there as D-147, "proposed, awaiting Muiz's sign-off") and `c89e9fc` (admin deals toolbar). It's logged here as **D-151**, because D-147 to D-150 are already used in this repo.

Visual and UX only. Nothing the prototype has and the website doesn't is removed (sponsored slots, posters, pinned board, reactions, comment emoji, unique views and so on stay).

| # | What | Detail |
|---|---|---|
| A1 | Deal card | Green "↓ 52%" tag top-right of the photo · age ("2h ago") above the title, no category · title 2 lines · ₹price + struck MRP · "Save ₹X" in green with the store logo on the right · "Buy now ↗" navy outline, fills navy from the left on hover and the arrow flies out · hover: navy outline + soft shadow + photo zoom 3%, no pop-out |
| A2 | Colours | Navy and brand green only. No gold, yellow or pastel tiles: hero cards, the Loot band and tiles become white with a hairline |
| A3 | Corners | 8 px boxes, 6 px buttons and inputs, 4 px tags, no pills. Panels attached to a screen edge are square; phone bottom sheets keep 12 px tops |
| A4 | Hovers | No hover rings or scaling. Rows go grey with navy text; nav links get a light navy underline |
| A5 | Menus | Current page marked in the side menu (light blue row, navy bar) · side menu 18rem, compact rows · sort menu shows a navy tick |
| A6 | Quick view + deal page top | Slide-over 34rem · "Open full page" top-left, close top-right · price and MRP on one line, Save under · full-width navy Buy · share on the stats row · same discount tag and Buy as the card · bigger photo, smaller zoom hint · specs with a single border |
| A7 | Small items | Loot tag "80%+ off" · Blog NEW as a navy corner ribbon · arrow icons on blog deal embeds and Hot deals "View deal" · listing title scrolls away, filters stay pinned · thin grey scrollbars · desktop text 15 px up to 1200 px, growing to 18 px at 1920 px |
| A8 | Admin All deals toolbar | Store and Category filters list only those with deals · type labels "Top deal", "Loot"… · Posted menu "Today" / "Last 7 days" |
| A9 | Dark mode | Every new colour goes through the theme roles, so Light · Dark · Automatic (D-150) keep working |

Check: every public page at 412 px and 1440 px, light and dark, plus the admin All deals screen.

---

## Part B: the localStorage playground

### In plain words

1. **Seed data in files.** The sample data sits in a few small JSON files, split by kind so nothing is heavy:
   - `prototype/data/deals.json`: the deals, with their detail content
   - `prototype/data/catalogue.json`: categories, stores, deal types
   - `prototype/data/home.json`: pinned board, sponsored slots, posters, promo message, settings
   - `prototype/data/blog.json`: blog posts
   - `prototype/data/community.json`: comments, reports, feedback, users

   They're made by `build/build.py` from the existing `build/*.json`, so there's one source.
2. **Pages draw themselves from that data**, in the browser. They look as they do now.
3. **The client's changes go into localStorage only** (adds, edits and deletes), one entry per kind, for example `pg:deals`. The seed files are never changed.
4. **On every page load:** seed + the client's changes = what you see. A new deal appears at once on Home, the lists, search, its category and store pages, related deals and its own deal page.
5. **"Reset playground"** in admin clears the changes, which brings back the sample data.

### Images

An uploaded photo is shrunk in the browser to about 600 px JPEG (roughly 50–80 KB) and saved with the deal in localStorage, so it shows on every page and survives a refresh. If the browser's space (about 5 MB) runs out, the deal still saves and shows a placeholder photo, with a short message. No IndexedDB.

### Steps

| # | What | Estimate |
|---|---|---|
| B1 | `js/db.js`: loads the seed files, applies the changes from localStorage, offers get · list · add · edit · delete, and tells open pages when data changes. Photo shrink + save. Reset | 0.5 day |
| B2 | Public pages drawn from the data: Home and its rows, Top · Loot · New · Pantry lists, category, store, store + category, search, categories and stores indexes. Card template moved from Python to JS; filters, sort and loading work as today | 1.5 days |
| B3 | Deal page drawn from the data, including related deals. One generic deal page plus the 404 fallback, so a new deal opens at its own address (`/deal/{slug}-{id}`) | 1 day |
| B4 | Admin writes to the data: post · edit · clone a deal, Incoming approve / reject, All deals (status, withdraw, delete, bulk edit), categories and stores, pinned board, sponsored, posters, blog (moved onto `db.js`), settings. Overview counts read live from the data | 1.5–2 days |
| B5 | Public actions reach admin: comments, replies, reactions, reports, views, contact messages. They show in the admin inbox and the counts | 0.5–1 day |
| B6 | Test pass, phone and desktop: post a deal with a photo → see it on Home, the lists and its deal page → comment and report on it → see both in admin → edit the price, see it change → delete it, see it gone → Reset | 0.5 day |

**Total for Part B: about 5–6 days.**

### What the client can do in the playground

- Post, edit, clone, schedule, withdraw and delete deals, and approve or reject Incoming ones.
- Pin deals and reorder the pinned board.
- Add and edit sponsored slots, posters and the promo message.
- Add and edit categories and stores.
- Write and edit blog posts.
- Comment, react and report on the public site, and see all of it in admin.
- Reset everything to the sample data.

### Limits, said plainly

- Data lives in one browser on one device. Phone and laptop don't share it, and other people don't see it.
- Clearing site data or private windows starts fresh from the sample data.
- Sign-in stays the sample member and sample admin, as now. No emails or notifications are sent.
