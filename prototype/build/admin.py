# admin.py — admin panel pages (S16 batch A: shell, Overview, Incoming deals, All deals; D-098 look).
# Data sheet: design-system/ia/data-sheets/admin-batch-a.md (Law 15). Run by the last line of build.py in the same
# namespace, so it reuses the snapshot deals (types, stores, pinned set), the catalogue and the helpers there.
import datetime as _dt

TODAY = _dt.date(2026, 11, 13)
A_INCOMING_COUNT = 5   # SAMPLE incoming rows below (data sheet § Incoming)
A_INBOX_COUNT = 5      # SAMPLE (data sheet § Shell)
# D-104: pinned slots are an open list (slot 1, 2, 3…); on Fresh, slot k sits at card k × PIN_EVERY (build.py, admin sets N)
A_PIN = {d['file']: i + 1 for i, d in enumerate(pinned)}  # the 8 SAMPLE pinned deals the public site uses, in slot order

def soon(label): return 'admin-soon.html?s=' + label.replace(' ', '+')

# Sidebar (D-057). role: 'all' = admin + sub-admin, 'admin' = admin only. Sale posters added (DEV-019, D-098 §5).
NAV = [
    ('overview', 'Overview', 'layout-dashboard', 'admin.html', 'admin', None, None),
    ('deals', 'Deals', 'tag', None, 'all', None, [
        ('all', 'All deals', 'admin-deals.html', 'all', None),
        ('incoming', 'Incoming', 'admin-incoming.html', 'all', A_INCOMING_COUNT),
        ('post', 'Post a deal', 'admin-post.html', 'all', None),
        ('pinned', 'Pinned board', 'admin-pinned.html', 'admin', None),
    ]),
    ('posters', 'Sale posters', 'gallery-horizontal', 'admin-posters.html', 'admin', None, None),
    ('sponsored', 'Sponsored', 'megaphone', 'admin-sponsored.html', 'admin', None, None),  # DEV-030, D-108
    ('alerts', 'Alerts', 'bell', 'admin-alerts.html', 'admin', None, None),
    ('social', 'Social sharing', 'share-2', 'admin-social.html', 'admin', None, None),
    ('blog', 'Blog', 'newspaper', 'admin-blog.html', 'admin', None, None),
    ('inbox', 'Inbox', 'inbox', None, 'admin', A_INBOX_COUNT, [
        ('feedback', 'Feedback', 'admin-inbox.html?tab=feedback', 'admin', None),
        ('reports', 'Reports', 'admin-inbox.html?tab=reports', 'admin', None),
        ('deletion', 'Deletion requests', 'admin-inbox.html?tab=deletion', 'admin', None),
        ('comments', 'Comments', 'admin-inbox.html?tab=comments', 'admin', None),   # D-153: comments from the deal pages (plan.md B5)
    ]),
    ('catalogue', 'Catalogue', 'library', None, 'admin', None, [
        ('shops', 'Shops', 'admin-catalogue.html?tab=shops', 'admin', None),
        ('categories', 'Categories', 'admin-catalogue.html?tab=categories', 'admin', None),
        ('dealtypes', 'Deal types', 'admin-catalogue.html?tab=dealtypes', 'admin', None),
        ('types', 'Types', 'admin-catalogue.html?tab=types', 'admin', None),
    ]),
    ('users', 'Users', 'users', 'admin-users.html', 'admin', None, None),
    ('settings', 'Settings', 'settings', None, 'admin', None, [
        ('tags', 'Affiliate tags', 'admin-tags.html', 'admin', None),
        ('site', 'Site & app', 'admin-site.html', 'admin', None),
        ('roles', 'Roles', 'admin-roles.html', 'admin', None),
        ('security', 'Security', 'admin-security.html', 'admin', None),
    ]),
]

def _badge(n, key): return f'<span class="adm-count" data-count="{key}">{n}</span>' if n else ''

def sidebar(active):
    out = []
    for key, label, icon, href, role, badge, kids in NAV:
        r = f' data-role="{role}"' if role == 'admin' else ''
        if kids:
            open_ = any(k[0] == active for k in kids)
            sub = ''.join(f'<a href="{h}"{" data-role=" + chr(34) + kr + chr(34) if kr == "admin" else ""}{" aria-current=" + chr(34) + "page" + chr(34) if k == active else ""}>{E(l)}{_badge(b, k)}</a>' for k, l, h, kr, b in kids)
            out.append(f'<div class="adm-group"{r}><div class="adm-group-h"><i data-lucide="{icon}"></i><span>{E(label)}</span>{_badge(badge, key) if not open_ else ""}</div><div class="adm-sub">{sub}</div></div>')
        else:
            cur = ' aria-current="page"' if key == active else ''
            out.append(f'<a class="adm-link" href="{href}"{r}{cur}><i data-lucide="{icon}"></i><span>{E(label)}</span>{_badge(badge, key)}</a>')
    return '\n'.join(out)

def shell(fname, title, active, body, scripts='', after=''):
    page = f'''<!doctype html>
<html lang="en" class="admin">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title>{E(title)} · OfferTag Admin</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="css/ui.css">
<link rel="stylesheet" href="css/admin.css">
</head>
<body>
<!-- Admin shell (D-057; look D-098; data sheet admin-batch-a.md). Review state: ?role=sub shows the sub-admin menu. -->
<div class="adm">
  <aside class="adm-side" id="adm-side" aria-label="Admin menu">
    <div class="adm-brand"><a href="admin.html" aria-label="OfferTag admin home"><img src="assets/logo-crop.png" alt="OfferTag" width="1510" height="500"></a><span>Admin</span>
      <button class="btn btn-ghost btn-icon adm-close" type="button" data-side-close aria-label="Close menu"><i data-lucide="x"></i></button></div>
    <nav class="adm-nav">
{sidebar(active)}
    </nav>
    <div class="adm-side-foot">
      <div class="theme-seg adm-theme" role="radiogroup" aria-label="Theme"><button type="button" role="radio" data-theme-set="light" aria-checked="false"><i data-lucide="sun"></i><span>Light</span></button><button type="button" role="radio" data-theme-set="dark" aria-checked="false"><i data-lucide="moon"></i><span>Dark</span></button><button type="button" role="radio" data-theme-set="auto" aria-checked="false"><i data-lucide="sun-moon"></i><span>Auto</span></button></div>
      <a class="adm-link" href="index.html" target="_blank" rel="noopener"><i data-lucide="external-link"></i><span>View site</span></a>
      <button class="adm-link adm-collapse" type="button" data-side-collapse aria-label="Collapse menu"><i data-lucide="panel-left-close"></i><span>Collapse</span></button>
    </div>
  </aside>
  <div class="adm-overlay" data-side-close hidden></div>
  <div class="adm-main">
    <header class="adm-top">
      <button class="btn btn-ghost btn-icon adm-burger" type="button" data-side-open aria-label="Open menu" aria-controls="adm-side"><i data-lucide="menu"></i></button>
      <form class="adm-search" role="search" action="admin-deals.html">
        <label class="input-wrap"><i data-lucide="search"></i><span class="visually-hidden">Search</span><input class="input" type="search" name="q" placeholder="Search deals, links, users…" autocomplete="off" data-global-search><kbd>/</kbd></label>
      </form>
      <button class="btn btn-ghost btn-icon adm-search-btn" type="button" data-search-toggle aria-label="Search"><i data-lucide="search"></i></button>
      <a class="btn btn-default adm-post" href="{'admin-post.html'}"><i data-lucide="plus"></i><span>Post a deal</span></a>
      <div class="dropdown adm-user">
        <button class="btn btn-ghost adm-user-btn" type="button" data-menu-trigger aria-haspopup="menu" aria-expanded="false"><span class="avatar">A</span><span class="adm-user-name"><b>Adil</b><small data-role-label>Admin</small></span><i data-lucide="chevron-down"></i></button>
        <div class="menu" role="menu" hidden data-state="closed">
          <div class="menu-label">Signed in as Adil</div>
          <a role="menuitem" href="index.html" target="_blank" rel="noopener"><i data-lucide="external-link"></i>View site</a>
          <a role="menuitem" href="?role=sub" data-role="admin"><i data-lucide="eye"></i>Preview sub-admin menu</a>
          <a role="menuitem" href="?" data-role="sub"><i data-lucide="eye"></i>Back to admin view</a>
          <div class="separator"></div>
          <a role="menuitem" href="admin-login.html?state=out"><i data-lucide="log-out"></i>Sign out</a>
        </div>
      </div>
    </header>
    <main class="adm-content" id="main">
{body}
    </main>
  </div>
</div>
<div class="toaster" id="toaster" aria-live="polite"></div>
<script src="https://cdn.jsdelivr.net/npm/lucide@0.468.0/dist/umd/lucide.min.js"></script>
{scripts}<script src="js/admin.js"></script>
{after}</body>
</html>
'''
    open(os.path.join(ROOT, fname), 'w').write(page)

