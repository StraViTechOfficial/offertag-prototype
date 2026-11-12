# Experience brief — Contact & feedback, legal pages, error pages, Blog
AGREED v1 · 2026-11-09 (D-061) · Law 12. Sources: BRD B08, B20, B28, B30; W40, W11, W24; A16, A17; D-040, D-056.

## Contact & feedback (`/contact`, B30)
Who: a shopper reporting a broken link, suggesting something, or saying thanks (today's three types, A16); a store or partner wanting an email address.
Behaviours: top block — support email, "Chat with us" (D-055), WhatsApp/Telegram community links. Form: type (Issue · Suggestion · Appreciation, segmented), email (prefilled when signed in), message, Turnstile, [Send]. Success inline "Thanks, we read every message." No login needed. Goes to Inbox → Feedback.
Never: no phone number field, no captcha puzzle, no marketing opt-in.

## Legal pages (`/privacy`, `/disclaimer`, Terms)
Restyle only: title, updated date, body at reading width (65ch), sticky in-page contents on desktop. `/disclaimer` carries the full Amazon Associates text that today is appended to Amazon deal pages (W24) and is the target of "How we earn" (D-056). Terms: today it is a panel in the app's About (A17); it becomes a page linked from the footer (URL to be set in dev; new, flagged in sitemap).

## Error pages (B20, D-040)
One family, one layout: logo, one sentence, one primary action, a Fresh-deals feed below so no dead end.
- 404 "We couldn't find that page." → [Go to Fresh deals] + search field. HTTP 404.
- Deal no longer available (D-040): header banner on the detail layout, price greyed, "See similar deals". Separate from 404 on purpose (SEO, chat links).
- 403 "You don't have access to this." → [Back to deals].
- Offline / failed load: inline retry in place (feed brief); full-page only when nothing rendered: "You're offline" + [Retry].
- 500 "Something broke on our side." + [Try again]; no stack traces.

## Blog (`/blog`, `/blog/{post-name}`; D-093, B08)
Who: a reader from Google ("best earbuds under 1500") or from the "New" badge; wants a readable article with live prices and a path to the deals.
Index: title "Blog", list of posts (cover image optional, title, one-line summary, date, reading time), newest first, classic pagination (not infinite; content, not feed). No categories/tags in v1 (none exist).
Post: title, date, author "OfferTag", cover (optional), body at 65ch with headings, images, and embedded deal cards (the Compact card, live data, "Buy at {Store}" same three hit areas), "Deals mentioned" list at the end, then "More in {category}" feed strip, then related posts (3). Share row (WhatsApp, Telegram, copy). Phone: stacked; desktop: body + right rail of mentioned deals (sticky).
States: no posts yet → index shows "First posts coming soon" + Fresh feed; the Blog "New" badge is admin-controlled (D-057).
SEO: Article structured data, OG from cover or first deal image.
Never: no comments on posts (not in BRD), no newsletter box, no pop-ups.

## Mockups
`../../screens/static-blog.md`.
