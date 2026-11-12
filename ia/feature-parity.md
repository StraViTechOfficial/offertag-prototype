# Feature parity — BRD × old website × Flutter app × our design
COMPLETE · 2026-11-09 · D-054, Law 14. Every ADD/CHANGE/Q below was resolved in D-055–D-061 (shells, card/detail, admin, public briefs); DEV-007–016 logged. Q-031 (offertag.net) is the only item still open. S10a (D-062–D-066) drew the remaining agreed-in-words screens; Q-021 closed (Top picks). Sources: `docs/brd/brd.txt` (B-items), `inventory/old-website.md` (W-items), `inventory/flutter-app.md` (A-items). Our design = D-043–D-053 and `briefs/*.md`.

Status key: **PLACED** (already in a brief/decision) · **ADD** (missing; place it, no decision needed beyond "yes") · **CHANGE** (in our design but differs from BRD or today; needs a decision) · **REMOVED** (BRD removes it; line quoted) · **Q** (question with recommendation, see bottom). Dev = backend/dev-phase, no UI.

## BRD line items (p.1–3) at a glance
| B | BRD item | Status |
|---|---|---|
| B01 | Phone-first, Core Web Vitals, PageSpeed-checked | PLACED D-023/027 |
| B02 | Hottest-deals carousel at top of Home, admin can show/hide | **CHANGE** · D-031 "no slider, no image rails" contradicts the BRD; never logged → DEV-007, Q-024 |
| B03 | Automatic scrolling instead of "Load More" | **CHANGE** · D-032 hybrid keeps a "Show more" button after 3 auto pages → DEV-008 |
| B04 | "Fresh Deals" beside Top/Loot/Pantry/New; posted today; **only Fresh** sortable by price / % off | **CHANGE** · D-045 gives sort on every tab incl. Recommended, Most viewed → DEV-009 |
| B05 | Deal page: coupons added by admin per deal | **ADD** · detail coupon block (tap-to-copy), card "Coupon" tag, post-form field |
| B06 | Deal page: clean clickable links | **ADD** · rule: links in description/steps render as styled anchors, outbound, tagged |
| B07 | Better comment section: replies and likes | **ADD** · detail comments: one-level replies, like, newest first, login CTA (Google/OTP), admin delete |
| B08 | Blog home + article; paste-image editor; "New" label on Blog link | PLACED (sitemap, F10, D-053) · **ADD** "New" badge on Blog link, both shells |
| B09 | Join-our-community bar (WhatsApp/Telegram), closable for the day | **ADD** · both shells; replaces today's sticky side bar W07 → Q-025 placement |
| B10 | Admin: edit many deals at once | **ADD** · bulk edit drawer (status, type, category, shop, display, pin, notify) |
| B11 | Admin: push selected deals back to the top | **ADD** · row + bulk action "Bump to top" (today = re-save) |
| B12 | Pinning as today | PLACED D-053 (pinned board) |
| B13 | Admin share to social (edit screen or multi-select): FB Page, Pinterest, Threads | **ADD** · share panel on edit, bulk "Share…" on list, channel picker |
| B14 | Post-format editor per platform (image, title, price, % off, coupon, short link + platform tag) | **ADD** · new admin screen "Social sharing → Formats" |
| B15 | Share history per deal (where, when, success) | **ADD** · panel on deal edit |
| B16 | Amazon tags per poster and per platform (website, app, each social), managed in admin | **ADD** · new admin screen "Affiliate tags"; per-poster tag kept on Users (W53) |
| B17 | Telegram deals wait on an approval screen (edit/approve/reject); quick-post tool feeds it too | **ADD** · new admin screen "Incoming deals"; replaces today's auto-publish of direct-post W44 → Q-026 sub-admin access |
| B18 | Login: Google or email OTP; both create the account; no sign-up form; members keep accounts and comments | PLACED D-009/F4 · implies password, register, forgot/reset, change-password, Facebook, Apple REMOVED → DEV-010 |
| B19 | Everyone signs in once more after go-live | PLACED F5 (mockup pending) |
| B20 | On-page SEO: titles, descriptions, link previews, auto sitemap, proper 404 | PLACED D-050 (OG) · **ADD** error-page family: 404, 403, "deal no longer available" (D-040) |
| B21 | Kept: lists, categories, shops, search, filters, short links, affiliate tags | PLACED |
| B22 | Kept: comments | see B07 |
| B23 | Kept: web + app push alerts | **ADD** · web push opt-in UI (today OneSignal bell/prompt W08) → Q-027 |
| B24 | Kept: duplicate check, link cleaning | PLACED (admin brief) · "clean URL" checkbox W43 **ADD** to form |
| B25 | Kept: website-only / app-only setting | PLACED |
| B26 | Kept: admin roles | PLACED (hide, not disable) |
| B27 | Kept: bulk copy of deals for WhatsApp/Telegram | **CHANGE** · today on the public site for role 1 (W06); move to admin deals list bulk action → DEV-011 |
| B28 | Kept: Amazon disclosure | PLACED (one line under Buy, D-050) · **ADD** footer disclosure + `/disclaimer` page restyle (W24 paragraphs move there) |
| B29 | Kept: live chat (Tawk.to, W09) | **ADD** · desktop launcher bottom-right; phone: entry in menu + Contact, no floating bubble → Q-028 |
| B30 | Kept: feedback | PLACED "Report a problem" (D-050) · **ADD** general feedback form on `/contact` (type · email · message · Turnstile), today app-only A16 |
| B31 | Delete Account form fixed (Play requirement) | **ADD** · `/delete-account` public form (name, email, mobile, reason, Turnstile) + in-profile delete with confirm + admin "Deletion requests" list (none today, W39) → DEV-012 |
| B32 | Turnstile on login, delete account, feedback | **ADD** · widget slot in those three forms |
| B33 | App content, social links, settings controlled from admin | **ADD** · admin screen "Site & app settings" (social links, community bar on/off, carousel on/off, support email, Blog "New" on/off) |
| B34 | Admin deals + approval on the phone (app) | App parked (D-005) · web admin "Incoming deals" and post form must work one-handed on phone (PLACED in admin brief, extend to queue) |
| B35 | App Links, `oftg.in` short domain | Dev · copy/share UI shows whichever short form dev configures |
| B36 | Removed: member posting, m.offertag.in, login-based app notifications, banner slider | REMOVED D-008 · see Q-029 on what "login-based notifications" removes |
| B37 | Login codes by email (SES) | **ADD** · one branded transactional email template (OTP) → Q-030 scope |

