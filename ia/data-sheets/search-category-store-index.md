# Data sheet — search, category / store feeds, indexes, slide-over, Home add-ons (S13)
Law 15 · 2026-11-11 · Sources: `old-code/schema.sql`, `old-code/offer-tag/routes/web.php`, `DealsController.php` (`applySearchFilters`, `buildTitleForCategory`, `buildHeadingForCategory`, `buildFooterDescription`), `resources/views/search.blade.php`, `header.blade.php`, Flutter `searchPage.dart`, BRD p.1–2, live site 2026-11-11.
Prototype data: `prototype/build/deals-clean.json` (42 live deals, snapshot 10 Nov 23:20 IST) · `deal-details.json` · `deals-extra.json` (3) · NEW `catalogue.json` (31 active categories, 14 active shops, live totals, live SEO text).

## 0. Facts that bound every screen
| Fact | Source |
|---|---|
| Public search matches `deals.title`, `categories.category_name`, `shops.name` with `LIKE %q%`; AND with category / shop / type filters | old-code `applySearchFilters` |
| Pinned deals are excluded when a search term is present; otherwise merged into slots 3/6/9/13 | old-code (W14); D-045 (pinned invisible) |
| Listings show `deal_status = approved`, `deal_display_type` in (1,2) on web, `publish_at <= now`, active shop and category | old-code `applySearchFilters` (W17) |
| Page size 16 | `config PER_PAGE_RECORDS`, D-032 |
| Routes kept: `/deals/search?q=` · `/products/{cat}-deals` · `/shops/{shop}` · `/shops/{shop}/{cat}` · `/{dealType}` | `routes/web.php`; Law 4 |
| No categories or stores index exists today (lists live in the filter sidebar) → index pages are NEW views on old routes' data, no new data | D-065 |
| Catalogue: 53 category ids, 31 active; 64 shop ids, 14 active; ordered by `order_no` | live `?arrow_flag=1` JSON, `categories.is_active`, `shops.is_active` |
| Live totals per shop / category = what the old site's own "Load More" reports (`paginated.total`; the query joins `deal_type`, so a deal with two types counts twice) | live site 2026-11-11, `catalogue.json` |
| Search placeholder today: "Search Offers, Deals, Coupons, Recharge" (web), "Find you want" (app); no suggestions, no recent searches today | `header.blade.php`, `searchPage.dart` |

## 1. Search results page `search.html` (`/deals/search?q=`)
| Element | Source |
|---|---|
| Query text in field and H1 "Results for “q”" | URL `q` (old route) |
| Result set | rule §0 row 1 on the snapshot's 42 deals; pinned excluded (SAMPLE pinned set, see §7) |
| Count line "N deals" | snapshot count |
| Facets Category · Store (with counts), Discount, Price, Type (shown, D-075), Posted | `deals.category_id`, `deals.shop_id`, `discount_percent`, `discount_amount`, `deal_type`, `updated_at` |
| Sort set | D-075 (`updated_at`, `discount_percent`, `actual_amount − discount_amount`, `discount_amount`, `view_counter`) |
| Empty state: "No deals for “q”", applied chips, Clear all, three nearby categories, Fresh feed | feed brief v2 §States, D-045; nearby = top 3 categories by live total |
| `<title>` "Search: q — OfferTag" | design (old site uses the home title on search, W19 gap) |

## 2. Search sheet (phone) and header suggestions (desktop)
| Element | Source |
|---|---|
| Recent searches (max 5, Clear) | browser storage, per device (D-064) — no table |
| Store chips | `shops` active rows in `order_no` order (14) |
| Categories list: top 4 by live total + "All categories ›" | `categories` active rows, live totals |
| Typed ≥ 2 chars: completions | deal titles in the snapshot containing q (first five words), max 3 |
| Store match row → store page · Category match row → category page | `shops.name`, `categories.category_name` LIKE q (same rule as results) |
| Top 3 deals (image, title, price) | snapshot deals matching the rule, newest first |
| "See all results for “q”" → `search.html?q=` | old route |

