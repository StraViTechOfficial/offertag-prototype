# Data sheet — admin batch D: Blog posts list, Blog editor, admin phone pass (S16)
Law 15. ASCII: `screens/admin-pinned-blog.md` §2–4. Public blog: `static-blog.md` data sheet, `build/blog.json`. Look: D-098.

## Routes
| Screen | Live route | Prototype file | Source |
|---|---|---|---|
| Blog posts | `/admin/blog` (new) | `admin-blog.html` | B08, D-061 |
| Blog editor | `/admin/blog/{id}/edit`, `/admin/blog/create` (new) | `admin-blog-edit.html?post={name}`; no `post` = new post | B08, admin-pinned-blog §3 |
| Public post | `/blog/{slug}` | `blog-{name}.html` (S15) | D-061 |

## Blog posts list
| Element | Source | Note |
|---|---|---|
| 4 published posts: title, summary, date, cover, body, deals | `build/blog.json`, the same posts the public Blog shows | SAMPLE posts (no blog exists today; B08 is new) |
| 1 scheduled + 1 draft post | SAMPLE | Built from snapshot deals so the editor has real embeds |
| Counts All · Drafts · Scheduled · Published | counted from the rows | |
| Deals column | count of deal blocks in the post body | |
| Row menu: Edit, View ↗, Duplicate, Publish now / Unpublish, Delete | admin-pinned-blog §2 | Unpublish keeps the address (shows "not available") |
| Author "OfferTag" | public post byline and JSON-LD (S15) | |

## Blog editor
| Element | Source | Note |
|---|---|---|
| Title, Summary (≤ 160, shown on the index and share card) | admin-pinned-blog §3; public post uses `summary` as meta description and OG text | |
| Body blocks: paragraph, H2, H3, lists, link, image, deal | public post renderer (`build.py` blog: `p`, `h`, `deal`, `img`) | H3 and lists are new to the renderer |
| Deal embed: image, store, % off, title, price, status | snapshot deals (same rows as All deals) | Withdrawn deal shows "No longer available" (§3) |
| Deal picker: search title, link, store; withdrawn greyed but insertable with a warning | §3 | |
| Paste an image → inline | B08 | Prototype keeps it in the page only |
| Slug | `blog.json` `name` → `/blog/{name}` | Read-only once published (no URL changes) |
| Cover | `blog.json` `cover` (a deal image) | |
| Category for "More in …" | public post picks the most common category of its deals | Editor shows it as the default, changeable |
| SEO title, meta description | public post head (title, description) | SEO title empty = post title |
| Autosave every 10 s, "saved N s ago" | §3 | This browser only (localStorage) |
| Publish confirm with the public URL; Schedule date-time; Preview opens the public page | §3 | Preview of an unsaved post = the public page of that post when it exists |

## Admin phone pass (35)
Checked at 412 px on every admin page against §4: tables become cards, tabs scroll, filters fold into one row, drawers full-screen, two-pane screens stack with the preview folded, settings Save sticky, Overview tiles 2-up. Results in the S16 session note.
