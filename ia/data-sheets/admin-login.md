# Data sheet — screen 37: Admin sign-in (S18)
Law 15. Look: D-098 (admin dark). Public sign-in for comparison: `auth-account.md`.

## Route
| Screen | Live route | Prototype | Source |
|---|---|---|---|
| Admin sign-in | `/admin/login` | `/admin/login` (`build/admin_login.py`, `js/admin-login.js`) | `routes/web.php:139`, `LoginController@adminLogin` |

## Elements
| Element | Source | Note |
|---|---|---|
| Logo + "Admin" tag | `assets/logo-crop.png`, admin shell | |
| Continue with Google | BRD login options (Google, email code); DEV-010 removes passwords | Today's admin login is a password form; it goes |
| Work email → 6-digit code, resend after 30 s, 5 tries, 15-minute lock | public sign-in rules (D-084, `site.js`) | Same rules for staff |
| Staff check: role 1 (admin) or 3 (sub-admin) | `users.role_id`, D-057 | Admin lands on `/admin`, sub-admin on `/admin/deal` |
| "No admin access" state for any other account | `admin` middleware (`routes/web.php:28`) | Points to Settings → Roles |
| Return to the admin page that sent you (`?url=`, admin paths only) | D-105 | Outside addresses ignored |
| "You are signed out" note | admin top-bar Sign out → `/admin/login?state=out` | |
| Back to OfferTag → `/` | D-105 (every page reaches Home) | |
| Sample rules | SAMPLE | Any `@offertag.in` address is staff; one starting "sub" is a sub-admin; code 000000 is wrong; Google signs in as Adil |

Review states: `?state=code`, `?state=denied`, `?state=out`.