## Screen by screen

### 1. Phone shell (D-043/046/048) and desktop shell (D-047)
| Feature | Source | Status · where it goes |
|---|---|---|
| Logo, search, type tabs | W03 W05 A2 | PLACED |
| Account entry: guest "Sign in"; member name → profile, Sign out | W01 W02 | PLACED (menu sheet / header account) |
| "Go to admin panel" for roles 1/3 | W02 | **ADD** · account menu item, roles 1/3 only |
| "Post a deal" (member) | W02 A12 | REMOVED · BRD "Member deal posting" |
| Role-1 card checkboxes + Copy Selected | W06 | **CHANGE** → admin list (DEV-011) |
| Sticky side bar: app, FB, WhatsApp, Telegram | W07 | **CHANGE** → community bar (B09) + footer links |
| Community bar, closable for the day | B09 | **ADD** · Q-025 |
| Web push opt-in | W08 B23 | **ADD** · Q-027 |
| Live chat | W09 B29 | **ADD** · Q-028 |
| Blog link + "New" badge | B08 | **ADD** · desktop header, phone menu |
| Hottest-deals carousel (admin toggle) | B02 W12 | **CHANGE** · Q-024 |
| Footer: disclosure, legal links, app link, socials, SEO text slot | W11 W19 B28 | **ADD** · footer not designed yet; SEO text as collapsed "About {page}" block |
| `offertag.net` footer variant | W11 W63 | Q-031 (recommend out of scope) |
| Dark mode | A-F W— | PLACED |
| H1 per page | W04 | PLACED (count/updated line region; category/shop one-line header) |
| Grid/list switch | A2 | PLACED (density, D-045) |
| Exit confirm, splash, no-internet | A1 A18 | n/a web · offline: inline retry state PLACED |