def types_html(ts): return ''.join(f'<span class="tchip t-{t.lower()}">{"Top deal" if t == "Top" else t}</span>' for t in ts if t != 'Fresh')

# ---------- Overview (admin-tools §8) ----------
INBOX_UNHANDLED = dict(feedback=2, reports=2, deletion=1)   # matches build_inbox() SAMPLE rows (admin_c.py); total = A_INBOX_COUNT

def fresh_now(n=10):  # Fresh as visitors see it: newest first, pinned deal every PIN_EVERY cards (D-104; listing.js placePins)
    pins = [d for d in pinned]; rest = [d for d in PAGES['fresh']['items'] if d not in pins]; out = []
    while len(out) < n and (rest or pins):
        if (len(out) + 1) % PIN_EVERY == 0 and pins: out.append((pins.pop(0), True))
        elif rest: out.append((rest.pop(0), False))
        else: out.append((pins.pop(0), True))
    return out

def attention_html():  # M-15 / M-17 (D-106): one place for everything waiting, plus what Fresh and the pins look like right now
    items = [('inbox', 'Incoming deals to review', A_INCOMING_COUNT, 'admin-incoming.html', 'Telegram bot and held deals'),
             ('mail', 'Contact messages', INBOX_UNHANDLED['feedback'], 'admin-inbox.html?tab=feedback', 'From the Contact form, not handled'),
             ('flag', 'Problems reported on deals', INBOX_UNHANDLED['reports'], 'admin-inbox.html?tab=reports', 'Link, price or stock reports'),
             ('user-x', 'Account deletion requests', INBOX_UNHANDLED['deletion'], 'admin-inbox.html?tab=deletion', 'From the app and the site; 7-day promise')]
    rows = ''.join(f'<a class="att-row{" is-clear" if n == 0 else ""}" href="{h}"><i data-lucide="{ic}"></i><span class="att-t"><b>{E(t)}</b><small>{E(sub)}</small></span><span class="att-n">{n if n else "All clear"}</span><i data-lucide="chevron-right" class="att-go"></i></a>' for ic, t, n, h, sub in items)
    fr = ''.join(f'<li><span class="fn-pos">{i + 1}</span><img src="{dimg(d)}" alt="" loading="lazy"><span class="t-title">{E(d["t"])}</span>{"<span class=fn-pin><i data-lucide=pin></i>Pinned</span>" if pin else f"<span class=t-meta>{d[chr(97)+chr(103)+chr(101)+chr(116)+chr(120)+chr(116)]}</span>"}</li>' for i, (d, pin) in enumerate(fresh_now()))
    return f'''<section class="panel attention"><div class="panel-h"><h2>Needs attention</h2><span class="tag-sample">Sample</span></div><div class="att-list">{rows}</div></section>
        <div class="two-col">
          <section class="panel"><div class="panel-h"><h2>On Top deals now <small>first {len(fresh_now())} cards</small></h2><a href="fresh.html" target="_blank" rel="noopener">Open Top deals <i data-lucide="external-link"></i></a></div><ol class="tlist fresh-now">{fr}</ol></section>
          <section class="panel"><div class="panel-h"><h2>Pinned on Top deals</h2><a href="admin-pinned.html">Pinned board <i data-lucide="chevron-right"></i></a></div>
            <p class="pin-sum"><b>{len(pinned)}</b> pinned deals, one every <b>{PIN_EVERY}</b> cards: cards {", ".join(str(PIN_EVERY * (i + 1)) for i in range(min(4, len(pinned))))}{" … " + str(PIN_EVERY * len(pinned)) if len(pinned) > 4 else ""}.</p>
            <ul class="tlist">{"".join(f'<li><span class="fn-pos">{i + 1}</span><img src="{dimg(d)}" alt="" loading="lazy"><span class="t-title">{E(d["t"])}</span><span class="t-meta">card {PIN_EVERY * (i + 1)}</span></li>' for i, d in enumerate(pinned[:5]))}</ul></section>
        </div>'''

def build_overview():
    today = [d for d in deals if d['agemin'] <= 1440]
    latest = sorted(deals, key=lambda d: d['agemin'])[:5]
    kpis = [
        ('Posted today', len(today), 'admin-deals.html?posted=today', 'View deals'),
        ('Incoming', A_INCOMING_COUNT, 'admin-incoming.html', 'Review'),
        ('Alerts sent today', 2, 'admin-alerts.html', 'Alerts'),
        ('Inbox unhandled', A_INBOX_COUNT, 'admin-inbox.html', 'Open inbox'),
        ('Pinned on Top deals', len(A_PIN), 'admin-pinned.html', 'Pinned board'),
    ]
    k = ''.join(f'<a class="kpi" href="{h}"><span class="kpi-l">{l}</span><b class="kpi-n"{" data-count=incoming" if l == "Incoming" else ""}>{v}</b><span class="kpi-a">{a} <i data-lucide="arrow-right"></i></span></a>' for l, v, h, a in kpis)
    rows = ''.join(f'<li><span class="t-time">{d["agetxt"]}</span><img src="{dimg(d)}" alt="" loading="lazy"><a class="t-title" href="{d["page"]}" target="_blank" rel="noopener">{E(d["t"])}</a><span class="t-meta">{E(d["store"])}</span>{types_html(d["types"][:1] if d["types"][0] != "Fresh" else d["types"][1:2])}<span class="pill pill-live">Live</span></li>' for d in latest)
    shares = [(latest[0], [('Facebook', 1), ('Threads', 0)]), (latest[1], [('Facebook', 1), ('Pinterest', 1)]), (latest[2], [('Threads', 1)]), (latest[3], [('Facebook', 1)]), (latest[4], [('Pinterest', 0)])]
    srows = ''.join(f'<li><span class="t-time">{d["agetxt"]}</span><span class="t-title">{E(d["t"])}</span><span class="share-res">{"".join(f"<span class={chr(34)}{"ok" if ok else "bad"}{chr(34)}><i data-lucide={chr(34)}{"check" if ok else "x"}{chr(34)}></i>{p}</span>" for p, ok in r)}</span></li>' for d, r in shares)
    body = f'''      <div class="page-h">
        <div><h1>Overview</h1><p>{TODAY.strftime("%A %-d %b")} · today so far</p></div>
        <div class="page-h-acts"><a class="btn btn-outline" href="admin-incoming.html"><i data-lucide="inbox"></i>Review incoming <span class="adm-count" data-count="incoming">{A_INCOMING_COUNT}</span></a></div>
      </div>
      <div class="sub-note" data-role="sub"><i data-lucide="info"></i><p>Sub-admins don't see Overview. They start on <a href="admin-deals.html?role=sub">All deals</a>.</p></div>
      <div data-role="admin">
        <div class="kpis">{k}</div>
        {attention_html()}
        <div class="two-col">
          <section class="panel"><div class="panel-h"><h2>Latest live deals</h2><a href="admin-deals.html">All deals <i data-lucide="chevron-right"></i></a></div><ul class="tlist">{rows}</ul></section>
          <section class="panel"><div class="panel-h"><h2>Recent shares</h2><span class="tag-sample">Sample</span></div><ul class="tlist">{srows}</ul></section>
        </div>
      </div>'''
    shell('admin.html', 'Overview', 'overview', body)

# ---------- Incoming deals (admin-deals §1; SAMPLE rows per data sheet) ----------
INC = [  # (deal index in snapshot, source, received, hold, overrides)
    (20, 'telegram', '2 min ago', None, {}),
    (0, 'telegram', '9 min ago', None, {}),
    (27, 'form', '14 min ago', 'mrp', {'m': None}),
    (33, 'telegram', '38 min ago', 'missing', {'cat': None}),
    (8, 'form', '1 h ago', 'mrp', {'m': 'low'}),
]
FEATURED = dict(price=10000, pct=70, cap=5)  # M-07 (D-106): Site & app → Featured deals; price = the meeting's ₹10,000 example, discount 70% (meeting example; separate from the Loot line, D-117)
SRC = {'telegram': ('Telegram', 'send'), 'form': ('Quick post', 'mouse-pointer-click')}   # D-155: no scraper
HOLD = {'similar': 'Similar deal posted today', 'mrp': 'Check MRP', 'missing': 'Category missing'}

