# Route map (D-105)
Every prototype page lives in the folder of its real address: `/fresh-deals` is `design-system/prototype/fresh-deals/index.html`. Built by `build/routes.py` (last step of `build.py`); the list of addresses written is `build/routes.json`. Live addresses come from `offer-tag/routes/web.php` and are unchanged (Law 4); new ones are in DEV-025.

Preview: `python3 design-system/prototype/build/serve.py`, then `http://localhost:8090/…`. Addresses have no trailing slash (`/x/` redirects to `/x`); an unknown address returns `404.html` with status 404. Assets load from root paths (`/css`, `/js`, `/assets`), so pages work at any depth; opening files directly from disk is no longer supported.

## One address per page
| Address | Built from | Status |
|---|---|---|
| `/` | `index.html` | live, unchanged |
| `/fresh-deals` | `fresh.html` | live, unchanged |
| `/top-deals` | `top-picks.html` | live, unchanged |
| `/loot-deals` | `loot.html` | live, unchanged |
| `/new-deals` | `new.html` | live, unchanged |
| `/pantry-deals` | `pantry.html` | live, unchanged |
| `/deals/search` | `search.html` | live, unchanged |
| `/categories` | `categories.html` | new |
| `/stores` | `stores.html` | new |
| `/login` | `login.html` | live, unchanged |
| `/relogin` | `relogin.html` | new |
| `/user/profile` | `account.html` | live, unchanged |
| `/delete-account` | `delete-account.html` | live, unchanged |
| `/contact` | `contact.html` | live, unchanged |
| `/privacy` | `privacy.html` | live, unchanged |
| `/disclaimer` | `disclaimer.html` | live, unchanged |
| `/terms` | `terms.html` | new |
| `/faq` | `faq.html` | new |
| `/blog` | `blog.html` | new |
| `/forbidden` | `403.html` | live, unchanged |
| `/404.html` | `404.html` | error file served by the host |
| `/500.html` | `500.html` | error file served by the host |
| `/offline` | `offline.html` | new |
| `/_design/email-otp` | `email-otp.html` | design sheet, not a site page |
| `/_design/share-card` | `share-card.html` | design sheet, not a site page |
| `/admin/login` | `admin-login.html` | new |
| `/admin` | `admin.html` | new |
| `/admin/incoming` | `admin-incoming.html` | new |
| `/admin/deal` | `admin-deals.html` | live, unchanged |
| `/admin/deal/create` | `admin-post.html` | live, unchanged |
| `/admin/pinned` | `admin-pinned.html` | new |
| `/admin/admin-notifications` | `admin-alerts.html` | live, unchanged |
| `/admin/posters` | `admin-posters.html` | new |
| `/admin/sponsored` | `admin-sponsored.html` | new (D-108) |
| `/admin/social` | `admin-social.html` | new |
| `/admin/settings/tags` | `admin-tags.html` | new |
| `/admin/feedback` | `admin-inbox.html` | live, unchanged |
| `/admin/settings/site` | `admin-site.html` | new |
| `/admin/role` | `admin-roles.html` | live, unchanged |
| `/admin/users` | `admin-users.html` | live, unchanged |
| `/admin/security` | `admin-security.html` | new: bot check switch and flagged IPs (Muiz, 22 Nov) |
| `/admin/shop` | `admin-catalogue.html` | live, unchanged |
| `/admin/blog` | `admin-blog.html` | new |
| `/admin/blog/create` | `admin-blog-edit.html` | new |
| `/admin/soon` | `admin-soon.html` | new |

## Patterns (one per record)
| Address | Page | Status | Source |
|---|---|---|---|
| `/deal/{slug}` | deal detail | live | `routes/web.php` deal/{slug}; slug from the snapshot |
| `/products/{category-slug}-deals` | category feed | live | categoryPage |
| `/shops/{shop}` · `/shops/{shop}/{category}` | store and store+category feeds | live | shopPage, categoryShopPage |
| `/blog/{post-name}` | blog post | new (D-093) | |
| `/admin/deal/{id}/edit` · `/admin/deal/{id}/clone` | post form, filled | live | admin `deal` resource, `deal/{id}/clone` |
| `/admin/blog/{post-name}/edit` | blog editor, filled | new | |

## Tabs with their own address
| Page | Tab → address | Status |
|---|---|---|
| Catalogue | Shops `/admin/shop` · Categories `/admin/category` · Deal types `/admin/lookup` · Types `/admin/type` | live (admin resources) |
| Inbox | Feedback `/admin/feedback` · Reports `/admin/reports` · Deletion requests `/admin/deletion-requests` | feedback live; others new |
| Social sharing | Channels `/admin/social` · Formats `/admin/social/formats` · History `/admin/social/history` | new |

Query strings stay for filters and review states: `?q=` search, `?tab=` on the Blog list, `?role=sub` sub-admin preview, `?user=1|admin|sub` signed-in states, `?state=` on sign-in screens, `?url=` return address on `/login` and `/admin/login` (local paths only).

## Not routed
`/look-review.html`: the S16 colour review sheet (hand-made, kept for the Colour pass). Email template and share card sit under `/_design/`.