### 2. Feed (Home, type, search, category, shop)
| Feature | Source | Status |
|---|---|---|
| Category + shop filters with text filter | W13 A4 | PLACED (facets; store search) · **ADD** category search too (50 categories) |
| Pinned slots 3/6/9/13, invisible | W14 | PLACED |
| Pinned excluded on search | W14 | PLACED as rule (note in feed spec) |
| Order by `updated_at`; edit bumps | W15 | PLACED as "Recommended"/Newest input · bump action B11 |
| Load More | W16 B03 | **CHANGE** DEV-008 |
| Sort | B04 | **CHANGE** DEV-009 |
| Display type / publish_at / active filters | W17 | Dev rule, note in spec |
| Search LIKE, placeholder | W18 A2 | PLACED (search sheet) |
| Category/shop SEO title, H1, footer text | W19 | PLACED header · footer slot **ADD** (shell) |
| Card: shop `icon_name` label | W20 | PLACED (store name) |
| Card: `deal_caption` ribbon | W20 A3 | **ADD** · optional caption label on card and detail |
| Card: category badge | W20 A3 | Q-032 |
| Card: image → store | W20 | CHANGE already decided D-050 (image → detail; Buy → store) |
| Card: posted time hidden when pinned | W20 | PLACED (always shown; pins invisible) |
| Card: "Shop Now" counts a view | W20 W30 | Dev |
| Carousel from `image_sliders` | W12 A2 | REMOVED (slider) · replaced by B02 → Q-024 |
| Empty / loader | W16 A2 | PLACED |
| Fresh tab | B04 D-033 | PLACED · Q-021 still open (Home type) |

### 3. Deal detail
| Feature | Source | Status |
|---|---|---|
| Image, zoom, title, posted, price block, shop | W21 A5 | PLACED |
| View counter on detail | W21 A5 | Q-033 (recommend not shown, D-045 logic) |
| "Comments" jump button | W22 | **ADD** · comment count link under price block → section |
| Description, How-to, "Click here", steps | W23 A5 | PLACED · B06 clean links **ADD** |
| Coupon code | B05 | **ADD** · in price block, tap-to-copy, then "Buy at {Store}" |
| Amazon disclosure paragraphs | W24 B28 | PLACED one line · full text → `/disclaimer` **ADD** |
| Short-lived notice + subscribe links | W25 A5 | **CHANGE** · fold into community bar + "Get alerts" row after related deals |
| Quicklinks: more {shop}, similar {cat}, {cat} from {shop} | W26 | PLACED (related by category then store; "See all in {category}"; **ADD** "More from {store}" link) |
| "Search this on Amazon / Flipkart" tagged links | W26 | Q-034 |
| Similar offers rail | W27 A5 | PLACED (6–8, same category then store) |
| Comments: replies, likes, login CTA, admin delete | W28 B07 | **ADD** section (see B07) |
| Share: WhatsApp, Telegram, copy; text template (title, short link, MRP, price, % off) | A5 F9 | PLACED · **ADD** template text to spec |
| SEO title, canonical rule, OG | W29 D-050 | PLACED |
| `?source` / `fbclid` tags | W30 | Dev |
| `/v/`, `/d/`, `/o/t/r/` | W31 | PLACED (unchanged URLs) |
| Category and shop names visible | W32 | PLACED (breadcrumb desktop; meta line phone) |
| Report a problem | D-050 | PLACED · logged as DEV-013 (addition vs BRD) |
| Withdrawn state | D-040 | PLACED |

