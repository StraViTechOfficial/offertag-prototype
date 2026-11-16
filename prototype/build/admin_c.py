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
    return (f'      <div class="sub-note" data-role="sub"><i data-lucide="lock"></i><p>{page_name} is for admins only. Sub-admins see Deals and View site. <a href="admin-deals.html?role=sub">Go to All deals</a></p></div>\n'
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
        acct = (_sel('data-pin-board aria-label="Pinterest board"', _opts(['Loot deals', 'Fresh deals', 'All deals'], 'Loot deals'), 'sel-sm') if c['acct'] == 'board' else f'<span class="ch-acct">{E(c["acct"])}</span>')
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
    cards = []
    for c in CHANNELS:
        k = c['k']
        cards.append(f'''            <details class="fmt panel" data-fmt="{k}"{" open" if k == "fb" else ""}>
              <summary class="panel-h"><h2><span class="ch-mark ch-{k} sm" aria-hidden="true">{c["mark"]}</span>{E(c["name"])}</h2><span class="fmt-dirty" data-fmt-dirty hidden>Unsaved</span><i data-lucide="chevron-down"></i></summary>
              <div class="fmt-body">
                {ck('data-fmt-img checked', 'Include the deal image')}
                <label class="fld"><span class="lab">Text</span><textarea class="textarea mono" rows="5" data-fmt-text spellcheck="false">{E(FMT_DEFAULT[k])}</textarea><span class="err" hidden>Keep {{short_link}} so the post links back to the deal.</span></label>
                <div class="ins"><span class="lab">Insert</span>{"".join(f'<button class="chip-add" type="button" data-ins="{{{p}}}">{{{p}}}</button>' for p in ("title", "price", "mrp", "pct", "store", "coupon_line", "short_link"))}</div>
                <p class="hint-line"><i data-lucide="tag"></i>Amazon tag on these links: <b data-fmt-tag="{k}"></b> <a href="admin-tags.html">Affiliate tags</a></p>
                <div class="fmt-foot"><button class="btn btn-default btn-sm" type="button" data-fmt-save disabled>Save format</button><button class="btn btn-ghost btn-sm" type="button" data-fmt-reset>Reset to default</button></div>
              </div>
            </details>''')
    body = f'''      <div class="page-h">
        <div><h1>Social sharing</h1><p>Share a deal to the OfferTag Facebook Page, Pinterest and Threads from the deal's edit screen. Connect each place once here, and set what each post says.</p></div>
      </div>
      {tabs('data-stab', [('channels', 'Channels', None), ('formats', 'Formats', None), ('history', 'History', None)], 'channels')}
      <section data-spanel="channels">
        <div class="panel"><div class="panel-h"><h2>Where deals can be shared</h2><span class="tag-sample">Sample</span></div><ul class="chs" data-chs>
{chr(10).join(rows)}
        </ul></div>
        <p class="foot-note" data-approval-note><i data-lucide="info"></i>Meta (Facebook, Threads) and Pinterest must approve the OfferTag app before posting works; that is due by week 7. Until then these show “Awaiting platform approval”.</p>
      </section>
      <section data-spanel="formats" hidden>
        <div class="fmts">
          <div class="fmt-list">
{chr(10).join(cards)}
          </div>
          <details class="panel fmt-pv" open data-fmt-pvwrap><summary class="panel-h"><h2>Preview <small data-pv-name>Facebook Page</small></h2><i data-lucide="chevron-down"></i></summary>
            <div class="spv"><img src="{pvd["img"]}" alt="" data-spv-img><p data-spv-text></p><small class="spv-meta" data-spv-meta></small></div>
            <p class="foot-note pad"><i data-lucide="info"></i>Sample deal: the newest deal. {{coupon_line}} shows “Code: …” only when the deal has a coupon.</p>
          </details>
        </div>
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
            <td data-l="Flipkart id"><label class="fld"><span class="visually-hidden">Flipkart id for {E(w)}</span><input class="input q-input mono" type="text" value="{E(f)}" data-tag="fk" placeholder="Not set" spellcheck="false" autocomplete="off"></label></td>
            <td class="m-used" data-l="Used on">{E(u)}</td>
          </tr>''' for k, w, a, f, u, req, note in TAG_ROWS)
    body = f'''      <div class="page-h">
        <div><h1>Affiliate tags</h1><p>Which tag goes on each link, so a sale can be traced to where the visitor came from. Tags are added when a link is saved or shared; the stored deal link stays clean.</p></div>
      </div>
      <form data-tags novalidate>
        <div class="tbl-wrap"><table class="tbl ltbl tags-tbl">
          <thead><tr><th>Where the link is used</th><th>Amazon tag</th><th>Flipkart id</th><th>Used on</th></tr></thead>
          <tbody>
{rows}
          </tbody></table></div>
        <p class="foot-note"><i data-lucide="user-round"></i><span>Poster tags: an admin or sub-admin can have their own Amazon tag, set in <a href="admin-users.html">Users</a>. It replaces the website tag on links they share from the admin.</span></p>
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
    un = lambda xs: sum(1 for x in xs if not x['done'])
    body = f'''      <div class="page-h">
        <div><h1>Inbox</h1><p>Messages from the Contact form, problems reported on deal pages, and account deletion requests from the app and site.</p></div>
      </div>
      <div class="inbox-bar">{tabs('data-itab', [('feedback', 'Feedback', un(fb)), ('reports', 'Reports', un(rp)), ('deletion', 'Deletion requests', un(dl))], 'feedback')}
        {ck('data-unhandled checked', 'Unhandled only')}<span class="tag-sample">Sample</span></div>
      <ul class="ibx" data-ibx></ul>
      <p class="empty" data-ibx-empty hidden></p>
      <p class="foot-note" data-ibx-note="deletion" hidden><i data-lucide="info"></i>“Mark deleted” only records that the account was removed. Delete the account on the server first; the app promises removal within 7 days.</p>
{OVERLAY}
{CONFIRM}'''
    shell('admin-inbox.html', 'Inbox', 'feedback', admin_only('Inbox', body),
          scripts=f'<script>window.ADM_INBOX = {jdump(dict(feedback=fb, reports=rp, deletion=dl))};</script>\n', after=C_AFTER)

# ---------- Site & app (admin-tools §5, B33) ----------
def build_site():
    def row(label, hint, ctrl): return f'<div class="set-row"><div class="set-l"><b>{label}</b>{f"<small>{hint}</small>" if hint else ""}</div><div class="set-c">{ctrl}</div></div>'
    def url(name, val, ph, kind='url'): return f'<label class="fld"><span class="visually-hidden">{E(ph)}</span><input class="input" type="{kind}" name="{name}" value="{E(val)}" placeholder="{E(ph)}" spellcheck="false" autocomplete="off"><span class="err" hidden></span></label>'
    body = f'''      <div class="page-h">
        <div><h1>Site & app settings</h1><p>Switches and links used across the website header, footer and menu, and in the app.</p></div>
      </div>
      <form class="set" data-site novalidate>
        <section class="panel"><div class="panel-h"><h2>Home</h2></div>
          {row('Sale posters', 'The poster slider at the top of Home. <a href="admin-posters.html">Manage posters</a>', sw('name="posters"', True, 'Sale posters'))}
          {row('Join button', 'The small WhatsApp / Telegram button in the bottom corner of every public page. Opens when tapped, closes on scroll. Uses the links below.', sw('name="strip"', True, 'Join button'))}
        </section>
        <section class="panel"><div class="panel-h"><h2>Featured deals</h2><span class="tag-sample">Sample</span></div>
          {row('Price at or above', 'Deals at this price or higher get a “Featured” flag in Incoming, so they are reviewed first.', f'<label class="input-wrap pre"><span>₹</span><input class="input mono" type="number" name="feat_price" min="0" step="500" value="{FEATURED["price"]}" aria-label="Featured price threshold"></label>')}
          {row('Or discount at or above', 'Flag big discounts too. Leave empty to use price only.', f'<label class="input-wrap post"><input class="input mono" type="number" name="feat_pct" min="0" max="99" value="{FEATURED["pct"]}" aria-label="Featured discount threshold"><span>%</span></label>')}
          {row('At most per day', 'After this many, matching deals come in without the flag, so highlights stay special.', f'<input class="input mono feat-cap" type="number" name="feat_cap" min="1" max="50" value="{FEATURED["cap"]}" aria-label="Featured deals per day">')}
          {row('What the flag does', 'Nothing is published or promoted on its own. An admin always decides.', _sel('name="feat_do" aria-label="What the flag does"', '<option>Flag in Incoming for review</option><option>Flag and suggest Top pick</option><option>Flag and suggest a push alert</option>'))}
        </section>
        <section class="panel"><div class="panel-h"><h2>Header</h2></div>
          {row('Blog “New” pill', 'Shows next to Blog until a visitor opens the newest post.', sw('name="blognew"', True, 'Blog New pill'))}
        </section>
        <section class="panel"><div class="panel-h"><h2>Links</h2><small>footer, menu, Deal alerts and app</small></div>
          {row('WhatsApp group', '', url('wa', 'https://chat.whatsapp.com/FpM8Z1mM898BmFOqd8ccqg', 'https://chat.whatsapp.com/…'))}
          {row('Telegram channel', '', url('tg', 'https://t.me/OffertagLoot', 'https://t.me/…'))}
          {row('Facebook', '', url('fb', 'https://www.facebook.com/Offertag.in', 'https://facebook.com/…'))}
          {row('Instagram', 'Hidden on the site while empty.', url('ig', '', 'https://instagram.com/…'))}
          {row('LinkedIn', 'Hidden on the site while empty.', url('li', '', 'https://linkedin.com/company/…'))}
          {row('Play Store', '', url('play', 'https://play.google.com/store/apps/details?id=app.offertag', 'https://play.google.com/…'))}
          {row('Support email', 'Shown on Contact, FAQ and the footer.', url('mail', 'support@offertag.in', 'name@offertag.in', 'email'))}
        </section>
        <section class="panel"><div class="panel-h"><h2>Help</h2></div>
          {row('Live chat (Tawk.to)', 'The chat bubble on every page.', sw('name="chat"', True, 'Live chat'))}
        </section>
        <div class="savebar" data-savebar hidden><span>Changes apply to the website at once and to the app the next time it opens.</span><button class="btn btn-ghost btn-sm" type="button" data-discard>Discard</button><button class="btn btn-default btn-sm" type="submit">Save</button></div>
      </form>'''
    shell('admin-site.html', 'Site & app settings', 'site', admin_only('Site & app settings', body), after=C_AFTER)

# ---------- Roles (read-only, D-057) ----------
def build_roles():
    Y, N = '<span class="yes"><i data-lucide="check"></i><span class="visually-hidden">Yes</span></span>', '<span class="no">—<span class="visually-hidden">No</span></span>'
    areas = [('Overview', 1, 0), ('All deals: edit, clone, share, status', 1, 1), ('Incoming deals: approve, reject', 1, 1), ('Post a deal', 1, 1), ('Pinned board', 1, 0),
             ('Sale posters', 1, 0), ('Alerts', 1, 0), ('Social sharing', 1, 0), ('Blog', 1, 0), ('Inbox', 1, 0), ('Catalogue', 1, 0), ('Users', 1, 0), ('Settings', 1, 0)]
    rows = ''.join(f'<tr><td>{E(a)}</td><td class="ctr">{Y if x else N}</td><td class="ctr">{Y if y else N}</td></tr>' for a, x, y in areas)
    body = f'''      <div class="page-h">
        <div><h1>Roles</h1><p>What each role can open in the admin. Roles are fixed; to give someone a different role, ask the developer.</p></div>
      </div>
      <div class="roles">
        <div class="role-c"><b>Admin</b><p>Everything, including settings and users.</p></div>
        <div class="role-c"><b>Sub-admin</b><p>Posts and manages deals. Sees Deals and View site only.</p></div>
        <div class="role-c"><b>Member</b><p>Signs in on the website or app to save deals and comment. No admin access.</p></div>
      </div>
      <div class="tbl-wrap"><table class="tbl roles-tbl">
        <thead><tr><th>Area</th><th class="ctr">Admin</th><th class="ctr">Sub-admin</th></tr></thead>
        <tbody>{rows}</tbody></table></div>
      <p class="foot-note"><i data-lucide="eye"></i><span>See the admin as a sub-admin: <a href="admin-deals.html?role=sub">Preview sub-admin menu</a>.</span></p>'''
    shell('admin-roles.html', 'Roles', 'roles', admin_only('Roles', body))

# ---------- Users (admin-tools §6) ----------
USERS = [  # SAMPLE (data sheet C)
    ('Adil', 'adil@…', '', 'Admin', '2019-06', 'offertag-21'), ('Imran K.', 'posts@…', '', 'Sub-admin', '2025-01', 'offertag3-21'),
    ('Neha P.', 'neha.p@…', '', 'Sub-admin', '2025-08', ''), ('Rahul S.', 'rahul@…', '98xxxxxx21', 'Member', '2024-03', ''),
    ('Priya M.', 'priya@…', '', 'Member', '2023-11', ''), ('Arjun V.', 'arjun.v@…', '97xxxxxx08', 'Member', '2026-10', ''),
    ('Sneha R.', 'sneha@…', '', 'Member', '2022-05', ''), ('Mohammed F.', 'mfaiz@…', '99xxxxxx44', 'Member', '2021-01', ''),
    ('Kavya N.', 'kavya@…', '', 'Member', '2026-11', ''), ('Vikram T.', 'vikram@…', '90xxxxxx13', 'Member', '2020-07', ''),
    ('Ananya G.', 'ananya@…', '', 'Member', '2025-12', ''), ('Deepak J.', 'deepak@…', '88xxxxxx70', 'Member', '2019-09', ''),
]
def build_users():
    data = [dict(id=i + 1, name=n, email=e, phone=p, role=r, joined=j, tag=t) for i, (n, e, p, r, j, t) in enumerate(USERS)]
    body = f'''      <div class="page-h">
        <div><h1>Users</h1><p>Everyone with an account. Admins and sub-admins can have their own Amazon tag for the links they share.</p></div>
      </div>
      <div class="toolbar">
        <label class="input-wrap tb-search"><i data-lucide="search"></i><span class="visually-hidden">Search users</span><input class="input" type="search" placeholder="Name, email or phone" data-uq></label>
        {_sel('data-urole aria-label="Role"', '<option value="">All roles</option><option>Admin</option><option>Sub-admin</option><option>Member</option>', 'tb-sel')}
        <span class="count" data-ucount></span><span class="tag-sample">Sample</span>
      </div>
      <div class="tbl-wrap"><table class="tbl ltbl users-tbl">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Amazon tag</th></tr></thead>
        <tbody data-urows></tbody></table>
        <p class="empty" data-uempty hidden>No users match. <button class="btn-link" type="button" data-uclear>Clear search</button></p></div>
      <p class="foot-note"><i data-lucide="info"></i><span>This prototype holds 12 sample users; the live list pages through every account. Emails and phone numbers stay masked in lists.</span></p>
{OVERLAY}
      <aside class="sheet sheet-right" id="user-edit" hidden data-state="closed" role="dialog" aria-modal="true" aria-labelledby="ue-title">
        <div class="sheet-header"><div class="sheet-title" id="ue-title">User</div><p class="sheet-desc" data-ue-sub></p></div>
        <button class="sheet-close" type="button" data-close aria-label="Close"><i data-lucide="x"></i></button>
        <form class="sheet-body pe" data-ue novalidate>
          <dl class="kv" data-ue-kv></dl>
          <label class="fld" data-ue-tagfld><span class="lab">Amazon tag <small>replaces the website tag on links this person shares</small></span><input class="input mono" type="text" name="tag" placeholder="e.g. offertag3-21" spellcheck="false" autocomplete="off"><span class="err" hidden>Amazon tags in India end in “-21”.</span></label>
          <p class="hint-line" data-ue-member hidden><i data-lucide="info"></i>Members don’t post deals, so they have no tag.</p>
        </form>
        <div class="sheet-footer"><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-ue-save>Save</button></div>
      </aside>'''
    shell('admin-users.html', 'Users', 'users', admin_only('Users', body), scripts=f'<script>window.ADM_USERS = {jdump(data)};</script>\n', after=C_AFTER)

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
    dtypes = [dict(id=i + 1, name=n, rule=r, order=i + 1, n=tcount(k), on=True) for i, (n, k, r) in enumerate([
        ('Fresh', 'Fresh', 'Everything posted today, newest first'), ('Top picks', 'Top', 'Our picks, ranked'), ('Loot', 'Loot', '70% off or more'),
        ('New', 'New', 'Just in'), ('Pantry', 'Pantry', 'Grocery and kitchen essentials')])]
    for d in dtypes:
        if d['name'] == 'New': d['rule'] = PAGES['new']['rule'] if 'new' in PAGES else d['rule']
        if d['name'] == 'Loot': d['rule'] = PAGES['loot']['rule'] if 'loot' in PAGES else d['rule']
        if d['name'] == 'Fresh': d['rule'] = PAGES['fresh']['rule'] if 'fresh' in PAGES else d['rule']
    types = [dict(id=1, name='Deal Type', alias='deal_type')]
    body = f'''      <div class="page-h">
        <div><h1>Catalogue</h1><p>Shops, categories and deal types the site is built on. Changes show on the website at once.</p></div>
        <div class="page-h-acts"><button class="btn btn-default" type="button" data-cat-add><i data-lucide="plus"></i><span data-cat-add-l>Add shop</span></button></div>
      </div>
      {tabs('data-ctab', [('shops', 'Shops', len(shops)), ('categories', 'Categories', len(cats)), ('dealtypes', 'Deal types', len(dtypes)), ('types', 'Types', len(types))], 'shops')}
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
        <div class="sheet-footer"><button class="btn btn-ghost danger" type="button" data-ce-del>Delete</button><button class="btn btn-outline" type="button" data-close>Cancel</button><button class="btn btn-default" type="button" data-ce-save>Save</button></div>
      </aside>
{CONFIRM}'''
    shell('admin-catalogue.html', 'Catalogue', 'shops', admin_only('Catalogue', body),
          scripts=f'<script>window.ADM_CAT = {jdump(dict(shops=shops, categories=cats, dealtypes=dtypes, types=types))};</script>\n', after=C_AFTER)

build_social(); build_tags(); build_inbox(); build_site(); build_roles(); build_users(); build_catalogue()
print('Admin: batch C (admin-social, admin-tags, admin-inbox, admin-site, admin-roles, admin-users, admin-catalogue)')
