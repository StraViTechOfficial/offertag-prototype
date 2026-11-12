# Inventory — existing Flutter app (reference, read-only)
Source: `/mnt/d/PC-Downloads/offertag-master/offertag-master/lib/` · v1.0.24+30 · read 2026-11-09 for the parity pass (D-054, Law 14).
Purpose: list every screen and feature so each is PLACED, REMOVED or QUESTIONED in `../feature-parity.md`. Mobile app itself is parked (D-005); this file feeds the website design.

## Screens
| # | Screen | Shows / does |
|---|---|---|
| A1 | Splash | 3 s logo. |
| A2 | Home feed | App bar title per tab; search field (submits `/deals/search`, clear X); **banner carousel** from `sliders` (autoplay 5 s, tap opens URL); **deal-type tabs** Top/Loot/Pantry/New from `lookups`; grid 2-col or list (drawer "Switch View", not saved); shimmer skeleton; empty "No deal found"; pull-to-refresh + infinite scroll; scroll-to-top on tab/filter change; exit confirm on back. Sort sheet exists in code but is commented out. |
| A3 | Deal card | Thumbnail, optional `deal_caption` ribbon, title 2 lines, posted date, category, MRP struck, price, "% Off", shop logo, "Shop Now" (external browser via `clean_url`), tap → detail. No share, no vote, no view count on card. |
| A4 | Filters | Two checkbox lists, Categories and Online Shops (A–Z), Reset / Apply, count badge on FILTER. No search inside lists, no price/discount filter. |
| A5 | Deal detail | Hero image (tap → pinch-zoom), title, "Posted {date}", **view counter (eye icon)**, price/MRP/% off, shop logo, "Product Description" (HTML, links external), "How to get {title}?" with "Click here" + `deal_step` HTML, static disclaimer paragraph (deals short-lived, join WhatsApp/Telegram/FB), **comments** (avatar, name, time, HTML; logged-out prompt to Login/Sign Up; logged-in Quill editor → plain text; flat, no reply/like/edit/delete), **Similar Offers** horizontal rail from `relatedDeals`, floating **share** (system sheet, text template: title, short_url, MRP, price, % off), bottom bar **SHOP NOW**. No copy link, no report. |
| A6 | Instant Alerts | Login required. Chat-style read-only broadcast feed over wallpaper; each bubble: optional link-preview card (image+title), HTML message or bare URL, timestamp; **pinned message** card at top (dismiss locally); Clear all (`DELETE /clear-notifications`); refresh. |
| A7 | Login | Email + password, Forgot password, Sign Up link, Facebook, Google (Apple logic present, button hidden). Error toasts incl. "admin credentials" block. |
| A8 | Register | Name, Email, Password, Confirm, Mobile; email-verification required; Facebook, Google, **Apple** buttons. |
| A9 | Forgot password | Email → reset link mail. |
| A10 | Change password | Old + new. |
| A11 | Profile | Name, Username, Email (read-only), Mobile; Update; Change password link; **Delete profile** (confirm → `DELETE /user`). No avatar upload; `points` returned by API but never shown. |
| A12 | Post deal (member) | Type multi-select, Category, Shop, Title, Description (Quill), Steps (Quill), Image (gallery/camera), Deal URL, Actual amount, Discount %, Discount amount; all required; duplicate error. |
| A13 | My deals | Pending / Rejected / Approved lists, read-only cards. |
| A14 | Discussion (forum) | Topics list, add topic (title + description), paginate. |
| A15 | Topic comments | Flat comments on a topic. |
| A16 | Feedback form | Radio Suggestions / Issues / Appreciation, email (prefilled if logged in), text; no login needed. |
| A17 | About | Static expandable panels: app info, about us, SEO-ish copy blocks, **Terms of Usage**, **Contact Us**, FAQ-style questions. |
| A18 | No internet | Retry returns to the triggering screen. |
| — | Dead code | Notifications page, Search page, Settings (currency), wishlist/orders/rate-us drawer items commented out. |

## Navigation
- Drawer: Home · My Profile · My Deals (Post / Pending / Rejected / Approved) · Login/Register · Switch View · Notifications toggle · Discussion · Share app (Play Store link) · Feedback · About · Log out · Dark Theme switch. Footer "JOIN US ON": WhatsApp, Facebook, Instagram, Telegram, LinkedIn.
- Bottom bar (Home only): INSTANT ALERTS (bell, "New" badge; login prompt if logged out) · FILTER (count badge).
- Deep links: none (`/d/`, `/v/` not handled). Notification tap: `screen=notification_module` → Instant Alerts, else deal by slug.

## Auth and session
- Methods: email+password, Google, Facebook, Apple (register only). No OTP.
- 401 → clear login → Login screen "Token expired, please login again" (this is the app's forced re-login today). `check-token` before Post deal / My deals.
- Logout local only; also turns notifications off and deletes FCM token.

## Notifications
- FCM topic `deal_notification`, device token registered via `POST /subscribe-notification`. Toggle in drawer (login required, OS permission, settings deep-link if denied). No OneSignal in app.

## API used (all `$BASE_URL/…`)
`GET /deals/search` (shops[], categories[], deals=typeId, q, page) · `GET /deal-type/{slug}` · `GET /deal/{slug}` (deal, comments, relatedDeals) · `GET /deal/post-deal` (categories, shops, lookups) · `POST /deal` · `GET /user/deals?status=` · `POST /comment` · `POST /register` · `POST /login` · `GET /social-login/{google|facebook}` · `POST /apple-login` · `POST /forgot-password` · `GET|PUT /user/profile` · `PUT /user/change-password` · `DELETE /user` · `GET /check-token` · `GET|POST /forums` · `GET /get-comments/{id}` · `POST /forum-comments` · `POST /feedback` · `POST /subscribe-notification` · `GET /notifications` · `DELETE /clear-notifications`.
- Deal model carries unused: `deal_link`, `affiliate_value`, `view_counter`, `is_pinned`, `shop_steps`, `amazon_tag`.

## Other
No onboarding, no update prompt, no ads, no in-app web view (buy opens external browser), no client-side affiliate tagging (server `clean_url`).