def build_incoming():
    rows = []
    for idx, src, rec, hold, ov in INC:
        d = deals[idx]; p = d['p']
        m = d['m'] if 'm' not in ov else (None if ov['m'] is None else p - 1)
        cat = d['cat'] if 'cat' not in ov else None
        pct = round((m - p) / m * 100) if m and m > p else None
        ts = d['types'] if pct is not None else ['New']
        sl, si = SRC[src]
        flag = f'<span class="hold"><i data-lucide="triangle-alert"></i>{HOLD[hold]}' + (f' · <a href="{d["page"]}" target="_blank" rel="noopener">view</a>' if hold == 'similar' else '') + '</span>' if hold else ''
        why = [f'{inr(FEATURED["price"])}+' for _ in [0] if p >= FEATURED['price']] + [f'{FEATURED["pct"]}%+ off' for _ in [0] if pct is not None and pct >= FEATURED['pct']]
        mrp = f'MRP {inr(m)}' if m else '<span class="miss">MRP —</span>'
        pct_h = f'<b class="pct">{pct}% off</b>' if pct is not None else '<span class="miss">—%</span>'
        cat_h = E(cat) if cat else '<span class="miss">Category?</span>'
        rows.append(f'''        <article class="inc" data-inc data-missing="{"1" if hold == "missing" else ""}" data-pct="{pct or 0}" data-title="{E(d["t"])}">
          <label class="ck"><input type="checkbox" data-inc-check aria-label="Select {E(d["t"][:40])}"><span class="box"><i data-lucide="check"></i></span></label>
          <img class="inc-img" src="{dimg(d)}" alt="" loading="lazy">
          <div class="inc-body">
            <div class="inc-top"><span class="src src-{src}"><i data-lucide="{si}"></i>{sl}</span><span class="inc-time">received {rec}</span>{flag}</div>
            <h3>{E(d["t"])}</h3>
            <div class="inc-meta">{E(d["store"])} · {cat_h}</div>
            <div class="inc-price"><b>{inr(p)}</b> <span>{mrp}</span> {pct_h} <span class="inc-types">{types_html(ts)}</span></div>
          </div>
          <div class="inc-acts">
            <button class="btn btn-default btn-sm" type="button" data-approve>Approve</button>
            <a class="btn btn-outline btn-sm" href="admin-post.html?id={d['id']}">Edit</a>
            <button class="btn btn-ghost btn-sm" type="button" data-reject>Reject</button>
          </div>
        </article>''')
    body = f'''      <div class="page-h">
        <div><h1>Incoming deals</h1><p>Deals from Telegram and Quick post wait here until you approve them.</p></div>
      </div>
      <div class="inc-bar" data-inc-bar>
        <label class="ck"><input type="checkbox" data-inc-all aria-label="Select all"><span class="box"><i data-lucide="check"></i></span></label>
        <span data-inc-sel>Select all</span>
        <span class="inc-bar-acts" hidden data-inc-bulk><button class="btn btn-default btn-sm" type="button" data-bulk-approve>Approve</button><button class="btn btn-outline btn-sm" type="button" data-bulk-reject>Reject</button></span>
      </div>
      <div class="inc-list" data-panel="pending">
{chr(10).join(rows)}
      </div>
      <div class="inc-list" data-panel="approved" hidden><p class="empty">Nothing approved yet today.</p></div>
      <div class="inc-list" data-panel="rejected" hidden><p class="empty">Nothing rejected. Rejected deals stay here for 30 days.</p></div>
      <p class="foot-note"><i data-lucide="info"></i>Approve publishes now with the deal types shown. Deals at 90% off or more also send a push alert. A deal with no store or category opens Edit instead.</p>
      <div class="popover reject-pop" id="reject-pop" hidden data-state="closed" role="dialog" aria-label="Reject deal">
        <label class="field-label">Reason <span>optional, only admins see it</span><input class="input" type="text" data-reject-reason placeholder="e.g. Price already back up"></label>
        <div class="pop-acts"><button class="btn btn-ghost btn-sm" type="button" data-reject-cancel>Cancel</button><button class="btn btn-default btn-sm destructive" type="button" data-reject-go>Reject</button></div>
      </div>'''
    shell('admin-incoming.html', 'Incoming deals', 'incoming', body)

# ---------- All deals (admin-deals §2) ----------
SHOP_HOSTS = {'amazon': 'Amazon', 'amzn': 'Amazon', 'flipkart': 'Flipkart', 'fkrt': 'Flipkart', 'myntra': 'Myntra', 'ajio': 'Ajio', 'jiomart': 'Jiomart', 'bigbasket': 'BigBasket', 'meesho': 'Meesho', 'blinkit': 'Blinkit', 'swiggy': 'Swiggy', 'nykaa': 'Nykaa', 'tatacliq': 'Tata CLiQ'}
# D-148 views. SAMPLE: total = the public count (every view, repeats included); unique = each visitor once per deal (member id, else browser cookie or app install id);
# Buy clicks = taps on Buy through our link. The build phase records these; the prototype derives steady sample numbers from the deal id.
def adm_uniq(d):
    v = int(d.get('views') or 0); return round(v * (0.55 + (int(d['id']) % 23) / 100))
def adm_clicks(d):
    v = int(d.get('views') or 0); return round(v * (0.09 + (int(d['id']) % 11) / 100))
def adm_rows():  # one list for All deals, the post form, the pinned board and alerts (data sheets A and B)
    rows = []
    for i, d in enumerate(sorted(deals, key=lambda d: d['agemin'])):
        st = 'live'; when = d['agetxt']
        if i == 17: st = 'withdrawn'
        rows.append(dict(id=d['id'], t=d['t'], store=d['store'], cat=d['cat'], p=d['p'], m=d['m'], pct=int(d['pct']),
                         types=[t for t in d['types'] if t != 'Fresh'], status=st, pin=A_PIN.get(d['file']), age=d['agemin'] if st != 'scheduled' else -1,
                         when=when, views=d['views'], uniq=adm_uniq(d), clicks=adm_clicks(d), img=dimg(d), page=d['page'], link=d['link'], display=1,
                         caption=d['caption'], coupon=d['coupon'], terms=d['coupon_terms'], offers=d['offers'], note=d['note'], exc=d['step_exceptions'],
                         logo=store_logo(d['store']) or ''))
    return rows
ADM_ROWS = adm_rows()
def adm_data(): return json.dumps(ADM_ROWS, ensure_ascii=False).replace('</', '<\\/')

