# admin.py — admin panel pages (S16 batch A: shell, Overview, Incoming deals, All deals; D-098 look).
# Data sheet: design-system/ia/data-sheets/admin-batch-a.md (Law 15). Run by the last line of build.py in the same
# namespace, so it reuses the snapshot deals (types, stores, pinned set), the catalogue and the helpers there.
import datetime as _dt

TODAY = _dt.date(2026, 11, 13)
SAVEBAR = '      <div class="savebar" data-savebar hidden><span>Unsaved changes</span><button class="btn btn-ghost btn-sm" type="button" data-discard>Discard</button><button class="btn btn-default btn-sm" type="button" data-save>Save</button></div>'  # same bar as Settings; js saveBar() in admin.js
A_INBOX_COUNT = 1      # SAMPLE: open deletion requests only; feedback has no count (changes.md P-38)
# D-104: pinned slots are an open list (slot 1, 2, 3…); on Fresh, slot k sits at card k × PIN_EVERY (build.py, admin sets N)
A_PIN = {d['file']: i + 1 for i, d in enumerate(pinned)}  # the 8 SAMPLE pinned deals the public site uses, in slot order

def soon(label): return 'admin-soon.html?s=' + label.replace(' ', '+')

# Sidebar (D-160, replaces the D-057 tree): nine flat links, no sub-items, so the whole menu fits a laptop screen.
# Pages that belong together sit behind one link and share a row of section tabs (SECTIONS) above the page.
# role: 'all' = Super admin + Admin, 'admin' = Super admin only (changes.md A-13). Addresses are unchanged (Law 4); only the menu changes.
NAV = [
    ('overview', 'Overview', 'layout-dashboard', 'admin.html', 'all', None),
    ('deals', 'Deals', 'tag', 'admin-deals.html', 'all', None),
    ('promote', 'Sponsored', 'megaphone', 'admin-sponsored.html', 'admin', None),     # 2026-11-25 (changes.md A-06): sale posters gone; featured deals fill Home's hero
    ('alerts', 'Alerts', 'bell', 'admin-alerts.html', 'all', None),
    ('blog', 'Blog', 'newspaper', 'admin-blog.html', 'admin', None),
    ('inbox', 'Inbox', 'mail', 'admin-inbox.html?tab=feedback', 'admin', A_INBOX_COUNT),
    ('catalogue', 'Catalogue', 'library', 'admin-catalogue.html?tab=shops', 'admin', None),
    ('settings', 'Settings', 'settings', 'admin-site.html', 'admin', None),
]
# Section tabs: page key → (menu key, tabs). Tabs: (page key, label, href, role).
_SEC = {
    'deals': [('all', 'All deals', 'admin-deals.html', 'all'), ('pinned', 'Pinned board', 'admin-pinned.html', 'all')],
    'settings': [('site', 'Site & app', 'admin-site.html', 'admin'), ('tags', 'Affiliate tags', 'admin-tags.html', 'admin'), ('social', 'Social sharing', 'admin-social.html', 'admin'),
                 ('users', 'Users', 'admin-users.html', 'admin')],   # Roles merged into Users (changes.md A-13); P-60: Security tab hidden until backend and website are done
}
SECTION_OF = {k: sec for sec, tabs in _SEC.items() for k, *_ in tabs}
SECTION_OF.update({'post': 'deals', 'feedback': 'inbox', 'shops': 'catalogue', 'sponsored': 'promote'})   # Post a deal and the tabbed Inbox / Catalogue pages

def _badge(n, key): return f'<span class="adm-count" data-count="{key}">{n}</span>' if n else ''

def sidebar(active):
    on = SECTION_OF.get(active, active)
    out = []
    for key, label, icon, href, role, badge in NAV:
        r = f' data-role="{role}"' if role == 'admin' else ''
        cur = ' aria-current="page"' if key == on else ''
        out.append(f'<a class="adm-link" href="{href}"{r}{cur}><i data-lucide="{icon}"></i><span>{E(label)}</span>{_badge(badge, key)}</a>')
    return '\n'.join(out)

def section_tabs(active):  # links between the pages of one section; the page keeps its own heading below
    sec = SECTION_OF.get(active)
    tabs = _SEC.get(sec)
    if not tabs or active not in [k for k, *_ in tabs]: return ''   # Post / Edit keep their own back link instead
    label = next(l for k, l, *_ in NAV if k == sec)
    links = ''.join(f'<a href="{h}"{" data-role=" + chr(34) + "admin" + chr(34) if r == "admin" else ""}{" aria-current=" + chr(34) + "page" + chr(34) if k == active else ""}>{E(l)}</a>' for k, l, h, r in tabs)
    return f'      <nav class="sec-tabs" aria-label="{E(label)}">{links}</nav>\n'

