# Navigation models
AGREED · 2026-11-09 · Rewritten from D-043–D-061. Mockups in `../screens/shells.md`.

## Phone (< 600 px) — D-043/046/048/055
Top bar 56 (≡ · logo · search), not sticky on scroll-down; compact bar (search · Filter badge · Sort) returns on scroll-up. Type chips (Fresh first) + rule line. Quick-filter row. Home only: hottest strip (admin toggle, default off). Community bar, one line, dismiss till midnight. Count line, Comfortable 1-column cards, hybrid loading, footer at every "Show more" stop.
Menu sheet: account row · Blog (New badge) · Categories · Stores · Get deal alerts (On/Off) · Chat with us · Feedback · Theme · Admin panel (roles 1/3) · Sign out · app + social links.
Search: full-screen sheet. Detail: full page with sticky buy bar (coupon chip when present). Sign in: bottom sheet or `/login`. No bottom tab bar. Nothing floats over content.

## Desktop (≥ 900 px) — D-047/055
Header 64: logo · inline search · Blog (New) · alerts bell · theme · account menu (Sign in / Profile · Admin panel · Sign out). Underlined type tab bar with rule line. Home only: hottest strip. Left facet panel 260 (community line on top; Category with search, Store with search, Discount, Price, Type, Posted; counts). Main: chips · count · sort · density · compact grid 5/4. Chat launcher bottom-right. Detail: slide-over beside the grid or full page two-column. Footer four columns + collapsed SEO block.

## Admin — D-160 (replaces D-057's tree)
Sidebar 240 collapsible, nine flat links, no sub-items: Overview · Incoming n · Deals · Promote · Alerts · Blog · Inbox n · Members (D-161) · Catalogue · Settings; foot: View site · Collapse. Grouped pages share underlined section tabs above the page: Deals (All deals · Pinned board), Promote (Sale posters · Sponsored), Settings (Site & app · Affiliate tags · Social sharing · Users (admins and sub-admins only) · Roles · Security). Members = everyone who signed up, at `/admin/members`. Inbox and Catalogue keep their in-page tabs; Catalogue no longer shows Types. Top bar: global search (`/`), Post a deal, account menu (View site, theme Light · Dark · Auto, Sign out). Sub-admin: Incoming · Deals (All deals) + View site. Phone: drawer, "+ Post" in top bar. Every address is unchanged.

## Rules
One CTA label "Buy at {Store}". Every number labelled. Gold only in badge, savings, type label, active-tab rule. Red only for errors. Focus and pressed states everywhere; nothing depends on hover. Hide, never disable, menu items a role lacks.