def build_deals():
    rows = ADM_ROWS
    sel = lambda name, label, opts: f'<label class="select tb-sel"><span class="visually-hidden">{label}</span><select data-f="{name}"><option value="">{label}</option>{"".join(f"<option value={chr(34)}{E(v)}{chr(34)}>{E(t)}</option>" for v, t in opts)}</select><i data-lucide="chevron-down"></i></label>'
    stores = sorted({r['store'] for r in rows}, key=lambda s: shop_by_name[s]['order'] if s in shop_by_name else 99)
    catsl = [c['name'] for c in CATS if any(r['cat'] == c['name'] for r in rows)]
    toolbar = ''.join([
        sel('status', 'Status', [('live', 'Live'), ('pending', 'Pending'), ('rejected', 'Rejected'), ('withdrawn', 'Withdrawn')]),
        sel('type', 'Type', [('Top', 'Top deal'), ('Loot', 'Loot'), ('New', 'New'), ('Pantry', 'Pantry')]),
        sel('store', 'Store', [(s, s) for s in stores]),
        sel('cat', 'Category', [(c, c) for c in catsl]),
        sel('pin', 'Pinned', [('yes', 'Pinned'), ('no', 'Not pinned')]),
        sel('display', 'Shows on', [('1', 'Web + App'), ('2', 'Web only'), ('3', 'App only')]),
        sel('posted', 'Posted', [('today', 'Today'), ('week', 'Last 7 days')]),
    ])
    cat_opts = ''.join(f'<option>{E(c["name"])}</option>' for c in CATS)
    store_opts = ''.join(f'<option>{E(s["name"])}</option>' for s in SHOPS)
    body = f'''      <div class="page-h">
        <div><h1>All deals</h1><p><span data-total>{CATALOGUE["all_total"]:,}</span> deals on the live site · this prototype holds the latest {len(rows)}</p></div>
      </div>
      <div class="toolbar">
        <label class="input-wrap tb-search"><i data-lucide="search"></i><span class="visually-hidden">Search deals</span><input class="input" type="search" placeholder="Title or link" data-f="q"></label>
        <button class="btn btn-outline tb-more" type="button" data-filters-toggle aria-expanded="false"><i data-lucide="sliders-horizontal"></i>Filters</button>
        <div class="tb-sels" data-filters>{toolbar}</div>
      </div>
      <div class="chips-row"><div class="chips" data-chips></div><span class="count" data-count-line></span>
        <label class="select per"><span class="visually-hidden">Rows per page</span><select data-per><option>25</option><option>50</option><option>100</option></select><i data-lucide="chevron-down"></i></label></div>
      <div class="tbl-wrap">
        <table class="tbl" data-tbl>
          <thead><tr>
            <th class="c-ck"><label class="ck"><input type="checkbox" data-all aria-label="Select all on this page"><span class="box"><i data-lucide="check"></i></span></label></th>
            <th class="c-deal">Deal</th><th>Store</th>
            <th class="num"><button type="button" data-sort="p">Price</button></th>
            <th class="num"><button type="button" data-sort="pct">Off</button></th>
            <th>Type</th><th><button type="button" data-sort="status">Status</button></th><th class="num">Pin</th>
            <th><button type="button" data-sort="age" aria-sort="ascending">Posted</button></th>
            <th class="num"><button type="button" data-sort="uniq" title="Each visitor counted once per deal">Unique views</button></th><th class="c-act"><span class="visually-hidden">Actions</span></th>
          </tr></thead>
          <tbody data-rows></tbody>
        </table>
        <p class="empty" data-empty hidden>No deals match these filters. <button class="btn-link" type="button" data-clear>Clear all</button></p>
      </div>
      <nav class="pager" data-pager aria-label="Pages"></nav>

      <div class="bulkbar" data-bulkbar hidden role="region" aria-label="Bulk actions">
        <b data-bulk-n>0 selected</b>
        <button class="btn btn-outline btn-sm" type="button" data-bulk="edit"><i data-lucide="pencil"></i>Edit…</button>
        <button class="btn btn-outline btn-sm" type="button" data-bulk="bump"><i data-lucide="arrow-up-to-line"></i>Bump to top</button>
        <button class="btn btn-outline btn-sm" type="button" data-bulk="wa"><i data-lucide="copy"></i>Copy for WhatsApp</button>
        <button class="btn btn-outline btn-sm" type="button" data-bulk="share"><i data-lucide="share-2"></i>Share to…</button>
        <div class="dropdown align-start up"><button class="btn btn-outline btn-sm" type="button" data-menu-trigger aria-haspopup="menu" aria-expanded="false">Change status<i data-lucide="chevron-up"></i></button>
          <div class="menu" role="menu" hidden data-state="closed"><button role="menuitem" type="button" data-bulk="st-live">Live</button><button role="menuitem" type="button" data-bulk="st-withdrawn">Withdrawn</button><button role="menuitem" type="button" data-bulk="st-rejected">Rejected</button></div></div>
        <button class="btn btn-outline btn-sm danger" type="button" data-bulk="delete"><i data-lucide="trash-2"></i>Delete</button>
        <button class="btn btn-ghost btn-icon btn-sm" type="button" data-bulk="clear" aria-label="Clear selection"><i data-lucide="x"></i></button>
      </div>

      <div class="menu row-menu" id="row-menu" role="menu" hidden data-state="closed">
        <a role="menuitem" href="{'admin-post.html'}" data-act="edit"><i data-lucide="pencil"></i>Edit</a>
        <a role="menuitem" href="{'admin-post.html'}" data-act="clone"><i data-lucide="copy-plus"></i>Clone</a>
        <button role="menuitem" type="button" data-act="wa"><i data-lucide="message-circle"></i>Copy for WhatsApp</button>
        <button role="menuitem" type="button" data-act="link"><i data-lucide="link"></i>Copy buy link</button>
        <a role="menuitem" href="admin-post.html" data-act="share"><i data-lucide="share-2"></i>Share…</a>
        <button role="menuitem" type="button" data-act="bump"><i data-lucide="arrow-up-to-line"></i>Bump to top</button>
        <button role="menuitem" type="button" data-act="pin"><i data-lucide="pin"></i><span data-pin-label>Pin</span></button>
        <a role="menuitem" href="admin-alerts.html" data-act="push"><i data-lucide="bell-ring"></i>Send push</a>
        <a role="menuitem" href="#" data-act="open" target="_blank" rel="noopener"><i data-lucide="external-link"></i>Open public page</a>
        <div class="separator"></div>
        <div class="menu-label">Change status</div>
        <button role="menuitemradio" type="button" data-act="st-live">Live</button>
        <button role="menuitemradio" type="button" data-act="st-withdrawn">Withdrawn</button>
        <button role="menuitemradio" type="button" data-act="st-rejected">Rejected</button>
        <div class="separator"></div>
        <button role="menuitem" type="button" data-act="delete" class="danger"><i data-lucide="trash-2"></i>Delete</button>
      </div>

      <div class="sheet-overlay" data-overlay hidden data-state="closed"></div>
      <aside class="sheet sheet-right" id="bulk-edit" hidden data-state="closed" role="dialog" aria-modal="true" aria-labelledby="be-title">
        <div class="sheet-header"><div class="sheet-title" id="be-title">Edit <span data-be-n>0</span> deals</div><p class="sheet-desc">Only ticked fields change.</p></div>
        <button class="sheet-close" type="button" data-close aria-label="Close"><i data-lucide="x"></i></button>
        <div class="sheet-body be">
          <div class="be-row"><label class="ck"><input type="checkbox" data-be="status"><span class="box"><i data-lucide="check"></i></span></label><span>Status</span><label class="select"><select data-bev="status"><option value="live">Live</option><option value="withdrawn">Withdrawn</option><option value="rejected">Rejected</option></select><i data-lucide="chevron-down"></i></label></div>
          <div class="be-row"><label class="ck"><input type="checkbox" data-be="types"><span class="box"><i data-lucide="check"></i></span></label><span>Deal types</span><div class="be-types" data-bev="types"><button type="button" aria-pressed="false" value="Top">Top deal</button><button type="button" aria-pressed="false" value="Loot">Loot</button><button type="button" aria-pressed="false" value="New">New</button><button type="button" aria-pressed="false" value="Pantry">Pantry</button></div></div>
          <div class="be-row"><label class="ck"><input type="checkbox" data-be="cat"><span class="box"><i data-lucide="check"></i></span></label><span>Category</span><label class="select"><select data-bev="cat">{cat_opts}</select><i data-lucide="chevron-down"></i></label></div>
          <div class="be-row"><label class="ck"><input type="checkbox" data-be="store"><span class="box"><i data-lucide="check"></i></span></label><span>Store</span><label class="select"><select data-bev="store">{store_opts}</select><i data-lucide="chevron-down"></i></label></div>
          <div class="be-row"><label class="ck"><input type="checkbox" data-be="display"><span class="box"><i data-lucide="check"></i></span></label><span>Shows on</span><label class="select"><select data-bev="display"><option value="1">Web + App</option><option value="2">Web only</option><option value="3">App only</option></select><i data-lucide="chevron-down"></i></label></div>
          <div class="be-row"><label class="ck"><input type="checkbox" data-be="unpin"><span class="box"><i data-lucide="check"></i></span></label><span>Unpin</span><small>Pinning picks a slot on the Pinned board</small></div>
          <div class="be-row"><label class="ck"><input type="checkbox" data-be="push"><span class="box"><i data-lucide="check"></i></span></label><span>Send push</span><small>One alert per deal to all subscribers</small></div>
        </div>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-be-apply>Apply to <span data-be-n>0</span> deals</button></div>
      </aside>

      <aside class="sheet dialog" id="bulk-share" hidden data-state="closed" role="dialog" aria-modal="true" aria-labelledby="bs-title">
        <div class="sheet-header"><div class="sheet-title" id="bs-title">Share <span data-bs-n>0</span> deals</div><p class="sheet-desc">Each deal is posted with the saved format for that platform (<a href="admin-social.html?tab=formats">Formats</a>). Nothing posts on its own.</p></div>
        <div class="sheet-body bs">
          {ck('data-bs-ch="fb" checked', 'Facebook Page <small>OfferTag.in</small>')}
          {ck('data-bs-ch="pin" checked', 'Pinterest <small>Loot deals board</small>')}
          {ck('data-bs-ch="th" disabled', 'Threads <small>not connected · <a href="admin-social.html">Connect</a></small>')}
          <p class="hint-line" data-bs-skip hidden><i data-lucide="info"></i><span></span></p>
        </div>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-bs-go><i data-lucide="send"></i>Share now</button></div>
      </aside>
      <aside class="sheet dialog" id="confirm" hidden data-state="closed" role="alertdialog" aria-modal="true" aria-labelledby="cf-title" aria-describedby="cf-desc">
        <div class="sheet-header"><div class="sheet-title" id="cf-title"></div><p class="sheet-desc" id="cf-desc"></p></div>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-confirm-go></button></div>
      </aside>'''
    shell('admin-deals.html', 'All deals', 'all', body, scripts=f'<script>window.ADM_DEALS = {adm_data()};</script>\n')

