# Data sheet — admin batch C: Social sharing, Affiliate tags, Inbox, Site & app + Roles, Users, Catalogue (S16)
Law 15. Old code: `offer-tag/` (read-only); columns from `offer-tag/database/migrations/`. ASCII: `screens/admin-tools.md` §2–7, phone pattern `screens/admin-pinned-blog.md` §4. Approval: D-059. Look: D-098. Catalogue values: `build/catalogue.json` (live site, 2026-11-11).

## Routes
| Screen | Live route | Prototype file | Source |
|---|---|---|---|
| Social sharing | `/admin/social` (new) | `admin-social.html`; `?tab=channels\|formats\|history` | D-059, B13–B15 |
| Affiliate tags | `/admin/settings/tags` (new) | `admin-tags.html` | B16, D-059 |
| Inbox | `/admin/inbox` (today `admin/feedback`) | `admin-inbox.html`; `?tab=feedback\|reports\|deletion` | B30, B31, DEV-012, DEV-013 |
| Site & app | `/admin/settings/site` (new) | `admin-site.html` | B33, D-057 |
| Roles | `/admin/settings/roles` (new) | `admin-roles.html` | D-057 |
| Users | `/admin/users` (today) | `admin-users.html` | D-059, DEV-014 |
| Catalogue | `/admin/shops`, `/admin/categories`, … (today) | `admin-catalogue.html`; `?tab=shops\|categories\|dealtypes\|types` | D-059 |

## Social sharing
| Element | Source | Note |
|---|---|---|
| Channels Facebook Page, Pinterest, Threads | B13, D-059 | Connection states SAMPLE: no tokens in the prototype |
| "Awaiting platform approval" note | BRD (Meta and Pinterest approval by week 7) | Shown as a line; review state `?approval=pending` greys the channels |
| Page / board / handle names | `facebook.com/Offertag.in` (`layouts/app.blade.php:85`) | Pinterest board and Threads handle SAMPLE |
| Formats: one template per platform, placeholders `{title} {price} {mrp} {pct} {store} {coupon_line} {short_link}` | admin-tools §2 | Default text = the D-058 share template the post form already uses |
| Preview deal | the newest snapshot deal (same as All deals row 1) | |
| Platform tag line | Affiliate tags table below | |
| Short link pattern `offertag.in/v/…` | `config/app.php` short_url (batch B) | |
| History rows | SAMPLE | Same rows as Overview "Recent shares" |

## Affiliate tags
| Row | Amazon tag | Flipkart id | Source |
|---|---|---|---|
| Website (deal page) | offertag-21 | offertag | `details.blade.php:196`; Flipkart `affid=offertag` from `NotificationsController.php:146–148` |
| Short links / WhatsApp | offertag1-21 | offertag | `DealsController.php:42` (`$whatsappTag`) |
| Google / `?source=` | offertag2-21 | offertag | `DealsController.php:44` (`$googleTag`) |
| Facebook | offertagfb-21 | offertag | `DealsController.php:46` (`$facebookTag`) |
| Pinterest, Threads | empty | empty | new channels (B13); owner fills |
| Android app | offertag-21 | offertag | Push links use `tag=offertag-21` (`NotificationsController.php:146`); app source not in the bundle, so marked "check" |
| Flipkart shop record | `shops.affiliate_value` is blank for Flipkart in the live catalogue | | Shown in Catalogue as "—" |
| Per-poster tag | `users.amazon_tag` (2019 migration), W53 | | Edited in Users |

## Inbox
| Element | Source | Note |
|---|---|---|
| Feedback rows: type, email, when, message | `feedback` table: `feedback` 1 Suggestion · 2 Issue · 3 Appreciation, `email`, `description`, `created_at` | Rows SAMPLE, emails masked |
| Reports rows: reason, deal, who, when, note | DEV-013 / D-050 report sheet (`feed-states-index.md`): Link not working · Price has changed · Out of stock · Something else | Rows SAMPLE; deals are snapshot deals |
| Deletion rows: name, email, mobile, reason, date | `account_deletions` (2024 migration) | Rows SAMPLE, masked |
| Handled toggle, "Unhandled only" default on | admin brief (Inbox) | `handled` is a new column |
| Unhandled counts 2 · 2 · 1 = 5 | same 5 as the sidebar and Overview (batch A) | SAMPLE |
| Mark deleted records only | admin-tools §4, Law 4 | |

## Site & app
| Field | Value | Source |
|---|---|---|
| Community strip on/off, WhatsApp link, Telegram link | `chat.whatsapp.com/FpM8Z1mM898BmFOqd8ccqg`, `t.me/OffertagLoot` | `layouts/app.blade.php:89, 93` |
| Facebook | `facebook.com/Offertag.in` | `layouts/app.blade.php:85` |
| Instagram, LinkedIn | empty | Not in today's site |
| Play Store | `play.google.com/store/apps/details?id=app.offertag` | `layouts/app.blade.php:81` |
| Support email | support@offertag.in | `contact.blade.php:19`, footers |
| Live chat (Tawk.to) on/off | on | `layouts/app.blade.php:111` |
| Blog "New" pill on/off | on | D-097 (3) |
| Sale posters on/off | on | DEV-019; posters themselves in Sale posters |
| Hottest strip toggle from the ASCII | dropped | Home has no hottest strip since the sectioned Home and DEV-019 (D-100) |

## Roles
| Element | Source |
|---|---|
| Roles Admin (1), Sub-admin (3), Member (2, "Customer" in the seeder) | `roles` table, `RolesTableSeeder.php`, `AdminAuthorization.php:20` |
| What each role sees | D-057 sidebar split; read-only (admin-tools §5 "Roles (read-only)") |

## Users
| Element | Source | Note |
|---|---|---|
| Columns name, email, phone, role, joined, Amazon tag | `users`: `name`, `email`, `mobile`, `role_id`, `created_at`, `amazon_tag` | |
| Rows | SAMPLE 12, masked | The live total is not in the snapshot, so no total is shown (Law 15) |
| Adil, Admin, joined 2019-06, offertag-21 | shell user (batch A), ASCII | |
| Edit: Amazon tag only | admin-tools §6; role change and block not in scope | Amazon India tags end in `-21` |
| No points, no export | DEV-014 | |

## Catalogue
| Tab | Rows | Source | Note |
|---|---|---|---|
| Shops | 14 active shops | `catalogue.json` shops: name, slug, order, logo, `affiliate_value`, description, deal totals | The snapshot holds active rows only, so "Active only" shows the same 14 |
| Shop card label (≤ 13) | new field | D-099 card | Defaults to the name |
| Shop default steps | `shops.shop_steps`; build.py `SHOP_STEPS` | Same list for every shop today |
| Shop logo | `assets/stores/` SAMPLE wordmarks (batch B) | Live: `shops.shop_logo` |
| Categories | 31 active categories: name, slug, order, totals, SEO title + description | `catalogue.json` categories | Slug is read-only: no URL changes |
| Deal types | Fresh · Top picks · Loot · New · Pantry, order 1–5 | D-062 (tab order, rename of "Home") | Counts from the snapshot |
| Types | one row: Deal Type, alias `deal_type` | `TypesTableSeeder.php` | Read-only |
| Delete blocked while deals exist | admin-tools §7 | Every snapshot shop and category has deals |
