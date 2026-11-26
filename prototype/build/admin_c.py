# admin_c.py — admin batch C (S16): Social sharing, Affiliate tags, Inbox, Site & app, Roles, Users, Catalogue.
# Runs inside build.py's namespace after admin.py (shell, ADM_ROWS, ck, _sel, E, inr, CATS, SHOPS, SHOP_STEPS, store_logo …).
# Data sheet: design-system/ia/data-sheets/admin-batch-c.md. Every SAMPLE value is declared there and tagged "Sample" on screen.

C_AFTER = '<script src="js/admin-c.js"></script>\n'
CONFIRM = '''      <aside class="sheet dialog" id="confirm" hidden data-state="closed" role="alertdialog" aria-modal="true" aria-labelledby="cf-title" aria-describedby="cf-desc">
        <div class="sheet-header"><div class="sheet-title" id="cf-title"></div><p class="sheet-desc" id="cf-desc"></p></div>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-confirm-go></button></div>
      </aside>'''
OVERLAY = '      <div class="sheet-overlay" data-overlay hidden data-state="closed"></div>'

def jdump(x): return json.dumps(x, ensure_ascii=False).replace('</', '<\\/')

def admin_only(page_name, body):  # sub-admins never reach these pages (D-057); ?role=sub shows why
    return (f'      <div class="sub-note" data-role="sub"><i data-lucide="lock"></i><p>{page_name} is for Super admins only. Admins post, edit and delete deals, and see Overview, Deals and Alerts. <a href="admin-deals.html?role=sub">Go to All deals</a></p></div>\n'
            f'      <div data-role="admin">\n{body}\n      </div>')

def tabs(attr, items, active):  # items: (key, label, count or None)
    out = []
    for k, l, n in items:
        on = k == active
        cnt = '' if n is None else f' <span class="adm-count muted" data-tcount="{k}">{n}</span>'
        out.append(f'<button class="tabs-trigger" role="tab" type="button" {attr}="{k}"{" data-state=active" if on else ""} aria-selected="{"true" if on else "false"}">{E(l)}{cnt}</button>')
    return f'<div class="tabs-list adm-tabs" role="tablist">{"".join(out)}</div>'

def sw(attr, checked=True, label=''):  # on/off switch
    return f'<label class="switch"><input type="checkbox" role="switch" {attr}{" checked" if checked else ""} aria-label="{E(label)}"><span></span></label>'

LATEST = sorted(deals, key=lambda d: d['agemin'])[:5]

# ---------- Social sharing (admin-tools §2) ----------
FMT_DEFAULT = {  # D-058 share template, same text the post form's Share panel builds
    'fb': '{pct}% off · {title}\nDeal price ₹{price} (MRP ₹{mrp}) at {store}\n{coupon_line}\n{short_link}',
    'pin': '{pct}% off {title} · ₹{price} at {store}\n{short_link}',
    'th': '{pct}% off {title}\nNow ₹{price} (MRP ₹{mrp}) at {store}\n{coupon_line}\n{short_link}',
}
CHANNELS = [  # SAMPLE connection states (data sheet C)
    dict(k='fb', name='Facebook Page', mark='f', acct='OfferTag.in', state='on', note='expires in 52 days', tag='offertagfb-21'),
    dict(k='pin', name='Pinterest', mark='P', acct='board', state='on', note='', tag=''),
    dict(k='th', name='Threads', mark='@', acct='@offertag', state='off', note='', tag=''),
]