# ---------- Placeholder for screens in later batches ----------
def build_soon():
    body = '''      <div class="soon">
        <i data-lucide="hammer"></i>
        <h1 data-soon-title>This screen</h1>
        <p>This screen is built in a later batch (S16–S19). Its design is already agreed in <code>design-system/screens/</code>.</p>
        <div class="page-h-acts"><a class="btn btn-outline" href="admin-deals.html">All deals</a><a class="btn btn-default" href="admin-incoming.html">Incoming deals</a></div>
      </div>'''
    shell('admin-soon.html', 'Coming next', None, body)


# =================== Batch B (data sheet admin-batch-b.md) ===================
def _opts(items, sel=None): return ''.join(f'<option{" selected" if v == sel else ""}>{E(v)}</option>' for v in items)
def ck(attr, label, checked=False, extra=''): return f'<label class="ckl"{extra}><span class="ck"><input type="checkbox" {attr}{" checked" if checked else ""}><span class="box"><i data-lucide="check"></i></span></span><span>{label}</span></label>'
def _sel(attr, opts_html, cls=''): return f'<label class="select {cls}"><select {attr}>{opts_html}</select><i data-lucide="chevron-down"></i></label>'

# ---------- Post / edit deal (admin-deals §3, contract §1) ----------
def build_post():
    blocks = [  # optional contract blocks: key, label, kind, limit, placeholder
        ('offers', 'Offer details', 'lines', 4, '10% instant discount with HDFC Bank cards'),
        ('highlights', 'Highlights', 'lines', 6, 'One line per highlight'),
        ('links', 'Links', 'pairs', 20, 'Label|https://…'),
        ('note', 'Note', 'one', 1, 'e.g. Price shows after adding to cart'),
        ('specs', 'Specs', 'pairs', 12, 'Label|Value'),
    ]
    bl = ''.join(f'''<div class="blk" data-blk="{k}" data-kind="{kind}" data-max="{mx}" hidden>
            <div class="blk-h"><b>{lab}</b><small>{"up to " + str(mx) + (" rows" if kind == "pairs" else " lines") if kind != "one" else "one line, up to 140 characters"}</small><button type="button" class="btn btn-ghost btn-icon btn-sm" data-blk-remove aria-label="Remove {lab}"><i data-lucide="x"></i></button></div>
            <div class="blk-rows" data-rows-for="{k}"></div>
            {f'<button type="button" class="btn-link add-row" data-add-row>+ Add a row</button>' if kind != 'one' else ''}
            <template data-ph>{E(ph)}</template>
          </div>''' for k, lab, kind, mx, ph in blocks)
    adds = ''.join(f'<button type="button" class="chip-add" data-blk-add="{k}">+ {lab}</button>' for k, lab, *_ in blocks)
    steps = ''.join(f'<li>{E(x)}</li>' for x in SHOP_STEPS['*'])
    body = f'''      <a class="back" href="admin-deals.html"><i data-lucide="chevron-left"></i>All deals</a>
      <div class="page-h">
        <div><h1 data-form-title>Post a deal</h1><p data-form-sub>Paste the store link. Fields marked * are needed to publish.</p></div>
      </div>
      <div class="post" data-post>
        <form class="post-form panel" novalidate data-form>
          <div class="sec">
            <label class="fld"><span class="lab">Deal link *</span><input class="input" type="url" name="link" placeholder="https://amzn.in/d/…" data-req autocomplete="off"><span class="err" hidden></span></label>
            {ck('name="clean"', 'Clean URL <small>remove everything after “?” (store tags are removed anyway)</small>')}
            <p class="warn" data-dup hidden><i data-lucide="triangle-alert"></i><span>A similar deal was posted today.</span> <a href="#" target="_blank" rel="noopener" data-dup-link>View it</a></p>
          </div>
          <div class="sec img-sec">
            <span class="lab">Image *</span>
            <div class="img-row"><div class="img-well" data-img-well><i data-lucide="image"></i><img alt="" hidden data-img></div>
              <div class="img-acts"><button type="button" class="btn btn-outline btn-sm" data-img-fetch><i data-lucide="refresh-cw"></i>Fetch from link</button><label class="btn btn-outline btn-sm"><i data-lucide="upload"></i>Upload<input type="file" accept="image/*" hidden data-img-file></label><small>Kept up to 1200 px. JPG, PNG or WebP.</small></div></div>
            <span class="err" data-img-err hidden>Add an image: fetch it from the link or upload one.</span>
          </div>
          <div class="sec">
            <label class="fld"><span class="lab">Title *</span><input class="input" type="text" name="title" maxlength="200" data-req placeholder="Product name as the store shows it"><span class="err" hidden></span></label>
            <div class="grid2">
              <label class="fld"><span class="lab">Store *</span>{_sel('name="store" data-req', '<option value="">Choose…</option>' + _opts([x['name'] for x in SHOPS]))}<small class="hint" data-store-hint hidden>Picked from the link</small><span class="err" hidden></span></label>
              <label class="fld"><span class="lab">Category</span>{_sel('name="cat"', _opts([c['name'] for c in CATS], 'Others'))}</label>
            </div>
            <div class="grid3">
              <label class="fld"><span class="lab">Price ₹ *</span><input class="input num" type="text" inputmode="numeric" name="p" data-req placeholder="0 for a sale post"><span class="err" hidden></span></label>
              <label class="fld"><span class="lab">MRP ₹</span><input class="input num" type="text" inputmode="numeric" name="m"><span class="err" hidden></span></label>
              <label class="fld"><span class="lab">Off</span><span class="input-suffix"><input class="input num" type="text" inputmode="numeric" name="pct" readonly tabindex="-1"><span>%</span></span></label>
            </div>
            <div class="fld"><span class="lab">Deal types <small>set from the discount, change if needed</small></span>
              <div class="tpick" data-types><button type="button" value="Top" aria-pressed="false">Top deal</button><button type="button" value="Loot" aria-pressed="false">Loot</button><button type="button" value="New" aria-pressed="false">New</button><button type="button" value="Pantry" aria-pressed="false">Pantry</button></div></div>
          </div>
          <div class="sec">
            <div class="grid3 g-cap">
              <label class="fld"><span class="lab">Caption <small>≤ 40</small></span><input class="input" type="text" name="caption" maxlength="40" placeholder="e.g. Lowest ever"></label>
              <label class="fld"><span class="lab">Coupon <small>≤ 20</small></span><input class="input upper" type="text" name="coupon" maxlength="20" placeholder="SAVE20"></label>
              <label class="fld"><span class="lab">Coupon terms <small>≤ 80</small></span><input class="input" type="text" name="terms" maxlength="80" placeholder="On orders above ₹999"></label>
            </div>
            {bl}
            <div class="adds" data-adds><span class="lab">Add</span>{adds}</div>
            <div class="fld"><span class="lab">Description</span>
              <div class="rte"><div class="rte-bar" role="toolbar" aria-label="Formatting"><button type="button" data-cmd="bold" aria-label="Bold"><i data-lucide="bold"></i></button><button type="button" data-cmd="italic" aria-label="Italic"><i data-lucide="italic"></i></button><button type="button" data-cmd="insertUnorderedList" aria-label="Bulleted list"><i data-lucide="list"></i></button><button type="button" data-cmd="insertOrderedList" aria-label="Numbered list"><i data-lucide="list-ordered"></i></button><button type="button" data-cmd="createLink" aria-label="Link"><i data-lucide="link"></i></button></div>
              <div class="rte-body" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Description" data-desc></div></div></div>
            <div class="fld"><span class="lab">How to get it</span>
              <details class="steps"><summary>Store default steps (<span data-steps-n>{len(SHOP_STEPS['*'])}</span>) <small>from Catalogue → Shops</small></summary><ol>{steps}</ol></details>
              <div class="blk-rows" data-exc></div><button type="button" class="btn-link add-row" data-add-exc>+ Add an extra step (shown first)</button></div>
          </div>
          <div class="sec">
            <div class="grid3">
              <label class="fld"><span class="lab">Shows on</span>{_sel('name="display"', '<option value="1">Web + App</option><option value="2">Web only</option><option value="3">App only</option>')}</label>
              <div class="fld"><span class="lab">Pinned</span><div class="pinrow">{ck('name="pin"', 'Pin')}{_sel('name="slot" aria-label="Slot"', ''.join(f'<option value="{x}">Slot {x}{" (next free)" if x == len(A_PIN) + 1 else ""}</option>' for x in range(1, len(A_PIN) + 2)))}</div></div>
              <div class="fld"><span class="lab">Push alert</span>{ck('name="notify"', 'Send push <small data-notify-hint>auto at 90% off</small>')}</div>
            </div>
            <div class="fld" hidden><span class="lab">Publish</span>   <!-- D-155: deals publish at once, no scheduling; kept hidden on "Now" for the form script -->
              <div class="pubrow"><label class="rad"><input type="radio" name="when" value="now" checked><span></span>Now</label><label class="rad"><input type="radio" name="when" value="later"><span></span>Schedule</label><input class="input" type="datetime-local" name="at" value="2026-11-14T09:00" disabled aria-label="Publish at"></div></div>
          </div>
          <div class="form-foot" data-foot>
            <button class="btn btn-default btn-lg" type="submit" data-submit>Publish</button>
            <button class="btn btn-outline" type="button" data-edit-only hidden data-bump><i data-lucide="arrow-up-to-line"></i>Bump to top</button>
            <span class="saved" data-saved>Draft saved on this device</span>
            <button class="btn btn-ghost danger" type="button" data-edit-only hidden data-del><i data-lucide="trash-2"></i>Delete</button>
          </div>
        </form>

        <aside class="post-side">
          <details class="panel side-sec" open data-preview-wrap><summary class="panel-h"><h2>Preview</h2><span class="seg" role="radiogroup" aria-label="Card size"><button type="button" aria-pressed="true" data-dens="c">Comfortable</button><button type="button" aria-pressed="false" data-dens="k">Compact</button></span></summary>
            <div class="pv-wrap"><article class="pv" data-pv>
              <div class="pv-img"><img alt="" data-pv-img hidden><span class="pv-cap" data-pv-cap hidden></span><span class="pv-pct" data-pv-pct hidden></span></div>
              <div class="pv-body"><div class="pv-store" data-pv-store>now</div><div class="pv-title" data-pv-title>Deal title shows here</div>
                <div class="pv-price"><b data-pv-p>₹—</b><s data-pv-m></s></div>
                <div class="pv-coupon" data-pv-coupon hidden></div>
                <div class="pv-foot"><span class="pv-save" data-pv-save></span><span class="pv-chip" data-pv-chip></span></div>
                <span class="pv-buy">Buy now<i data-lucide="arrow-up-right"></i></span></div>
            </article></div>
            <a class="side-link" href="#" target="_blank" rel="noopener" data-edit-only hidden data-open-page>Open public page <i data-lucide="external-link"></i></a>
          </details>
          <section class="panel side-sec vstats-sec" data-edit-only hidden><div class="panel-h"><h2>Views</h2><span class="tag-sample">Sample</span></div>
            <dl class="vstats">
              <div class="is-main"><dt>Unique visitors</dt><dd data-v-uniq>0</dd></div>
              <div><dt>Total views</dt><dd data-v-total>0</dd></div>
              <div><dt>Buy clicks</dt><dd data-v-clicks>0</dd></div>
            </dl>
            <p class="vstats-note">Unique counts each visitor once per deal: a member, or one browser or app. Total counts every view and is the number on the public page.</p></section>
          <section class="panel side-sec" id="share" data-edit-only hidden><div class="panel-h"><h2>Share</h2><small>Nothing is shared on its own</small></div>
            <div class="share">
              {ck('data-ch="fb" checked', 'Facebook Page')}{ck('data-ch="pin"', 'Pinterest')}{ck('data-ch="th" checked', 'Threads')}
              <label class="fld"><span class="lab">Preview for</span>{_sel('data-share-for', '<option value="fb">Facebook Page</option><option value="pin">Pinterest</option><option value="th">Threads</option>')}</label>
              <div class="share-pv" data-share-pv></div>
              <button class="btn btn-default btn-block" type="button" data-share-now>Share now</button>
            </div></section>
          <section class="panel side-sec" data-edit-only hidden><div class="panel-h"><h2>Share history</h2><span class="tag-sample">Sample</span></div>
            <ul class="tlist hist" data-hist>
              <li><span class="t-title">Threads</span><span class="t-meta">2 h ago</span><span class="ok-t"><i data-lucide="check"></i>Posted</span><a class="side-a" href="#" aria-label="View on Threads">View</a></li>
              <li><span class="t-title">Facebook Page</span><span class="t-meta">2 h ago</span><span class="bad-t"><i data-lucide="x"></i>Failed</span><button class="side-a" type="button" data-retry>Retry</button></li>
            </ul></section>
        </aside>
      </div>

      <section class="done panel" data-done hidden tabindex="-1">
        <i data-lucide="circle-check"></i>
        <h2 data-done-title>Deal is live</h2>
        <p data-done-sub>It’s at the top of Top deals and in its type lists.</p>
        <div class="done-links">
          <label class="fld"><span class="lab">Public page</span><span class="copyrow"><input class="input" readonly data-done-page><a class="btn btn-outline btn-sm" href="#" target="_blank" rel="noopener" data-done-open>Open</a></span></label>
          <label class="fld"><span class="lab">Short link</span><span class="copyrow"><input class="input" readonly data-done-short><button class="btn btn-outline btn-sm" type="button" data-copy-short>Copy</button></span></label>
        </div>
        <div class="page-h-acts"><button class="btn btn-outline" type="button" data-copy-wa><i data-lucide="message-circle"></i>Copy for WhatsApp</button><a class="btn btn-outline" href="admin-post.html" data-done-share><i data-lucide="share-2"></i>Share to…</a><a class="btn btn-default" href="admin-post.html" data-another><i data-lucide="plus"></i>Post another</a></div>
      </section>

      <div class="sticky-pub" data-sticky><button class="btn btn-default btn-block btn-lg" type="button" data-submit-proxy>Publish</button></div>
      <div class="sheet-overlay" data-overlay hidden data-state="closed"></div>
      <aside class="sheet dialog" id="confirm" hidden data-state="closed" role="alertdialog" aria-modal="true" aria-labelledby="cf-title" aria-describedby="cf-desc">
        <div class="sheet-header"><div class="sheet-title" id="cf-title"></div><p class="sheet-desc" id="cf-desc"></p></div>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-confirm-go></button></div>
      </aside>'''
    cfg = json.dumps(dict(hosts=SHOP_HOSTS, steps=SHOP_STEPS['*'], logos={x['name']: store_logo(x['name']) or '' for x in SHOPS}), ensure_ascii=False)
    shell('admin-post.html', 'Post a deal', 'post', body, scripts=f'<script>window.ADM_DEALS = {adm_data()}; window.ADM_CFG = {cfg};</script>\n')

