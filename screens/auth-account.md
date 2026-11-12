# Sign in, re-login, account, delete account — ASCII (Law 11)
AGREED v1 · 2026-11-09 (D-061) · Brief: `../ia/briefs/auth-account.md`. Phone shown; desktop centres the same card at 420 px over a muted background.

## Sign in
```
┌──────────────────────────────────┐
│ ‹                                │
│        [Offertag logo]           │
│        Sign in                   │
│ New here? Signing in creates     │
│ your account.                    │
│                                  │
│ [ G  Continue with Google      ] │
│ ─────────── or ───────────       │
│ Email                            │
│ [ you@example.com              ] │
│ ( turnstile, inline when needed )│
│ [        Send code             ] │
│                                  │
│ By continuing you agree to the   │
│ Terms and Privacy policy.        │
└──────────────────────────────────┘
```
Code step:
```
│ Enter the code                   │
│ Sent to you@example.com · Change │
│ [ 4 ][ 8 ][ 2 ][ _ ][ _ ][ _ ]   │
│ Valid for 10 minutes             │
│ Resend code in 0:27              │
│ ✗ That code is not right. 3 tries│ red, inline, only on error
│   left.                          │
```
As a bottom sheet (from "Sign in to comment"): same content, 85 % height, deal page faintly behind; success closes the sheet and focuses the composer.

## Forced re-login (once, after go-live)
```
┌──────────────────────────────────┐
│        [Offertag logo]           │
│ We moved to a safer sign-in.     │
│ Please sign in once more. Your   │
│ account and comments are safe.   │
│ [        Sign in               ] │
│ Continue browsing without        │
│ signing in                       │
└──────────────────────────────────┘
```

## Account
```
┌──────────────────────────────────┐
│ ‹ Account                        │
│ Display name                     │
│ [ Abdul M.                     ] │ shown on comments
│ Email                            │
│   you@example.com (sign-in email)│ read-only
│ Mobile (optional)                │
│ [ +91 98xxx xxx21              ] │
│ [ Save ]                         │
├──────────────────────────────────┤
│ Alerts                           │
│ Browser alerts            On ●   │ opt-in trigger (D-055)
│ App alerts are managed in the app│
├──────────────────────────────────┤
│ Delete account                   │
│ Removes your account and         │
│ comments. Cannot be undone.      │
│ [ Delete my account ]            │ → inline confirm → signed out
└──────────────────────────────────┘
```

## Delete account, public `/delete-account`
```
┌──────────────────────────────────┐
│ Delete your OfferTag account     │
│ Signed in? Delete from Account › │
│ Name   [                      ]  │
│ Email  [                      ]  │
│ Mobile [                      ]  │
│ Reason (optional)                │
│ [                              ] │
│ ( turnstile )                    │
│ [ Request deletion ]             │
│ We delete accounts within 7 days │
│ and email you when done.         │
└──────────────────────────────────┘
```

## OTP email (Q-030)
```
┌──────────────────────────────────┐
│ [Offertag logo]                  │
│ Your OfferTag sign-in code       │
│                                  │
│          4 8 2 9 1 7             │ Jost 32
│                                  │
│ Valid for 10 minutes. If you did │
│ not request this, ignore this    │
│ email.                           │
│ ──────────────────────────────   │
│ OfferTag · support@offertag.in   │
└──────────────────────────────────┘
```
