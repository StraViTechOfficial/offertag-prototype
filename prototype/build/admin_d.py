# admin_d.py — admin batch D (S16): Blog posts list (33), Blog editor (34). Screen 35 is the phone pass over every admin page (CSS only).
# Runs inside build.py's namespace after admin_c.py. Data sheet: design-system/ia/data-sheets/admin-batch-d.md

def blog_admin_posts():
    raw = json.load(open(os.path.join(HERE, 'blog.json')))
    def blocks(body):
        out = []
        for b in body:
            if 'p' in b: out.append({'p': b['p']})
            elif 'h' in b: out.append({'h': b['h']})
            elif 'deal' in b: out.append({'deal': deals[b['deal']]['id']})
            elif 'img' in b: out.append({'img': 'assets/deals/lg/' + deals[b['img']]['file'], 'alt': b['alt']})
        return out
    def main_cat(ds):
        c = {}
        for d in ds: c[d['cat']] = c.get(d['cat'], 0) + 1
        return max(c, key=c.get) if c else ''
    posts = []
    for p in raw:
        ds = [deals[b['deal']] for b in p['body'] if 'deal' in b]
        dt = datetime.strptime(p['date'], '%Y-%m-%d')
        posts.append(dict(name=p['name'], title=p['title'], summary=p['summary'], status='published', date=p['date'], time='09:00', when=f'{dt.day} {dt:%b}',
                          cover=('assets/deals/lg/' + deals[p['cover']]['file']) if p['cover'] is not None else '', cat=main_cat(ds), body=blocks(p['body']), seo='', meta='', edited=''))
    # SAMPLE scheduled + draft posts (data sheet D), built from snapshot deals
    kit = [d for d in deals if d['cat'] == 'Kitchen'][:3]
    gro = [d for d in deals if d['cat'] in ('Grocery', 'Food & Beverage')][:2]
    wd = next(r for r in ADM_ROWS if r['status'] == 'withdrawn')
    if kit:
        posts.append(dict(name='kitchen-deals-for-the-wedding-season', title='Kitchen deals for the wedding season', summary='Cookware and appliances worth gifting, with live prices.', status='scheduled',
                          date='2026-11-15', time='09:00', when='15 Nov', cover='assets/deals/lg/' + kit[0]['file'], cat='Kitchen', seo='', meta='', edited='',
                          body=[{'p': 'Wedding season means gifts, and kitchen things are the safest pick. These are on our feed this week.'}, {'h': 'Cookware'}] + [{'deal': d['id']} for d in kit]))
    posts.append(dict(name='grocery-staples-price-watch', title='Grocery staples: price watch', summary='', status='draft', date='', time='', when='', cover='', cat=(gro[0]['cat'] if gro else ''), seo='', meta='', edited='1 h ago',
                      body=[{'p': 'Atta, oil and rice prices move every week. We track the packs our readers buy most.'}] + [{'deal': d['id']} for d in gro] + [{'deal': wd['id']}]))
    order = {'draft': 0, 'scheduled': 1, 'published': 2}
    posts.sort(key=lambda p: (order[p['status']], -int(p['date'].replace('-', '') or 0)))
    return posts

BLOG_ADMIN = blog_admin_posts()

def build_blog_list():
    n = lambda s: sum(1 for p in BLOG_ADMIN if p['status'] == s)
    body = f'''      <div class="page-h">
        <div><h1>Blog</h1><p>Guides and round-ups with live deals inside. A deal in a post always shows its current price, and says “No longer available” once it is withdrawn.</p></div>
        <div class="page-h-acts"><a class="btn btn-outline" href="blog.html" target="_blank" rel="noopener"><i data-lucide="external-link"></i>View blog</a><a class="btn btn-default" href="admin-blog-edit.html"><i data-lucide="plus"></i>New post</a></div>
      </div>
      <div class="toolbar">
        {tabs('data-btab', [('all', 'All', len(BLOG_ADMIN)), ('draft', 'Drafts', n('draft')), ('scheduled', 'Scheduled', n('scheduled')), ('published', 'Published', n('published'))], 'all')}
        <label class="input-wrap tb-search"><i data-lucide="search"></i><span class="visually-hidden">Search posts</span><input class="input" type="search" placeholder="Search titles" data-bq></label>
        <span class="tag-sample">Sample</span>
      </div>
      <div class="tbl-wrap"><table class="tbl ltbl blog-tbl">
        <thead><tr><th>Post</th><th>Status</th><th>Date</th><th class="num">Deals</th><th class="c-act"><span class="visually-hidden">Actions</span></th></tr></thead>
        <tbody data-brows></tbody></table>
        <p class="empty" data-bempty hidden></p></div>
      <div class="menu row-menu" id="blog-menu" role="menu" hidden data-state="closed">
        <a role="menuitem" href="#" data-bm="edit"><i data-lucide="pencil"></i>Edit</a>
        <a role="menuitem" href="#" data-bm="view" target="_blank" rel="noopener"><i data-lucide="external-link"></i>View</a>
        <button role="menuitem" type="button" data-bm="dup"><i data-lucide="copy-plus"></i>Duplicate</button>
        <button role="menuitem" type="button" data-bm="pub"><i data-lucide="send"></i>Publish now</button>
        <button role="menuitem" type="button" data-bm="unpub"><i data-lucide="eye-off"></i>Unpublish</button>
        <div class="separator"></div>
        <button role="menuitem" type="button" data-bm="del" class="danger"><i data-lucide="trash-2"></i>Delete</button>
      </div>
{OVERLAY}
{CONFIRM}'''
    shell('admin-blog.html', 'Blog', 'blog', admin_only('Blog', body), scripts=f'<script>window.ADM_BLOG = {jdump(BLOG_ADMIN)};</script>\n', after='<script src="js/admin-d.js"></script>\n')