# ---------- Pinned board (admin-pinned-blog §1) ----------
def build_pinned():
    pins = sorted([r for r in ADM_ROWS if r['pin']], key=lambda r: r['pin'])
    ages = ['2 h', '5 h', '1 d', '1 d', '2 d', '3 d', '4 d', '5 d']   # SAMPLE (data sheet B)
    data = [dict(id=r['id'], age=ages[i % len(ages)]) for i, r in enumerate(pins)]
    gaps = ''.join(f'<option value="{n}"{" selected" if n == PIN_EVERY else ""}>{n}</option>' for n in range(2, 11))
    body = f'''      <div class="page-h">
        <div><h1>Pinned board</h1><p>Pinned deals show on the Top deals page only, in a repeating slot every few cards, all the way down the feed. Slot 1 is the first pinned spot, slot 2 the next, and so on. <span class="desk-only">Drag a card to change the order; dropping on another card swaps the two.</span><span class="phone-only">Change the order with the slot menu on each card; picking a filled slot swaps the two.</span> When pinned deals run out, the rest of the slots show normal fresh deals.</p></div>
        <div class="page-h-acts"><a class="btn btn-outline" href="fresh.html" target="_blank" rel="noopener"><i data-lucide="external-link"></i>Preview on Top deals</a></div>
      </div>
      <section class="panel pin-gap">
        <label class="pin-gap-f"><span>Show a pinned deal every</span><span class="select"><select data-pin-every aria-label="Cards between pinned deals">{gaps}</select><i data-lucide="chevron-down"></i></span><span>cards on Top deals</span></label>
        <p class="pin-gap-h" data-pin-gap-h></p>
      </section>
      <div class="slots" data-slots role="list"></div>
      <p class="foot-note"><i data-lucide="keyboard"></i>Keyboard: focus a card, press Space to pick it up, arrow keys to move, Space to drop. On a phone, use the slot menu on each card.</p>
      <div class="popover pick-pop" id="pick-pop" hidden data-state="closed" role="dialog" aria-label="Pin a deal">
        <label class="input-wrap"><i data-lucide="search"></i><input class="input" type="search" placeholder="Search title or paste link" data-pick-q aria-label="Search deals"></label>
        <ul class="pick-list" data-pick-list role="listbox"></ul>
      </div>'''
    shell('admin-pinned.html', 'Pinned board', 'pinned', body, scripts=f'<script>window.ADM_DEALS = {adm_data()}; window.ADM_PINS = {json.dumps(dict(every=PIN_EVERY, pins=data))};</script>\n')