def build_social():
    rows = []
    for c in CHANNELS:
        acct = (_sel('data-pin-board aria-label="Pinterest board"', _opts(['Loot deals', 'Top deals', 'All deals'], 'Loot deals'), 'sel-sm') if c['acct'] == 'board' else f'<span class="ch-acct">{E(c["acct"])}</span>')
        rows.append(f'''          <li class="ch" data-ch="{c["k"]}" data-state="{c["state"]}">
            <span class="ch-mark ch-{c["k"]}" aria-hidden="true">{c["mark"]}</span>
            <div class="ch-main"><b>{E(c["name"])}</b>{acct}</div>
            <span class="ch-status" data-ch-status></span>
            <div class="ch-acts" data-ch-acts></div>
          </li>''')
    hist_src = [(LATEST[0], 'fb', 'ok', 'Adil'), (LATEST[0], 'th', 'Token expired', 'Adil'), (LATEST[1], 'fb', 'ok', 'Imran K.'), (LATEST[1], 'pin', 'ok', 'Imran K.'),
                (LATEST[2], 'th', 'ok', 'Adil'), (LATEST[3], 'fb', 'ok', 'Adil'), (LATEST[4], 'pin', 'Board not found', 'Imran K.')]
    hist = [dict(when=d['agetxt'], t=d['t'], ch=ch, res=r, by=by, page=d['page']) for d, ch, r, by in hist_src]
    pv = ADM_ROWS[0]
    pvd = dict(title=pv['t'], price=pv['p'], mrp=pv['m'], pct=pv['pct'], store=pv['store'], coupon=pv['coupon'] or '', img=pv['img'], short='offertag.in/v/' + str(pv['id'])[-5:])
    body = f'''      <div class="page-h">
        <div><h1>Social sharing</h1><p>Share a deal to the OfferTag Facebook Page, Pinterest and Threads from the deal's page. Connect each place once here. Every post uses the same fixed text.</p></div>
      </div>
      {tabs('data-stab', [('channels', 'Channels', None), ('history', 'History', None)], 'channels')}
      <section data-spanel="channels">
        <div class="panel"><div class="panel-h"><h2>Where deals can be shared</h2><span class="tag-sample">Sample</span></div><ul class="chs" data-chs>
{chr(10).join(rows)}
        </ul></div>
        <div class="panel fixed-fmt"><div class="panel-h"><h2>What every post says</h2><small>one fixed text for every place, also used by Copy for WhatsApp</small></div>
          <div class="spv"><img alt="" data-spv-img><p data-spv-text></p></div></div>
        <p class="foot-note" data-approval-note><i data-lucide="info"></i>Meta (Facebook, Threads) and Pinterest must approve the OfferTag app before posting works; that is due by week 7. Until then these show “Awaiting platform approval”.</p>
      </section>
      <section data-spanel="history" hidden>
        <div class="toolbar">
          {_sel('data-hf="ch" aria-label="Platform"', '<option value="">All platforms</option><option value="fb">Facebook Page</option><option value="pin">Pinterest</option><option value="th">Threads</option>', 'tb-sel')}
          {_sel('data-hf="res" aria-label="Result"', '<option value="">Any result</option><option value="ok">Posted</option><option value="bad">Failed</option>', 'tb-sel')}
          <span class="tag-sample">Sample</span>
        </div>
        <div class="tbl-wrap"><table class="tbl ltbl">
          <thead><tr><th>When</th><th>Deal</th><th>Platform</th><th>Result</th><th>By</th></tr></thead>
          <tbody data-hist></tbody></table>
          <p class="empty" data-hist-empty hidden>Nothing matches.</p></div>
      </section>
{OVERLAY}
{CONFIRM}'''
    shell('admin-social.html', 'Social sharing', 'social', admin_only('Social sharing', body),
          scripts=f'<script>window.ADM_SOCIAL = {jdump(dict(channels=CHANNELS, hist=hist, pv=pvd, defaults=FMT_DEFAULT))};</script>\n', after=C_AFTER)

