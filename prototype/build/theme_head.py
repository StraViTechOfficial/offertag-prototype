# theme_head.py — D-150 dark mode. Runs inside routes.py's rewrite(): every page gets this script as the first thing in <head>,
# so the chosen theme is set before anything draws (no white flash). Public pages start on Automatic (follows the device),
# admin pages start on Dark. The same script wires every [data-theme-set] button (header menu, phone menu, admin sidebar).
THEME_JS = r'''<script>(function(){var d=document.documentElement,admin=d.classList.contains('admin'),k=admin?'adm-theme':'ot-theme',def=admin?'dark':'auto',p;
try{p=localStorage.getItem(k)}catch(e){}if(p!=='light'&&p!=='dark'&&p!=='auto')p=def;
var m=window.matchMedia('(prefers-color-scheme: dark)');
function apply(){var t=p==='auto'?(m.matches?'dark':'light'):p;d.dataset.theme=t;d.dataset.themePref=p;d.style.colorScheme=t;
var c=document.querySelector('meta[name=theme-color]');if(c)c.content=t==='dark'?(admin?'#0a0f1d':'#0b111f'):(admin?'#0a0f1d':'#ffffff');
var bs=document.querySelectorAll('[data-theme-set]');for(var i=0;i<bs.length;i++)bs[i].setAttribute('aria-checked',bs[i].getAttribute('data-theme-set')===p?'true':'false');
var f=document.querySelectorAll('[data-theme-flip]');for(var q=0;q<f.length;q++)f[q].setAttribute('aria-label',t==='dark'?'Switch to light theme':'Switch to dark theme');
var em=document.querySelectorAll('emoji-picker');for(var j=0;j<em.length;j++)em[j].className=t;}
apply();if(m.addEventListener)m.addEventListener('change',function(){if(p==='auto')apply()});
window.OTTheme={get:function(){return p},set:function(v){p=v;try{localStorage.setItem(k,v)}catch(e){}apply();
var n={light:'Light',dark:'Dark',auto:'Automatic'}[v];if(window.OT&&OT.toast)OT.toast('Theme: '+n,v==='dark'?'moon':v==='light'?'sun':'sun-moon');}};
document.addEventListener('click',function(e){var f=e.target.closest&&e.target.closest('[data-theme-flip]');if(f){e.preventDefault();window.OTTheme.set(d.dataset.theme==='dark'?'light':'dark');return}var b=e.target.closest&&e.target.closest('[data-theme-set]');if(!b)return;e.preventDefault();window.OTTheme.set(b.getAttribute('data-theme-set'))});
document.addEventListener('DOMContentLoaded',apply);
window.addEventListener('storage',function(e){if(e.key===k&&e.newValue){p=e.newValue;apply()}});})();</script>'''


def add_theme(html):
    if 'window.OTTheme' in html or '<head>' not in html:
        return html
    tag = '<head>\n' + THEME_JS + '\n<meta name="theme-color" content="#ffffff">'
    return html.replace('<head>', tag, 1)
