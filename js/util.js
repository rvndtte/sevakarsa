/* Utilitas umum: helper DOM, format, komponen kecil (tag, foto, modal, toast) */
window.App = window.App || {};
(function (A) {
  const DAY = 86400000, HOUR = 3600000, MIN = 60000;
  A.DAY = DAY;
  A.ui = { draft: {}, tab: {}, wizard: null, edit: {}, filters: { q: '', cat: '', city: '', dur: '', sort: 'new', all: false } };

  A.$ = (s, r = document) => r.querySelector(s);
  A.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  A.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  A.uid = p => p + Math.random().toString(36).slice(2, 8);
  A.ic = (n, cls = '') => `<i class="ti ti-${n} ${cls}"></i>`;
  A.initials = n => String(n || '?').replace(/^(Desa|Universitas|Tim)\s+/i, '').split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  A.avatar = (name, cls = '') => `<div class="avatar ${cls}">${A.esc(A.initials(name))}</div>`;

  /* ----- format waktu ----- */
  A.fmtDate = ts => new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  A.fmtDT = ts => new Date(ts).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  A.ago = ts => {
    const d = A.now() - ts;
    if (d < MIN) return 'baru saja';
    if (d < HOUR) return Math.floor(d / MIN) + ' mnt lalu';
    if (d < DAY) return Math.floor(d / HOUR) + ' jam lalu';
    if (d < 30 * DAY) return Math.floor(d / DAY) + ' hari lalu';
    return A.fmtDate(ts);
  };
  A.remain = ms => {
    if (ms <= 0) return 'Waktu habis';
    const d = Math.floor(ms / DAY), h = Math.floor(ms % DAY / HOUR), m = Math.floor(ms % HOUR / MIN), s = Math.floor(ms % MIN / 1000);
    if (d > 0) return `${d} hari ${h} jam`;
    if (h > 0) return `${h} jam ${m} mnt`;
    return `${m} mnt ${s} dtk`;
  };
  A.cd = end => `<span data-cd="${end}">${A.remain(end - A.now())}</span>`;
  A.tickCountdowns = () => A.$$('[data-cd]').forEach(el => { el.textContent = A.remain(+el.dataset.cd - A.now()); });

  /* ----- status ----- */
  const ST = {
    available: ['Available', 'green'], reserved: ['Reserved', 'amber'], proposal: ['Proposal', 'blue'], matched: ['Matched', 'purple'],
    rejected: ['Rejected', 'red'], expired: ['Expired', 'gray'], draft: ['Draft', 'gray'], requested: ['Diajukan', 'blue'],
    declined: ['Tidak dipilih', 'gray'], pending: ['Menunggu verifikasi', 'amber'], approved: ['Terverifikasi', 'green'],
    submitted: ['Menunggu review', 'blue'], revision: ['Perlu revisi', 'amber'], done: ['Selesai', 'purple']
  };
  A.tag = (s, extra = '') => { const [l, c] = ST[s] || [s, 'gray']; return `<span class="tag ${c} ${extra}">${l}</span>`; };
  A.chipTag = (t, c = 'green') => `<span class="tag ${c}">${A.esc(t)}</span>`;
  A.NOTIF = {
    partnership: ['heart-handshake', 'c-green'], proposal: ['file-text', 'c-blue'], discussion: ['message', 'c-blue'],
    deadline: ['clock', 'c-amber'], status: ['circle-check', 'c-purple'], reject: ['circle-x', 'c-red'], expire: ['hourglass-empty', 'c-gray'], system: ['bell', 'c-gray']
  };

  /* ----- foto placeholder (SVG datar) ----- */
  const PAL = [['#CFE3D6', '#6C9A7C', '#3F6B54', '#22432F'], ['#D8E6EE', '#7FA58F', '#4B7A62', '#27483A'], ['#EADFC6', '#8FB39B', '#5C8A70', '#2F5442'], ['#C9DCE6', '#6F9C86', '#3A6650', '#1F3F30']];
  A.photo = (seed, cls = 't') => {
    let h = 0; String(seed).split('').forEach(c => h = (h * 31 + c.charCodeAt(0)) >>> 0);
    const p = PAL[h % PAL.length], o = h % 30;
    return `<div class="photo ${cls}"><svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice"><rect width="200" height="120" fill="${p[0]}"/><circle cx="${150 + o / 3}" cy="28" r="12" fill="#F6E7A8" opacity=".8"/><ellipse cx="${30 + o}" cy="105" rx="110" ry="60" fill="${p[1]}"/><ellipse cx="${170 - o}" cy="118" rx="120" ry="62" fill="${p[2]}"/><ellipse cx="90" cy="150" rx="150" ry="50" fill="${p[3]}"/><rect x="${60 + o}" y="88" width="14" height="9" rx="2" fill="#C97A56"/><rect x="${105 + o / 2}" y="96" width="16" height="10" rx="2" fill="#D08A5F"/></svg></div>`;
  };

  /* ----- toast & modal ----- */
  A.toast = (msg, type = 'ok') => {
    let box = A.$('.toasts'); if (!box) { box = document.createElement('div'); box.className = 'toasts'; document.body.appendChild(box); }
    const t = document.createElement('div'); t.className = 'toast' + (type === 'err' ? ' err' : '');
    t.innerHTML = `${A.ic(type === 'err' ? 'alert-circle' : 'circle-check')}<span>${A.esc(msg)}</span>`;
    box.appendChild(t); setTimeout(() => t.remove(), 3800);
  };
  A.modal = ({ title, body = '', actions = [], wide = false }) => {
    A.closeModal();
    const o = document.createElement('div'); o.className = 'overlay'; o.id = 'modal';
    o.innerHTML = `<div class="modal" ${wide ? 'style="max-width:680px"' : ''}><h3>${title}</h3><div>${body}</div><div class="acts">${actions.map((a, i) => `<button class="btn ${a.cls || 'out'}" data-mi="${i}">${a.label}</button>`).join('')}</div></div>`;
    o.addEventListener('click', e => {
      if (e.target === o) return A.closeModal();
      const b = e.target.closest('[data-mi]'); if (!b) return;
      const a = actions[+b.dataset.mi];
      if (a.onClick) { const r = a.onClick(o); if (r === false) return; }
      A.closeModal();
    });
    document.body.appendChild(o);
    const f = o.querySelector('input,textarea,select'); if (f) f.focus();
    return o;
  };
  A.closeModal = () => { const m = A.$('#modal'); if (m) m.remove(); };
  A.confirm = (title, msg, onYes, { danger = false, label = 'Ya, lanjutkan' } = {}) =>
    A.modal({ title, body: `<p class="mu">${msg}</p>`, actions: [{ label: 'Batal' }, { label, cls: danger ? 'red' : '', onClick: onYes }] });

  A.formData = form => {
    const out = {}, fd = new FormData(form);
    for (const [k, v] of fd.entries()) {
      if (k.endsWith('[]')) { const kk = k.slice(0, -2); (out[kk] = out[kk] || []).push(v); } else out[k] = typeof v === 'string' ? v.trim() : v;
    }
    return out;
  };
  A.csv = s => String(s || '').split(',').map(x => x.trim()).filter(Boolean);
  A.pct = n => Math.round(n) + '%';
  A.ringCls = n => n >= 75 ? '' : n >= 55 ? 'amber' : 'red';
  A.ring = (n, big = false) => `<div class="ring ${A.ringCls(n)} ${big ? 'big' : ''}" style="--p:${Math.round(n)}"><b>${Math.round(n)}${big ? '%' : ''}</b></div>`;
  A.empty = (icon, text, extra = '') => `<div class="empty">${A.ic(icon)}<div>${text}</div>${extra}</div>`;
  A.CATEGORIES = ['Teknologi', 'Pertanian', 'Lingkungan', 'UMKM', 'Kesehatan', 'Pendidikan'];
  A.SKILLS = ['Web Development', 'UI/UX Design', 'Data Analysis', 'Bisnis', 'IoT', 'Bioteknologi', 'Agribisnis', 'Pendidikan', 'Kesehatan Masyarakat', 'Desain Grafis', 'Manajemen Proyek', 'Pemasaran Digital'];
  A.CITIES = { 'Kab. Malang': 'Jawa Timur', 'Kota Malang': 'Jawa Timur', 'Kab. Pasuruan': 'Jawa Timur', 'Kab. Blitar': 'Jawa Timur', 'Kab. Sleman': 'DI Yogyakarta', 'Kab. Bandung': 'Jawa Barat' };
})(window.App);
