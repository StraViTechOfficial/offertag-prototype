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

**P-03:** the price slider's ends come from the deals on the page, e.g. ₹1 to ₹94,740 on Top deals. The scale is logarithmic, so cheap items get ₹10 steps and expensive ones ₹500 to ₹1,000 steps. The filter applies when a handle is released, or with Go after typing Min/Max. Links keep working (`?disc=75&price=-950`).

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

## Part B: Admin

### Deals

#### A-01 Deals list row: actions in the row, no menu clutter
Screens: Image 1 (row) and 2 (menu).
- [ ] **Remove** Clone (including the `/admin/deal/{id}/clone` pages and "Copy Deal"), Copy buy link, Bump to top, the "Change status" group (Live, Withdrawn, Rejected) and the stand-alone "Share…" behaviour that leaves the page.
- [ ] **Copy for WhatsApp** is the only copy action and uses a **copy icon** (not the chat bubble). It copies the one fixed format (see Part C, short links).
- [ ] **Share** opens a share sheet **in place**, as a small popover on desktop and a bottom sheet on phones. It offers WhatsApp, Telegram, Facebook and copy link, and uses the device's native share on phones. Today Share sends the user to the deal's edit page (`#share`); after this change it never navigates away.
- [ ] Put the actions **in the row itself**, using the empty space in the table. Each is an icon button with a tooltip, in this order: Copy for WhatsApp · Share · Pin · Feature · Send push · Open public page · Edit. Use clear icons, for example copy, share-2, pin (filled when pinned), star (filled when featured), bell, external-link and pencil.
- [ ] The overflow menu (`…`) keeps only **Delete**, with a confirmation and an Undo toast.
- [ ] **Pin** and **Feature** are toggles in the row and show their state at a glance.
- [ ] On phones the same actions are available from the card's action strip or sheet.

#### A-02 Reorder by dragging, and multi-select (replaces "Bump to top")
- [ ] Each row gets a **drag handle** (grip icon). Dragging a row up moves that deal up on the site, so the top row is the first deal shown.
- [ ] Each row gets a **checkbox**. With several rows selected, dragging any selected row moves them all together, keeping their order.
- [ ] The selection bar shows "N selected" with these bulk actions: **Move to top** · Copy for WhatsApp (all selected, one after another) · Pin · Feature · Delete · Clear.
- [ ] On touch screens the handle works with long-press and drag, and "Move to top" is available for one-tap use.
- [ ] Replaces B11 "Bump to top" and the silent bump on save.

#### A-03 Remove deal statuses entirely
Screen: Image 3 (tabs: All 120 · Live 114 · Pending 5 · Withdrawn 1 · Rejected 0).
The script publishes deals directly. There is no pending, approved, rejected or withdrawn state: a deal is either on the site or deleted.
- [ ] Remove the status tabs, the Status column, the status filter and the status chips everywhere in the admin.
- [ ] Remove the Live, Pending, Withdrawn and Rejected labels from `js/admin.js` (`LABEL.status`), from the sample data (`data/*.json`, `build/*.json`) and from the deal content contract (field 24).
- [ ] Remove the "only live deals can be shared" checks.
- [ ] **Incoming page** (`/admin/incoming`): remove it entirely, with its menu entry, Overview tiles and links. *(Decided 2026-11-25.)*
- [ ] Replaces B17 (Telegram deals wait for approval), D-040 (withdrawn state) and D-079 (publish rule statuses).

#### A-04 Deal view page (read-only) with an edit drawer
Screen: Image 10 (context).
- [ ] Clicking a row in the deals list opens a **deal view page** (new address `/admin/deal/{id}`), not the edit form. It shows:
  - Image, title, price, MRP, % off, store, category and the auto tag (Loot, Top and so on)
  - When posted and by whom, plus the Pinned and Featured state
  - **Numbers:** views, Buy clicks, shares by channel (WhatsApp, Telegram, Facebook and so on) and pushes sent
  - **Comments** on this deal: author, time and text, each with Delete and Undo. This replaces the Comments tab in the Inbox.
  - Actions: Copy for WhatsApp · Share · Pin · Feature · Send push · Open public page · Delete
- [ ] A **pencil (Edit) button** opens the edit form in a **side drawer** (full screen on phones). Saving closes the drawer and refreshes the view.
- [ ] The existing address `/admin/deal/{id}/edit` keeps working and opens the view page with the drawer open.

