/* Router berbasis hash (#/path) + penjaga akses per peran + event delegation */
window.App = window.App || {};
(function (A) {
  const routes = [];
  A.acts = {};
  A.route = (pattern, roles, fn, layout = 'app') => {
    const keys = [], re = new RegExp('^' + pattern.replace(/:[a-z]+/g, m => { keys.push(m.slice(1)); return '([^/]+)'; }) + '$');
    routes.push({ pattern, re, keys, roles, fn, layout });
  };
  A.path = () => (location.hash.replace(/^#/, '') || '/').split('?')[0];
  A.go = p => { if (location.hash === '#' + p) A.render(); else location.hash = p; };
  A.home = u => !u ? '/login' : u.role === 'desa' ? '/desa' : u.role === 'univ' ? '/univ' : '/admin';
  A.back = () => history.length > 1 ? history.back() : A.go(A.home(A.Store.me()));

  A.match = () => {
    const path = A.path();
    for (const r of routes) {
      const m = path.match(r.re); if (!m) continue;
      const params = {}; r.keys.forEach((k, i) => params[k] = decodeURIComponent(m[i + 1]));
      return Object.assign({ params, path }, r);
    }
    return null;
  };

  let lastPath = null;
  A.render = () => {
    const root = A.$('#root'), r = A.match(), me = A.Store.me();
    if (!r) { A.go(me ? A.home(me) : '/'); return; }
    if (r.roles && (!me || !r.roles.includes(me.role))) { A.toast(me ? 'Halaman ini tidak tersedia untuk peran Anda.' : 'Silakan masuk terlebih dulu.', 'err'); A.go(A.home(me)); return; }
    if (me && ['/login', '/register'].includes(r.path)) { A.go(A.home(me)); return; }
    const y = window.scrollY;
    let html;
    try { html = r.fn(r.params, me); } catch (e) { console.error(e); html = `<div class="main"><div class="card">${A.empty('bug', 'Terjadi kesalahan menampilkan halaman: ' + A.esc(e.message))}</div></div>`; }
    root.innerHTML = r.layout === 'public' ? html : A.shell(me, html, r.path);
    A.$$('[data-draft]').forEach(el => { el.value = A.ui.draft[el.dataset.draft] || ''; });
    A.tickCountdowns(); A.demoPanel();
    const box = A.$('.msgs'); if (box) box.scrollTop = box.scrollHeight;
    window.scrollTo(0, lastPath === r.path ? y : 0); lastPath = r.path;
    document.title = 'SumbangRuang — ' + (r.title || 'Platform KKN Desa & Universitas');
  };

  /* aksi lewat atribut data-act / data-submit / data-input */
  A.run = fn => { try { const r = fn(); A.render(); return r; } catch (e) { A.toast(e.message, 'err'); } };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-act]'); if (!t) return;
    const fn = A.acts[t.dataset.act]; if (!fn) return;
    if (t.tagName === 'A' && !t.getAttribute('href')) e.preventDefault();
    fn(Object.assign({}, t.dataset), t, e);
  });
  document.addEventListener('submit', e => {
    const f = e.target.closest('form[data-submit]'); if (!f) return;
    e.preventDefault(); const fn = A.acts[f.dataset.submit]; if (fn) fn(A.formData(f), f, Object.assign({}, f.dataset));
  });
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset && el.dataset.draft) A.ui.draft[el.dataset.draft] = el.value;
    if (el.dataset && el.dataset.input) { const fn = A.acts[el.dataset.input]; if (fn) fn(el.value, el, Object.assign({}, el.dataset)); }
  });
  document.addEventListener('change', e => {
    const el = e.target; if (el.dataset && el.dataset.change) { const fn = A.acts[el.dataset.change]; if (fn) fn(el.type === 'checkbox' ? el.checked : el.value, el, Object.assign({}, el.dataset)); }
  });
  document.addEventListener('keydown', e => { const t = e.target; if (e.key === 'Enter' && t.dataset && t.dataset.enter) { e.preventDefault(); const b = A.$(t.dataset.enter); if (b) b.click(); } });
  window.addEventListener('hashchange', () => A.render());
})(window.App);
