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
CHANNELS = [  # where deals are shared (P-44)
    dict(k='fb', name='Facebook Page', mark='f', acct='OfferTag.in'),
    dict(k='pin', name='Pinterest', mark='P', acct='OfferTag'),
    dict(k='th', name='Threads', mark='@', acct='@offertag'),
]

def build_social():  # P-44 (Adil): we set up their own apps, so nothing to connect here; just where deals go and how a post looks
    cards = ''.join(f'''          <article class="spc" data-spc="{c["k"]}">
            <h2><span class="ch-mark sm ch-{c["k"]}" aria-hidden="true">{c["mark"]}</span>{E(c["name"])} <small>{E(c["acct"])}</small><span class="pill pill-live spc-st">Connected</span></h2>
            <div class="spv spv-{c["k"]}"><div class="spv-who"><span class="ch-mark sm ch-{c["k"]}" aria-hidden="true">{c["mark"]}</span><b>OfferTag</b><small>Just now</small></div><img alt="" data-spv-img><p data-spv-text></p></div>
          </article>''' for c in CHANNELS)
    body = f'''      <div class="page-h">
        <div><h1>Social sharing</h1><p>Deals are shared to these places from each deal’s page. Each shows whether it is connected, and how a deal looks there.</p></div>
      </div>
      <div class="spcs">
{cards}
      </div>'''
    shell('admin-social.html', 'Social sharing', 'social', admin_only('Social sharing', body), scripts='<script>window.ADM_SOCIAL = 1;</script>\n', after=C_AFTER)

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
            <td class="c-name"><b>{E(w)}</b></td>
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
        <p class="foot-note"><i data-lucide="info"></i><span>Pinterest and Threads have no tag yet. Until you add one, their links carry the website tag. Amazon tags in India end in “-21”.</span></p>
        <div class="savebar" data-savebar hidden><span>Unsaved changes</span><button class="btn btn-ghost btn-sm" type="button" data-discard>Discard</button><button class="btn btn-default btn-sm" type="submit">Save tags</button></div>
      </form>'''
    shell('admin-tags.html', 'Affiliate tags', 'tags', admin_only('Affiliate tags', body), after=C_AFTER)

# ---------- Inbox (admin-tools §4) ----------
def build_inbox():
    R = ADM_ROWS
    fb = [dict(id=1, kind='Issue', who='rahul.k@gmail.com', when='2 h', msg='Shop Now on the boAt earbuds deal opens a page that says 404.'),
          dict(id=2, kind='Suggestion', who='priya.s@gmail.com', when='5 h', msg='Please add a dark mode to the app.'),
          dict(id=3, kind='Appreciation', who='kavya.m@gmail.com', when='1 d', msg='Saved ₹3,000 on my TV, thanks!')]
    rp = [dict(id=11, reason='Price has changed', deal=R[0]['t'], did=R[0]['id'], page=R[0]['page'], who='Signed out', when='40 min', note=f'Now {inr(round(R[0]["p"] * 1.2))}', done=False),
          dict(id=12, reason='Link not working', deal=R[5]['t'], did=R[5]['id'], page=R[5]['page'], who='rahul@…', when='3 h', note='', done=False),
          dict(id=13, reason='Out of stock', deal=R[9]['t'], did=R[9]['id'], page=R[9]['page'], who='sneha@…', when='1 d', note='', done=True)]
    dl = [dict(id=21, name='Arjun V.', email='arjun.v@…', phone='97xxxxxx08', reason='Not using it anymore', when='1 d', done=False),
          dict(id=22, name='Vikram T.', email='vikram@…', phone='90xxxxxx13', reason='Too many notifications', when='9 d', done=True, result='Deleted 6 Nov')]
    un = lambda xs: sum(1 for x in xs if not x['done'])
    body = f'''      <div class="page-h">
        <div><h1>Inbox</h1><p>Messages from the Contact form and account deletion requests from the app and site. Comments are on each deal's page now.</p></div>
      </div>
      <div class="inbox-bar">{tabs('data-itab', [('feedback', 'Feedback', None), ('deletion', 'Deletion requests', un(dl))], 'feedback')}
        </div>
      <ul class="ibx" data-ibx></ul>
      <p class="empty" data-ibx-empty hidden></p>
      <p class="foot-note" data-ibx-note="deletion" hidden><i data-lucide="info"></i>Requests from the public delete-account form, for people who can’t sign in. Delete account removes it the same way as deleting from Account. Google Play expects removal within 7 days.</p>
{OVERLAY}
{CONFIRM}
      <aside class="sheet sheet-right" id="fb-reply" hidden data-state="closed" role="dialog" aria-modal="true" aria-labelledby="fr-title">
        <div class="sheet-header"><div class="sheet-title" id="fr-title">Message</div><p class="sheet-desc" data-fr-to></p></div>
        <button class="sheet-close" type="button" data-close aria-label="Close"><i data-lucide="x"></i></button>
        <form class="sheet-body pe" data-fr novalidate>
          <blockquote class="fr-quote" data-fr-msg></blockquote>
          <div class="fr-reply" data-fr-reply><h3 class="fr-h">Reply by email</h3>
          <label class="fld"><span class="lab">Subject *</span><input class="input" type="text" name="subject" maxlength="120"><span class="err" hidden>Add a subject.</span></label>
          <label class="fld"><span class="lab">Message *</span><textarea class="input" name="body" rows="9" maxlength="2000"></textarea><span class="err" hidden>Add a message.</span></label>
          <p class="hint">Filled from the template for this kind of message. Edit it before sending if needed. Sent from the support email in Site &amp; app.</p></div>
        </form>
        <div class="sheet-footer"><span class="grow"></span><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-fr-send data-fr-reply><i data-lucide="send"></i>Send reply</button></div>
      </aside>'''
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
USERS = [  # SAMPLE (name, email, phone, role, joined, active, last sign-in); P-43: no per-user Amazon tag (Adil, 26 Nov)
    ('Adil', 'adil@offertag.in', '98xxxxxx01', 'Super admin', '2019-06', True, 'today'),
    ('Imran K.', 'imran@offertag.in', '', 'Admin', '2025-01', True, 'today'),
    ('Neha P.', 'neha.p@offertag.in', '', 'Admin', '2025-08', True, 'yesterday'),
    ('Farhan A.', 'farhan@offertag.in', '', 'Admin', '2024-04', False, '3 months ago'),
]
_Y, _N = '<i data-lucide="check" class="mx-y" aria-label="Yes"></i>', '<span class="mx-n" aria-label="No">—</span>'
ROLE_MX = '<table class="tbl mx-tbl"><thead><tr><th>Area</th><th>Super admin</th><th>Admin</th><th>User</th></tr></thead><tbody>' + ''.join(f'<tr><td>{a}</td><td>{_Y}</td><td>{_Y if x else _N}</td><td>{_N}</td></tr>' for a, x in [
    ('Overview', 1), ('Deals: post, edit, delete, share', 1), ('Pinned board', 1), ('Alerts', 1), ('Sponsored', 0), ('Blog', 0), ('Inbox', 0), ('Catalogue: shops, categories, deal types', 0),
    ('Settings: site and app, affiliate tags, social sharing', 0), ('Users: add, edit, turn off, delete', 0)]) + f'<tr><td>Website and app: view deals, edit own profile</td><td>{_Y}</td><td>{_Y}</td><td>{_Y}</td></tr></tbody></table><p class="mx-note">Users are the people who sign in on the website or app. They never open the admin and are not listed here.</p>'   # P-51: same as admin_only() pages
def build_users():
    data = [dict(id=i + 1, name=n, email=e, phone=p, role=r, joined=j, active=a, last=l) for i, (n, e, p, r, j, a, l) in enumerate(USERS)]
    body = f'''      <div class="page-h">
        <div><h1>Users</h1><p>The people who run OfferTag.</p></div>
        <div class="page-h-acts"><button class="btn btn-default" type="button" data-unew><i data-lucide="user-plus"></i>Add user</button></div>
      </div>
      <details class="panel role-mx"><summary><i data-lucide="shield"></i>What each role can do</summary>{ROLE_MX}</details>
      <div class="toolbar">
        <label class="input-wrap tb-search"><i data-lucide="search"></i><span class="visually-hidden">Search users</span><input class="input" type="search" placeholder="Name or email" data-uq></label>
        {_sel('data-urole aria-label="Role"', '<option value="">Everyone</option><option>Super admin</option><option>Admin</option>', 'tb-sel')}
        <span class="count" data-ucount></span>
      </div>
      <div class="tbl-wrap"><table class="tbl ltbl users-tbl">
        <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Last signed in</th><th class="c-act"><span class="visually-hidden">Actions</span></th></tr></thead>
        <tbody data-urows></tbody></table>
        <p class="empty" data-uempty hidden>No users match. <button class="btn-link" type="button" data-uclear>Clear search</button></p></div>
{SAVEBAR}
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
    shell('admin-user.html', 'User', 'users', admin_only('Users', body), scripts=f'<script>window.ADM_USERS = {jdump([dict(id=i + 1, name=n, email=e, phone=p, role=r, joined=j, active=a, last=l) for i, (n, e, p, r, j, a, l) in enumerate(USERS)])};</script>\n', after=C_AFTER)

# ---------- Catalogue (admin-tools §7) ----------
def build_catalogue():
    amz_ids = [dict(label=l, id=i) for l, i in (('web', 'offertag-21'), ('short', 'offertag1-21'), ('google', 'offertag2-21'), ('fb', 'offertagfb-21'))]  # label = where the ID is used (fixed list in admin-c.js AFF_USE)  # P-47: sample, the Amazon tags already used on Affiliate tags
    def affs(s): return amz_ids if s['name'] == 'Amazon' else ([dict(label='web', id=s['affiliate'].strip())] if s['affiliate'].strip() else [])
    shops = [dict(id=s['id'], name=s['name'], label=s['name'][:13], slug=s['slug'], aff=s['affiliate'].strip(), affs=affs(s), order=s['order'], n=s['total'], on=True,
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
{SAVEBAR}
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
