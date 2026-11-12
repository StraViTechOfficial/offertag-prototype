# Data sheet — contact, error family, legal, blog, OTP email, share card (S15)
Law 15. Old code: `offer-tag/` (read-only). Brief and ASCII: `briefs/static-blog.md`, `screens/static-blog.md`, `screens/auth-account.md` § OTP (D-061). Blog URLs: D-093.

## Routes
| Screen | Live route | Prototype file | Source |
|---|---|---|---|
| Contact & feedback | `/contact` | `contact.html` | `routes/web.php:100`, W40 |
| Privacy | `/privacy` | `privacy.html` | `routes/web.php:98`, W40 |
| Disclaimer | `/disclaimer` | `disclaimer.html` | `routes/web.php:99`, W40 |
| Terms | none today; address set in dev | `terms.html` | brief, sitemap |
| 403 | `/forbidden` | `403.html` | W40 |
| 404 · 500 · offline | none today | `404.html` · `500.html` · `offline.html` | BRD B20, brief |
| Blog index | `/blog` (new) | `blog.html` | BRD B08, D-093 |
| Blog post | `/blog/{post-name}` (new) | `blog-{post-name}.html` | BRD B08, D-093 |
| OTP email | email, no route | `email-otp.html` | BRD B37, D-061 |
| Share card | image, no route | `share-card.html` | D-050, `briefs/deal-detail.md` |

## Contact & feedback
| Element | Source | Note |
|---|---|---|
| support@offertag.in | `contact.blade.php:19`, W40 | Admin-editable later (D-057) |
| Chat with us | D-055 | Placeholder link until chat is wired |
| WhatsApp, Telegram | BRD B09, D-055, same placeholders as the community bar | Links come from Site & app settings (B33) |
| Type: Issue · Suggestion · Appreciation | `feedback.feedback` (1 Suggestion, 2 Issue, 3 Appreciation), A16 | Order and default from the agreed ASCII |
| Email, required, prefilled when signed in | `feedback.email`, `StoreFeedbackRequest`, A16 | Old rule: required only; format check added as on the other forms |
| Message, required | `feedback.description` (longText), `StoreFeedbackRequest` | |
| Turnstile | BRD B32 | Same inline rule as the S14 forms |
| "Thanks, we read every message." | brief D-061 | Goes to Inbox → Feedback |

## Error family
| Element | Source |
|---|---|
| Four sentences and actions | brief D-061 |
| Search field on 404 | brief D-061 |
| Fresh deals below | brief D-061; the same 12 cards as Home (snapshot) |
| Old 403 message | Replaced by the brief |
"Deal no longer available" is the detail-page state built in S12 (D-040), not part of this family.

## Legal pages (`build/legal.json`)
| Element | Source | Note |
|---|---|---|
| Privacy text, word for word | `privacy.blade.php` | Layout only (D-034); see flags below |
| "Effective from April 12th, 2020" | `privacy.blade.php`, closing section | Only legal page with a date in the source; the other two show none |
| Disclaimer text, word for word | `disclaimer.blade.php` | |
| "How we earn": two Amazon paragraphs | `DealsController.php:486`, W24, D-056 | Moved from the Amazon deal pages |
| Terms text | Footer block "Diclaimer & Terms Of Usage" in `layouts/footer.blade.php:67`, same text in app About (A17) | The only Terms text that exists today, one paragraph |

Flags for the client checkpoint: the privacy text still names Facebook login and passwords (retired, DEV-010), and promises deletion "within 14 working days" where the new forms promise 7 days (D-061). The text stays as stored until the owner rewrites it.

## Blog (SAMPLE, declared)
The blog is new (BRD B08), so no post exists in any store. Post titles, summaries, body copy, dates and post names in `build/blog.json` are SAMPLE. Each post contains no prices or discount figures in its copy.
| Element | Source |
|---|---|
| Embedded deals, deals rail, Deals mentioned | Snapshot deals, same fields as the cards; title, store, price, MRP, % and tagged link are live data |
| Reading time | Derived: words ÷ 200, minimum 1 |
| Author "OfferTag" | brief D-061 |
| Cover optional; cover image | brief; a snapshot deal photo stands in |
| "More in {category}" | Category most used by the post's deals; other snapshot deals; hidden when none remain |
| Related posts (3) | brief; other posts, newest first |
| Share text | Post title and `/blog/{post-name}`, as the deal share (D-058) |
| Article data, link preview from cover or first deal image | BRD B20, brief |
| 10 posts per page | Dev value; the pager appears only past one page |

## OTP email
All copy and layout from `briefs/auth-account.md` and the agreed ASCII. Code `482917` is the ASCII's SAMPLE. Jost with an Arial fallback, because most mail apps block web fonts.

## Share card
| Element | Source |
|---|---|
| Deal photo, title, store, price, MRP, % off | Snapshot deal, same fields as the cards |
| "Up to x% off" on sale posts | Same rule as the deal page |
| Logo on white | Law 6, D-050 |
| 1200 × 630 | Standard link-preview size |
Largest deal photo stored is 300 px (Q-020), so the photo is soft at full size until larger originals are kept.
