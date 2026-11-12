# Inventory — existing website, admin and API (reference, read-only)
Source: `/mnt/d/PC-Downloads/old-code/offer-tag/` (Laravel 5.5), `schema.sql`, `server-audit.txt` · read 2026-11-09 for the parity pass (D-054, Law 14).
Purpose: every feature that exists today, so each is PLACED, REMOVED or QUESTIONED in `../feature-parity.md`. IDs W-xx are referenced there.

## Public shell (every page)
| ID | Feature today |
|---|---|
| W01 | Top bar guest: "Sign in with Google" only (Register link commented out; `/register` is unreachable, shadowed by `/{dealType}`). |
| W02 | Top bar logged in: "Hello {name}" → profile · "Go To Admin Panel" (roles 1/3) · "Post a deal" · Logout. |
| W03 | Logo + search box (`/deals/search?q=`), placeholder "Search Offers, Deals, Coupons, Recharge". |
| W04 | H1 per page (home / category / shop / type). |
| W05 | Deal-type tab bar from lookups type 1, ordered by `order_no`; `/top-deals`, `/loot-deals`, `/pantry-deals`, `/new-deals` (+1). |
| W06 | Role 1 only: checkbox on each card + "Copy Selected Buy Link" / "Copy Selected OfferTag Link" → WhatsApp/Telegram-formatted list (`*_X% Off_* - title @ _price_` + short URL). |
| W07 | Sticky side bar: Android app (Play Store), Facebook page, WhatsApp group, Telegram channel. |
| W08 | OneSignal web push (bell button, prompt, welcome notification). |
| W09 | Tawk.to live chat widget. |
| W10 | GA4, meta keywords, `fb:app_id`, twitter meta, canonical. |
| W11 | Footer: long SEO "About / Why us / FAQ" text; `footer-us` variant when APP_URL is offertag.net; `additional-footer` slot = category/shop SEO description. |

## Listing pages (home, type, search, category, shop)
| ID | Feature today |
|---|---|
| W12 | Home shows only the deal type with `order_no=1`; AMP slider carousel on top (autoplay 2 s; `image_sliders`, 0 rows live). |
| W13 | Left sidebar: category checkbox list with inline text filter + link per category; shop checkbox list with text filter + link to `/shops/{slug}`. Desktop auto-applies; mobile filter icon with Apply/Reset. |
| W14 | 16 per page minus pinned; pinned deals merged into slots 3/6/9/13 (`PINNED_DEALS_ORDER`); pinned excluded when a search term is present. |
| W15 | Sorted by `updated_at` desc (editing a deal bumps it). No sort control. |
| W16 | "Load More" button (AJAX); "No deals to show"; loader. |
| W17 | Filters: `deal_display_type` in (1,2) on web, (1,3) on API; `publish_at <= now`; active shop and category; status approved. |
| W18 | Search: SQL LIKE on title, category name, shop name. |
| W19 | Category / shop / shop+category pages: generated SEO title, description, H1; footer SEO text for a whitelist of slugs. |
| W20 | Deal card: pin icon · shop `icon_name` badge (13 chars) · `deal_caption` badge · lazy thumbnail (click → store link) · title (55 chars → detail) · relative posted time (hidden when pinned) · category badge · MRP struck · price · % off · small shop logo · "Shop Now" (new tab, counts a view). |