# ---------- Alerts (admin-tools §1) ----------
def build_alerts():
    h = ADM_ROWS
    hist = [  # SAMPLE history (data sheet B)
        ('Today', '14:02', f'{h[1]["pct"]}% off {h[1]["t"][:48]}', 'ok', 'ok'),
        ('Today', '11:40', f'{h[6]["pct"]}% off {h[6]["t"][:48]}', 'ok', 'bad'),
        ('Yesterday', '21:15', 'Big Billion Days is live: today’s top loot deals', 'ok', 'ok'),
        ('Yesterday', '09:30', f'{h[9]["pct"]}% off {h[9]["t"][:48]}', 'ok', 'ok'),
    ]
    rows, last = '', None
    for day, tm, txt, w, a in hist:
        if day != last: rows += f'<li class="day">{day}</li>'; last = day
        res = lambda ok, lab: f'<span class="{"ok" if ok == "ok" else "bad"}"><i data-lucide="{"check" if ok == "ok" else "x"}"></i>{lab}</span>'
        act = '<button class="btn btn-ghost btn-sm" type="button" data-retry>Retry app</button>' if a == 'bad' else '<button class="btn btn-ghost btn-sm" type="button" data-resend>Resend</button>'
        rows += f'<li><span class="t-time">{tm}</span><span class="t-title">{E(txt)}</span><span class="share-res">{res(w, "Web")}{res(a, "App")}</span>{act}</li>'
    body = f'''      <div class="page-h"><div><h1>Alerts</h1><p>A push alert goes to everyone who turned on alerts on the website or in the app. Deals at 90% off or more send one on their own when published.</p></div></div>
      <div class="two-col al">
        <section class="panel"><div class="panel-h"><h2>New alert</h2></div>
          <form class="al-form" data-al-form novalidate>
            <div class="fld"><span class="lab">Deal or link</span>
              <div class="al-pick" data-al-pick><label class="input-wrap"><i data-lucide="search"></i><input class="input" type="search" placeholder="Search deals or paste a link" data-al-q autocomplete="off" aria-label="Search deals or paste a link"></label>
                <ul class="pick-list al-list" data-al-list hidden role="listbox"></ul></div>
              <div class="al-att" data-al-att hidden></div></div>
            <label class="fld"><span class="lab">Message *</span><textarea class="textarea" rows="3" maxlength="120" data-al-msg placeholder="e.g. 75% off boAt Airdopes, lowest price ever"></textarea><span class="cnt"><span data-al-n>0</span>/120</span><span class="err" hidden>Write a message.</span></label>
            <div class="fld"><span class="lab">Send to</span><div class="pinrow">{ck('data-al-web checked', 'Website <small>browser alerts</small>')}{ck('data-al-app checked', 'App')}</div><span class="err" data-al-to-err hidden>Pick at least one.</span></div>
            <button class="btn btn-default" type="submit"><i data-lucide="send"></i>Send alert</button>
          </form></section>
        <details class="panel al-pv" open data-fold-phone><summary class="panel-h"><h2>Preview <small>as a phone shows it</small></h2><i data-lucide="chevron-down"></i></summary>
          <div class="notif-wrap"><div class="notif"><div class="notif-h"><span class="notif-ico">OT</span><b>OfferTag</b><small>now</small></div><b class="notif-t" data-nt>Your message shows here</b><span class="notif-b" data-nb></span><img alt="" data-ni hidden></div></div></details>
      </div>
      <section class="panel sent"><div class="panel-h"><h2>Sent</h2><span class="tag-sample">Sample</span></div><ul class="tlist" data-al-hist>{rows}</ul></section>
      <div class="sheet-overlay" data-overlay hidden data-state="closed"></div>
      <aside class="sheet dialog" id="confirm" hidden data-state="closed" role="alertdialog" aria-modal="true" aria-labelledby="cf-title" aria-describedby="cf-desc">
        <div class="sheet-header"><div class="sheet-title" id="cf-title"></div><p class="sheet-desc" id="cf-desc"></p></div>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-confirm-go></button></div>
      </aside>'''
    shell('admin-alerts.html', 'Alerts', 'alerts', body, scripts=f'<script>window.ADM_DEALS = {adm_data()};</script>\n')

# ---------- Sale posters → owner posters in "Hot deals today" (D-113, DEV-031) ----------
def build_posters():
    # SAMPLE owner posters: kind "deal" features an existing deal, kind "custom" is the owner's own picture (any size), title, store, link and dates
    ps = [dict(id=1, kind='custom', title=x['title'], img=x['img'], store=x['store'], link='Flipkart store page', start='2026-11-10', end='2026-11-22', on=True) for x in TD_CUSTOM]
    ps += [dict(id=2, kind='deal', deal=d['id'], title=d['t'], img=td_img(d)[0], store=d['store'], link='Deal page', start='2026-11-12', end='2026-11-21', on=True) for d in TD_FEATURED]
    ps.append(dict(id=3, kind='custom', title='Republic Day sale: up to 70% off', img='assets/posters/festive.jpg', store='Amazon', link='Loot deals', start='2026-01-20', end='2026-01-26', on=True))
    deal_opts = [dict(id=d['id'], t=d['t'], img=td_img(d)[0], store=d['store'], price=inr(d['p']), pct=d['pct']) for d in by_views]
    shop_opts = ''.join(f'<option>{E(x["name"])}</option>' for x in SHOPS)
    body = f'''      <div class="page-h">
        <div><h1>Sale posters</h1><p>Your posters show first in <b>Hot deals today</b> at the top of Home, in this order, each as a card with a ★ Featured label. After them, the 10 most-viewed deals of the last 24 hours fill the row on their own. A poster shows only between its start and end dates and while it is on.</p></div>
        <div class="page-h-acts"><a class="btn btn-outline" href="index.html" target="_blank" rel="noopener"><i data-lucide="external-link"></i>See Home</a><button class="btn btn-default" type="button" data-poster-new><i data-lucide="plus"></i>Add poster</button></div>
      </div>
      <div class="tabs-list adm-tabs" role="tablist"><button class="tabs-trigger" role="tab" data-ptab="cur" data-state="active" aria-selected="true">Live and upcoming <span class="adm-count muted" data-pcount="cur"></span></button><button class="tabs-trigger" role="tab" data-ptab="past" aria-selected="false">Ended <span class="adm-count muted" data-pcount="past"></span></button></div>
      <ol class="posters" data-posters></ol>
      <p class="foot-note"><i data-lucide="info"></i>Feature a deal uses the deal’s own photo, price and link. A custom poster takes a picture of any size: it fills the card’s photo frame, so keep the main subject in the middle. Card colour and button colour come from the store.</p>
      <div class="sheet-overlay" data-overlay hidden data-state="closed"></div>
      <aside class="sheet sheet-right" id="poster-edit" hidden data-state="closed" role="dialog" aria-modal="true" aria-labelledby="pe-title">
        <div class="sheet-header"><div class="sheet-title" id="pe-title">Add poster</div><p class="sheet-desc">Shows first in Hot deals today between the dates you set.</p></div>
        <button class="sheet-close" type="button" data-close aria-label="Close"><i data-lucide="x"></i></button>
        <form class="sheet-body pe" data-pe novalidate>
          <div class="fld"><span class="lab">Poster type</span><div class="pe-kind" role="radiogroup" aria-label="Poster type"><label><input type="radio" name="kind" value="deal" checked><span>Feature a deal</span></label><label><input type="radio" name="kind" value="custom"><span>Custom poster</span></label></div></div>
          <div data-kind="deal">
            <label class="fld"><span class="lab">Deal *</span><select class="input" name="deal"><option value="">Choose a deal</option>{''.join(f'<option value="{o["id"]}">{E(o["t"][:70])} · {o["price"]} · {E(o["store"])}</option>' for o in deal_opts)}</select><span class="err" hidden>Choose a deal.</span></label>
            <p class="muted pe-hint">The card uses the deal’s photo, title, price and link.</p>
          </div>
          <div data-kind="custom" hidden>
            <div class="fld"><span class="lab">Picture * <small>any size</small></span><label class="drop wide" data-drop="d"><img alt="" hidden><span><i data-lucide="upload"></i>Choose image</span><input type="file" accept="image/*" hidden></label><span class="err" hidden>Add a picture.</span></div>
            <label class="fld"><span class="lab">Title *</span><input class="input" type="text" name="title" maxlength="70" placeholder="e.g. Big Billion Days: up to 80% off electronics"><span class="err" hidden>Add a title.</span></label>
            <label class="fld"><span class="lab">Store *</span><select class="input" name="store">{shop_opts}</select></label>
            <label class="fld"><span class="lab">Opens *</span><input class="input" type="text" name="link" placeholder="A store page, a category, a deal or a full link"><span class="err" hidden>Add where the poster leads.</span></label>
          </div>
          <div class="grid2"><label class="fld"><span class="lab">Start *</span><input class="input" type="date" name="start"></label><label class="fld"><span class="lab">End *</span><input class="input" type="date" name="end"><span class="err" hidden>End must be on or after the start.</span></label></div>
          {ck('name="on" checked', 'On')}
        </form>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-pe-save>Save poster</button></div>
      </aside>
      <aside class="sheet dialog" id="confirm" hidden data-state="closed" role="alertdialog" aria-modal="true" aria-labelledby="cf-title" aria-describedby="cf-desc">
        <div class="sheet-header"><div class="sheet-title" id="cf-title"></div><p class="sheet-desc" id="cf-desc"></p></div>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-confirm-go></button></div>
      </aside>'''
    shell('admin-posters.html', 'Sale posters', 'posters', body, scripts=f'<script>window.ADM_POSTERS = {json.dumps(ps, ensure_ascii=False)}; window.ADM_POSTER_DEALS = {json.dumps(deal_opts, ensure_ascii=False)}; window.ADM_TODAY = "{TODAY.isoformat()}";</script>\n')