# ---------- Affiliate tags (admin-tools §3, B16) ----------
TAG_ROWS = [  # (key, where, amazon, flipkart, used on, required, note)
    ('web', 'Website (deal page)', 'offertag-21', 'offertag', 'Buy buttons', True, ''),
    ('short', 'Short links and WhatsApp copies', 'offertag1-21', 'offertag', 'Copy for WhatsApp, short links', True, ''),
    ('google', 'Google search visits (?source=)', 'offertag2-21', 'offertag', 'Visits from search', True, ''),
    ('fb', 'Facebook (posts and ?fbclid visits)', 'offertagfb-21', 'offertag', 'Facebook Page posts', True, ''),
    ('pin', 'Pinterest', '', '', 'Pinterest pins', False, ''),
    ('th', 'Threads', '', '', 'Threads posts', False, ''),
    ('app', 'Android app', 'offertag-21', 'offertag', 'App buy button', True, 'check'),
]
def build_tags():
    rows = ''.join(f'''          <tr data-tag-row="{k}">
            <td class="c-name"><b>{E(w)}</b>{'<span class="tag-check" title="The app source is not in the files we hold. Confirm with the app developer.">Check with app</span>' if note else ''}</td>
            <td data-l="Amazon tag"><label class="fld"><span class="visually-hidden">Amazon tag for {E(w)}</span><input class="input q-input mono" type="text" value="{E(a)}" data-tag="amz" placeholder="{"Required" if req else "Not set"}"{" data-req" if req else ""} spellcheck="false" autocomplete="off"><span class="err" hidden></span></label></td>
            <td class="m-used" data-l="Used on">{E(u)}</td>
          </tr>''' for k, w, a, f, u, req, note in TAG_ROWS)
    body = f'''      <div class="page-h">
        <div><h1>Affiliate tags</h1><p>Which tag goes on each link, so a sale can be traced to where the visitor came from. Tags are added when a link is saved or shared; the stored deal link stays clean.</p></div>
      </div>
      <form data-tags novalidate>
        <div class="tbl-wrap"><table class="tbl ltbl tags-tbl">
          <thead><tr><th>Where the link is used</th><th>Amazon tag</th><th>Used on</th></tr></thead>
          <tbody>
{rows}
          </tbody></table></div>
        <p class="foot-note"><i data-lucide="user-round"></i><span>Poster tags: each Super admin or Admin can have their own Amazon tag, set in <a href="admin-users.html">Users</a>. It replaces the website tag on links they share from the admin.</span></p>
        <p class="foot-note"><i data-lucide="info"></i><span>Pinterest and Threads have no tag yet. Until you add one, their links carry the website tag. Amazon tags in India end in “-21”.</span></p>
        <div class="savebar" data-savebar hidden><span>Unsaved changes</span><button class="btn btn-ghost btn-sm" type="button" data-discard>Discard</button><button class="btn btn-default btn-sm" type="submit">Save tags</button></div>
      </form>'''
    shell('admin-tags.html', 'Affiliate tags', 'tags', admin_only('Affiliate tags', body), after=C_AFTER)

# ---------- Inbox (admin-tools §4) ----------
def build_inbox():
    R = ADM_ROWS
    fb = [dict(id=1, kind='Issue', who='rahul@…', when='2 h', msg='Shop Now on the boAt earbuds deal opens a page that says 404.', done=False),
          dict(id=2, kind='Suggestion', who='priya@…', when='5 h', msg='Please add a dark mode to the app.', done=False),
          dict(id=3, kind='Appreciation', who='kavya@…', when='1 d', msg='Saved ₹3,000 on my TV, thanks!', done=True)]
    rp = [dict(id=11, reason='Price has changed', deal=R[0]['t'], did=R[0]['id'], page=R[0]['page'], who='Signed out', when='40 min', note=f'Now {inr(round(R[0]["p"] * 1.2))}', done=False),
          dict(id=12, reason='Link not working', deal=R[5]['t'], did=R[5]['id'], page=R[5]['page'], who='rahul@…', when='3 h', note='', done=False),
          dict(id=13, reason='Out of stock', deal=R[9]['t'], did=R[9]['id'], page=R[9]['page'], who='sneha@…', when='1 d', note='', done=True)]
    dl = [dict(id=21, name='Arjun V.', email='arjun.v@…', phone='97xxxxxx08', reason='Not using it anymore', when='1 d', done=False),
          dict(id=22, name='Vikram T.', email='vikram@…', phone='90xxxxxx13', reason='Too many notifications', when='9 d', done=True, result='Deleted 6 Nov')]
    un = lambda xs: len(xs)   # 2026-11-26: no handled / unhandled; the tab shows how many there are
    body = f'''      <div class="page-h">
        <div><h1>Inbox</h1><p>Messages from the Contact form and account deletion requests from the app and site. Comments are on each deal's page now.</p></div>
      </div>
      <div class="inbox-bar">{tabs('data-itab', [('feedback', 'Feedback', un(fb)), ('deletion', 'Deletion requests', un(dl))], 'feedback')}
        <span class="tag-sample">Sample</span></div>
      <ul class="ibx" data-ibx></ul>
      <p class="empty" data-ibx-empty hidden></p>
      <p class="foot-note" data-ibx-note="deletion" hidden><i data-lucide="info"></i>“Mark deleted” only records that the account was removed. Delete the account on the server first; the app promises removal within 7 days.</p>
{OVERLAY}
{CONFIRM}'''
    shell('admin-inbox.html', 'Inbox', 'feedback', admin_only('Inbox', body),
          scripts=f'<script>window.ADM_INBOX = {jdump(dict(feedback=fb, deletion=dl))};</script>\n', after=C_AFTER)