## Deal detail `/deal/{slug}`
| ID | Feature today |
|---|---|
| W21 | Original image 300 px · H1 title · "Posted on {full date time}" · eye icon + `view_counter` · price · MRP struck · % off · shop logo. |
| W22 | "Shop Now" (store, new tab) · "Comments" button (scrolls to comments). |
| W23 | "Product Description" (raw HTML) · "How to get {title}?" with "Click here to visit the deal page" + `deal_step` HTML. |
| W24 | Amazon deals: two Amazon Associates disclosure paragraphs auto-appended. |
| W25 | Fixed notice: deals are short-lived, price may change; subscribe via browser push / WhatsApp / Telegram / Facebook. |
| W26 | Right column "Other Quicklinks": More {shop} deals · Similar {category} deals · Similar {category} from {shop} · "Similar Products On Amazon" (search URL, `tag=offertag-21`) · "Similar Products On Flipkart" (`affid=offertag`). |
| W27 | "Similar Loot Offers": 5 latest deals in the same category (not filtered by status/display/publish). |
| W28 | Comments: logged-in only ("Please Login to post a comment" → Google); TinyMCE; newest first; username + date; no replies, likes, edit, pagination, moderation queue; role 1 trash per comment. Comment HTML unescaped (XSS). |
| W29 | SEO: title "OfferTag: {title} | {pct}% Off | {category} Loot Deal"; canonical `/deal/{slug minus -id}`; og:image = thumbnail. |
| W30 | Store link = `deal_link` + `shops.affiliate_value` (Amazon/Flipkart only). Overrides: `?source=` → `offertag2-21`, `?fbclid` → `offertagfb-21`; `/d/` default `offertag1-21`. View counted on every detail load and on card "Shop Now". |
| W31 | Short links: `/v/{alpha}` → 302 to detail; `/d/{alpha|id}` → OG tags + JS redirect to store; `/o/t/r/{slug}` legacy. Digits mapped A–J. |
| W32 | Not shown on detail: category name text, shop name text, `deal_caption`. No copy-link, no report, no share buttons (app has share). |

## Auth and account
| ID | Feature today |
|---|---|
| W33 | Web login: email + password (`is_active` only); role 1 → `admin/shop`, role 3 → `admin/deal`, others → `/home`; `?url=` returns to a deal. Google OAuth (new users get a shared hard-coded password). API: JWT 7 days; refuses roles 1/3; `social-login/{google|facebook}`; `apple-login` (no token verification). No OTP. |
| W34 | Web register (unreachable): name, email, username, mobile, password ×2, reCAPTCHA; activation email (resend after 24 h). API register works. |
| W35 | Forgot / reset password (Laravel + custom mail). Change password: old + new. |
| W36 | Profile: name, username (unique), email read-only, mobile; "Total Earned Points" = SUM(`deal_points`); "Remove Account" = AJAX hard delete, no confirm. Sidebar: Profile, Change Password, Post a deal, Pending / Rejected / Approved deals. |
| W37 | My deals `/user/deals?status=`: table incl. Points on Approved. Post a deal `/deal/post-deal` (member → pending). Duplicate check: same link (no query) or title LIKE, same day. |
| W38 | Points: set by admin on approval; shown on profile, approved list, admin report. No redemption. |
| W39 | `/delete-account` public form: name, email (must exist), mobile, reason → `account_deletions` (no admin screen; 0 rows). |
| W40 | Static: `/privacy`, `/disclaimer`, `/contact` (support@offertag.in + app link, no form), `/forbidden` 403. No custom 404. |