### 4. Auth
| Feature | Source | Status |
|---|---|---|
| Email + password login | W33 A7 | REMOVED · BRD B18 ("no passwords to remember") → DEV-010 |
| Register form, activation email | W34 A8 | REMOVED · BRD B18 ("no separate sign-up form") |
| Forgot / reset / change password | W35 A9 A10 | REMOVED · follows B18 |
| Facebook, Apple login | W33 A7 A8 | REMOVED · BRD lists Google + OTP only → DEV-010 confirm |
| Google login | W33 | PLACED |
| Email OTP | B18 | PLACED F4 · brief + mockups pending |
| reCAPTCHA → Turnstile | W34 B32 | **ADD** slot |
| Return to the page after login (`?url=`) | W33 | PLACED |
| Admin login; roles 1/3 land in admin | W33 | PLACED (same screen) |
| Forced re-login (web after go-live; app 401 today) | B19 A-C | PLACED F5 |
| "Admin credentials" block on API | W33 | Dev |

### 5. Account / profile / static
| Feature | Source | Status |
|---|---|---|
| Profile: name, username, email (read-only), mobile | W36 A11 | PLACED intent · Q-035 username |
| Total earned points; approved-deal points | W36 W38 A11 | REMOVED · belongs to member posting (BRD) → DEV-014 confirm |
| Remove account (no confirm) | W36 A11 | **ADD** · confirm step, Turnstile not needed when logged in |
| Public `/delete-account` form | W39 B31 | **ADD** |
| My deals, Post a deal | W37 A12 A13 | REMOVED · BRD |
| Notification preference (app toggle) | A-E | PLACED intent (profile shows browser-alert status; dev-dependent) |
| `/privacy`, `/disclaimer`, `/contact` | W40 | PLACED intent · Contact gains feedback form (B30) |
| Feedback form (type radio, email, text) | A16 | **ADD** on `/contact` |
| 403 / 404 / no-longer-available | W40 B20 D-040 | **ADD** error family |
| About / FAQ / Terms text | W11 A17 | PLACED → footer collapsed block; Terms link in footer |
| Forum / discussion | A14 A15 | REMOVED · BRD "forum" (D-008) |
| Instant Alerts inbox, pinned message, clear all | A6 | Q-029 (recommend REMOVED as "login-based notifications inside the app") |
| Share app (Play Store) | A-B | PLACED footer app link |
| Social links (WhatsApp, FB, Instagram, Telegram, LinkedIn) | A-B W07 | PLACED footer + community bar; values from admin settings (B33) |

### 6. Blog
| Feature | Source | Status |
|---|---|---|
| Blog home, article page, deal embeds | B08 F10 | PLACED intent · brief pending (P4 remainder) |
| "New" badge on Blog link | B08 | **ADD** |
| Editor with pasted images, deal picker, schedule | B08 D-053 | PLACED intent |

### 7. Admin shell
| Feature | Source | Status |
|---|---|---|
| Menu: Shop, Category, Deal, Type, Lookup, Users, Feedbacks, Notifications, Profile | W41 | PLACED (regrouped) · **ADD** Incoming deals, Social sharing, Affiliate tags, Site & app settings, Blog |
| User Deals, Slider | W41 W46 W50 | REMOVED · BRD |
| Sub-admin menu: Deals (+ queue?) | W41 D-053 | PLACED Deals · Q-026 |
| Dashboard | — | PLACED (owner overview, brief) |

### 8. Admin deals list
| Feature | Source | Status |
|---|---|---|
| Columns, search, paginate | W42 | PLACED (+ status, pinned, views, filters) |
| Points column | W42 | REMOVED (DEV-014) |
| Copy OfferTag link / Copy buy link per row | W42 | **ADD** row actions (formatted text as today) |
| View, Edit, Clone | W42 | PLACED |
| Delete (with files) | W42 | **ADD** · confirm + undo window |
| Send push per deal (bell) | W42 W57 | **ADD** · row action with confirm ("Send alert to all subscribers?") |
| Per-admin bitly replacement | W42 | REMOVED · feature disabled in code → DEV-015 confirm |
| Bulk edit, bump, copy, share, status | B10 B11 B27 B13 D-053 | **ADD** |
| Pinned board | D-053 | PLACED |
| Import Excel | W45 | Q-036 (recommend REMOVED, DEV-016) |

