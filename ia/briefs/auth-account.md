# Experience brief — sign in, forced re-login, account, delete account
AGREED v1 · 2026-11-09 (D-061) · Law 12. Sources: BRD B18, B19, B31, B32, B37; W33–W40; A7–A11. Removals per DEV-010 (password, sign-up, forgot/reset, Facebook, Apple) and DEV-014 (points).

## Who
1. Member who wants to comment — arrives from "Sign in to comment" on a deal page; wants back to the thread in under 30 seconds.
2. Existing member (28.9k) after go-live — everyone is signed out once (B19); must recognise their old email still works and nothing is lost.
3. Admin / sub-admin — same screen, lands in admin.
4. Member who wants out — delete-account request from the Play Store listing or the footer, possibly without being able to sign in.

## Jobs
Sign in with Google or a 6-digit code emailed to me; no password anywhere. Return to where I was. See and change my display name and mobile; see whether browser alerts are on; delete my account with one confirm. Request deletion without signing in (B31).

## Behaviours
Sign in (`/login`, also as a bottom sheet from "Sign in to comment" / menu)
- Two choices, equal weight: [Continue with Google] · email field + [Send code]. One screen, no tabs. Line under: "New here? Signing in creates your account." (B18: no sign-up form).
- Code step: 6 boxes, auto-advance, paste-aware; "Code sent to x@y.com · Change"; resend after 30 s with countdown; code valid 10 min (copy says so); 5 wrong tries → wait 15 min, inline red (red reserved for errors).
- Turnstile (B32) sits above the Send code button as an invisible/managed widget; when it needs interaction it appears inline, never as a modal.
- Success → return to `?url=` or the previous page; comment composer regains focus if that was the origin. Roles 1/3 → admin Overview / All deals.
- Errors inline: unknown delivery problem → "We could not send the code. Try again or use Google."
- OTP email (Q-030, recommended in scope): logo on white, "Your OfferTag sign-in code", the code in Jost 32 px, "Valid for 10 minutes. If you did not request this, ignore this email.", plain footer with support address. No images besides the logo, no marketing.
Forced re-login (B19, F5)
- Full-page interstitial on first visit after go-live for anyone with an old session: one sentence ("We moved to a safer sign-in. Please sign in once more."), [Sign in], "Continue browsing without signing in". After sign-in, back to the page they were on. Shown once; browsing never blocked.
Account (`/user/profile`)
- Display name (Q-035, recommended: one field, username retired from the UI), email read-only, mobile optional. [Save].
- Alerts: "Browser alerts: On/Off" with the opt-in trigger (D-055); "App alerts are managed in the app".
- Danger zone: "Delete account" → inline confirm panel ("This removes your account and comments. It cannot be undone.") → [Delete my account] → signed out, landing on Home with a toast. No Turnstile when signed in.
- Removed: change password, my deals, post a deal, points (DEV-010, DEV-014). Sidebar gone; one page.
Delete account, public (`/delete-account`, B31)
- Form: name, email, mobile, reason (optional), Turnstile, [Request deletion]. Success: "Request received. We delete accounts within 7 days and email you when done." Error states inline; email not found → still accepted (do not reveal membership), recorded for admin review in Inbox → Deletion requests (DEV-012).

## Feel
Short, reassuring, no friction. One screen per job.

## Never
No password field anywhere. No sign-up form. No social buttons other than Google. No CAPTCHA puzzles (Turnstile managed mode only). No "are you sure" without saying what is lost.

## Mockups
`../../screens/auth-account.md`.