## Admin (`/admin`, roles 1 and 3; role 3 limited by menu only)
| ID | Screen / feature today |
|---|---|
| W41 | Menu role 1: Shop · Category · Deal · User Deals · Slider · Type · Lookup · Users · Feedbacks · Notifications · My Profile · Logout. Role 3: Deal · User Deals · My Profile · Logout. `/admin` is empty (no dashboard). |
| W42 | Deals list: sorted `updated_at` desc; columns Sr, Category, Shop, Title, MRP, %, Price, Image, Points, Actions. Actions: Copy OfferTag Link (Title / Buy Link = short_url / Deal Details = `/v/` link / MRP / Price (pct OFF)) · Copy Buy Link · View · Edit · Copy Deal (clone) · Delete (confirm; deletes image files) · Send Notification bell (manual push, route unauthenticated). Search box → `admin/search`. No filters, no bulk, no status column. Per-admin bitly link replaces short_url if present (feature disabled). |
| W43 | Add deal: deal types multi-select · category · shop (loads `shop_steps` into steps) · title · description (TinyMCE) · steps (TinyMCE) · deal URL · "clean actual deal URL?" checkbox (strip query) · MRP · discount % (auto) · price · image upload · Deal Caption · Send Notification yes/no · Display Deal In (1 Web+App / 2 Web / 3 App) · Is Pinned · Pinned Order · Publish At (schedule). Saved tags `tag/ascsubtag/affid/affExtParam*` stripped. |
| W44 | Direct post `deal/direct-post?title&actual_amount&discount_amount&description&category_id&shop_id&deal_link&external_img&auto_post`: prefills; auto types: <25 % New, ≥25 % Top, ≥75 % +Loot, category 33 +Pantry; ≥90 % pre-ticks notification; `auto_post=1` submits automatically; external image downloaded and resized. |
| W45 | Edit (save bumps `updated_at` → top of listings) · Clone (copies image) · Import Excel (`admin/deal/import`, no menu link, probably broken). |
| W46 | User Deals approval queue `admin/user-deals?status=`: tabs pending/rejected/approved; Change Status modal (Approve/Reject, Points, send notification?), Edit, view link. Live: 0 pending. |
| W47 | Deal points report per user · per-user Excel export (link commented out). |
| W48 | Shops CRUD: name, `icon_name` (card label), logo (200/70), description (SEO footer), `affiliate_value`, `shop_steps` (default how-to), `order_no`, `is_active`; delete blocked if deals exist. |
| W49 | Categories CRUD: name, description (SEO), icon (200×200), `order_no`, `is_active`; delete blocked if deals exist. |
| W50 | Sliders CRUD: category, caption, image, url_1, url_2 (0 rows). |
| W51 | Types CRUD (lookup groups) · Lookups CRUD (name, type, `order_no`, active; type 1 = deal-type tabs; `order_no=1` = home tab). |
| W52 | Roles CRUD (name only; 3 rows; broken redirects). |
| W53 | Users: list Name / Email / Phone, 15 per page; "View Report" (points); "Add Amazon Tag" modal (`users.amazon_tag`). No search, edit, role change, block, delete. |
| W54 | Feedbacks: read-only list Type (1 Suggestion / 2 Issues / 3 Appreciation), Email, Description. No date, status, reply. |
| W55 | Notifications (Instant Alerts): chat-style history; compose text + optional URL (OG meta fetched and stored); Pin (one at a time, shown at top in app) · Delete; send = `user_notifications` row per opted-in user + FCM topic push; prefill `?deal_link=&auto_post=1` rewrites tags to `offertag-21` / `affid=offertag`. |
| W56 | My Profile (same profile form) · Comment delete (on public page only) · No forum moderation · No account-deletion screen. |

## API (`/api`) — app contract
Auth: `user/profile` GET/PUT · `user/change-password` · `DELETE user` · `check-token` · `POST deal` (member) · `user/deals` · `POST comment` · `GET notifications` (current month + pinned) · `notifications/{id}` POST/DELETE (any user can broadcast) · `subscribe-notification` · `clear-notifications` · `forums` · `forum-comments` · `get-comments/{id}`.
Public: `POST feedback` (also emails admin) · `search`, `deals/search` (+ `arrow_flag` extras: categories, sliders, shops, SEO text) · `deal-type/{slug}` · `products/{cat}-deals` · `shops/{shop}` · `deal/{slug}` · `login` · `register` · `forgot-password` · `social-login/{provider}` · `apple-login`.

## Cross-cutting
| ID | Feature today |
|---|---|
| W57 | Push: OneSignal web (segment All; title, "Price : ₹x", big picture, url) + FCM v1 topic `deal_notification`; triggered by deal save with "send notification", approve-with-push, manual bell, admin notifications. |
| W58 | Email (Gmail SMTP): activation, password reset, feedback-to-admin, exception notifier. |
| W59 | Scheduler empty; scheduled publishing via `publish_at <= now` in queries (12-hour format bug on search pages). |
| W60 | `robots.txt` blocks all bots except Googlebot (Bing limited); `sitemap.xml` static (~500 URLs, generated externally, stale). |
| W61 | Images (Intervention): deal original 300×300 white canvas, thumbnail 200×200; shop logo 200/70; category icon 200; editor uploads via unauthenticated route. 13 GB, ~934k files. |
| W62 | No expiry anywhere (seeder has unused "Expired" lookup). |
| W63 | Cuelinks affiliate script built but not included. Bitly removed. `offertag.net` US variant footer exists. |

## Dev-phase notes (out of design scope, hand to development)
Security: unauthenticated manual push route (`/send-notification/manual/{id}`); any app user can broadcast via `POST api/notifications`; Apple login trusts an unverified email; social sign-ups share one hard-coded password; unauthenticated editor image upload; `GET /deal` renders the admin list for any logged-in user; stored XSS in comments; sub-admin not restricted per route. Bugs: `/register` and `/403` shadowed by the `/{dealType}` catch-all; Excel import on wrong library version; pinned deals likely repeat on every page; 12-hour time bug in scheduled publishing on filtered pages; notification inbox limited to current month; web "Remove Account" deletes without confirmation.