# ---------- Site & app (admin-tools §5, B33) ----------
def build_site():
    def row(label, hint, ctrl): return f'<div class="set-row"><div class="set-l"><b>{label}</b>{f"<small>{hint}</small>" if hint else ""}</div><div class="set-c">{ctrl}</div></div>'
    def url(name, val, ph, kind='url'): return f'<label class="fld"><span class="visually-hidden">{E(ph)}</span><input class="input" type="{kind}" name="{name}" value="{E(val)}" placeholder="{E(ph)}" spellcheck="false" autocomplete="off"><span class="err" hidden></span></label>'
    body = f'''      <div class="page-h">
        <div><h1>Site & app settings</h1><p>Switches and links used across the website header, footer and menu, and in the app.</p></div>
      </div>
      <form class="set" data-site novalidate>
        <!-- 2026-11-25: Home switches (sale posters, join button), Featured deals rules and the empty Header block are gone (changes.md A-06, A-14, A-16) -->
        <section class="panel"><div class="panel-h"><h2>Links</h2><small>footer, menu, Deal alerts and app</small></div>
          {row('WhatsApp group', '', url('wa', 'https://chat.whatsapp.com/FpM8Z1mM898BmFOqd8ccqg', 'https://chat.whatsapp.com/…'))}
          {row('Telegram channel', '', url('tg', 'https://t.me/OffertagLoot', 'https://t.me/…'))}
          {row('Facebook', '', url('fb', 'https://www.facebook.com/Offertag.in', 'https://facebook.com/…'))}
          {row('Instagram', 'Hidden on the site while empty.', url('ig', '', 'https://instagram.com/…'))}
          {row('LinkedIn', 'Hidden on the site while empty.', url('li', '', 'https://linkedin.com/company/…'))}
          {row('Play Store', '', url('play', 'https://play.google.com/store/apps/details?id=app.offertag', 'https://play.google.com/…'))}
          {row('Support email', 'Shown on Contact, FAQ and the footer.', url('mail', 'support@offertag.in', 'name@offertag.in', 'email'))}
        </section>
        <div class="savebar" data-savebar hidden><span>Changes apply to the website at once and to the app the next time it opens.</span><button class="btn btn-ghost btn-sm" type="button" data-discard>Discard</button><button class="btn btn-default btn-sm" type="submit">Save</button></div>
      </form>'''
    shell('admin-site.html', 'Site & app settings', 'site', admin_only('Site & app settings', body), after=C_AFTER)

# ---------- Users and roles (changes.md A-13): Super admin and Admin only; add, edit, turn off, delete; a page per person with an activity log ----------
# The public site's users (28,880 sign-ups) are only a number on Overview (changes.md A-12).
USERS = [  # SAMPLE (id, name, email, phone, role, joined, Amazon tag, active, last sign-in)
    ('Adil', 'adil@offertag.in', '98xxxxxx01', 'Super admin', '2019-06', 'offertag-21', True, 'today'),
    ('Imran K.', 'imran@offertag.in', '', 'Admin', '2025-01', 'offertag3-21', True, 'today'),
    ('Neha P.', 'neha.p@offertag.in', '', 'Admin', '2025-08', '', True, 'yesterday'),
    ('Farhan A.', 'farhan@offertag.in', '', 'Admin', '2024-04', 'offertag4-21', False, '3 months ago'),
]
ROLE_NOTE = '<b>Super admin</b> can do everything. <b>Admin</b> can post, edit and delete deals, but can’t change categories or stores.'
def build_users():
    data = [dict(id=i + 1, name=n, email=e, phone=p, role=r, joined=j, tag=t, active=a, last=l) for i, (n, e, p, r, j, t, a, l) in enumerate(USERS)]
    body = f'''      <div class="page-h">
        <div><h1>Users</h1><p>The people who run OfferTag. Each can have their own Amazon tag for the links they share.</p></div>
        <div class="page-h-acts"><button class="btn btn-default" type="button" data-unew><i data-lucide="user-plus"></i>Add user</button></div>
      </div>
      <p class="role-line"><i data-lucide="shield"></i><span>{ROLE_NOTE}</span></p>
      <div class="toolbar">
        <label class="input-wrap tb-search"><i data-lucide="search"></i><span class="visually-hidden">Search users</span><input class="input" type="search" placeholder="Name or email" data-uq></label>
        {_sel('data-urole aria-label="Role"', '<option value="">Everyone</option><option>Super admin</option><option>Admin</option>', 'tb-sel')}
        <span class="count" data-ucount></span>
      </div>
      <div class="tbl-wrap"><table class="tbl ltbl users-tbl">
        <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Last signed in</th><th>Amazon tag</th><th class="c-act"><span class="visually-hidden">Actions</span></th></tr></thead>
        <tbody data-urows></tbody></table>
        <p class="empty" data-uempty hidden>No users match. <button class="btn-link" type="button" data-uclear>Clear search</button></p></div>
{OVERLAY}
{USER_FORM}
{CONFIRM}'''
    shell('admin-users.html', 'Users', 'users', admin_only('Users', body), scripts=f'<script>window.ADM_USERS = {jdump(data)};</script>\n', after=C_AFTER)