### 9. Admin post / edit deal
| Feature | Source | Status |
|---|---|---|
| Field set W43 | W43 | PLACED · **ADD** types as multi-select, "clean URL" toggle, caption, `shop_steps` autofill note |
| Coupon | B05 | **ADD** |
| Direct-post prefill, auto types, ≥90 % pre-tick | W44 | PLACED · auto_post → goes to Incoming deals (B17) |
| Live preview | D-053 | PLACED |
| Social share panel + history | B13 B15 | **ADD** |
| Save bumps to top | W45 | **CHANGE** · explicit "Bump" instead of silent bump on edit (B11) |
| Clone | W45 | PLACED |

### 10. Admin Incoming deals (approval queue) — NEW (B17)
Replaces W46 pattern without points. Phone-first. Tabs Pending / Approved / Rejected; row = source (Telegram / quick tool / poster), fetched image, title, prices, store, auto type; actions Edit, Approve (+notify), Reject (reason optional). Bulk approve. Duplicate flag inline.

### 11. Admin alerts (push)
| Feature | Source | Status |
|---|---|---|
| Compose text + URL with preview card, send, history | W55 | PLACED |
| Pin / delete message; per-user inbox fan-out | W55 A6 | Q-029 |
| Prefill from deal link | W55 | PLACED ("Send push" from deal row) |

### 12. Admin reference data, users, feedback, settings
| Feature | Source | Status |
|---|---|---|
| Shops fields incl. `icon_name`, SEO description, `shop_steps`, order | W48 | PLACED generic pattern · **ADD** these fields to spec |
| Categories fields | W49 | PLACED |
| Types / Lookups; `order_no=1` = home tab | W51 | PLACED · Q-021 |
| Roles CRUD | W52 | PLACED read-only list (intent) |
| Users: list, Amazon tag | W53 B16 | PLACED · points report REMOVED · **ADD** search |
| Feedback list | W54 | PLACED inbox · **ADD** date, handled, tabs: Feedback · Reports · Deletion requests |
| Comment moderation | W56 | PLACED inline admin delete on detail (as today); no new screen |
| Affiliate tags per platform | B16 | **ADD** screen |
| Social sharing: connections + formats | B13 B14 | **ADD** screen |
| Site & app settings | B33 | **ADD** screen |

## Decisions needed (recommendation first; Law 13)
Q-024 Carousel · Q-025 Community bar placement · Q-026 Sub-admin sees Incoming deals · Q-027 Web push opt-in · Q-028 Live chat on phone · Q-029 "Login-based notifications" scope · Q-030 OTP email template in scope · Q-031 offertag.net · Q-032 Category on card · Q-033 View counter on detail · Q-034 Amazon/Flipkart search links · Q-035 Username field · Q-036 Excel import. Full text in `docs/OPEN-QUESTIONS.md`; deviations in `docs/BRD-DEVIATIONS.md` DEV-007–016.

## Outcome
D-055 shells · D-056 footer · D-057 admin shell · D-058 card/detail · D-059 admin deals · D-060 admin tools · D-061 auth/account/static/blog. Briefs rewritten; new briefs: shell, auth-account, static-blog; admin brief v2. Screens: `../screens/*.md`.

## (original plan) After decisions
Rewrite `briefs/feed.md`, `briefs/deal-detail.md`, `briefs/admin.md` with the ADD items; write new briefs: shell-and-footer, auth, account-and-static, blog, incoming-deals, social-sharing. Then redraw shell mockups first (user instruction S09), then feed, card, detail, admin.
