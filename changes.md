# OfferTag prototype: change list (2026-11-25)

Source: owner review of the prototype on 2026-11-25, with 22 screenshots. **The owner's word is final.** Where an item conflicts with the BRD or an earlier decision (D-xxx), the item wins, and the old rule is listed under "Replaces".

Order of work: **Part A (public pages) first**, then Part B (admin). Every item has an ID (P-xx public, A-xx admin) so we can tick them off one by one.

What the current code base does today is described in **Part C** (deal types, short links, affiliate tags, statuses). The open questions to answer before or during the work are in **Part D**.

---

## Part A: Public site (done 2026-11-25)

### P-01 Deal card redesign (layout only)
Screens: Image 4 and 21 (Top deals card, listing card). Applies to **every** deal card: Home rails, listings, store and category pages, "More in…" rails and blog embeds, in both comfortable and compact density, on phone and desktop.

- [x] **Meta line above the title:** category, then time, e.g. `Fashion · 50 min ago`. Today only the time shows and the category is missing.
- [x] **Title** under the meta line (2-line clamp, as today).
- [x] **Price row:** price, struck-out MRP and **% off next to the price** (e.g. `₹371 ₹3,099 88% off`). Remove the separate `↓ 88%` badge in the image's top-right corner.
- [x] **Balance the empty space:** today the store logo sits alone on the right of the "Save ₹2,728" line, with a large gap opposite ₹371. Rearrange the price, Save and store logo so both sides line up. One option is the store logo in the meta row or on the image, with Save beside the price. Choose after the research below and make the result look symmetric.
- [x] **Research first:** look at cards from leading e-commerce and deal sites (Amazon, Flipkart, Myntra, Meesho, DesiDime, Slickdeals, CashKaro and similar). Note their visual hierarchy (what the eye sees first, second, third) and how they balance space. Write a short summary of what we copy and why in the task notes.
- [x] **Colour of the % off:** research which colour suits a discount figure. Today it is green, so either justify green or replace it. Base the justification on the colour's meaning ("saving", "urgency", "price drop"), on contrast in both light and dark themes against our palette, and on what the leading Indian shopping apps use. Write the justification in the task notes, and keep it in the brand tokens if the colour changes.
- [x] Keep the hover and press effects, shadows and Buy button behaviour **as they are**. This item is about layout only.

### P-02 Show "Pinned" on pinned deal cards
Screen: Image 4.
- [x] A pinned deal must show a clear pinned marker on its card, such as a pin icon chip ("Pinned") in a fixed corner. It must be visible in both themes and both densities.
- [x] The same marker shows on the deal page.