## 3. Category feed `category-{slug}.html` (`/products/{cat}-deals`), store feed `store-{slug}.html` (`/shops/{shop}`), combo `store-{shop}-{cat}.html` (`/shops/{shop}/{cat}`)
| Element | Source |
|---|---|
| Which pages exist | every active category (31), every active shop (14), every shop × category pair that has a deal in the snapshot |
| H1 "{Category} deals" / "{Store} deals" / "{Category} deals from {Store}" | `category_name`, `shops.name` (old H1 formula "{X} Loot Deals Online" replaced by design; `<title>` keeps the old formula) |
| `<title>` and meta description | old-code `buildTitleForCategory`, `buildDescriptionForCategory` (W19), verbatim |
| Rule line under H1: "{N} deals · {live total} all time" | snapshot count + live total |
| Locked chip for the page's own facet; that facet group hidden | D-075 |
| Type facet shown | D-075 |
| Collapsed "About {Category}" / "About {Store}" block in the footer | `categories.description`, `shops.description` as the live site renders them (`buildFooterDescription`); combo pages show category text then store text only for the old code's whitelist (Amazon, Flipkart × 21 categories), else category text, else store text |
| Breadcrumb Home › Category (› Store) | design |
| Empty state when the snapshot has no deal: "No {Category} deals right now", nearby categories (3 by live total), Fresh feed | feed brief §States |

## 4. Categories index `categories.html`, Stores index `stores.html`
| Element | Source |
|---|---|
| Rows | active rows only (31 / 14), link to the feed page |
| Order | top 8 by live total, then alphabetical (D-065) |
| Count per row | live total from `catalogue.json` (labelled "all time" in the page footnote); zero rows greyed, still linked |
| Category search box | design (D-065); stores: 14 rows, no box |
| Store logo | `shops.shop_logo` exists (`storage/shop/small/…`) but is a screenshot file per store; prototype shows the initial letter, logo slot kept for dev |

## 5. Desktop slide-over (listing card at ≥ 1024 px)
| Element | Source |
|---|---|
| Content | the deal's own page rendered in a 480 px panel (`deal-{id}.html?embed=1`: header, footer and menu hidden); same fields as the detail sheet (S12) |
| URL while open → `/deal/{slug}`; Back, Esc, ✕, backdrop close and restore | D-050, D-065 |
| "Open full page ↗" | D-065 |
| Selected card ring | D-065 |

## 6. Home add-ons
| Element | Source |
|---|---|
| Hottest-deals carousel (admin on/off) | BRD B02; D-072 makes the pinned hero this carousel → REC Q-038: no second strip; toggle = `?hero=0` in the prototype, "Site & app settings" in admin (B33) |
| Community bar: one line, WhatsApp · Telegram, × hides till midnight | BRD B09, D-055; links from Site & app settings (B33); dismissal per device |
| Alerts opt-in card after the first 16 cards on the second visit; "Turn on" → browser prompt; × = 30 days | BRD B23, D-055 (Q-027); visit count and dismissal per device; `?visit=2` forces it in the prototype |

## 7. Retro-audit of pages built in S11–S12 (defects under Law 15, fixed in S13)
| Element | Was | Now |
|---|---|---|
| Home "Shop by store" counts (1204, 612, …) | invented | live totals from `catalogue.json`, "all time" |
| Home category tiles | hand-picked 16 names | 31 active categories in `order_no` order, first 16 in the rail, "All categories" → index |
| Category names "Mobiles", "Home & Decor" | renamed in the build | catalogue spelling as stored (Q-037 for the admin fix) |
| Store list in facets | hard-coded 14 names | `catalogue.json` shops, same 14, catalogue order |
| "Pinned" hero deals | chosen by biggest saving / discount | SAMPLE (the scrape has no `is_pinned`), stated in the README |
| "updated 3 min ago" in the type nav | static text | kept as the live-state placeholder, labelled in the README (dev: `max(updated_at)`) |
| Related links "See all in {cat}", "More from {store}" → `fresh.html` | wrong target | category / store pages |
