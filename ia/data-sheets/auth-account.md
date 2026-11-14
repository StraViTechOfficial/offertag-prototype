# Data sheet — sign in, re-login, account, delete account, signed-in header (S14)
Law 15. Old code: `offer-tag/` in this repo (read-only, moved from `/mnt/d/PC-Downloads/old-code` on 2026-11-11). Brief and ASCII: `briefs/auth-account.md`, `screens/auth-account.md` (D-061). No `schema.sql` in the new copy; columns come from `offer-tag/database/migrations/`.

## Routes (kept)
| Screen | Live route | Prototype file | Source |
|---|---|---|---|
| Sign in | `/login/{url?}` | `login.html?url=` | `routes/web.php:130`, W33 |
| Account | `/user/profile` | `account.html` | `routes/web.php:80`, W36 |
| Delete request | `/delete-account` | `delete-account.html` | `routes/web.php:17`, W39 |
| Forced re-login | none today | `relogin.html` | BRD B19, D-061 |

## Sign in
| Element | Source |
|---|---|
| Continue with Google | BRD B18; `routes/web.php:147` |
| Email field + Send code; 6-digit code | BRD B18; brief D-061 |
| "New here? Signing in creates your account." | BRD B18 (no sign-up form) |
| Code valid 10 min; resend 30 s; 5 wrong tries → wait 15 min | brief D-061 |
| Send failure message | brief D-061 |
| Turnstile slot, inline only when needed | BRD B32; brief D-061 |
| Return to origin | `LoginController::loginForm` (`url` → `redirect_login_url`), W33 |
| Admin roles 1 and 3 land in admin | `LoginController::login`, W33; dev rule until the admin is built (S16) |
| Pop-up on desktop, sheet on phone | D-091, D-061 |
| Terms and Privacy links | D-061; pages arrive in S15, links are placeholders until then |

## Forced re-login
| Element | Source |
|---|---|
| Copy, Sign in, Continue browsing | BRD B19; `screens/auth-account.md` |
| Shown once, for old sessions | BRD B19; dev rule, not visible in the prototype |

## Account
| Element | Source | Note |
|---|---|---|
| Display name | `users.name` (string, required, max 255; `ProfileRequest`) | D-061 retires username from the UI |
| Email, read-only | `users.email` (`profile.blade.php`, disabled field) | |
| Mobile, optional | `users.mobile` (string 20, nullable); old form digits max 10 | Old form required it; brief makes it optional |
| Browser alerts toggle | D-055, D-061 | State per device |
| App alerts line | D-061 | `users.allow_notifications` belongs to the app |
| Delete, inline confirm, signed out to Home | `UsersController::removeAccount`; D-061 adds the confirm | Old delete had no confirm |
| Removed: change password, my deals, post a deal, points | DEV-010, DEV-014 (D-084) | |

## Delete request (public)
| Element | Source | Note |
|---|---|---|
| Name, required | `account_deletions.name`, max 255 | |
| Email, required | `account_deletions.email` | Old rule rejected unknown email (`exists:users,email`); D-061 accepts it, so membership is not revealed |
| Mobile, required | `account_deletions.mobile_number`, max 20 | |
| Reason, optional | `account_deletions.reason` | |
| Turnstile | BRD B32 | |
| Repeat request | Old rule rejected with a message | New: same success message, so membership is not revealed; admin sees repeats in Inbox (DEV-012) |
| "We delete accounts within 7 days and email you when done." | D-061 | Business promise; confirm with Adil at the client checkpoint |

## Signed-in header and menu
| Element | Source |
|---|---|
| Guest "Sign in"; member initial → name, Account, Sign out | W01, W02; feature-parity "Account entry" |

## SAMPLE
Member name "Asha Verma" and `asha@example.com` stand in for a signed-in member. `users` holds real people's personal data, which is never copied into the prototype. Declared here as the one exception to the SAMPLE rule.

## Staff link (S16 BRD audit, D-102)
| Element | Source | Note |
|---|---|---|
| "Admin panel" in the account menu and phone menu, roles 1 (admin) and 3 (sub-admin) only | `users.role_id`, `AdminAuthorization.php:20`; W02; D-055 | Review states `?user=admin`, `?user=sub`; sub-admins open All deals |