def build_blog_edit():
    cats = ''.join(f'<option>{E(c["name"])}</option>' for c in CATS)
    tool = lambda cmd, icon, label, extra='': f'<button type="button" data-bcmd="{cmd}" aria-label="{label}" title="{label}"{extra}><i data-lucide="{icon}"></i></button>'
    body = f'''      <div class="be-top">
        <a class="btn btn-ghost btn-sm" href="admin-blog.html"><i data-lucide="chevron-left"></i>Blog</a>
        <span class="be-state"><span class="pill" data-bstatus>Draft</span><small data-bsaved>Not saved yet</small></span>
        <div class="be-acts">
          <button class="btn btn-outline btn-sm be-set-btn" type="button" data-bsettings><i data-lucide="sliders-horizontal"></i>Settings</button>
          <a class="btn btn-outline btn-sm" href="#" target="_blank" rel="noopener" data-bpreview><i data-lucide="external-link"></i>Preview</a>
          <div class="be-sched"><button class="btn btn-outline btn-sm" type="button" data-bsched-btn aria-expanded="false"><i data-lucide="calendar-clock"></i><span>Schedule</span></button>
            <div class="popover sched-pop" data-bsched hidden role="dialog" aria-label="Schedule post">
              <label class="fld"><span class="lab">Publish on</span><input class="input" type="datetime-local" data-bsched-at><span class="err" hidden>Pick a time in the future.</span></label>
              <div class="pop-acts"><button class="btn btn-ghost btn-sm" type="button" data-bsched-cancel>Cancel</button><button class="btn btn-default btn-sm" type="button" data-bsched-go>Schedule</button></div>
            </div></div>
          <button class="btn btn-default btn-sm" type="button" data-bpublish><i data-lucide="send"></i><span>Publish</span></button>
        </div>
      </div>
      <div class="be">
        <div class="be-main">
          <label class="fld"><span class="lab">Title *</span><input class="input be-title" type="text" name="title" maxlength="110" placeholder="e.g. Best TWS earbuds under ₹1,500" autocomplete="off"><span class="err" hidden>Add a title.</span></label>
          <label class="fld"><span class="lab">Summary * <small>one line, shown on the blog list and when shared</small></span><textarea class="textarea" name="summary" rows="2" maxlength="160" placeholder="e.g. Five picks with live prices, and what to check before you buy."></textarea><span class="cnt"><span data-bsum-n>0</span>/160</span><span class="err" hidden>Add a one-line summary.</span></label>
          <div class="fld"><span class="lab" id="be-post-l">Post *</span>
            <div class="rte be-rte">
              <div class="rte-bar be-bar" role="toolbar" aria-label="Formatting" data-bbar>
                <span class="be-grp">{tool('undo', 'undo-2', 'Undo (Ctrl+Z)')}{tool('redo', 'redo-2', 'Redo (Ctrl+Y)')}</span>
                <label class="select be-blk"><span class="visually-hidden">Text style</span><select data-bblock><option value="p">Paragraph</option><option value="h2">Heading</option><option value="h3">Subheading</option><option value="h4">Small heading</option><option value="blockquote">Quote</option></select><i data-lucide="chevron-down"></i></label>
                <span class="be-grp">{tool('bold', 'bold', 'Bold (Ctrl+B)', ' aria-pressed="false"')}{tool('italic', 'italic', 'Italic (Ctrl+I)', ' aria-pressed="false"')}{tool('underline', 'underline', 'Underline (Ctrl+U)', ' aria-pressed="false"')}{tool('strike', 'strikethrough', 'Strikethrough', ' aria-pressed="false"')}</span>
                <span class="be-grp">{tool('link', 'link', 'Link (Ctrl+K)')}{tool('ul', 'list', 'Bullet list')}{tool('ol', 'list-ordered', 'Numbered list')}</span>
                <span class="be-grp">{tool('left', 'align-left', 'Align left')}{tool('center', 'align-center', 'Align centre')}{tool('right', 'align-right', 'Align right')}</span>
                <span class="be-grp">{tool('image', 'image', 'Image')}{tool('table', 'table', 'Table')}{tool('note', 'sticky-note', 'Note box')}{tool('hr', 'minus', 'Divider')}{tool('video', 'youtube', 'YouTube video')}{tool('button', 'mouse-pointer-click', 'Button')}</span>
                <span class="be-grp">{tool('clear', 'remove-formatting', 'Clear formatting')}</span>
                <span class="be-bar-end"><button class="btn btn-outline btn-sm be-add-deal" type="button" data-bcmd="deal" data-bdeal-btn><i data-lucide="plus"></i>Deals</button>
                  <span class="seg be-mode" role="group" aria-label="Edit or preview"><button type="button" data-bmode="edit" aria-pressed="true">Edit</button><button type="button" data-bmode="preview" aria-pressed="false">Preview</button></span></span>
                <input type="file" accept="image/*" hidden data-bimg>
              </div>
              <div class="rte-body be-body" contenteditable="true" data-bbody aria-labelledby="be-post-l" role="textbox" aria-multiline="true"></div>
              <div class="be-pv" data-bpv hidden>
                <div class="be-pv-bar"><span><i data-lucide="eye"></i>Preview, as readers see it. Deal cards sit beside the post on a computer.</span><span class="seg" role="group" aria-label="Screen"><button type="button" data-bdev="desk" aria-pressed="true">Computer</button><button type="button" data-bdev="phone" aria-pressed="false">Phone</button></span></div>
                <div class="be-pv-frame" data-bpv-frame><article class="be-pv-post" data-bpv-post></article></div>
              </div>
              <div class="be-status"><span data-bwords>0 words · 1 min read</span><button type="button" class="btn-link" data-boutline-btn aria-expanded="false">Outline (<span data-boutline-n>0</span>)</button><span class="be-hint">Type <kbd>/</kbd> for blocks · <kbd>##</kbd> + space for a heading · <kbd>Ctrl</kbd>+<kbd>K</kbd> for a link</span></div>
              <ol class="be-outline" data-boutline hidden></ol>
            </div>
            <span class="err" data-bbody-err hidden>Write the post.</span>
            <small class="hint">Paste or drop images straight into the text. Pasting from Google Docs or Word keeps headings, lists, bold and links.</small>
          </div>
        </div>
        <aside class="be-side" data-bside>
          <div class="be-side-h"><b>Post settings</b><button class="btn btn-ghost btn-icon btn-sm" type="button" data-bside-close aria-label="Close settings"><i data-lucide="x"></i></button></div>
          <section class="panel be-sec">
            <label class="fld"><span class="lab">Address</span><span class="slug"><span>offertag.in/blog/</span><input class="input mono" type="text" name="slug" autocomplete="off" spellcheck="false"></span><small class="hint" data-bslug-hint>Made from the title. Fixed once published, so links keep working.</small><span class="err" hidden></span></label>
            <div class="fld"><span class="lab">Cover image</span><label class="drop wide be-cover" data-bcover><img alt="" hidden><span><i data-lucide="upload"></i>Choose image</span><input type="file" accept="image/*" hidden></label><small class="hint">Shown on the blog list and when shared. If empty, the first deal’s image is used.</small></div>
            <label class="fld"><span class="lab">Category <small>for the “More in …” deals under the post</small></span>{_sel('name="cat"', cats)}</label>
            <label class="fld"><span class="lab">SEO title <small>empty = post title</small></span><input class="input" type="text" name="seo" maxlength="70" autocomplete="off"></label>
            <label class="fld"><span class="lab">Meta description <small>empty = summary</small></span><textarea class="textarea" name="meta" rows="2" maxlength="160"></textarea></label>
            <div class="fld"><span class="lab">Author</span><span class="ro">OfferTag</span></div>
          </section>
          <section class="panel be-sec"><div class="be-deals-h"><b>Deals in this post <span data-bdeal-n>0</span></b></div><ul class="be-deals" data-bdeals></ul></section>
        </aside>
      </div>
      <div class="sheet-overlay" data-overlay hidden data-state="closed"></div>
{CONFIRM}'''
    shell('admin-blog-edit.html', 'Blog editor', 'blog', admin_only('The blog editor', body),
          scripts=f'<script>window.ADM_DEALS = {adm_data()}; window.ADM_BLOG = {jdump(BLOG_ADMIN)}; window.ADM_TODAY = "{TODAY.isoformat()}";</script>\n', after='<script src="js/admin-d.js"></script>\n')

build_blog_list(); build_blog_edit()
print('Admin: batch D (admin-blog, admin-blog-edit)')