build_overview(); build_incoming(); build_deals(); build_soon()
# ---------- Sponsored (DEV-030, D-108): paid ad cards on Home; views and clicks per ad for the advertiser's report ----------
def build_sponsored():
    # SAMPLE: advertisers are fictional; views/clicks stand in for the counts the build phase records (dev-requirements)
    sp = [dict(id=x['id'], adv=x['adv'], title=x['title'], line=x['line'], cta=x['cta'], link=x['href'].replace('#sponsored-', 'https://example.com/ad-'), img=f'assets/posters/{x["img"]}.jpg',
               start=x['start'], end=x['end'], on=x['on'], views=x['views'], clicks=x['clicks']) for x in SPONSORS]  # same records Home uses
    sp.append(dict(id=3, adv='FitZone Gym, Powai', title='FitZone: 3 months for the price of 2', line='Opening offer at our Powai branch.', cta='Join now', link='https://example.com/ad-3', img='assets/posters/festive.jpg', start='2026-10-01', end='2026-10-31', on=True, views=24980, clicks=511))
    body = f'''      <div class="page-h">
        <div><h1>Sponsored</h1><p>Paid ad cards from businesses. Desktop shows one at the top of Home's right panel; phones and tablets show it between Top deals and Shop by store. With more than one live, each visit shows one at random. Every card is labelled "Sponsored".</p></div>
        <div class="page-h-acts"><a class="btn btn-outline" href="index.html" target="_blank" rel="noopener"><i data-lucide="external-link"></i>See Home</a><button class="btn btn-default" type="button" data-sp-new><i data-lucide="plus"></i>Add sponsored ad</button></div>
      </div>
      <div class="sp-stats" data-sp-stats></div>
      <div class="tabs-list adm-tabs" role="tablist"><button class="tabs-trigger" role="tab" data-stab="cur" data-state="active" aria-selected="true">Live and upcoming <span class="adm-count muted" data-scount="cur"></span></button><button class="tabs-trigger" role="tab" data-stab="past" aria-selected="false">Ended <span class="adm-count muted" data-scount="past"></span></button></div>
      <ol class="posters sp-list" data-sp-list></ol>
      <p class="foot-note"><i data-lucide="info"></i>Ad image 600 × 500 px. Phone image 1200 × 400 px, optional; if you skip it, the ad image is cropped to fit. Views count each time the card is on screen; clicks count each visit to the advertiser's link. Sample numbers.</p>
      <div class="sheet-overlay" data-overlay hidden data-state="closed"></div>
      <aside class="sheet sheet-right" id="sp-edit" hidden data-state="closed" role="dialog" aria-modal="true" aria-labelledby="se-title">
        <div class="sheet-header"><div class="sheet-title" id="se-title">Add sponsored ad</div><p class="sheet-desc">Shows on Home between the dates you set, labelled "Sponsored".</p></div>
        <button class="sheet-close" type="button" data-close aria-label="Close"><i data-lucide="x"></i></button>
        <form class="sheet-body pe" data-se novalidate>
          <label class="fld"><span class="lab">Advertiser *</span><input class="input" type="text" name="adv" maxlength="60" placeholder="Business name, e.g. Sharma Electronics"><span class="err" hidden>Add the advertiser.</span></label>
          <div class="fld"><span class="lab">Ad image * <small>600 × 500</small></span><label class="drop sq" data-drop="d"><img alt="" hidden><span><i data-lucide="upload"></i>Choose image</span><input type="file" accept="image/*" hidden></label><span class="err" hidden>Add the ad image.</span></div>
          <div class="fld"><span class="lab">Phone image <small>1200 × 400, optional</small></span><label class="drop wide" data-drop="m"><img alt="" hidden><span><i data-lucide="upload"></i>Choose image</span><input type="file" accept="image/*" hidden></label></div>
          <label class="fld"><span class="lab">Title *</span><input class="input" type="text" name="title" maxlength="60" placeholder="e.g. Sharma Electronics: up to 40% off headphones"><span class="err" hidden>Add a title.</span></label>
          <label class="fld"><span class="lab">One line <small>optional</small></span><input class="input" type="text" name="line" maxlength="90" placeholder="e.g. Free delivery across Mumbai"></label>
          <div class="grid2"><label class="fld"><span class="lab">Button *</span><input class="input" type="text" name="cta" maxlength="16" value="Visit"><span class="err" hidden>Add button text.</span></label><label class="fld"><span class="lab">Opens *</span><input class="input" type="url" name="link" placeholder="https://"><span class="err" hidden>Add a full link starting with https://</span></label></div>
          <div class="grid2"><label class="fld"><span class="lab">Start *</span><input class="input" type="date" name="start"></label><label class="fld"><span class="lab">End *</span><input class="input" type="date" name="end"><span class="err" hidden>End must be on or after the start.</span></label></div>
          {ck('name="on" checked', 'On')}
        </form>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-se-save>Save ad</button></div>
      </aside>
      <aside class="sheet dialog" id="confirm" hidden data-state="closed" role="alertdialog" aria-modal="true" aria-labelledby="cf-title" aria-describedby="cf-desc">
        <div class="sheet-header"><div class="sheet-title" id="cf-title"></div><p class="sheet-desc" id="cf-desc"></p></div>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-confirm-go></button></div>
      </aside>'''
    shell('admin-sponsored.html', 'Sponsored', 'sponsored', body, scripts=f'<script>window.ADM_SPONSORED = {json.dumps(sp, ensure_ascii=False)}; window.ADM_TODAY = "{TODAY.isoformat()}";</script>\n')

build_post(); build_pinned(); build_alerts(); build_posters(); build_sponsored()
exec(open(os.path.join(HERE, 'admin_c.py')).read())
exec(open(os.path.join(HERE, 'admin_d.py')).read())
exec(open(os.path.join(HERE, 'admin_e.py')).read())
exec(open(os.path.join(HERE, 'admin_login.py')).read())
print('Admin: batch A (admin, admin-incoming, admin-deals) + batch B (admin-post, admin-pinned, admin-alerts, admin-posters, admin-sponsored) + admin-soon')
