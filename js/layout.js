/* Kerangka aplikasi (sidebar per peran) + panel demo melayang */
window.App = window.App || {};
(function (A) {
  const NAV = {
    desa: [['/desa', 'home', 'Beranda'], ['/desa/problems', 'file-text', 'Kebutuhan Saya'], ['/partnerships', 'heart-handshake', 'Partnership'], ['/status', 'timeline-event', 'Status'], ['/notifications', 'bell', 'Notifikasi'], ['/desa/history', 'history', 'Riwayat & Dokumentasi'], ['/desa/profile', 'user', 'Profil Desa']],
    univ: [['/univ', 'home', 'Beranda'], ['/univ/discover', 'compass', 'Jelajahi Desa'], ['/partnerships', 'heart-handshake', 'Partnership & Proposal'], ['/status', 'timeline-event', 'Status'], ['/notifications', 'bell', 'Notifikasi'], ['/univ/profile', 'user', 'Profil Tim']],
    admin: [['/admin', 'layout-dashboard', 'Dashboard'], ['/admin/verify', 'user-check', 'Verifikasi Akun'], ['/admin/data', 'database', 'Data Platform'], ['/admin/log', 'activity', 'Log Aktivitas']]
  };
  const active = (href, path) => href === '/desa' || href === '/univ' || href === '/admin' ? path === href : path === href || path.startsWith(href + '/') || (href === '/desa/problems' && path.startsWith('/desa/problem')) || (href === '/univ/discover' && (path.startsWith('/univ/problem') || path.startsWith('/univ/match')));

  A.shell = (me, content, path) => {
    const unread = A.Store.unread(me.id), roleLabel = { desa: 'Desa', univ: 'Universitas', admin: 'Super Admin' }[me.role];
    const nav = NAV[me.role].map(([href, icon, label]) =>
      `<a class="nav ${active(href, path) ? 'on' : ''}" href="#${href}">${A.ic(icon)}<span>${label}</span>${href === '/notifications' && unread ? `<span class="cnt">${unread}</span>` : ''}</a>`).join('');
    return `<div class="app"><aside class="side ${me.role === 'admin' ? 'admin' : ''}">
      <a class="brand" href="#${A.home(me)}">${A.ic('leaf')}SumbangRuang</a>${nav}<div class="sp1"></div>
      <div class="userbox">${A.avatar(me.name, me.role === 'univ' ? 'av-d' : '')}<div class="grow"><div class="nm">${A.esc(me.name)}</div><div class="xs mu">${roleLabel}</div></div>
      <button class="iconbtn" data-act="logout" title="Keluar" style="width:34px;height:34px">${A.ic('logout')}</button></div>
    </aside><main class="main">${content}</main></div>`;
  };

  /* ---------- panel demo ---------- */
  A.demoPanel = () => {
    let box = A.$('#demo'); if (!box) { box = document.createElement('div'); box.id = 'demo'; box.className = 'demo'; document.body.appendChild(box); }
    const me = A.Store.me(), off = A.Store.data.clock || 0;
    box.classList.toggle('open', !!A.ui.demoOpen);
    box.innerHTML = `<div class="panel">
      <h4>Masuk cepat (akun demo)</h4><div class="btns">
        <button class="btn sm ${me?.id === 'd1' ? '' : 'out'}" data-act="demoLogin" data-email="desa@demo.id">${A.ic('home-heart')} Desa</button>
        <button class="btn sm ${me?.id === 'u1' ? '' : 'out'}" data-act="demoLogin" data-email="univ@demo.ac.id">${A.ic('building-community')} Univ</button>
        <button class="btn sm ${me?.role === 'admin' ? '' : 'out'}" data-act="demoLogin" data-email="admin@demo.id">${A.ic('shield-check')} Admin</button></div>
      <h4>Simulasi waktu</h4>
      <div class="sm mu" style="margin-bottom:8px">Sekarang: <b style="color:var(--text)">${A.fmtDT(A.now())}</b>${off ? ` (+${Math.round(off / A.DAY)} hari)` : ''}</div>
      <div class="btns"><button class="btn sm out" data-act="advance" data-days="1">+1 hari</button><button class="btn sm out" data-act="advance" data-days="3">+3 hari</button><button class="btn sm out" data-act="advance" data-days="7">+7 hari</button><button class="btn sm ghost" data-act="resetClock">Reset waktu</button></div>
      <p class="xs mu mt8">Majukan waktu untuk melihat countdown habis, status <b>Expired</b>, dan notifikasi deadline.</p>
      <h4>Data</h4><button class="btn sm red" data-act="resetData">${A.ic('refresh')} Reset semua data demo</button></div>
      <button class="fab" data-act="toggleDemo">${A.ic('flask')} Panel demo</button>`;
  };

  A.acts.toggleDemo = () => { A.ui.demoOpen = !A.ui.demoOpen; A.$('#demo').classList.toggle('open', A.ui.demoOpen); };
  A.acts.logout = () => { A.Store.logout(); A.ui.demoOpen = false; A.toast('Anda telah keluar.'); A.go('/'); };
  A.acts.demoLogin = d => {
    const u = A.Store.data.users.find(x => x.email === d.email); A.Store.data.session = u.id; A.Store.save();
    A.ui.tab = {}; A.ui.wizard = null; A.ui.edit = {}; A.toast('Masuk sebagai ' + u.name); A.go(A.home(u)); A.render();
  };
  A.acts.advance = d => { A.Store.advance(+d.days); A.toast(`Waktu dimajukan ${d.days} hari.`); A.render(); };
  A.acts.resetClock = () => { A.Store.resetClock(); A.toast('Waktu simulasi dikembalikan.'); A.render(); };
  A.acts.resetData = () => A.confirm('Reset data demo?', 'Semua perubahan (akun, kebutuhan, partnership) akan dikembalikan ke data awal.', () => { A.Store.reset(); A.ui.tab = {}; A.ui.wizard = null; A.ui.edit = {}; A.ui.draft = {}; A.toast('Data demo direset.'); A.go('/'); A.render(); }, { danger: true, label: 'Reset' });
})(window.App);
