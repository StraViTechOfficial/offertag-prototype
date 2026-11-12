# Experience brief — shells and footer (public phone, public desktop, admin)
AGREED v1 · 2026-11-09 (D-055, D-056, D-057) · Law 12. Builds on D-043/046/047/048 and adds every shell-level feature found in `../feature-parity.md` (B02, B08, B09, B23, B28, B29, B33, W02, W07, W11). Q-024–028 closed by D-055/D-057; markers kept for traceability.

## Who uses the shell
Everyone on every page. Two arrivals matter most: cold arrival from a chat link into a deal page (needs a visible way to the feed, no interruptions), and the daily returner opening Fresh (needs the feed in the first screen).

## Jobs of the shell
- Get to any list in one tap: type tabs, search, categories, stores, Blog.
- Hold the cross-cutting entries without stealing feed space: account, theme, alerts, chat, community links, admin link.
- Carry the legal and trust layer once, in the footer: Amazon disclosure, privacy, disclaimer, terms, contact, delete account.
- Give the admin one place to turn optional strips on and off (carousel, community bar, Blog "New" badge).

## Behaviours — public phone (< 600 px)
Top bar 56 px: menu (≡) · logo (24 px high; white plate in dark mode, D-039) · search icon. Not sticky on scroll-down; compact bar (search · Filter with badge · Sort) returns on scroll-up (D-046).
Type chips row: Fresh first, active filled; one rule line under it ("Posted today") (D-048).
Quick-filter row: Filter · Sort · Store · Category · Discount · Price · Type (D-048).
Hottest strip (Q-024): "Hottest right now →" + 6–8 compact cards, horizontal swipe, no autoplay, no dots; admin on/off, default off; lives in the Home strip slot of D-031, Home only.
Community bar (Q-025): one line "Join OfferTag on WhatsApp · Telegram" with ×; between the count line and the first card; dismissal remembered per device until midnight; never sticky; admin on/off, links from Site settings.
Count line: "312 deals · updated 3 min ago" (feed brief).
Alerts opt-in (Q-027): no browser prompt on arrival. Entry points: "Get deal alerts" in the menu sheet, and one inline card after the first feed batch on the second visit ("Get loot alerts in your browser" · Turn on · ✕, dismissed for 30 days). Tapping "Turn on" triggers the browser prompt. State shown in the menu as On/Off.
Live chat (Q-028): "Chat with us" in the menu sheet and on Contact; no floating bubble on phone (it would cover cards and the sticky buy bar).
Menu sheet (≡), bottom sheet ~85 %: account row (Sign in · or name → Profile) · Blog with "New" badge (B08; badge admin on/off, auto-hides 30 days after first blog post is a dev detail) · Categories · Stores · Get deal alerts (On/Off) · Chat with us · Feedback · Theme (Light / Dark / System) · Admin panel (roles 1/3 only, W02) · Sign out. Sheet footer: Android app · WhatsApp · Telegram · Facebook · Instagram.
Search: full-screen sheet (D-043).
Footer: stacked, reached at every "Show more" stop (D-032). See Footer.

## Behaviours — public desktop (≥ 900 px)
Header 64 px: logo (32 px) · inline search (~480 px) · Blog with "New" badge · Alerts bell (opt-in trigger; filled when on) · theme toggle · account menu (Sign in · or name → Profile · Admin panel for roles 1/3 · Sign out) (D-047 + B08, B23, W02).
Type tab bar: underlined, Fresh first, gold rule under active; the tab's rule line at the right end.
Hottest strip (Q-024): full-width row of 6 compact cards under the tab bar, Home only, admin on/off, default off.
Left facet panel 260 px (D-047): community line at the top (Q-025, same dismissal rule), then Category · Store (search) · Discount · Price · Type · Posted with counts.
Main: chips row + count + sort + density; compact grid 5/4 per row.
Live chat (Q-028): launcher bottom-right, 48 px, calm navy, label "Chat"; hidden while a slide-over detail is open.
Footer: four columns + SEO block.

## Footer (both)
1. Brand: logo, tagline, one-line disclosure "OfferTag earns a commission from Amazon and other stores when you buy through our links." → "How we earn" (`/disclaimer`, which carries the full Amazon Associates text, W24).
2. Deals: Fresh · Top · Loot · New · Pantry · Blog.
3. Help: Contact & feedback · Chat with us · Delete account · Privacy · Disclaimer · Terms.
4. Join us: WhatsApp · Telegram · Facebook · Instagram · LinkedIn · Get the Android app (badge).
Below: collapsed "About {page}" block (the W11/W19 SEO text; collapsed by default, expands on tap) · copyright · "Prices change fast; check the store before you buy."
Never: no newsletter box (no email list exists), no sitemap dump, no decorative imagery.

## Behaviours — admin shell (desktop-first, phone-capable)
Sidebar 240 px, collapsible to icons; groups in the order of daily work:
Overview · Deals (All deals · Incoming with pending count · Post a deal · Pinned board) · Alerts · Social sharing · Blog · Inbox (Feedback · Reports · Deletion requests, unread count) · Catalogue (Shops · Categories · Deal types · Types) · Users · Settings (Affiliate tags · Site & app · Roles) · View site ↗.
Top bar: global search ("/", deals, links, users) · theme · account (profile, sign out).
Sub-admin (role 3): Deals (All · Incoming · Post) and View site only; nothing else rendered (Q-026, D-053). Pinned board, Alerts and everything below stay admin-only.
Phone: top bar (≡ · Admin · search · "+ Post"); sidebar becomes a drawer; Incoming and Post a deal are tuned for one hand (B34).
Site & app settings (B33) holds every shell toggle: hottest strip on/off, community bar on/off + links, Blog "New" badge on/off, social links, support email, live-chat on/off.

## Feel
The shell is quiet chrome. Deals start within the first screen on every page. Nothing floats over content on phone.

## Never
No bottom tab bar (D-043). No app-install banner. No browser-permission prompt on arrival. No autoplay. No floating bubbles on phone. No hidden-but-disabled menu items for roles without access.

## Mockups
See `../../screens/shells.md` (ASCII, Law 11): phone shell + menu sheet, desktop shell, footer, admin shell (desktop and phone), sub-admin variant.