USER_FORM = '''      <aside class="sheet sheet-right" id="user-edit" hidden data-state="closed" role="dialog" aria-modal="true" aria-labelledby="ue-title">
        <div class="sheet-header"><div class="sheet-title" id="ue-title">Add user</div><p class="sheet-desc" data-ue-sub>They sign in with a code sent to this email.</p></div>
        <button class="sheet-close" type="button" data-close aria-label="Close"><i data-lucide="x"></i></button>
        <form class="sheet-body pe" data-ue novalidate>
          <label class="fld"><span class="lab">Name *</span><input class="input" type="text" name="name" maxlength="60" autocomplete="off"><span class="err" hidden>Add a name.</span></label>
          <label class="fld"><span class="lab">Email *</span><input class="input" type="email" name="email" autocomplete="off" placeholder="name@offertag.in"><span class="err" hidden>Add a working email.</span></label>
          <div class="fld"><span class="lab">Role *</span>
            <div class="role-pick">
              <label class="role-opt"><input type="radio" name="role" value="Admin" checked><span><b>Admin</b><small>Posts, edits and deletes deals. Can’t change categories or stores.</small></span></label>
              <label class="role-opt"><input type="radio" name="role" value="Super admin"><span><b>Super admin</b><small>Everything.</small></span></label>
            </div></div>
          <label class="fld"><span class="lab">Amazon tag <small>optional; used on links this person shares</small></span><input class="input mono" type="text" name="tag" placeholder="e.g. offertag5-21" spellcheck="false" autocomplete="off"><span class="err" hidden>Amazon tags in India end in “-21”.</span></label>
          <label class="ckl"><span class="ck"><input type="checkbox" name="active" checked><span class="box"><i data-lucide="check"></i></span></span><span>Active <small>can sign in</small></span></label>
        </form>
        <div class="sheet-footer"><button class="btn btn-ghost danger" type="button" data-ue-del hidden><i data-lucide="trash-2"></i>Delete</button><span class="grow"></span><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-ue-save>Save</button></div>
      </aside>'''

def build_user_page():  # /admin/users/{id}
    body = f'''      <a class="back" href="admin-users.html"><i data-lucide="chevron-left"></i>Users</a>
      <div class="up" data-user-page>
        <section class="panel up-head">
          <span class="avatar up-av" data-up-av>A</span>
          <div class="up-main"><h1 data-up-name>User</h1><p class="up-sub" data-up-sub></p><div class="up-badges" data-up-badges></div></div>
          <div class="up-acts">
            <button class="btn btn-default" type="button" data-up="edit"><i data-lucide="pencil"></i>Edit</button>
            <button class="btn btn-outline" type="button" data-up="role"><i data-lucide="shield"></i><span>Make Super admin</span></button>
            <button class="btn btn-outline" type="button" data-up="active"><i data-lucide="power"></i><span>Turn off</span></button>
            <button class="btn btn-ghost danger" type="button" data-up="del"><i data-lucide="trash-2"></i>Delete</button>
          </div>
        </section>
        <section class="up-stats" data-up-stats></section>
        <section class="panel">
          <div class="panel-h"><h2>Activity</h2><div class="seg up-filter" role="group" aria-label="Show"><button type="button" aria-pressed="true" data-uf="">All</button><button type="button" aria-pressed="false" data-uf="deal">Deals</button><button type="button" aria-pressed="false" data-uf="signin">Sign-ins</button><button type="button" aria-pressed="false" data-uf="settings">Settings</button></div></div>
          <ul class="up-log" data-up-log></ul>
          <p class="empty" data-up-empty hidden>Nothing here yet.</p>
        </section>
        <p class="empty" data-up-missing hidden>This user isn’t here any more. <a href="admin-users.html">Back to Users</a></p>
      </div>
{OVERLAY}
{USER_FORM}
{CONFIRM}'''
    shell('admin-user.html', 'User', 'users', admin_only('Users', body), scripts=f'<script>window.ADM_USERS = {jdump([dict(id=i + 1, name=n, email=e, phone=p, role=r, joined=j, tag=t, active=a, last=l) for i, (n, e, p, r, j, t, a, l) in enumerate(USERS)])};</script>\n', after=C_AFTER)