def shell(fname, title, active, body, scripts='', after=''):
    page = f'''<!doctype html>
<html lang="en" class="admin" data-total-deals="{CATALOGUE['all_total']}">
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
    <div class="adm-brand"><a href="admin.html" aria-label="OfferTag admin home"><img src="assets/logo-crop.png" alt="OfferTag" width="1510" height="500"></a>
      <button class="btn btn-ghost btn-icon adm-close" type="button" data-side-close aria-label="Close menu"><i data-lucide="x"></i></button></div>
    <nav class="adm-nav">
{sidebar(active)}
    </nav>
    <div class="adm-side-foot">
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
        <button class="btn btn-ghost adm-user-btn" type="button" data-menu-trigger aria-haspopup="menu" aria-expanded="false"><span class="avatar">A</span><span class="adm-user-name"><b data-user-name>Adil</b><small data-role-label>Super admin</small></span><i data-lucide="chevron-down"></i></button>
        <div class="menu" role="menu" hidden data-state="closed">
          <div class="menu-label" data-signed-in>Signed in as Adil</div>
          <a role="menuitem" href="index.html" target="_blank" rel="noopener"><i data-lucide="external-link"></i>View site</a>
          <a role="menuitem" href="?role=sub" data-role="admin"><i data-lucide="eye"></i>Preview as an Admin</a>
          <a role="menuitem" href="?" data-role="sub"><i data-lucide="eye"></i>Back to Super admin view</a>
          <div class="separator"></div>
          <div class="menu-label">Theme</div>
          <div class="theme-seg adm-theme" role="radiogroup" aria-label="Theme"><button type="button" role="radio" data-theme-set="light" aria-checked="false"><i data-lucide="sun"></i><span>Light</span></button><button type="button" role="radio" data-theme-set="dark" aria-checked="false"><i data-lucide="moon"></i><span>Dark</span></button><button type="button" role="radio" data-theme-set="auto" aria-checked="false"><i data-lucide="sun-moon"></i><span>Auto</span></button></div>
          <div class="separator"></div>
          <a role="menuitem" href="admin-login.html?state=out"><i data-lucide="log-out"></i>Sign out</a>
        </div>
      </div>
    </header>
    <main class="adm-content" id="main">
{section_tabs(active)}{body}
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

def types_html(ts): return ''.join(f'<span class="tchip t-{t.lower()}">{"Top deal" if t == "Top" else t}</span>' for t in ts if t not in ('Fresh', 'Top'))

# ---------- Overview (admin-tools §8) ----------

def build_overview():  # D-160: four counts, then what is live and what is pinned. Nothing repeated, no sample panels.
    today = [d for d in deals if d['agemin'] <= 1440]
    latest = sorted(deals, key=lambda d: d['agemin'])[:6]
    kpis = [
        ('Posted today', len(today), 'admin-deals.html?posted=today', 'View deals', 'today'),
        ('Deletion requests', A_INBOX_COUNT, 'admin-inbox.html?tab=deletion', 'Open requests', 'inbox'),
        ('Pinned on Top deals', len(A_PIN), 'admin-pinned.html', 'Pinned board', 'pinned'),
    ]
    k = ''.join(f'<a class="kpi" href="{h}" data-kpi="{key}"><span class="kpi-l">{l}</span><b class="kpi-n">{v}</b><span class="kpi-a">{a}</span></a>' for l, v, h, a, key in kpis)
    # changes.md A-12: one Users tile, just the number (28,880 sign-ups, BRD p.1); not a link, no names anywhere
    k += '<div class="kpi kpi-static" data-kpi="users"><span class="kpi-l">Users</span><b class="kpi-n">28,880</b><span class="kpi-a">People with an account on the site or app</span></div>'
    rows = ''.join(f'<li><span class="t-time">{d["agetxt"]}</span><img src="{dimg(d)}" alt="" loading="lazy"><a class="t-title" href="{d["page"]}" target="_blank" rel="noopener">{E(d["t"])}</a><span class="t-meta">{E(d["store"])}</span>{types_html(d["types"][:1] if d["types"][0] != "Fresh" else d["types"][1:2])}</li>' for d in latest)
    pins = ''.join(f'<li><span class="fn-pos">{i + 1}</span><img src="{dimg(d)}" alt="" loading="lazy"><span class="t-title">{E(d["t"])}</span><span class="t-meta">card {PIN_EVERY * (i + 1)}</span></li>' for i, d in enumerate(pinned[:6]))
    body = f'''      <div class="page-h">
        <div><h1>Overview</h1><p>{TODAY.strftime("%A %-d %b")} · today so far</p></div>
      </div>
      <div>
        <div class="kpis kpis-4">{k}</div>
        <div class="two-col ov-cols">
          <section class="panel" data-ov-latest><div class="panel-h"><h2>Latest live deals</h2><a href="admin-deals.html">All deals</a></div><ul class="tlist">{rows}</ul></section>
          <section class="panel" data-ov-pins><div class="panel-h"><h2>Pinned on Top deals</h2><a href="admin-pinned.html">Pinned board</a></div>
            <p class="pin-sum"><b>{len(pinned)}</b> pinned, one every <b>{PIN_EVERY}</b> cards on Top deals.</p>
            <ul class="tlist">{pins}</ul></section>
        </div>
      </div>'''
    shell('admin.html', 'Overview', 'overview', body)

FEATURED = dict(price=10000, pct=70, cap=5)  # M-07 (D-106): Site & app → Featured deals; price = the meeting's ₹10,000 example, discount 70% (meeting example; separate from the Loot line, D-117)
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
        when = d['agetxt']
        rows.append(dict(id=d['id'], t=d['t'], store=d['store'], cat=d['cat'], p=d['p'], m=d['m'], pct=int(d['pct']),
                         types=[t for t in d['types'] if t != 'Fresh'], pin=A_PIN.get(d['file']), featured=bool(d.get('featured')), status='live', age=d['agemin'],
                         when=when, views=d['views'], uniq=adm_uniq(d), clicks=adm_clicks(d), img=dimg(d), page=d['page'], link=d['link'], display=1,
                         caption=d['caption'], coupon=d['coupon'], terms=d['coupon_terms'], offers=d['offers'], note=d['note'], exc=d['step_exceptions'],
                         logo=store_logo(d['store']) or ''))
    return rows
ADM_ROWS = adm_rows()
def adm_data(): return json.dumps(ADM_ROWS, ensure_ascii=False).replace('</', '<\\/')

def build_deals():
    # 2026-11-25 (changes.md A-01–A-03): no statuses; every action sits in the row as an icon; Clone, Copy buy link, Bump to top and Change status are gone; the menu keeps Delete only.
    # P-41: no drag order; Move to top (row icon and bulk) lifts deals to the top of the site; pager shows first, nearby and last pages.
    rows = ADM_ROWS
    sel = lambda name, label, opts: f'<label class="select tb-sel"><span class="visually-hidden">{label}</span><select data-f="{name}"><option value="">{label}</option>{"".join(f"<option value={chr(34)}{E(v)}{chr(34)}>{E(t)}</option>" for v, t in opts)}</select><i data-lucide="chevron-down"></i></label>'
    stores = sorted({r['store'] for r in rows}, key=lambda s: shop_by_name[s]['order'] if s in shop_by_name else 99)
    catsl = [c['name'] for c in CATS if any(r['cat'] == c['name'] for r in rows)]
    toolbar = ''.join([
        sel('type', 'Type', [('Loot', 'Loot'), ('New', 'New'), ('Pantry', 'Pantry')]),
        sel('store', 'Store', [(s, s) for s in stores]),
        sel('cat', 'Category', [(c, c) for c in catsl]),
        sel('pin', 'Pinned', [('yes', 'Pinned'), ('no', 'Not pinned')]),
        sel('feat', 'Featured', [('yes', 'Featured'), ('no', 'Not featured')]),
        sel('display', 'Shows on', [('1', 'Web + App'), ('2', 'Web only'), ('3', 'App only')]),
        sel('posted', 'Posted', [('today', 'Today'), ('week', 'Last 7 days')]),
    ])
    cat_opts = ''.join(f'<option>{E(c["name"])}</option>' for c in CATS)
    store_opts = ''.join(f'<option>{E(s["name"])}</option>' for s in SHOPS)
    body = f'''      <div class="page-h">
        <div><h1>All deals</h1><p><span data-total>{CATALOGUE["all_total"]:,}</span> deals on the live site · this prototype holds the latest {len(rows)}</p></div>
      </div>
      <div class="toolbar dl-tools">
        <label class="input-wrap tb-search"><i data-lucide="search"></i><span class="visually-hidden">Search deals</span><input class="input" type="search" placeholder="Title or link" data-f="q"></label>
        <button class="btn btn-outline tb-more" type="button" data-filters-toggle aria-expanded="false" aria-controls="dl-filters"><i data-lucide="sliders-horizontal"></i>Filters<span class="adm-count muted" data-fcount hidden></span></button>
        <div class="tb-sels" id="dl-filters" data-filters>{toolbar}</div>
      </div>
      <div class="chips-row"><div class="chips" data-chips></div><span class="count" data-count-line></span>
        <label class="select per"><span class="visually-hidden">Rows per page</span><select data-per><option>25</option><option>50</option><option>100</option></select><i data-lucide="chevron-down"></i></label></div>
      <div class="tbl-wrap">
        <table class="tbl dl-tbl" data-tbl>
          <thead><tr>
            <th class="c-ck"><label class="ck"><input type="checkbox" data-all aria-label="Select all on this page"><span class="box"><i data-lucide="check"></i></span></label></th>
            <th class="c-deal">Deal</th>
            <th class="num"><button type="button" data-sort="p">Price</button></th>
            <th><button type="button" data-sort="age">Posted</button></th>
            <th class="num"><button type="button" data-sort="uniq" title="Each visitor counted once per deal">Views</button></th>
            <th class="c-act">Actions</th>
          </tr></thead>
          <tbody data-rows></tbody>
        </table>
        <p class="empty" data-empty hidden>No deals match these filters. <button class="btn-link" type="button" data-clear>Clear all</button></p>
      </div>
      <nav class="pager" data-pager aria-label="Pages"></nav>

      <div class="bulkbar" data-bulkbar hidden role="region" aria-label="Bulk actions">
        <b data-bulk-n>0 selected</b>
        <button class="btn btn-outline btn-sm" type="button" data-bulk="top"><i data-lucide="arrow-up-to-line"></i>Move to top</button>
        <button class="btn btn-outline btn-sm" type="button" data-bulk="wa"><i data-lucide="copy"></i>Copy for WhatsApp</button>
        <button class="btn btn-outline btn-sm" type="button" data-bulk="pin"><i data-lucide="pin"></i>Pin</button>
        <button class="btn btn-outline btn-sm" type="button" data-bulk="feat"><i data-lucide="star"></i>Feature</button>
        <button class="btn btn-outline btn-sm" type="button" data-bulk="edit"><i data-lucide="pencil"></i>Edit…</button>
        <button class="btn btn-outline btn-sm danger" type="button" data-bulk="delete"><i data-lucide="trash-2"></i>Delete</button>
        <button class="btn btn-ghost btn-icon btn-sm" type="button" data-bulk="clear" aria-label="Clear selection"><i data-lucide="x"></i></button>
      </div>

      <div class="menu row-menu" id="row-menu" role="menu" hidden data-state="closed">
        <button role="menuitem" type="button" data-act="delete" class="danger"><i data-lucide="trash-2"></i>Delete</button>
      </div>
      <div class="menu share-pop" id="share-pop" role="menu" hidden data-state="closed" aria-label="Share">
        <div class="menu-label">Share this deal</div>
        <a role="menuitem" href="#" target="_blank" rel="noopener" data-sh="wa"><i data-lucide="message-circle"></i>WhatsApp</a>
        <a role="menuitem" href="#" target="_blank" rel="noopener" data-sh="tg"><i data-lucide="send"></i>Telegram</a>
        <a role="menuitem" href="#" target="_blank" rel="noopener" data-sh="fb"><i data-lucide="facebook"></i>Facebook</a>
        <a role="menuitem" href="#" target="_blank" rel="noopener" data-sh="x"><i data-lucide="twitter"></i>X</a>
        <button role="menuitem" type="button" data-sh="link"><i data-lucide="link"></i>Copy short link</button>
        <button role="menuitem" type="button" data-sh="native" hidden><i data-lucide="share"></i>More apps…</button>
      </div>

      <div class="sheet-overlay" data-overlay hidden data-state="closed"></div>
      <aside class="sheet sheet-right" id="bulk-edit" hidden data-state="closed" role="dialog" aria-modal="true" aria-labelledby="be-title">
        <div class="sheet-header"><div class="sheet-title" id="be-title">Edit <span data-be-n>0</span> deals</div><p class="sheet-desc">Only ticked fields change.</p></div>
        <button class="sheet-close" type="button" data-close aria-label="Close"><i data-lucide="x"></i></button>
        <div class="sheet-body be">
          <div class="be-row"><label class="ck"><input type="checkbox" data-be="cat"><span class="box"><i data-lucide="check"></i></span></label><span>Category</span><label class="select"><select data-bev="cat">{cat_opts}</select><i data-lucide="chevron-down"></i></label></div>
          <div class="be-row"><label class="ck"><input type="checkbox" data-be="store"><span class="box"><i data-lucide="check"></i></span></label><span>Store</span><label class="select"><select data-bev="store">{store_opts}</select><i data-lucide="chevron-down"></i></label></div>
          <div class="be-row"><label class="ck"><input type="checkbox" data-be="display"><span class="box"><i data-lucide="check"></i></span></label><span>Shows on</span><label class="select"><select data-bev="display"><option value="1">Web + App</option><option value="2">Web only</option><option value="3">App only</option></select><i data-lucide="chevron-down"></i></label></div>
          <div class="be-row"><label class="ck"><input type="checkbox" data-be="unpin"><span class="box"><i data-lucide="check"></i></span></label><span>Unpin</span><small>Takes them off the Pinned board</small></div>
          <div class="be-row"><label class="ck"><input type="checkbox" data-be="unfeat"><span class="box"><i data-lucide="check"></i></span></label><span>Unfeature</span><small>Takes them out of Hot deals on Home</small></div>
        </div>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-be-apply>Apply to <span data-be-n>0</span> deals</button></div>
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
        <div class="page-h-acts"><a class="btn btn-outline" href="admin-deals.html">All deals</a><a class="btn btn-default" href="admin-post.html">Post a deal</a></div>
      </div>'''
    shell('admin-soon.html', 'Coming next', None, body)



# ---------- One deal, read only (changes.md A-04): what it is, how it does, its comments; Edit opens the form in a drawer ----------
SHARE_POP = """      <div class="menu share-pop" id="share-pop" role="menu" hidden data-state="closed" aria-label="Share">
        <div class="menu-label">Share this deal</div>
        <a role="menuitem" href="#" target="_blank" rel="noopener" data-sh="wa"><i data-lucide="message-circle"></i>WhatsApp</a>
        <a role="menuitem" href="#" target="_blank" rel="noopener" data-sh="tg"><i data-lucide="send"></i>Telegram</a>
        <a role="menuitem" href="#" target="_blank" rel="noopener" data-sh="fb"><i data-lucide="facebook"></i>Facebook</a>
        <a role="menuitem" href="#" target="_blank" rel="noopener" data-sh="x"><i data-lucide="twitter"></i>X</a>
        <button role="menuitem" type="button" data-sh="link"><i data-lucide="link"></i>Copy short link</button>
        <button role="menuitem" type="button" data-sh="native" hidden><i data-lucide="share"></i>More apps…</button>
      </div>"""
def build_deal_view():
    body = """      <a class="back" href="admin-deals.html"><i data-lucide="chevron-left"></i>All deals</a>
      <div class="dv" data-deal-view>
        <section class="panel dv-head">
          <div class="dv-img"><img alt="" data-dv-img></div>
          <div class="dv-main">
            <div class="dv-kicker" data-dv-kicker></div>
            <h1 class="dv-title" data-dv-title>Deal</h1>
            <div class="dv-price" data-dv-price></div>
            <p class="dv-posted" data-dv-posted></p>
            <div class="dv-acts">
              <button class="btn btn-default" type="button" data-dv-edit><i data-lucide="pencil"></i>Edit</button>
              <button class="btn btn-outline" type="button" data-dv="wa"><i data-lucide="copy"></i>Copy for WhatsApp</button>
              <button class="btn btn-outline" type="button" data-dv="share" data-quick="share"><i data-lucide="share-2"></i>Share</button>
              <button class="btn btn-outline" type="button" data-dv="pin" aria-pressed="false"><i data-lucide="pin"></i><span>Pin</span></button>
              <button class="btn btn-outline" type="button" data-dv="feat" aria-pressed="false"><i data-lucide="star"></i><span>Feature</span></button>
              <button class="btn btn-outline" type="button" data-dv="push"><i data-lucide="bell-ring"></i>Send push</button>
              <a class="btn btn-outline" href="#" target="_blank" rel="noopener" data-dv-open><i data-lucide="external-link"></i>Public page</a>
              <button class="btn btn-ghost danger" type="button" data-dv="del"><i data-lucide="trash-2"></i>Delete</button>
            </div>
          </div>
        </section>
        <section class="dv-stats" aria-label="How this deal is doing" data-dv-stats></section>
        <div class="dv-grid">
          <section class="panel dv-sec"><div class="panel-h"><h2>Shares</h2></div><ul class="dv-shares" data-dv-shares></ul></section>
          <section class="panel dv-sec"><div class="panel-h"><h2>Links</h2></div><div class="dv-links" data-dv-links></div></section>
        </div>
        <section class="panel dv-sec" id="comments"><div class="panel-h"><h2>Comments <span class="adm-count muted" data-dv-ccount>0</span></h2><a class="side-a" href="#" target="_blank" rel="noopener" data-dv-cpage>See them on the deal page</a></div>
          <ul class="dv-comments" data-dv-comments></ul>
          <p class="empty" data-dv-cempty hidden>No comments on this deal yet.</p></section>
        <p class="empty" data-dv-missing hidden>This deal isn’t here any more. It may have been deleted. <a href="admin-deals.html">Back to All deals</a></p>
      </div>
      <div class="sheet-overlay" data-overlay hidden data-state="closed"></div>
      <aside class="sheet sheet-right sheet-wide" id="edit-drawer" hidden data-state="closed" role="dialog" aria-modal="true" aria-labelledby="ed-title">
        <div class="sheet-header"><div class="sheet-title" id="ed-title">Edit deal</div><p class="sheet-desc">Changes show on the site when you save.</p></div>
        <button class="sheet-close" type="button" data-close aria-label="Close"><i data-lucide="x"></i></button>
        <iframe class="ed-frame" title="Edit deal" data-ed-frame></iframe>
      </aside>
      <div class="menu row-menu" id="row-menu" role="menu" hidden data-state="closed"></div>
""" + SHARE_POP + """
      <aside class="sheet dialog" id="confirm" hidden data-state="closed" role="alertdialog" aria-modal="true" aria-labelledby="cf-title" aria-describedby="cf-desc">
        <div class="sheet-header"><div class="sheet-title" id="cf-title"></div><p class="sheet-desc" id="cf-desc"></p></div>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-confirm-go></button></div>
      </aside>"""
    shell('admin-deal-view.html', 'Deal', 'all', body, scripts=f'<script>window.ADM_DEALS = {adm_data()};</script>\n')

build_overview(); build_deals(); build_deal_view(); build_soon()

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
        <div><h1 data-form-title>Post a deal</h1><p data-form-sub>Paste the store link, add a picture, check the price. That’s it.</p></div>
      </div>
      <div class="post" data-post>
        <form class="post-form panel" novalidate data-form>
          <div class="sec">
            <label class="fld"><span class="lab">1. Deal link *</span><input class="input input-lg" type="url" name="link" placeholder="Paste the product link from Amazon, Flipkart, Myntra…" data-req autocomplete="off"><small class="hint">We pick the store from the link and remove other people’s affiliate tags on our own.</small><span class="err" hidden></span></label>
            <p class="warn" data-dup hidden><i data-lucide="triangle-alert"></i><span>A similar deal was posted today.</span> <a href="#" target="_blank" rel="noopener" data-dup-link>View it</a></p>
          </div>
          <div class="sec img-sec">
            <span class="lab">2. Picture *</span>
            <div class="drop" data-drop tabindex="0" role="button" aria-label="Add a picture: drop it here, paste it, or click to choose a file">
              <img alt="" hidden data-img>
              <div class="drop-empty" data-drop-empty><i data-lucide="image-plus"></i><b>Drop the picture here</b><span>or paste it (Ctrl+V), or <u>choose a file</u></span><small>JPG, PNG or WebP · kept up to 1200 px</small></div>
              <button type="button" class="btn btn-outline btn-sm drop-change" data-drop-change hidden><i data-lucide="replace"></i>Change</button>
              <input type="file" accept="image/*" hidden data-img-file>
            </div>
            <div class="img-acts"><button type="button" class="btn btn-ghost btn-sm" data-img-fetch><i data-lucide="refresh-cw"></i>Fetch the picture from the link</button></div>
            <span class="err" data-img-err hidden>Add an image: fetch it from the link or upload one.</span>
          </div>
          <div class="sec">
            <label class="fld"><span class="lab">3. Title *</span><input class="input" type="text" name="title" maxlength="200" data-req placeholder="Product name, e.g. boAt Airdopes 141 Bluetooth Earbuds"><span class="err" hidden></span></label>
            <div class="fld"><span class="lab">Description <small>optional</small></span>
              <div class="rte"><div class="rte-bar" role="toolbar" aria-label="Formatting"><button type="button" data-cmd="bold" aria-label="Bold"><i data-lucide="bold"></i></button><button type="button" data-cmd="italic" aria-label="Italic"><i data-lucide="italic"></i></button><button type="button" data-cmd="insertUnorderedList" aria-label="Bulleted list"><i data-lucide="list"></i></button><button type="button" data-cmd="insertOrderedList" aria-label="Numbered list"><i data-lucide="list-ordered"></i></button><button type="button" data-cmd="createLink" aria-label="Link"><i data-lucide="link"></i></button></div>
              <div class="rte-body" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Description" data-desc data-ph="A line or two about the deal, if it helps"></div></div></div>
            <div class="grid2">
              <label class="fld"><span class="lab">4. Store *</span>{_sel('name="store" data-req', '<option value="">Choose…</option>' + _opts([x['name'] for x in SHOPS]))}<small class="hint" data-store-hint hidden>Picked from the link</small><span class="err" hidden></span></label>
              <label class="fld"><span class="lab">Category</span>{_sel('name="cat"', _opts([c['name'] for c in CATS], 'Others'))}</label>
            </div>
            <div class="grid3">
              <label class="fld"><span class="lab">5. Deal price ₹ *</span><input class="input num" type="text" inputmode="numeric" name="p" data-req placeholder="e.g. 499"><small class="hint">0 for a sale with many prices</small><span class="err" hidden></span></label>
              <label class="fld"><span class="lab">MRP ₹</span><input class="input num" type="text" inputmode="numeric" name="m" placeholder="e.g. 1999"><span class="err" hidden></span></label>
              <label class="fld"><span class="lab">Off <small>worked out for you</small></span><span class="input-suffix"><input class="input num" type="text" inputmode="numeric" name="pct" readonly tabindex="-1"><span>%</span></span></label>
            </div>
            <p class="tag-hint" data-tag-hint hidden><i data-lucide="tag"></i><span></span> <a href="admin-catalogue.html?tab=dealtypes">Rules</a></p>
          </div>
          <details class="sec more-sec" data-more>
            <summary><span><b>More details</b><small>Caption, coupon and extras. Most deals don’t need them.</small></span><i data-lucide="chevron-down"></i></summary>
            <div class="more-body">
            <div class="grid3 g-cap">
              <label class="fld"><span class="lab">Caption <small>≤ 40</small></span><input class="input" type="text" name="caption" maxlength="40" placeholder="e.g. Lowest ever"></label>
              <label class="fld"><span class="lab">Coupon <small>≤ 20</small></span><input class="input upper" type="text" name="coupon" maxlength="20" placeholder="SAVE20"></label>
              <label class="fld"><span class="lab">Coupon terms <small>≤ 80</small></span><input class="input" type="text" name="terms" maxlength="80" placeholder="On orders above ₹999"></label>
            </div>
            {bl}
            <div class="adds" data-adds><span class="lab">Add</span>{adds}</div>
            </div>
          </details>
          <div class="sec">
            <span class="lab">6. Options</span>
            <div class="grid4 opts-row">
              <label class="fld"><span class="lab">Shows on</span>{_sel('name="display"', '<option value="1">Web + App</option><option value="2">Web only</option><option value="3">App only</option>')}</label>
              <div class="fld"><span class="lab">Pinned</span><div class="pinrow">{ck('name="pin"', 'Pin')}{_sel('name="slot" aria-label="Slot"', ''.join(f'<option value="{x}">Slot {x}{" (next free)" if x == len(A_PIN) + 1 else ""}</option>' for x in range(1, len(A_PIN) + 2)))}</div></div>
              <div class="fld"><span class="lab">Featured</span>{ck('name="featured"', 'Feature <small>in Hot deals on Home</small>')}</div>
              <div class="fld"><span class="lab">Push alert</span>{ck('name="notify"', 'Send push <small data-notify-hint>ticked at 90% off</small>')}</div>
            </div>
          </div>
          <div class="form-foot" data-foot>
            <button class="btn btn-default btn-lg" type="submit" data-submit>Publish</button>
            <span class="saved" data-saved>Draft saved on this device</span>
            <button class="btn btn-ghost danger" type="button" data-edit-only hidden data-del><i data-lucide="trash-2"></i>Delete</button>
          </div>
        </form>

        <aside class="post-side">
          <details class="panel side-sec" open data-preview-wrap><summary class="panel-h"><h2>How it looks on the site</h2></summary>
            <div class="pv-wrap"><article class="pv" data-pv>
              <div class="pv-img"><img alt="" data-pv-img hidden><span class="pv-cap" data-pv-cap hidden></span><span class="pv-pin" data-pv-pin hidden><i data-lucide="pin"></i>Pinned</span></div>
              <div class="pv-body"><div class="pv-top"><span class="pv-store" data-pv-store>Others · Just now</span><span class="pv-chip" data-pv-chip></span></div><div class="pv-title" data-pv-title>Deal title shows here</div>
                <div class="pv-price"><b data-pv-p>₹—</b><s data-pv-m></s><em data-pv-pct></em></div>
                <div class="pv-coupon" data-pv-coupon hidden></div>
                <div class="pv-foot"><span class="pv-save" data-pv-save></span></div>
                <span class="pv-buy">Buy now<i data-lucide="arrow-up-right"></i></span></div>
            </article></div>
            <a class="side-link" href="#" target="_blank" rel="noopener" data-edit-only hidden data-open-page>Open public page <i data-lucide="external-link"></i></a>
          </details>
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
        <div class="page-h-acts"><button class="btn btn-outline" type="button" data-copy-wa><i data-lucide="copy"></i>Copy for WhatsApp</button><a class="btn btn-outline" href="admin-deals.html" data-done-share><i data-lucide="eye"></i>Open the deal</a><a class="btn btn-default" href="admin-post.html" data-another><i data-lucide="plus"></i>Post another</a></div>
      </section>

      <div class="drop-over" data-drop-over hidden><div><i data-lucide="image-down"></i><b>Drop the picture to use it</b></div></div>
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
        <div><h1>Pinned board</h1><p>New deals keep coming in at the top of Top deals; pinned deals stay in place between them. <span class="desk-only">Drag to change the order.</span><span class="phone-only">Change the order with the menu on each card.</span></p></div>
        <div class="page-h-acts"><a class="btn btn-outline" href="fresh.html" target="_blank" rel="noopener"><i data-lucide="external-link"></i>Preview on Top deals</a></div>
      </div>
      <section class="panel pin-gap">
        <label class="pin-gap-f"><span>Show a pinned deal every</span><span class="select"><select data-pin-every aria-label="Cards between pinned deals">{gaps}</select><i data-lucide="chevron-down"></i></span><span>cards on Top deals</span></label>
        <p class="pin-gap-h" data-pin-gap-h></p>
      </section>
      <div class="slots" data-slots role="list"></div>
{SAVEBAR}
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
        ('Yesterday', '21:15', f'{h[12]["t"][:60]} · ₹{h[12]["p"]:,}', 'ok', 'ok'),
        ('Yesterday', '09:30', f'{h[9]["pct"]}% off {h[9]["t"][:48]}', 'ok', 'ok'),
    ]
    rows, last = '', None
    for day, tm, txt, w, a in hist:
        if day != last: rows += f'<li class="day">{day}</li>'; last = day
        res = lambda ok, lab: f'<span class="{"ok" if ok == "ok" else "bad"}"><i data-lucide="{"check" if ok == "ok" else "x"}"></i>{lab}</span>'
        act = '<button class="btn btn-ghost btn-sm" type="button" data-retry>Retry app</button>' if a == 'bad' else '<button class="btn btn-ghost btn-sm" type="button" data-resend>Resend</button>'
        rows += f'<li><span class="t-time">{tm}</span><span class="t-title">{E(txt)}</span><span class="share-res">{res(w, "Web")}{res(a, "App")}</span>{act}</li>'
    body = f'''      <div class="page-h"><div><h1>Alerts</h1><p>A push alert goes to everyone who turned on alerts on the website or in the app. For deals at 90% off or more, Send push is ticked for you on the posting form; untick it to skip the alert.</p></div></div>
      <div class="tabs-list adm-tabs al-tabs" role="tablist"><button class="tabs-trigger" role="tab" type="button" data-altab="send" data-state="active" aria-selected="true">Send alert</button><button class="tabs-trigger" role="tab" type="button" data-altab="hist" aria-selected="false">History</button></div><!-- P-62: history is its own tab -->
      <div class="two-col al" data-alpane="send">
        <section class="panel"><div class="panel-h"><h2>New alert</h2></div>
          <form class="al-form" data-al-form novalidate>
            <div class="fld"><span class="lab">Deal *</span>
              <div class="al-pick" data-al-pick><label class="input-wrap"><i data-lucide="search"></i><input class="input" type="search" placeholder="Search deals or paste the deal's link" data-al-q autocomplete="off" aria-label="Search deals"></label>
                <ul class="pick-list al-list" data-al-list hidden role="listbox"></ul></div>
              <div class="al-att" data-al-att hidden></div><span class="err" data-al-deal-err hidden>Pick the deal to send.</span>
              <small class="hint">The alert shows the deal’s picture, title and price. Nothing to type.</small></div>
            <div class="fld"><span class="lab">Send to</span><div class="pinrow">{ck('data-al-web checked', 'Website <small>browser alerts</small>')}{ck('data-al-app checked', 'App')}</div><span class="err" data-al-to-err hidden>Pick at least one.</span></div>
            <button class="btn btn-default" type="submit"><i data-lucide="send"></i>Send alert</button>
          </form></section>
        <details class="panel al-pv" open data-fold-phone><summary class="panel-h"><h2>Preview <small>as a phone shows it</small></h2><i data-lucide="chevron-down"></i></summary>
          <div class="notif-wrap"><div class="notif"><div class="notif-h"><span class="notif-ico">OT</span><b>OfferTag</b><small>now</small></div><b class="notif-t" data-nt>The deal title shows here</b><span class="notif-b" data-nb></span><img alt="" data-ni hidden></div></div></details>
      </div>
      <section class="panel sent" data-alpane="hist" hidden><div class="panel-h al-hist-h"><h2>Sent alerts <small>newest first</small></h2><label class="input-wrap al-hq"><i data-lucide="search"></i><input class="input" type="search" placeholder="Search sent alerts" data-al-hq aria-label="Search sent alerts" autocomplete="off"></label></div><ul class="tlist" data-al-hist>{rows}</ul><p class="empty" data-al-hempty hidden>No sent alert matches.</p><p class="hint al-hnote">Older alerts load as you scroll. History keeps 90 days.</p></section>
      <div class="sheet-overlay" data-overlay hidden data-state="closed"></div>
      <aside class="sheet dialog" id="confirm" hidden data-state="closed" role="alertdialog" aria-modal="true" aria-labelledby="cf-title" aria-describedby="cf-desc">
        <div class="sheet-header"><div class="sheet-title" id="cf-title"></div><p class="sheet-desc" id="cf-desc"></p></div>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-confirm-go></button></div>
      </aside>'''
    shell('admin-alerts.html', 'Alerts', 'alerts', body, scripts=f'<script>window.ADM_DEALS = {adm_data()};</script>\n')

# ---------- Sponsored (DEV-030, D-108): paid ad cards on Home; views and clicks per ad for the advertiser's report ----------
def build_sponsored():
    # SAMPLE: advertisers are fictional; views/clicks stand in for the counts the build phase records (dev-requirements)
    sp = [dict(id=x['id'], adv=x['adv'], title=x['title'], line=x['line'], cta=x['cta'], link=x['href'].replace('#sponsored-', 'https://example.com/ad-'), img=f'assets/posters/{x["img"]}.jpg',
               start=x['start'], end=x['end'], on=x['on'], views=x['views'], clicks=x['clicks']) for x in SPONSORS]  # same records Home uses
    sp.append(dict(id=3, adv='FitZone Gym, Powai', title='FitZone: 3 months for the price of 2', line='Opening offer at our Powai branch.', cta='Join now', link='https://example.com/ad-3', img='assets/posters/festive.jpg', start='2026-10-01', end='2026-10-31', on=True, views=24980, clicks=511))
    body = f'''      <div class="page-h">
        <div><h1>Sponsored</h1><p>A business sends you a picture; you add it with one button. It shows on Home, labelled "Sponsored". There is one ad slot, so one ad runs at a time; schedule the next one for after it ends.</p></div>
        <div class="page-h-acts"><a class="btn btn-outline" href="index.html" target="_blank" rel="noopener"><i data-lucide="external-link"></i>See Home</a><button class="btn btn-default" type="button" data-sp-new><i data-lucide="plus"></i>Add sponsored ad</button></div>
      </div>
      <div class="tabs-list adm-tabs" role="tablist"><button class="tabs-trigger" role="tab" data-stab="live" data-state="active" aria-selected="true">Live <span class="adm-count muted" data-scount="live"></span></button><button class="tabs-trigger" role="tab" data-stab="cur" aria-selected="false">Scheduled <span class="adm-count muted" data-scount="cur"></span></button><button class="tabs-trigger" role="tab" data-stab="past" aria-selected="false">Ended <span class="adm-count muted" data-scount="past"></span></button></div>
      <ol class="posters sp-list" data-sp-list></ol>
{SAVEBAR}
      <div class="sheet-overlay" data-overlay hidden data-state="closed"></div>
      <aside class="sheet sheet-right" id="sp-edit" hidden data-state="closed" role="dialog" aria-modal="true" aria-labelledby="se-title">
        <div class="sheet-header"><div class="sheet-title" id="se-title">Add sponsored ad</div><p class="sheet-desc">A picture and one button. That’s all.</p></div>
        <button class="sheet-close" type="button" data-close aria-label="Close"><i data-lucide="x"></i></button>
        <form class="sheet-body pe" data-se novalidate>
          <div class="fld"><span class="lab">Ad picture * <small>the picture the business sent, about 600 × 500</small></span><label class="drop sq" data-drop="d"><img alt="" hidden><span><i data-lucide="upload"></i>Choose picture</span><input type="file" accept="image/*" hidden></label><span class="err" hidden>Add the ad picture.</span></div>
          <div class="grid2"><label class="fld"><span class="lab">Button text *</span><input class="input" type="text" name="cta" maxlength="20" value="Visit website" list="cta-ideas"><datalist id="cta-ideas"><option value="Visit website"><option value="Call us"><option value="Shop now"><option value="Order on WhatsApp"><option value="Know more"></datalist><span class="err" hidden>Add the button text.</span></label>
            <label class="fld"><span class="lab">Button opens *</span><input class="input" type="text" name="link" placeholder="https://… or a phone number"><span class="err" hidden>Add a link starting with https://, or a phone number.</span></label></div>
          <div class="grid2"><label class="fld"><span class="lab">Start date *</span><input class="input" type="date" name="start"><span class="err" hidden>Add the start date.</span></label><label class="fld"><span class="lab">End date <small>optional</small></span><input class="input" type="date" name="end"><span class="err" hidden>The end date must be on or after the start date.</span></label></div>
          <p class="hint-line"><i data-lucide="info"></i><span>The ad shows on Home from the start date. With no end date it stays on until you switch it off. The dates are only for you; the site never shows them.</span></p>
          {ck('name="on" checked', 'On')}
        </form>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-se-save>Save ad</button></div>
      </aside>
      <aside class="sheet dialog" id="confirm" hidden data-state="closed" role="alertdialog" aria-modal="true" aria-labelledby="cf-title" aria-describedby="cf-desc">
        <div class="sheet-header"><div class="sheet-title" id="cf-title"></div><p class="sheet-desc" id="cf-desc"></p></div>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-confirm-go></button></div>
      </aside>'''
    shell('admin-sponsored.html', 'Sponsored', 'sponsored', body, scripts=f'<script>window.ADM_SPONSORED = {json.dumps(sp, ensure_ascii=False)}; window.ADM_TODAY = "{TODAY.isoformat()}";</script>\n')

build_post(); build_pinned(); build_alerts(); build_sponsored()
exec(open(os.path.join(HERE, 'admin_c.py')).read())
exec(open(os.path.join(HERE, 'admin_d.py')).read())
exec(open(os.path.join(HERE, 'admin_e.py')).read())
exec(open(os.path.join(HERE, 'admin_login.py')).read())
print('Admin: batch A (admin, admin-deals, admin-deal-view) + batch B (admin-post, admin-pinned, admin-alerts, admin-sponsored) + admin-soon')