### P-03 Listing filters: sliders
Screens: Image 22 (today's filters) and 23 (reference). Applies to the filter panel on listings, category, store and search pages, and to the phone filter sheet.

- [x] **Discount:** replace the radio list with **one slider** that snaps to the stops **Any · 25% · 50% · 75% · 90%**, labelled "25% or more" and so on.
- [x] **Price:** replace the radio list with a **two-handle range slider, Amazon style**:
  - The ends come from the deals in the current list. For example, if the cheapest deal is ₹43 and the dearest is a ₹35,000 TV, the slider runs from ₹43 to ₹35,000.
  - Use a non-linear (stepped or logarithmic) scale, so the cheap end gets fine steps and the expensive end gets coarse steps.
  - Show the live range text (`₹43 – ₹35,000`) and keep the Min and Max boxes, which stay in sync with the handles.
  - Apply the filter on release (or with a "Go" button on phones).
- [x] **Remove the "Posted" filter** entirely.
- [x] Active-filter chips and "Clear all" still work with the new controls.

### P-04 Blog article: "More blogs" instead of "More in {category}"
Screen: Image 9. Today the article pages `blog/lunch-boxes-and-tiffins-worth-packing`, `blog/why-bldc-ceiling-fans-cost-more` and others show "More in Kitchen", a rail of **deals**.
- [x] Remove the "More in {category}" deal rail from the article page.
- [x] Put **"More blogs"** in its place, a rail of other blog posts (newest first, excluding the current one) that links to the blog home.

### P-05 Remove deal statuses from the public site (see A-03)
- [x] Remove the "withdrawn" banner and state from the deal page. A deal is either on the site or deleted, so a deleted deal's address shows the normal 404.
- [x] The public pages and `js/render.js` stop filtering by status.

### P-06 Remove "Report a problem" from the deal page (follows A-11)
- [x] Remove the "Report a problem" button and its bottom sheet on phones from every deal page, because reports are removed from the admin.

### P-07 Deal type tabs follow the Settings rules (see A-14)
- [x] The Top deals, Loot deals, New deals and Pantry deals pages, and the card tags, use the percentages set in Admin → Catalogue → Deal types (A-14), with the old site's defaults: Top 25% or more, Loot 75% or more, New below 25%, Pantry = Grocery. The rules are no longer hard-coded in `js/db.js` and `js/admin.js`.

### P-08 Home hero = Featured deals (see A-06)
- [x] The Home hero (today the "sale posters" slider) shows **featured deals**, the deals marked Featured in the admin.
- [x] The poster slider and poster images are removed.
- [x] Sponsored ads keep their place on Home in the new simple format (A-07).

### P-09 Remove "How to get it" from the deal page
Screen: Image 26.
- [x] Remove the "How to get it" block (store steps) from every deal page.

### P-10 Price filter: slider only
Screen: Image 25.
- [x] Remove the Min/Max boxes and the Go button under the price slider.

### P-11 Deal lists load automatically, no "Show more deals" button (added 2026-11-26, Adil)
Source: signed proposal ("Automatic scrolling instead of Load More", 31 Oct requirements). Replaces D-032's button after every 2 auto-loads.
- [x] Remove the "Show more deals (N more)" button and its "Page N" hint (`prototype/js/listing.js`, `renderLoadState`). Every batch loads on scroll with the spinner.
- [x] Keep the `?page=N` link and the back-button restore (SEO and position), and the corner back-to-top button.
- [ ] Same on every list: listings, category, store, search. Then the same change in `web/`.
- [x] Footer is hard to reach on long lists, so the menu (phone and desktop) also carries Privacy policy, Terms of use and Disclaimer (`build/home.template.html`). Help & FAQs and Feedback were already there.

### P-12 Deal-type headings get their own colour (added 2026-11-26, Adil, in review)
The retail pass had turned every heading icon grey, so the headings looked idle.
- [x] Top gold star, Loot red flame, New blue sparkles, Pantry green basket (new icon), on Home and on each type page (`js/theme.js`, end of `css/theme.css`).
- [x] One short motion when the icon first scrolls into view; none for people who turn motion off.
- [x] No discount label on any heading: the Loot "75%+ off" sticker is removed (replaces D-137–D-141).
- [ ] Same in `web/` once approved.

### P-13 Top deals = today's deals, any discount (added 2026-11-26, Adil's decision)
Follows D-114 (Fresh became Top deals at `/top-deals`, `/fresh-deals` 301s there). Replaces the Top part of P-07/A-14 (Top 25%+).
- [x] Top deals lists deals posted since 12 am today (IST on the live site), any discount, newest first; pinned deals stay on it whatever their date. Its line reads "Today's deals, newest first" (`js/db.js`, `js/render.js`, `build/build.py`).
- [x] No "Top deal" tag on cards or deal pages and no Top option in the type filter, public or admin, since every deal of the day is on it (`js/render.js`, `build/build.py`, `build/admin.py`, `js/admin.js`, `js/admin-db.js`). FAQ text updated.
- [x] Loot (75%+), New (under 25%) and Pantry (Grocery) keep their rules. Admin → Catalogue → Deal types: the % box moved from Top to New; Top reads "Today's deals (resets at 12 am)" (`js/admin-c.js`).
- [ ] Same in `web/` and the backend list rule (told backend-ot 26 Nov).

### P-14 Deal-type tabs are fixed (added 2026-11-26, Adil)
The four tabs (Top, Loot, New, Pantry) are part of the site build, not admin content.
- [x] Admin → Catalogue → Deal types: no Name field, no Active switch or column, no deal count in the edit sheet. Only the rule and the order stay (`js/admin-c.js`).
- [ ] Same in `web/` admin.

### P-15 Light/dark button in the header (added 2026-11-26, Adil)
The theme switch sat only inside the menu, where few people look.
- [x] Sun/moon button in the header beside Sign in, every public page; one tap swaps light and dark with a short turn (still under reduced motion). The menu keeps Light / Dark / Auto (`build/home.template.html`, `build/theme_head.py`, `css/theme.css`).
- [ ] Same in `web/`.

### P-16 No deal counts on shops, categories or lists (added 2026-11-26, Adil)
Counts add weight and say nothing a shopper needs (follows D-155).
- [x] Admin → Catalogue: no Deals column on Shops, Categories or Deal types; no "N deals" line in the edit sheet (`js/admin-c.js`). The delete guard ("has N deals, so it can't be deleted") stays.
- [x] Public lists: no "N deals" line above the list; store-in-category pages read "All deals from this store in this category" instead of "N today" (`build/listing.template.html`, `build/build.py`, `js/render.js`). The phone filter sheet's "N deals match" line is gone too (Adil); "No deals match these filters." still shows on an empty result (`build/listing.template.html`, `js/listing.js` made null-safe).
- [ ] Same in `web/`.

### P-18 Blog: no hover box; guide posts without deals (added 2026-11-26, Adil)
- [x] Header Blog link: the "New on the blog" hover box is gone; the NEW ribbon stays (`build/home.template.html`).
- [x] Two guide posts with no deals ("How to spot a fake discount before you pay", "When to buy during the big sale weeks") show the blog is not only for deals (`build/blog.json`). A post without deals hides the "Deals in this post" rail and centres the article (`build/build.py`, `css/theme.css`); its share image falls back to the site icon.
- [ ] Same in `web/` (the blog must accept a post with no deals).

### P-17 Account page: no mobile, plain layout (added 2026-11-26, Adil)
- [x] Mobile field removed (old site had it; nothing uses it now; less personal data under DPDP). Existing numbers stay in the database untouched.
- [x] Three stacked cards replaced by one plain page: avatar + "Account" + email at the top, then hairline sections (Profile, Browser alerts, Delete account in red with the same confirm step) (`build/build.py`, `js/site.js`, `css/theme.css`).
- [ ] Same in `web/`; backend profile update drops `mobile`.

### P-19 FAQ: no chat button (added 2026-11-26, D-155)
- [x] "Chat with us" button removed (there is no live chat); heading "Still need help?" is now "More help" (UI text is never a question). Contact us stays (`build/build.py`).

### P-20 Home: no "new since your last visit" bar (added 2026-11-26, Adil)
- [x] Removed from the home heading row; it was not signed scope (D-122) and showed big misleading counts after a long gap or cleared storage (`build/home.template.html`). Scripts skip it when absent.
- [ ] Same in `web/`.

### P-21 Sorting and filters follow the signed line (added 2026-11-26, Adil)
Signed: "only this list [today's deals] can be sorted by price or by % off". Replaces the sort part of earlier builds and the sliders of P-03.
- [x] Top deals: sort menu with Newest (default), % off: high to low, Price: low to high, Price: high to low. Recommended, Biggest saving and Most viewed are gone everywhere.
- [x] Every other list (Loot, New, Pantry, category, store, search): no sort menu, newest first.
- [x] Price and discount sliders only on Top deals (Adil: today's list is the one that sorts and filters by price and % off); hidden on every other list. Category, store and deal-type filters stay (`build/listing.template.html`, `build/build.py`).
- [ ] Same in `web/`.

### P-22 Categories page: icon tiles, no search box (added 2026-11-26, Adil)
About 30 categories fit on one screen, so the "Find a category" box is gone. Each category is a tile with its icon (same icon map as the home side panel), 2 per row on phones, 3 on tablets, 4 on desktop; top 8 by deals first, then A–Z (`build/build.py` cat_tiles, `js/render.js` renderIndex, `css/theme.css`). The Stores page is unchanged.
- [x] Not AI-looking (Adil): plain tiles (thin border, 8px radius, no tinted icon chip, no lift or glow); the icon is grey and turns brand colour on hover. Duplicate or generic icons replaced: Electronics monitor-smartphone, Recharge battery-charging, Grocery apple, Beauty brush (was sparkles), Cab car-taxi-front, Home & Decore sofa, Cashback wallet, Others shapes. The home "Shop by category" panel uses the same map.
- [ ] Same in `web/`.

### P-23 Filter panel polish (added 2026-11-26, Adil)
- [x] Category group opens by default; on a category page (no Category group) the Store group opens instead (`build/listing.template.html`, `build/build.py`).
- [x] Each category row shows its icon (same map as the Categories page); each store row shows its logo (a store icon when it has none, e.g. Others) (`opt_mark` in `build/build.py`, `css/theme.css`). The checkbox sits at the right end of these rows (icon, name, checkbox), so it doesn't crowd the icon.
- [x] Discount slider (Top deals): 1% steps from Any up to the biggest discount on the page, instead of fixed 25/50/75/90 stops (`js/listing.js`). Price slider unchanged (cheapest to dearest deal on the page).
- [x] Clear all (panel header and phone sheet) is dimmed and not clickable until a filter is on (`js/listing.js`).
- [ ] Same in `web/`.

### P-24 Admin order by drag; public lists follow it; names fixed (added 2026-11-26, Adil)
- [x] Admin → Catalogue (Shops, Categories, Deal types): a 9-dot handle on each row; drag (mouse or touch) or arrow keys on the handle to reorder. The Order number field is gone; the first column shows the position (#1, #2…) beside the handle, renumbered after each move. Disabled while the search box has text (`js/admin-c.js`, `css/admin.css`).
- [x] Every public category/store list follows that order, Others always last: filter options, the Categories page, the Stores page, the home "Shop by category" (first 10) and store rows (`build/build.py` ORD, `js/render.js`). **This replaces the P-22 "top 8 by deals, then A–Z" order** on the Categories page and the home panel. Seed: Bookmyshow moved before Others.
- [x] An existing shop's or category's Name and a category's page address are not in the edit sheet at all (both are SEO-linked); they are set only when adding one. Deal types have no Delete (each is a site tab and page). Card label stays editable (it only shows on deal cards).
- [x] No Active on/off for shops or categories (Adil: it's a website, they are always on). The switch column, the "Active only" filter and the edit-sheet checkbox are gone. Deal types lost theirs in P-14.
- SEO description stays: it is the old site's `shops.description` / `categories.description`, the text Google shows under the page link.
- [ ] `web/`: the admin drag waits for the admin port; the public order needs the catalogue API to return `order` (backend).

### P-25 Active back as "Show on site"; category icons match the site (added 2026-11-26, Adil)
- [x] The old site has Active for shops and categories, so it is back as one "Show on site" tick in the edit sheet (no switch column). Delete stays, only for a shop or category with no deals (same as the old site). Overrides the "no Active" line in P-24.
- [x] Admin category rows show the same lucide icon the site shows (not the old uploaded photo). The edit sheet has an icon picker (the site's map plus spares); the chosen icon is saved on the category and the Categories page uses it (`js/admin-c.js` CAT_ICONS, `js/admin-db.js`, `js/render.js`, `css/admin.css`).
- [ ] `web/`: admin port + backend `icon` (lucide name) on categories, replacing the old `icon_name` image.

### P-26 No "Deal type" filter (added 2026-11-26, Adil)
- [x] Search, category and store pages no longer have the Deal type filter group (Posted today / Loot / New / Pantry); the header tabs already cover it. Reverses the facet part of D-075 (`build/build.py` TYPE_HIDDEN always set).
- [ ] `web/`: drop the type facet from the listing filters.

### P-27 Category page keeps its Category filter, ticked (added 2026-11-26, Adil)
- [x] On a category page the Category group now shows, with that page's category ticked and locked (not counted as a filter, Clear all leaves it). Its find box is hidden. Store pages are unchanged (`build/build.py` data-page-lock, `js/listing.js`, `css/theme.css`).
- [ ] `web/`: same on category pages.

### P-28 Store pages keep their Store filter, ticked; "Hidden" label in admin (added 2026-11-26, Adil)
- [x] Store and store+category pages show the Store group with that page's store ticked and locked, as P-27 does for categories (`build/build.py`, `js/listing.js`). P-27 fix: store+category pages lock the category (lock[-1]), not the store.
- [x] Admin catalogue rows with Show on site off carry a "Hidden" label (`js/admin-c.js`).
- [ ] `web/`: same on store pages; admin label with the admin port.

### P-29 Category and store pages list every option, their own ticked (added 2026-11-26, Adil)
- [x] Replaces the single locked option of P-27/P-28. The Category (or Store) group lists all of them with this page's one ticked. Ticking another, or unticking this one, opens the search page (all deals) with that choice in the link, e.g. Electronics + Mobile goes to `/deals/search?cat=electronics,mobile`. The category and store pages themselves stay: they are the ranked SEO addresses (`build/build.py`, `js/listing.js` query()).
- [ ] `web/`: same.

### P-30 Filter box opens on its ticked option (added 2026-11-26, Adil)
- [x] When a Category or Store box scrolls, it opens scrolled to its first ticked option (with the one above peeking), so on e.g. the Kitchen page "Kitchen" is in view. The box scrolls, not the page (`js/listing.js` after readUrl).
- [ ] `web/`: same.

### P-31 Join tab opens by itself once per visit (added 2026-11-26, Adil)
- [x] The left-edge join tab (WhatsApp, Telegram, app) opens 1 s after page load and closes 2 s later, unless the visitor's pointer or focus is on it. Once per visit (browser session, sessionStorage `ot-fjoin-peek`): every page load was too much, Adil agreed (`js/site.js`).
- [ ] `web/`: same.

### P-32 Home "Shop by store" box: fixed height, no scroll trap (added 2026-11-26, Adil)
- [x] The box is a fixed 4½ rows high (24rem, half a row peeks so the scroll is obvious) and scrolls inside; when its list ends, the wheel carries on to the page (`overscroll-behavior: auto`, was `contain`, which trapped the scroll). Replaces D-158's fill-to-the-deals height. Tested: wheel over the box scrolls it to the end, then the page moves (`css/theme.css`, end of file).
- [ ] `web/`: same.

### P-33 Top page: Category and Store filters start closed (added 2026-11-26, Adil)
- [x] Top opens Discount and Price only; Category and Store are closed until tapped. Loot, New and Pantry open Category; category and store pages open Category and Store (P-28 had opened Store everywhere by mistake). `build/build.py`, `build/listing.template.html`.
- [ ] `web/`: same.

### P-34 · Home: four deal rails, 16 deals each, then View all (26 Nov)
- Home now has Top, Loot, New and Pantry rails (was Top and Loot only). Same order as the header links.
- Each rail shows up to 16 deals (4 slides of 4 on desktop). When a list has more, the last slide is a "View all" card (no count, Adil: counts look dull) that opens the full page. An empty rail hides itself.
- Files: build/build.py (rail(), more()), build/home.template.html (#new, #pantry), js/render.js (playground rails), css/theme.css (.rail-more).
- Sample data has only 1 New deal, so that rail looks thin here. The live site will have plenty.

### P-35 · No counts on the site, plainer footer, categories can't be deleted (26 Nov)
- Counts removed (Adil: counts look dull for a deals site): search "See all N results" is now "See all results"; deal page views count gone; comment link and Comments heading lose the number; /categories and /stores headers read "Deals by category" / "Deals by store". Admin keeps its numbers.
- Footer: one line about OfferTag; app box "OfferTag app · Deal alerts on your phone"; shorter disclaimer; "Privacy & you" is now "Legal"; Blog moved to Deals; the generic "About OfferTag deals" box is gone (category and store pages keep their own SEO text from the old site).
- Admin: categories have no Delete (deals and page links depend on them); "Show on site" hides one. Shops have no Delete either (Adil, 26 Nov); "Show on site" hides one. Deal types already had no Delete.
- Files: js/site.js, js/render.js, js/detail.js, build/detail.template.html, build/footer.html, build/build.py, js/admin-c.js.

### P-36 · Pinned chip only on Top deals (26 Nov)
- Pinned slots were already Top-only (D-104), but the "Pinned" chip showed on the card everywhere: home rails, Loot, category pages, search, deal page. Now it shows only on Top deals; elsewhere a pinned deal is a normal card. css/theme.css only.

### P-37 · No Flipkart affiliate id anywhere (26 Nov)
- Adil: our Flipkart links carry no id. Removed `affid=offertag` from the Buy link tagging (js/db.js, build/build.py STORE_TAG), the "Search this on Flipkart" link (build.py, render.js), the old category texts (build/catalogue.json, 8 links), and the Flipkart id column in Settings → Affiliate tags (build/admin_c.py, js/admin-c.js).
- Another site's `affid` on a pasted link is still stripped, so nobody else earns on our deals.
- Also corrected in Part C above: "Flipkart uses affid=offertag" describes the old site only.
- Backend: docs/features/short-links-and-tags.md and migration-cutover.md updated; the import still copies Flipkart's id (offertag-backend db/import/load.sql:58) and needs a one-line fix there.

### P-38 · Inbox: no handled step; deletion requests are acted on (26 Nov)
- Feedback is a plain list, newest first, with Delete (and Undo) on each message. No Handled switch, no "Unhandled only" tick, no count.
- Deletion requests (from the public delete-account form, for people who can't sign in) show only open ones, each with Delete account (confirm; removes it the same way as deleting from Account, backend #23 `deleteAccount()`) and Dismiss (Undo). Was: "Mark deleted", which only recorded it.
- Counts: only open deletion requests are counted (tab, sidebar, Overview tile now "Deletion requests"). A signed-in user deleting from Account never reaches the Inbox.
- Files: js/admin-c.js, js/db.js (inboxOpen), build/admin_c.py, build/admin.py.

### P-39 · Filter chips at the top, no second Clear all (26 Nov)
- What you picked (category, store, "80% off or more", price range, coupon) shows as chips above the deal list, each with an x to remove it. The Clear all that sat beside the chips is gone; the filter panel's Clear all (and the phone sheet's) is the one place (Adil: chips yes, Clear all once, as Amazon and Flipkart do).
- Files: js/listing.js.

### P-40 · Alerts page: 90% push is a pre-tick, not an automatic send (26 Nov)
- The Alerts intro said deals at 90%+ "send one on their own". On the old site the posting form only pre-ticks Send notification at 90%+ (DealsController.php:1236) and the admin saves it. Text now says so (build/admin.py). Show on (Web + App / Web only / App only) stays: signed scope v3.18 ("website only / app only" deal setting) and the old site's deal_display_type.

### P-41 · Admin Deals list: Move to top instead of drag; smarter pager (26 Nov)
- Adil: with thousands of deals nobody drags rows, but Bump to top is needed. The drag handle, the "drag to move" hint and keyboard move are gone (reverses A-02's drag part). Each row has a Move to top icon, and the bulk bar has Move to top for ticked deals. The list shows the site order: newest first, with moved deals on top. Posted, Price and Views still sort.
- Pager shows the first 3, the last 3 and the pages around the current one: 1 2 3 … 49 50 51 … 98 99 100. The deal picker's pager uses the same rule.
- Files: js/admin.js (pageNums, pagerHtml, ACT.top), build/admin.py.

### P-43 · Users: no per-person Amazon tag (26 Nov)
- Adil: the admins don't need their own Amazon tag. Removed from the Users list, the edit form and the person page, and the "Poster tags" note on Affiliate tags. Links use the tags on the Affiliate tags page only.
- Backend: drop the per-user tag field from the users table and the link builder, if it was planned.
- Files: build/admin_c.py, build/data_export.py, js/admin-c.js.

### P-44 · Social sharing: just the platforms and a sample post (26 Nov)
- Adil: we set up OfferTag's own Meta and Pinterest apps for them, so the admin has nothing to connect. Removed Connect / Disconnect / Reconnect, the Pinterest board picker, the "What every post says" panel, the approval note and the History tab (and its /admin/social/history page).
- The page now lists Facebook Page, Pinterest and Threads, each with the sample deal shown as a post there (same share text as Copy for WhatsApp).
- Files: build/admin_c.py, build/routes.py, js/admin-c.js, js/admin-db.js, css/admin.css.

### P-45 · Header: proper Sign in button and a clear light/dark switch (26 Nov)
- Adil: the outline "Sign in" looked small and generic; the lone sun was too faint. Sign in is now a filled navy pill with a user icon (white in dark mode). The theme button is a sun/moon switch with both icons always visible and a knob on the current one.
- Files: build/home.template.html (header source for every page), css/theme.css.

### P-46 · Footer: bolder look, same content (26 Nov)
- Adil: footer felt plain. Added the big "Bachat har shopping par." tagline (gold "shopping"), social icons in their brand colours, a gold rule under each column head, a soft glow on the navy, and a large faint OfferTag wordmark above the copyright line. Links and wording unchanged.
- Files: build/footer.html, css/theme.css.

### P-47 · Catalogue: a store keeps several affiliate IDs (26 Nov)
- Adil: a store like Amazon can have many IDs; let the admin store all of them. Each row is "Used for" (fixed list: Website buy buttons, WhatsApp and short links, Google search visits, Facebook, Pinterest, Threads, Android app, Spare) + ID, no free-text names; one ID per place; Website buy buttons is the default. Rows, Add ID and remove; empty IDs and duplicates are refused. Affiliate tags still decides which ID goes on each link. Sample: Amazon has Website, WhatsApp, Google and Facebook IDs.
- Backend: shops need a list of IDs (shop_affiliate_ids: shop_id, label, value), not one affiliate_value; the first is the default.
- Files: build/admin_c.py, js/admin-c.js, js/admin-db.js, css/admin.css.

### P-42 · Admin pages wait for Save (26 Nov)
- Adil: admin changes must not save on their own. Pinned board ("every N" and slot order), Sponsored "Show on Home", the Users "can sign in" switch, and Catalogue order now use the same Unsaved changes · Discard · Save bar, with a leave warning. Unpin, Pin a deal, sheets with their own Save, and the one-click buttons on a user's page stay instant with Undo. A published blog post no longer autosaves (Update or Cmd+S); drafts still autosave because there is no Save draft button.
- Files: js/admin.js (ADM.saveBar), js/admin-c.js, js/admin-d.js, build/admin.py (SAVEBAR), build/admin_c.py.

### P-48 · Pantry rule: categories as chips (26 Nov)
- Adil: the Pantry rule list wasted space. All categories now show as compact chips in the sheet (no inner scroll box); picked ones are highlighted.
- Files: css/admin.css.

### P-49 · Inbox feedback: Done and Reply thanks; no Sample tags (26 Nov)
- Adil: deleting feedback had no use. Each message now has Reply thanks (opens a mail to the sender with a short thank-you that fits Issue, Suggestion or Appreciation, which the user picks on the website form) and Done (hides it, with Undo; kept, not deleted).
- All "Sample" tags removed from admin pages; the Playground box already says it is a demo. The ADMIN badge stays.
- Per-user Amazon tag stays removed (P-43, Adil confirmed).
- Files: js/admin-c.js, build/admin_c.py, build/admin.py, build/admin_d.py.

### P-50 · Security: flagged clicks keep our tag; no Let back in (26 Nov)
- Adil: dropping our Amazon tag is not safe (shared mobile IPs mean real buyers) and nobody can ask to be let back in. A flagged IP (over 300 Shop Now clicks in 10 min) now only stops counting as views; its clicks keep our tag and nothing is blocked. The flag clears after a day, so the page is a read-only list.
- Backend: changes X.5 (break test 6): flagged IPs must get the tagged link; only preview bots stay untagged, pending backend-ot.
- Files: build/admin_e.py, js/admin-e.js.

### P-51 · Social sharing shows Connected; Users has a role table (26 Nov)
- Social sharing: each platform card shows a Connected status next to the account (sample: all connected). Backend: needs a per-platform status (connected / token expired) from the posting app setup.
- Users: "What each role can do", a collapsible tick table of Super admin, Admin and User (website/app: view deals, edit own profile; no admin access), brought back in place of the one-line note (matches the pages admin_only() locks).
- Files: build/admin_c.py, css/admin.css.

### P-52 · Footer toned down (26 Nov)
- Adil: P-46 was too much. Removed the big tagline, the giant faint wordmark, the glow and the brand-coloured social circles; the footer is back to the plain layout with only a small gold rule under each column title.
- Files: build/footer.html, css/theme.css.

### P-53 · Header: plain Sign in + tiny theme icon (26 Nov)
- Adil: the filled Sign in button and sun/moon pill looked busy and like competitors. Sign in is now a plain text link; theme is one tiny icon: a moon in light mode, a sun in dark mode (Adil tried an on/off switch and preferred the plain icon). The menu keeps Light / Dark / Auto.
- Files: build/home.template.html, build/theme_head.py, css/theme.css.

### P-54 · Admin Sponsored: each ad its own card (26 Nov)
- Two ads sat in one box with only a line between them; now separate cards with a 12px gap.
- Files: css/admin.css.

### P-55 · No "Check with app" label (26 Nov)
- Removed the "Check with app" tag beside Android app rows in admin.
- Files: build/admin_c.py.

### P-56 · Contact: no WhatsApp / Telegram buttons (26 Nov)
- They pointed at the one-way deal group and channel, so a support message would never reach the team. Contact now has the support email and the feedback form (goes to admin Inbox). The footer still links both channels for deal alerts.
- Files: build/build.py.

### P-57 · Admin sidebar: no "Admin" chip (26 Nov)
- The chip beside the logo said "Admin" even for a Super admin. Removed it; the role already shows under the name at the top right. The admin sign-in page keeps its "Admin" label.
- Files: build/admin.py.

### P-58 · Footer redesign (26 Nov)
- After a look at CashKaro, GrabOn, DealsHeaven, FreeKaaMaal and DealsMagnet (all: logo + 3–4 link columns + grey icon row): ours leads with "Get every deal, your way", four cards (WhatsApp, Telegram, Android app, Browser alerts), each with one line and one action. Then four short link groups (Deals, Browse, Help, Legal; no duplicate Contact, store list cut to Amazon and Flipkart), a plain commission line, and small Facebook / Instagram / LinkedIn icons beside the copyright. X dropped (no setting in admin).
- Same day, Adil: the rounded cards looked AI-made. The four ways are now flat columns split by thin lines, with small squarer icons; the commission line has no box. Browser alerts shows its state: "On for this device · Turn off" (green dot) once on, and tapping again turns it off. The real site reads this from the browser's notification permission and push subscription, so it stays correct per device.
- The Android app icon box was dark navy and blended into the footer; it is now Google Play green (#01875f).
- Files also: js/site.js.
- Files: build/footer.html, css/theme.css.

### P-59 · Sponsored: one slot, one live ad (26 Nov)
- Adil: Home has one ad slot, so showing a random one of several live ads made no sense. Admin tabs are now Live · Scheduled · Ended. Two switched-on ads can't share a day: saving or switching on an ad whose dates overlap another shows "Another ad runs 23 Nov – 13 Dec. One ad shows at a time, so pick dates outside that, or switch that ad off." Sample HomeNest ad now starts after Sharma's ends.
- Backend needs the same overlap check on save (sponsored table), not only the screen.
- Files: build/admin.py, build/build.py (seed dates), js/admin.js.

### P-60 · Security tab hidden; old sponsored copies reset (26 Nov)
- Adil: the flagged-IP page caused confusion (flagged sounded like blocked). The Security tab is out of the admin menu until the backend and website are done; the page file stays for later. Role table row no longer lists security.
- Browsers that saved the old sample ads (two live at once) drop that copy once, so the one-slot list from P-59 shows.
- Files: build/admin.py, build/admin_c.py, js/db.js.

### P-61 · Feedback: reply by email, nothing removed (26 Nov)
- Adil: keep every feedback message; no Done step. Each message with an email gets Reply, which opens a sheet filled from a ready template for its kind (Issue, Suggestion, Appreciation), editable, then Send reply. The row stays and shows "Replied 26 Nov" with Reply again.
- Templates follow the usual support pattern (thank, say what happens next; for issues ask for a screenshot or deal link). Backend: send through SES from the support email in Site & app; store `replied_at` on the feedback row.
- Files: build/admin_c.py, js/admin-c.js, css/admin.css.

### P-62 · Alerts: Send alert and History tabs (26 Nov)
- Adil: sent alerts are history and can grow long, so they get their own tab with a search box, newest first. Default picked: history kept 90 days, older rows load as you scroll (backend: paged list).
- Files: build/admin.py, js/admin.js, css/admin.css.

### P-63 · Admin buttons plainer (26 Nov)
- Adil: buttons looked like an AI template. Main action is now solid brand blue with white text (was near-white), 6 px corners, no icon in front of text on main and outline buttons, no press shrink. Icon-only buttons unchanged. Confirm titles no longer end in a question mark ("Delete this deal", "Send a push alert").
- Files: css/admin.css, js/admin.js, js/admin-c.js.

### P-64 · Feedback: Open and reply (26 Nov)
- Adil: long messages need opening. List cuts each message to two lines; every row has Open and reply (Open when there is no email). The sheet shows the kind, sender, time and full message, then the reply form with the template.
- Files: build/admin_c.py, js/admin-c.js, css/admin.css.

### P-65 · Admin template look, deeper pass (26 Nov)
- Adil: still looked like an AI template. Deal rows: 9 icon buttons cut to Copy for WhatsApp, Edit and More; More lists Share, Pin, Feature, Move to top, Send push alert, Open public page, Delete as words. In-page tabs are underlined text (were pill boxes). Overview links have no arrows. Feedback rows: Open, plus Reply with a mail icon (P-63 had hidden it).
- Files: js/admin.js, js/admin-c.js, build/admin.py, css/admin.css.

### P-66 · Admin main button is Buy gold (26 Nov)
- Adil picked option 3 of four brand colours (white, sky, gold, navy). Main button: gold #F5B000 with dark text, 4 px corners, weight 500. Small row actions (Edit, Open, Reply, Reset) are underlined text with no box. Merged Muiz's 307a793 (no handled state on feedback) before this; my P-38/P-61 already cover it, so my side was kept.
- Files: css/admin.css.

### P-67 · Feedback Reply is a boxed button (26 Nov)
- Adil could not see Reply once P-66 made small actions plain text. Reply (mail icon) has a border again and turns gold on hover; Open stays as text.
- Files: css/admin.css.

### P-68 · Feedback: one Reply button, always (26 Nov)
- Adil saw only "Open" in his browser: Reply was shown only when the sender looked like an email, and his saved playground data failed that check. Back to the simple row: one Reply button (mail icon) on every message; it opens the full message with the reply below. The Contact form requires an email, so every message can be answered.
- Files: js/admin-c.js.

### P-69 · Pinned board wording (26 Nov)
- Adil found "Slot 1 · card 3" and the four-line intro confusing. Intro is one line: new deals keep coming in at the top of Top deals; pinned deals stay in place between them. Cards say "Spot 1, 2, 3" (no card number); summary reads "8 pinned deals, one after every 2 new deals". Logic unchanged.
- Files: build/admin.py, js/admin.js.

### P-70 · Sign-in is email + code only, no Google (26 Nov)
- Adil: no Google sign-in; members and staff sign in with email and a one-time code. The public sign-in already had no Google button (D-155); the admin sign-in still had "Continue with Google" + "or": removed. Send-error text no longer says "use Google".
- Backend: Google sign-in (`google.service.ts`, `GOOGLE_CLIENT_IDS`) is no longer needed; web/ and the Android app drop any Google button.
- Files: build/admin_login.py, js/admin-login.js, js/site.js.

### P-71 · No coupon terms (26 Nov)
- Adil: only the coupon code is needed. Deal form loses the "Coupon terms" box; deal pages no longer show a terms line. No "How to get the deal" box either (Adil: not needed, though the old site had `deal_step`).
- Backend: drop `coupon_terms` from the deal API/form; old `deal_step` is not shown.
- Files: build/admin.py, build/build.py, js/render.js, js/admin.js.

### P-72 · Deal form: no extra blocks (26 Nov)
- Adil: Offer details, Highlights, Links, Note and Specs are not in scope; the Description box covers them, as on the old site. "More details" now holds only Caption and Coupon. The public deal page still lays out an old description's highlights/specs when it finds them (display only, from the description text).
- Backend: no offers/highlights/links/note/specs fields on the deal form API.
- Files: build/admin.py, js/admin.js.

### P-73 · Caption on deal cards (26 Nov)
Adil: the caption showed on the deal page but not in the listings. The old site puts `deal_caption` on the card picture (`.dealCaption`), so cards now show it the same way: a band across the middle of the picture, centred text (`.cap-chip`). Files: `build/build.py` card(), `js/render.js` card(), `css/theme.css`.

### P-74 · Waiting for approval is back (26 Nov)
Reverses A-03 for Telegram deals: signed scope v3.18 says Telegram deals wait on an approval screen. New tab Deals → Waiting for approval (`/admin/incoming`) with a count on Deals. Each deal shows picture, shop, category, age, title and caption that can be fixed in place, Approve (puts it live, newest on Top deals) and Reject, plus Approve all. Deals posted from the admin form still go live directly. Sample: 3 deals. Files: `build/admin.py` (build_incoming, _SEC, NAV count), `build/routes.py`, `js/admin.js`, `css/admin.css`.

### Notes from the public build (2026-11-25)

**P-01 card research (what we copied and why).** Flipkart, Meesho and Ajio show the price, the struck MRP and "% off" on **one line**, read left to right. Amazon puts "-88%" before the price. Myntra puts "(88% OFF)" after the MRP. DesiDime and Slickdeals put the store and the posting time in a small top line above the title. Our card now follows that common order:
1. **Top line:** category · age on the left, store logo on the right. This is a balanced left/right pair.
2. **Title:** 2 lines.
3. **Price line:** price, struck MRP and % off.
4. **Saving line:** "You save ₹…", quiet grey, full width.
5. **Buy now:** full width.

Every row is either full width or a left/right pair, so no row leaves an empty side. The store logo used to sit alone opposite "Save". The `↓ 88%` badge on the photo is gone, and the photo's top-left corner now holds the Pinned chip. Share moved to the top-right corner, still shown on hover. On narrow cards the word "ago" drops first, so the category stays readable. Hover, press and Buy effects are unchanged.

**P-01 colour of the % off: green, as text, not a solid badge.**
- **Meaning:** % off is a gain for the shopper. Green means "saving / good for you", and India's biggest marketplaces train that reading every day: Flipkart, Meesho, Ajio and JioMart all show "% off" in green.
- **Why not red:** Amazon's red "-88%" belongs to its urgency badge ("Limited time deal"). In our interface red already means errors and Delete, and in money contexts red reads as a loss. A red discount would also clash with our navy brand.
- **Why not orange:** Myntra's orange is Myntra's own brand colour. Copying it would look borrowed.
- **Contrast:** the token `--save-ink` (#166941, 6.7:1 on white) passes WCAG AA for small bold text. Dark mode uses the lighter `--save` (hsl 151 58% 52%) on the dark card.
- **Why text, not a badge:** one green element per card is enough. "You save" moved to grey so it doesn't repeat the green, and price stays the strongest element.

**P-03:** the price slider's ends come from the deals on the page, e.g. ₹1 to ₹94,740 on Top deals. The scale is logarithmic, so cheap items get ₹10 steps and expensive ones ₹500 to ₹1,000 steps. The filter applies when a handle is released. There are no typed Min/Max boxes (removed at your request). Links keep working (`?disc=75&price=-950`).

**P-07:** with the old-site rule, **New deals** means "under 25% off". In this sample only 1 of the 118 deals qualifies, so the New deals page is almost empty, while Top deals has 114. This is what you asked for; change the numbers in Catalogue → Deal types (A-14) if you want it different.

**P-08:** the Home hero shows the deals marked Featured (3 sample deals), then the most-viewed ones. The sample "Incoming" deals are no longer in the data (A-03).

**Files changed:**
- `prototype/build/build.py` (card, rules, hero, blog)
- `build/data_export.py` (no status or Incoming, featured flag)
- `build/listing.template.html` (sliders, no Posted)
- `build/detail.template.html` (no report, no withdrawn banner)
- `js/db.js` (type rules, no statuses)
- `js/render.js` (card, hero, lists, blog, Pinned chip on the deal page)
- `js/listing.js` (sliders)
- `js/detail.js` (no report, no withdrawn)
- `css/theme.css` (card and slider styles at the end)

---

## Part B: Admin (done 2026-11-25)

### Deals

#### A-01 Deals list row: actions in the row, no menu clutter
Screens: Image 1 (row) and 2 (menu).
- [x] **Remove** Clone (including the `/admin/deal/{id}/clone` pages and "Copy Deal"), Copy buy link, Bump to top, the "Change status" group (Live, Withdrawn, Rejected) and the stand-alone "Share…" behaviour that leaves the page.
- [x] **Copy for WhatsApp** is the only copy action and uses a **copy icon** (not the chat bubble). It copies the one fixed format (see Part C, short links).
- [x] **Share** opens a share sheet **in place**, as a small popover on desktop and a bottom sheet on phones. It offers WhatsApp, Telegram, Facebook and copy link, and uses the device's native share on phones. Today Share sends the user to the deal's edit page (`#share`); after this change it never navigates away.
- [x] Put the actions **in the row itself**, using the empty space in the table. Each is an icon button with a tooltip, in this order: Copy for WhatsApp · Share · Pin · Feature · Send push · Open public page · Edit. Use clear icons, for example copy, share-2, pin (filled when pinned), star (filled when featured), bell, external-link and pencil.
- [x] The overflow menu (`…`) keeps only **Delete**, with a confirmation and an Undo toast.
- [x] **Pin** and **Feature** are toggles in the row and show their state at a glance.
- [x] On phones the same actions are available from the card's action strip or sheet.

#### A-02 Reorder by dragging, and multi-select (replaces "Bump to top")
- [x] Each row gets a **drag handle** (grip icon). Dragging a row up moves that deal up on the site, so the top row is the first deal shown.
- [x] Each row gets a **checkbox**. With several rows selected, dragging any selected row moves them all together, keeping their order.
- [x] The selection bar shows "N selected" with these bulk actions: **Move to top** · Copy for WhatsApp (all selected, one after another) · Pin · Feature · Delete · Clear.
- [x] On touch screens the handle works with long-press and drag, and "Move to top" is available for one-tap use.
- [x] Replaces B11 "Bump to top" and the silent bump on save.

#### A-03 Remove deal statuses entirely
Screen: Image 3 (tabs: All 120 · Live 114 · Pending 5 · Withdrawn 1 · Rejected 0).
The script publishes deals directly. There is no pending, approved, rejected or withdrawn state: a deal is either on the site or deleted.
- [x] Remove the status tabs, the Status column, the status filter and the status chips everywhere in the admin.
- [x] Remove the Live, Pending, Withdrawn and Rejected labels from `js/admin.js` (`LABEL.status`), from the sample data (`data/*.json`, `build/*.json`) and from the deal content contract (field 24).
- [x] Remove the "only live deals can be shared" checks.
- [x] **Incoming page** (`/admin/incoming`): remove it entirely, with its menu entry, Overview tiles and links. *(Decided 2026-11-25.)*
- [x] Replaces B17 (Telegram deals wait for approval), D-040 (withdrawn state) and D-079 (publish rule statuses).

#### A-04 Deal view page (read-only) with an edit drawer
Screen: Image 10 (context).
- [x] Clicking a row in the deals list opens a **deal view page** (new address `/admin/deal/{id}`), not the edit form. It shows:
  - Image, title, price, MRP, % off, store, category and the auto tag (Loot, Top and so on)
  - When posted and by whom, plus the Pinned and Featured state
  - **Numbers:** views, Buy clicks, shares by channel (WhatsApp, Telegram, Facebook and so on) and pushes sent
  - **Comments** on this deal: author, time and text, each with Delete and Undo. This replaces the Comments tab in the Inbox.
  - Actions: Copy for WhatsApp · Share · Pin · Feature · Send push · Open public page · Delete
- [x] A **pencil (Edit) button** opens the edit form in a **side drawer** (full screen on phones). Saving closes the drawer and refreshes the view.
- [x] The existing address `/admin/deal/{id}/edit` keeps working and opens the view page with the drawer open.

#### A-05 Post a deal: a simpler page
Screens: Image 5 and 6.
- [x] **Drag and drop the image anywhere on the page.** While a file is dragged over the window, show a full-page "Drop image here" overlay. Pasting an image (Ctrl+V), Fetch from link and Upload also keep working.
- [x] **Remove the "Clean URL" checkbox.** Link cleaning stays automatic, as in the current code: store tags and affiliate parameters are stripped on save and the right tag is added when the link is used (Part C).
- [x] **Remove the "Deal types" chips** (Top deal, Loot, New, Pantry). The tag is set automatically from the % off using the Settings rules (A-14). Show a read-only hint instead, e.g. "Will be tagged: Loot (88% off)".
- [x] **Off %** is calculated from Price and MRP and is no longer typed by hand.
- [x] Field order, plain-language labels and helper text:
  1. Deal link (store chosen automatically from the link)
  2. Image (drop zone)
  3. Title
  4. Description (simple editor)
  5. Store and Category
  6. Price, MRP and the calculated off %
  7. Options: Pinned · **Featured** · Send push · Shows on (Web + App by default)
  8. "More details" (coupon, how to get it and extras) stays folded away
- [x] Clear required markers, inline errors, and the live card preview on the right, which shows the new card from P-01.
- [x] After publishing: the success panel with Copy for WhatsApp, Share and "Post another".

#### A-06 Featured deals replace sale posters
Screens: Image 6 (Promote), 13 and 14 (Settings → Home → Sale posters).
- [x] Remove **sale posters** completely:
  - the "Add poster" form and `/admin/posters`
  - the Promote → Sale posters entry
  - the Settings → Home "Sale posters" toggle and its "Manage posters" link
  - the poster sample data
- [x] A deal becomes featured **only** from the deals list row (A-01), the deal view page (A-04) or the Post/Edit form (A-05). There are no other places, so nothing is duplicated.
- [x] Featured deals fill the Home hero (P-08).

#### A-07 Sponsored ads: image + CTA only
Screen: Image 7.
- [x] The add and edit form has only these fields:
  - **Image** (one image, required)
  - **Button text** (CTA), e.g. "Visit website" or "Call us"
  - **Button link** (URL, or `tel:` for calls)
  - **Start date** (optional) and **End date** (optional)
  - **On/off** switch
- [x] Remove Advertiser, Phone image and Title, along with every other field.
- [x] Dates: if both are given, the ad shows only within that period. If they are empty, the ad shows until it is switched off. The dates are for internal use only and are never shown on the site. There is no separate scheduling feature.
- [x] The list shows the image thumbnail, button text, link, dates (or "Until turned off"), on/off, views and clicks.

#### A-08 New alert: deal image, title and price only
Screen: Image 8.
- [x] When a deal is selected, the alert is built from the deal itself: **image, title and price**. Nothing else is entered.
- [x] Remove the "Message" box.
- [x] Keep the "Send to" choice exactly as it is today (Website, App, or both). *(Decided 2026-11-25.)*

### Inbox

#### A-11 Inbox: remove Reports, move Comments
Screen: Image 10.
- [x] **Remove Reports** entirely: the tab, its data and the public "Report a problem" button (P-06).
- [x] **Move Comments** to each deal's view page (A-04), and remove the Comments tab and `/admin/comments`.
- [x] The Inbox keeps Feedback (contact form) and Deletion requests.

### People, roles and access

#### A-12 Remove the Members page; show a Users count on Overview
Screen: Image 11.
- [x] Remove the **Members** page (`/admin/members`) and its sidebar entry.
- [x] On **Overview**, add one tile labelled **"Users"** showing the total (28,880). The tile is not clickable, and no names or details are shown anywhere.

#### A-13 Roles and users: three roles, one Users page
Screens: Image 17 (Roles) and 19 (Users). Roles:

| Role | Can do |
|---|---|
| **Super admin** | Everything |
| **Admin** | Post, edit and delete deals. Cannot change categories or shops. |
| **User** (public) | View the site and edit their own profile. No admin access. |

- [x] **Merge Roles into Users.** Remove the Settings → Roles tab and its capability matrix.
- [x] On the Users page, show one short line describing the Admin role only (the text in the table above). Super admin needs no description.
- [x] Rename "Sub-admin" to **Admin** and "Admin" to **Super admin** everywhere: menus, labels, `?role=` preview and data.
- [x] Settings → Users lists **Super admins and Admins only**. Public users appear only as the count from A-12.
- [x] **Add user:** name, email, role (Admin or Super admin) and Amazon tag. The user signs in with email OTP.
- [x] **Edit user:** name, role (promote to Super admin or demote to Admin), Amazon tag.
- [x] **Active / Inactive** switch. An inactive user cannot sign in, and their deals stay on the site.
- [x] **Delete user**, with a confirmation. Their deals stay on the site.
- [x] **Per-user page** (`/admin/users/{id}`): profile, role, status and Amazon tag, editable in place, plus an **activity log (audit)** listing sign-ins, deals posted, edited and deleted, and settings changed, each with a date and time and filterable by type.
- [x] Menu access: an Admin sees only what the Admin role allows. *(Confirm the exact list in Part D, Q5.)*
- [x] Replaces D-160's "roles are fixed, ask the developer" note.

### Settings

#### A-14 Deal tag rules, set in Catalogue → Deal types (replaces "Featured deals" rules)
Screens: Image 15 and 24.
- [x] Remove the "Featured deals" settings block from Settings (Price at or above, Or discount at or above, At most per day, What the flag does).
- [x] Remove the empty **"Header"** block that sits directly below it in Settings (Image 24). *(Decided 2026-11-25.)*
- [x] Catalogue stays **as it is**. In **Catalogue → Deal types**, the "Rule line" becomes a **real, editable rule** instead of descriptive text. Defaults are the **old live site's** numbers (W44):
  - **Top deal:** 25% off or more
  - **Loot:** 75% off or more (also counts as Top)
  - **New:** below 25% off
  - **Pantry:** deals in the **Grocery** category. This is a category rule, not a percentage rule.
  - **Push ticked by default:** 90% off or more (old site rule, unchanged)
- [x] Every deal gets its tag from these rules automatically, both new deals and existing ones when a rule changes. For example, with Loot set to 85%, every deal at 85% off or more is tagged Loot.
- [x] Order and on/off for each deal type stay as they are today.

#### A-15 Social sharing: one fixed format
Screen: Image 16.
- [x] Remove the per-platform format editor: the text box, the Insert chips, "Save format" and "Reset to default".
- [x] One **hard-coded** format is used for every share, with no editing.
- [x] Replaces B14.

#### A-16 Join / community buttons are always on
Screen: Image 14.
- [x] In Settings → Site & app, remove the on/off switch for the join / announcement buttons (WhatsApp, Telegram, Get the app) just below the Home section. They are always shown. *(Decided 2026-11-25.)*

#### A-17 Security: flagged IPs only, kept simple
Screen: Image 20.
- [x] Remove the **Bot check** section entirely.
- [x] Keep one **Flagged IPs** table with the columns IP · Status · Added · Until · "Let back in".
- [x] Remove the **"Why"** column.
- [x] Remove **"Always allowed"**: the row, the status and the "Remove" action.

#### A-18 One place for affiliate tags (Catalogue vs Affiliate tags)
Screen: Image 12 (Catalogue → Shops row showing `tag=offertag-21`).
- [x] The Amazon and Flipkart tags are set in **Settings → Affiliate tags only**, per channel: Website, App, WhatsApp/short links, Google, Facebook and so on (BRD B16).
- [x] Remove the affiliate tag column and field from Catalogue → Shops, so the Shops page keeps only name, logo, card label, description, steps, order and active.
- [x] Per-person Amazon tags stay on Users (A-13).
- [x] See Part C for how the tags are used today.

#### A-19 Short links: build them properly
- [x] Make the short link **fixed per deal** and generated from the deal ID, as on the old site (Part C). Today the prototype makes a random 5-character link (`offertag.in/v/` + random), so the same deal gets a different link each time.
- [x] "Copy for WhatsApp" and Share use the **buy short link** (`/d/…`, which goes straight to the store with the WhatsApp tag). The deal page link is `/v/…`.

### Notes from the admin build (2026-11-25)

- **Site order:** dragging a deal (or **Move to top**) sets its place on the site. Home, Top deals and the other lists now follow that order, newest first otherwise. Drag works when the list is in site order (the Deal column). If it's sorted by price, time or views, the handles are greyed out with a "Back to site order" link. Arrow keys on a handle move a deal one place.
- **Row actions:** Copy for WhatsApp · Share (a menu on desktop, the phone's own share sheet on phones) · Pin · Feature · Send push · Public page · Edit · ⋮ (Delete only). Pinned and Featured show as lit icons and as labels under the title.
- **Deal page:** `/admin/deal/{id}` shows the deal, its numbers (views, unique visitors, Buy clicks, click rate, comments), sample share counts, its links (public page, both short links, store link) and its comments, with Delete and Undo. **Edit** opens the form in a side drawer. Saving closes it and refreshes the page. The old `/admin/deal/{id}/edit` address opens the deal page with the drawer open.
- **Post a deal:** numbered steps, a big drop zone, drag a picture anywhere on the page, or paste it. Description sits under the title. The tag hint ("Will be tagged: Loot") follows the rules. Featured is in Options. Clone, Clean URL, deal-type chips, "How to get it", Bump and the share panel are gone.
- **Sponsored (updated 2026-11-26):** no views, clicks, rate or advertiser report. The start date is required and the end date is optional (no end date = on until switched off). An ad that hasn't started yet shows "Starts 2 Dec" instead of a status word. The list shows "Button → website" and the dates. The public card is the picture with "Sponsored" and the button under it. A phone number in "Button opens" becomes a Call button.
- **Users:** Settings → Users lists Super admins and Admins. **Add user**, Edit (name, email, role, Amazon tag, active), the on/off switch, Delete. You can't delete or turn off yourself, and there's always at least one active Super admin. Each user has a page `/admin/users/{id}` with an activity log: sign-ins, deals posted, edited, pinned, featured, moved and deleted, and settings changed. Real actions taken in this browser are logged against whoever is signed in (Super admin preview = Adil, Admin preview = Imran K.), on top of sample history.
- **Admin access (Q5, still to confirm):** an Admin sees Overview, Deals (All deals, Pinned board, Post a deal) and Alerts. Everything else says "for Super admins only".
- **Deal tag rules:** Catalogue → Deal types shows the live rule for each tab. Edit Top deals or Loot to change the %, edit Pantry to pick its categories. New is "under the Top deals %". Loot must stay above Top. Every page, card tag, filter and the Loot heading sticker follow at once.
- **Short links:** fixed per deal (`offertag.in/d/` + the id written as letters, A=0 … J=9), used by Copy for WhatsApp, Share and the deal page.
- **The one post text:** title, then "Deal price: ₹… (MRP ₹…, …% off)", then "Code: …" if there's a coupon, then "Buy: offertag.in/d/…". Social sharing shows it, read-only.
- **Removed pages:** `/admin/incoming`, `/admin/posters`, `/admin/members`, `/admin/role`, `/admin/reports`, `/admin/comments`, `/admin/social/formats` and every `/admin/deal/{id}/clone` page.

---

## Part C: What the current code base does today

Sources: `ia/inventory/old-website.md` (live offertag.in, Laravel), `ia/deal-content-contract.md` and `prototype/js/*.js`.

**Deal types (tags)**
- Old live site, direct post (W44): below 25% → New; 25% or more → Top; 75% or more → also Loot; category 33 (Grocery) → also Pantry; 90% or more → push notification ticked by default.
- Prototype (D-117, `js/db.js:43` and `js/admin.js:395`): above 25% → Top; above 80% → also Loot; Grocery or Kitchen → Pantry; **every** deal → New. These numbers are hard-coded, and the post form lets the admin override them with chips.
- After A-14, the numbers come from Settings, with no manual override.

**Short links (W31, W30)**
- `offertag.in/v/{code}` redirects (302) to the deal's page on OfferTag.
- `offertag.in/d/{code}` shows the OG preview card (for WhatsApp and Telegram), then a script sends the visitor **straight to the store** with the WhatsApp tag `offertag1-21`.
- `{code}` is the deal ID with each digit written as a letter (0→A … 9→J). `/o/t/r/{slug}` is a legacy form.
- The old admin "Copy OfferTag link" copied: Title / Buy link (short URL) / Deal details (`/v/` link) / MRP / Price (pct OFF).
- The prototype does not follow this; see A-19.

**Affiliate tags**
- On the old site the store link is `deal_link` + `shops.affiliate_value` (Amazon and Flipkart only).
- The tag changes with the source of the click: `?source=` → `offertag2-21` (Google), `?fbclid` → `offertagfb-21` (Facebook), `/d/` short link → `offertag1-21` (WhatsApp), and the website itself → `offertag-21`. Flipkart uses `affid=offertag` (old site; the new site adds no Flipkart id, P-37).
- The prototype shows the tag in two places, Catalogue → Shops and Settings → Affiliate tags. A-18 keeps only Settings.

**Statuses**
- The old site had statuses only for deals posted by members (pending, rejected, approved), and the BRD removed member posting.
- The prototype added Incoming, Pending, Rejected and Withdrawn for the Telegram bot (B17). A-03 removes all of them.

---

## Part D: Decisions (2026-11-25)

| # | Item | Decision |
|---|---|---|
| Q1 | A-03 | Remove the Incoming page entirely. |
| Q2 | A-16 | Remove the on/off switch for the join / announcement buttons; they are always on. |
| Q3 | A-14 | The element is the empty "Header" block in Settings (Image 24). Remove it. |
| Q4 | A-08 | Keep the alert "Send to" choice as it is. |
| Q5 | A-13 | Not answered yet. Built with the working default: an Admin sees Overview, Deals (list, post, pinned) and Alerts. |
| Q6 | A-14 | Catalogue stays as it is. The deal tag rules are edited in Catalogue → Deal types (the "Rule line" becomes a real rule). |
| Q7 | A-14 | Use the old live site's numbers: Top 25% or more, Loot 75% or more, New below 25%, Pantry = Grocery, push at 90% or more. Where the old site and the BRD cover something, follow the old site. |
