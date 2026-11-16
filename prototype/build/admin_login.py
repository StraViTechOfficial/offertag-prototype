# admin_login.py — screen 37, Admin sign-in (S18, D-105). Runs inside build.py's namespace after admin_d.py.
# Data sheet: design-system/ia/data-sheets/admin-login.md. Live route `admin/login` (routes/web.php:139, LoginController@adminLogin);
# password sign-in is removed (DEV-010), so staff use the same Google / email-code methods as the public site.

def build_admin_login():
    page = f'''<!doctype html>
<html lang="en" class="admin">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title>Admin sign in · OfferTag</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="css/ui.css">
<link rel="stylesheet" href="css/admin.css">
</head>
<body class="alog-body">
<!-- Admin sign-in (screen 37, D-105; data sheet admin-login.md). Review states: ?state=code · ?state=denied · ?state=out (after sign-out). Sample: any @offertag.in address is staff; one starting "sub" is a sub-admin; 000000 is the wrong code. -->
<main class="alog" id="main">
  <div class="alog-brand"><img src="assets/logo-crop.png" alt="OfferTag" width="1510" height="500"><span>Admin</span></div>
  <section class="alog-card" aria-labelledby="alog-h">
    <p class="alog-note" data-alog-out hidden><i data-lucide="check"></i>You are signed out.</p>
    <div data-alog-step="start">
      <h1 id="alog-h">Sign in to the admin</h1>
      <p class="alog-sub">For OfferTag staff. Use the Google account or email address your admin role is on.</p>
      <button class="btn btn-outline alog-google" type="button" data-alog-google><svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.9-5.4 3.9-3.3 0-5.9-2.7-5.9-6s2.6-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"/></svg>Continue with Google</button>
      <div class="alog-or"><span>or</span></div>
      <form data-alog-email novalidate>
        <label class="fld"><span class="lab">Work email</span><input class="input" type="email" name="email" autocomplete="email" placeholder="you@offertag.in" required><span class="err" data-alog-email-err hidden></span></label>
        <button class="btn btn-default alog-go" type="submit">Email me a code</button>
      </form>
    </div>
    <div data-alog-step="code" hidden>
      <h1>Enter the code</h1>
      <p class="alog-sub">Sent to <b data-alog-to></b> · <button class="btn-link" type="button" data-alog-change>Change</button></p>
      <form data-alog-code novalidate>
        <label class="fld"><span class="lab">6-digit code</span><input class="input alog-otp mono" type="text" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{{6}}" placeholder="••••••"><span class="err" data-alog-code-err hidden></span></label>
        <button class="btn btn-default alog-go" type="submit">Sign in</button>
      </form>
      <button class="btn-link alog-resend" type="button" data-alog-resend disabled>Resend code in 0:30</button>
    </div>
    <div data-alog-step="denied" hidden>
      <h1>No admin access</h1>
      <p class="alog-sub"><b data-alog-who></b> is not on the admin team. Ask an admin to add you under Settings → Roles, or sign in with another account.</p>
      <div class="alog-acts"><button class="btn btn-outline" type="button" data-alog-again>Use another account</button><a class="btn btn-ghost" href="index.html">Go to OfferTag</a></div>
    </div>
  </section>
  <p class="alog-foot"><a href="index.html"><i data-lucide="arrow-left"></i>Back to OfferTag</a></p>
</main>
<div class="toaster" id="toaster" aria-live="polite"></div>
<script src="https://cdn.jsdelivr.net/npm/lucide@0.468.0/dist/umd/lucide.min.js"></script>
<script src="js/admin-login.js"></script>
</body>
</html>
'''
    open(os.path.join(ROOT, 'admin-login.html'), 'w').write(page)

build_admin_login()
print('Admin: screen 37 (admin-login)')