#### A-05 Post a deal: a simpler page
Screens: Image 5 and 6.
- [ ] **Drag and drop the image anywhere on the page.** While a file is dragged over the window, show a full-page "Drop image here" overlay. Pasting an image (Ctrl+V), Fetch from link and Upload also keep working.
- [ ] **Remove the "Clean URL" checkbox.** Link cleaning stays automatic, as in the current code: store tags and affiliate parameters are stripped on save and the right tag is added when the link is used (Part C).
- [ ] **Remove the "Deal types" chips** (Top deal, Loot, New, Pantry). The tag is set automatically from the % off using the Settings rules (A-14). Show a read-only hint instead, e.g. "Will be tagged: Loot (88% off)".
- [ ] **Off %** is calculated from Price and MRP and is no longer typed by hand.
- [ ] Field order, plain-language labels and helper text:
  1. Deal link (store chosen automatically from the link)
  2. Image (drop zone)
  3. Title
  4. Description (simple editor)
  5. Store and Category
  6. Price, MRP and the calculated off %
  7. Options: Pinned · **Featured** · Send push · Shows on (Web + App by default)
  8. "More details" (coupon, how to get it and extras) stays folded away
- [ ] Clear required markers, inline errors, and the live card preview on the right, which shows the new card from P-01.
- [ ] After publishing: the success panel with Copy for WhatsApp, Share and "Post another".

#### A-06 Featured deals replace sale posters
Screens: Image 6 (Promote), 13 and 14 (Settings → Home → Sale posters).
- [ ] Remove **sale posters** completely:
  - the "Add poster" form and `/admin/posters`
  - the Promote → Sale posters entry
  - the Settings → Home "Sale posters" toggle and its "Manage posters" link
  - the poster sample data
- [ ] A deal becomes featured **only** from the deals list row (A-01), the deal view page (A-04) or the Post/Edit form (A-05). There are no other places, so nothing is duplicated.
- [ ] Featured deals fill the Home hero (P-08).

#### A-07 Sponsored ads: image + CTA only
Screen: Image 7.
- [ ] The add and edit form has only these fields:
  - **Image** (one image, required)
  - **Button text** (CTA), e.g. "Visit website" or "Call us"
  - **Button link** (URL, or `tel:` for calls)
  - **Start date** (optional) and **End date** (optional)
  - **On/off** switch
- [ ] Remove Advertiser, Phone image and Title, along with every other field.
- [ ] Dates: if both are given, the ad shows only within that period. If they are empty, the ad shows until it is switched off. The dates are for internal use only and are never shown on the site. There is no separate scheduling feature.
- [ ] The list shows the image thumbnail, button text, link, dates (or "Until turned off"), on/off, views and clicks.

#### A-08 New alert: deal image, title and price only
Screen: Image 8.
- [ ] When a deal is selected, the alert is built from the deal itself: **image, title and price**. Nothing else is entered.
- [ ] Remove the "Message" box.
- [ ] Keep the "Send to" choice exactly as it is today (Website, App, or both). *(Decided 2026-11-25.)*

### Inbox

#### A-11 Inbox: remove Reports, move Comments
Screen: Image 10.
- [ ] **Remove Reports** entirely: the tab, its data and the public "Report a problem" button (P-06).
- [ ] **Move Comments** to each deal's view page (A-04), and remove the Comments tab and `/admin/comments`.
- [ ] The Inbox keeps Feedback (contact form) and Deletion requests.

### People, roles and access

#### A-12 Remove the Members page; show a Users count on Overview
Screen: Image 11.
- [ ] Remove the **Members** page (`/admin/members`) and its sidebar entry.
- [ ] On **Overview**, add one tile labelled **"Users"** showing the total (28,880). The tile is not clickable, and no names or details are shown anywhere.

#### A-13 Roles and users: three roles, one Users page
Screens: Image 17 (Roles) and 19 (Users). Roles:

| Role | Can do |
|---|---|
| **Super admin** | Everything |
| **Admin** | Post, edit and delete deals. Cannot change categories or shops. |
| **User** (public) | View the site and edit their own profile. No admin access. |

