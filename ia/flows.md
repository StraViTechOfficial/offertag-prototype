# Key flows
AGREED · 2026-11-09 · Rewritten from D-032, D-040, D-050, D-055–D-061. Trigger → steps → end states.

F1 Browse → deal → store. Open `/` (Fresh) or a tab → page 1 server-rendered, pinned slots kept → scroll auto-loads 2–3, "Show more", repeat (D-032) → card body → `/deal/{slug}` (desktop: slide-over) · card Buy → `/d/{id}` directly → detail Buy → store in new tab (phone: same tab). Coupon chip copies first. Back restores position. End: list end → "See Top deals"; withdrawn → banner + similar.
F2 Daily return. `/` shows today's posts newest first, "updated X min ago"; empty before first post → "No deals yet today" + Top; hottest strip only if admin turned it on.
F3 Search, category, store. Search sheet/field → `/deals/search?q=` with facets; category/shop pages same component with one-line header; empty → chips + Clear all + nearby categories.
F4 Sign in. "Sign in" (menu/header) or "Sign in to comment" → sheet: Google, or email → code (6 digits, resend 30 s, Turnstile inline) → back to origin, composer focused. Roles 1/3 → admin.
F5 Forced re-login. First visit after go-live with an old session → one card → Sign in or continue browsing → return to page.
F6 Comment. Detail → composer (signed in) → Post → appears on top; Reply nests one level; Like toggles; role 1 Delete inline. Error → inline, text kept.
F7 Alerts opt-in. Menu "Get deal alerts" / header bell / inline card (2nd visit, once) → browser prompt → state On shown in menu and account.
F8 Share. Card ⤴ or detail row → WhatsApp / Telegram / Copy with the fixed text template and short link carrying the source tag.
F9 Report a problem. Detail link → sheet: Link dead / Price changed / Other + note → Inbox → Reports.
F10 Feedback & delete. `/contact` form (Turnstile) → Inbox → Feedback. `/delete-account` form (Turnstile) → Inbox → Deletion requests; signed-in delete → inline confirm → signed out.
F11 Blog. Blog (New) → index → post with live cards → Buy / Deals mentioned / More in category.
F12 Admin: incoming deal. Telegram or quick tool → Incoming → Approve (one tap, auto types, push at ≥90 %) / Edit → Approve / Reject (reason) → live; duplicate flagged inline.
F13 Admin: post a deal. Post → link (clean toggle) → image → title, store (steps autofill), category, prices, types, coupon, caption, steps, description, display, pin/slot, now/schedule, notify → Publish → success panel (public link, short link, Copy for WhatsApp, Share to…, Post another).
F14 Admin: manage deals. Filters + search → row menu (Edit, Clone, Copy for WhatsApp, Copy buy link, Share…, Bump to top, Pin, Send push, Change status, Delete) → bulk bar (Edit drawer, Bump, Copy, Share, Status, Delete) → 10 s undo.
F15 Admin: share to social. Edit → Share panel: channels, per-platform preview from saved format → Share now → Share history (retry). Formats and channels in Social sharing.
F16 Admin: alert. Alerts → attach deal/link → message → Send (confirm) → history with web/app result, resend/retry. From a deal row "Send push" prefills.
F17 Theme. Light / Dark / System in menu (phone), header (desktop), account menu (admin); stored per device; no flash.