# ---------- Catalogue (admin-tools §7) ----------
def build_catalogue():
    shops = [dict(id=s['id'], name=s['name'], label=s['name'][:13], slug=s['slug'], aff=s['affiliate'].strip(), order=s['order'], n=s['total'], on=True,
                  logo=store_logo(s['name']) or '', steps=SHOP_STEPS.get(s['name'], SHOP_STEPS['*']), seo=s['description']) for s in SHOPS]
    cats = []
    for c in CATS:
        img = f"assets/cats/{c['slug']}.jpg"
        cats.append(dict(id=c['id'], name=c['name'], slug=c['slug'], order=c['order'], n=c['total'], on=True, img=img if os.path.exists(os.path.join(ROOT, img)) else '',
                         title=c['title'], seo=c['description']))
    tcount = lambda t: sum(1 for d in deals if t in d['types'])
    # changes.md A-14: the rule behind each tab is set here (old live site defaults: Top 25%+, Loot 75%+, New under 25%, Pantry = Grocery)
    dtypes = [dict(id=i + 1, key=k, name=n, order=i + 1, n=tcount(k), on=True) for i, (n, k) in enumerate([('Top deals', 'Top'), ('Loot', 'Loot'), ('New', 'New'), ('Pantry', 'Pantry')])]
    types = [dict(id=1, name='Deal Type', alias='deal_type')]
    body = f'''      <div class="page-h">
        <div><h1>Catalogue</h1><p>Shops, categories and deal types the site is built on. Changes show on the website at once.</p></div>
        <div class="page-h-acts"><button class="btn btn-default" type="button" data-cat-add><i data-lucide="plus"></i><span data-cat-add-l>Add shop</span></button></div>
      </div>
      {tabs('data-ctab', [('shops', 'Shops', len(shops)), ('categories', 'Categories', len(cats)), ('dealtypes', 'Deal types', len(dtypes))], 'shops')}
      <div class="toolbar" data-cat-tools>
        <label class="input-wrap tb-search"><i data-lucide="search"></i><span class="visually-hidden">Search</span><input class="input" type="search" placeholder="Search by name" data-cq></label>
        <span data-cat-active>{ck('data-conly checked', 'Active only')}</span>
        <span class="count" data-ccount></span>
      </div>
      <div class="tbl-wrap"><table class="tbl ltbl cat-tbl" data-ctbl><thead data-chead></thead><tbody data-crows></tbody></table>
        <p class="empty" data-cempty hidden>Nothing matches. <button class="btn-link" type="button" data-cclear>Clear search</button></p></div>
      <p class="foot-note" data-cnote></p>
{OVERLAY}
      <aside class="sheet sheet-right" id="cat-edit" hidden data-state="closed" role="dialog" aria-modal="true" aria-labelledby="ce-title">
        <div class="sheet-header"><div class="sheet-title" id="ce-title">Edit</div><p class="sheet-desc" data-ce-sub></p></div>
        <button class="sheet-close" type="button" data-close aria-label="Close"><i data-lucide="x"></i></button>
        <form class="sheet-body pe" data-ce novalidate></form>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-ce-save>Save</button></div>
      </aside>
{CONFIRM}'''
    shell('admin-catalogue.html', 'Catalogue', 'shops', admin_only('Catalogue', body),
          scripts=f'<script>window.ADM_CAT = {jdump(dict(shops=shops, categories=cats, dealtypes=dtypes, types=types))};</script>\n', after=C_AFTER)

build_social(); build_tags(); build_inbox(); build_site(); build_users(); build_user_page(); build_catalogue()
print('Admin: batch C (admin-social, admin-tags, admin-inbox, admin-site, admin-roles, admin-users, admin-catalogue)')