- [ ] **Merge Roles into Users.** Remove the Settings → Roles tab and its capability matrix.
- [ ] On the Users page, show one short line describing the Admin role only (the text in the table above). Super admin needs no description.
- [ ] Rename "Sub-admin" to **Admin** and "Admin" to **Super admin** everywhere: menus, labels, `?role=` preview and data.
- [ ] Settings → Users lists **Super admins and Admins only**. Public users appear only as the count from A-12.
- [ ] **Add user:** name, email, role (Admin or Super admin) and Amazon tag. The user signs in with email OTP.
- [ ] **Edit user:** name, role (promote to Super admin or demote to Admin), Amazon tag.
- [ ] **Active / Inactive** switch. An inactive user cannot sign in, and their deals stay on the site.
- [ ] **Delete user**, with a confirmation. Their deals stay on the site.
- [ ] **Per-user page** (`/admin/users/{id}`): profile, role, status and Amazon tag, editable in place, plus an **activity log (audit)** listing sign-ins, deals posted, edited and deleted, and settings changed, each with a date and time and filterable by type.
- [ ] Menu access: an Admin sees only what the Admin role allows. *(Confirm the exact list in Part D, Q5.)*
- [ ] Replaces D-160's "roles are fixed, ask the developer" note.

### Settings

#### A-14 Deal tag rules, set in Catalogue → Deal types (replaces "Featured deals" rules)
Screens: Image 15 and 24.
- [ ] Remove the "Featured deals" settings block from Settings (Price at or above, Or discount at or above, At most per day, What the flag does).
- [ ] Remove the empty **"Header"** block that sits directly below it in Settings (Image 24). *(Decided 2026-11-25.)*
- [ ] Catalogue stays **as it is**. In **Catalogue → Deal types**, the "Rule line" becomes a **real, editable rule** instead of descriptive text. Defaults are the **old live site's** numbers (W44):
  - **Top deal:** 25% off or more
  - **Loot:** 75% off or more (also counts as Top)
  - **New:** below 25% off
  - **Pantry:** deals in the **Grocery** category. This is a category rule, not a percentage rule.
  - **Push ticked by default:** 90% off or more (old site rule, unchanged)
- [ ] Every deal gets its tag from these rules automatically, both new deals and existing ones when a rule changes. For example, with Loot set to 85%, every deal at 85% off or more is tagged Loot.
- [ ] Order and on/off for each deal type stay as they are today.

#### A-15 Social sharing: one fixed format
Screen: Image 16.
- [ ] Remove the per-platform format editor: the text box, the Insert chips, "Save format" and "Reset to default".
- [ ] One **hard-coded** format is used for every share, with no editing.
- [ ] Replaces B14.

#### A-16 Join / community buttons are always on
Screen: Image 14.
- [ ] In Settings → Site & app, remove the on/off switch for the join / announcement buttons (WhatsApp, Telegram, Get the app) just below the Home section. They are always shown. *(Decided 2026-11-25.)*

#### A-17 Security: flagged IPs only, kept simple
Screen: Image 20.
- [ ] Remove the **Bot check** section entirely.
- [ ] Keep one **Flagged IPs** table with the columns IP · Status · Added · Until · "Let back in".
- [ ] Remove the **"Why"** column.
- [ ] Remove **"Always allowed"**: the row, the status and the "Remove" action.

#### A-18 One place for affiliate tags (Catalogue vs Affiliate tags)
Screen: Image 12 (Catalogue → Shops row showing `tag=offertag-21`).
- [ ] The Amazon and Flipkart tags are set in **Settings → Affiliate tags only**, per channel: Website, App, WhatsApp/short links, Google, Facebook and so on (BRD B16).
- [ ] Remove the affiliate tag column and field from Catalogue → Shops, so the Shops page keeps only name, logo, card label, description, steps, order and active.
- [ ] Per-person Amazon tags stay on Users (A-13).
- [ ] See Part C for how the tags are used today.

#### A-19 Short links: build them properly
- [ ] Make the short link **fixed per deal** and generated from the deal ID, as on the old site (Part C). Today the prototype makes a random 5-character link (`offertag.in/v/` + random), so the same deal gets a different link each time.
- [ ] "Copy for WhatsApp" and Share use the **buy short link** (`/d/…`, which goes straight to the store with the WhatsApp tag). The deal page link is `/v/…`.

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
- The tag changes with the source of the click: `?source=` → `offertag2-21` (Google), `?fbclid` → `offertagfb-21` (Facebook), `/d/` short link → `offertag1-21` (WhatsApp), and the website itself → `offertag-21`. Flipkart uses `affid=offertag`.
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
| Q5 | A-13 | Not answered yet. Working default: an Admin sees Overview, Deals (list, post, pinned) and Alerts. |
| Q6 | A-14 | Catalogue stays as it is. The deal tag rules are edited in Catalogue → Deal types (the "Rule line" becomes a real rule). |
| Q7 | A-14 | Use the old live site's numbers: Top 25% or more, Loot 75% or more, New below 25%, Pantry = Grocery, push at 90% or more. Where the old site and the BRD cover something, follow the old site. |
