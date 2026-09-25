/* Halaman Super Admin: dashboard, verifikasi akun, data platform, log aktivitas */
(function (A) {
  const S = A.Store, V = A.V;

  A.route('/admin', ['admin'], () => {
    const D = S.data, pend = D.users.filter(u => u.verified === 'pending');
    const c = r => D.users.filter(u => u.role === r && u.verified === 'approved').length;
    return V.head('Dashboard Super Admin', 'Pantau aktivitas keseluruhan platform SumbangRuang') +
      `<div class="g3">${V.stat('home-heart', 'c-green', c('desa'), 'Desa terverifikasi')}${V.stat('building-community', 'c-blue', c('univ'), 'Universitas terverifikasi')}<a href="#/admin/verify" style="display:block">${V.stat('user-exclamation', 'c-amber', pend.length, 'Menunggu verifikasi')}</a>
        ${V.stat('file-text', 'c-green', D.problems.filter(p => ['available', 'requested', 'connected'].includes(p.status)).length, 'Kebutuhan aktif')}${V.stat('heart-handshake', 'c-amber', D.partnerships.filter(p => ['requested', 'connected'].includes(p.status)).length, 'Kerja sama berjalan')}${V.stat('inbox', 'c-purple', V.pendingGroups(D.partnerships), 'Kesepakatan menunggu konfirmasi')}</div>
      <div class="g2 mt16"><div class="card"><div class="row sp"><h3 class="nb">Akun menunggu verifikasi</h3><a class="xs b" style="color:var(--green-500)" href="#/admin/verify">Lihat semua</a></div><div class="list mt12">${pend.map(u => `<div class="item"><div class="ib s ${u.role === 'desa' ? 'c-green' : 'c-blue'}">${A.ic(u.role === 'desa' ? 'home-heart' : 'building-community')}</div><div class="grow"><div class="b">${A.esc(u.name)}</div><div class="xs mu">${A.esc(u.profile.city)} · ${A.ago(u.createdAt)}</div></div><button class="btn sm" data-act="reviewAcc" data-id="${u.id}">Tinjau</button></div>`).join('') || A.empty('user-check', 'Tidak ada antrean verifikasi.')}</div></div>
        <div class="card"><h3>Aktivitas sistem</h3><div class="list">${D.log.slice(0, 6).map(l => `<div class="row top">${A.ic(l.icon, 'mu')}<div><div class="sm b">${A.esc(l.text)}</div><div class="xs mu">${A.ago(l.ts)}</div></div></div>`).join('')}</div></div></div>`;
  });
  A.acts.reviewAcc = d => { A.ui.verifySel = d.id; A.ui.verifyTab = 'pending'; A.go('/admin/verify'); };

  A.route('/admin/verify', ['admin'], () => {
    const tab = A.ui.verifyTab || 'pending', all = S.data.users.filter(u => u.role !== 'admin'), list = all.filter(u => u.verified === tab).sort((a, b) => b.createdAt - a.createdAt);
    const sel = list.find(u => u.id === A.ui.verifySel) || list[0];
    const chip = (k, l) => `<button class="chip ${tab === k ? 'on' : ''}" data-act="vtab" data-k="${k}">${l} <span class="n">${all.filter(u => u.verified === k).length}</span></button>`;
    const detail = sel ? `<div class="card"><div class="row sp top wrap"><div class="row">${A.avatar(sel.name, sel.role === 'univ' ? 'av-d' : '')}<div><div class="f" style="font-size:20px">${A.esc(sel.name)}</div><div class="sm mu">${sel.role === 'desa' ? 'Desa' : 'Universitas'} · ${A.esc(sel.profile.city)}</div></div></div>${A.tag(sel.verified, 'lg')}</div>
        <div class="g2 mt16"><div><div class="label">Email</div><b>${A.esc(sel.email)}</b></div><div><div class="label">Kontak</div><b>${A.esc(sel.profile.contactName || '-')} · ${A.esc(sel.profile.phone || '-')}</b></div><div><div class="label">Lokasi</div><b>${A.esc(sel.profile.city)}, ${A.esc(sel.profile.province)}</b></div><div><div class="label">Terdaftar</div><b>${A.fmtDT(sel.createdAt)}</b></div></div>
        <div class="divider"></div><h3>Dokumen pendukung</h3><div class="list">${sel.docs.map(d => `<div class="item"><span class="ib s c-green">${A.ic(/jpg|png/i.test(d) ? 'photo' : 'file-text')}</span><div class="grow b sm">${A.esc(d)}</div><button class="btn sm out" data-act="viewDoc" data-name="${A.esc(d)}">Lihat</button></div>`).join('') || '<span class="mu sm">Tidak ada dokumen.</span>'}</div>
        <div class="divider"></div><h3>Riwayat verifikasi</h3><div class="tl">${sel.vlog.map((e, i, a) => `<div class="e"><div class="d ${i === a.length - 1 ? 'now' : ''}">${A.ic('check')}</div><div><div class="b sm">${A.esc(e.text)}</div><div class="xs mu">${A.fmtDT(e.ts)}</div></div></div>`).join('')}</div>
        ${sel.verified === 'pending' ? `<div class="divider"></div><div class="field"><label>Catatan (wajib jika menolak)</label><textarea id="vnote" data-draft="vnote-${sel.id}" placeholder="Alasan penolakan atau catatan verifikasi"></textarea></div><div class="row wrap"><button class="btn" data-act="verifyDo" data-id="${sel.id}" data-d="approve">${A.ic('check')} Setujui akun</button><button class="btn red" data-act="verifyDo" data-id="${sel.id}" data-d="reject">${A.ic('x')} Tolak</button></div>` : ''}</div>` : `<div class="card">${A.empty('user-check', 'Tidak ada akun pada kategori ini.')}</div>`;
    return V.head('Verifikasi akun', 'Periksa data dan dokumen sebelum akun desa atau universitas aktif') + `<div class="chips mb">${chip('pending', 'Menunggu')}${chip('approved', 'Disetujui')}${chip('rejected', 'Ditolak')}</div>
      <div class="g32" style="grid-template-columns:1fr 2fr"><div class="card"><h3>Antrean</h3><div class="list">${list.map(u => `<div class="item click" data-act="vpick" data-id="${u.id}" style="${sel && sel.id === u.id ? 'background:#F1F6EC;border-color:var(--green-500)' : ''}">${A.ic(u.role === 'desa' ? 'home-heart' : 'building-community', 'mu')}<div class="grow"><div class="b sm">${A.esc(u.name)}</div><div class="xs mu">${A.ago(u.createdAt)}</div></div></div>`).join('') || '<span class="mu sm">Kosong.</span>'}</div></div>${detail}</div>`;
  });
  A.acts.vtab = d => { A.ui.verifyTab = d.k; A.ui.verifySel = null; A.render(); };
  A.acts.vpick = d => { A.ui.verifySel = d.id; A.render(); };
  A.acts.viewDoc = d => A.modal({ title: A.esc(d.name), body: `<div style="height:220px;border-radius:14px;background:var(--cream-100);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--muted)">${A.ic('file-text')}<span class="sm">Pratinjau dokumen (demo — berkas tidak diunggah ke server)</span></div>`, actions: [{ label: 'Tutup' }] });
  A.acts.verifyDo = d => {
    const note = (A.$('#vnote') || {}).value || '';
    if (d.d === 'reject' && !note.trim()) return A.toast('Isi alasan penolakan terlebih dulu.', 'err');
    A.run(() => { S.verify(d.id, d.d, note.trim()); A.ui.draft['vnote-' + d.id] = ''; A.ui.verifySel = null; A.toast(d.d === 'approve' ? 'Akun disetujui — pengguna kini bisa masuk.' : 'Akun ditolak.'); });
  };

  A.route('/admin/data', ['admin'], () => {
    const D = S.data, t = A.ui.dtab || 'problems';
    const rows = {
      problems: D.problems.map(p => `<tr><td><b>${A.esc(p.title)}</b><div class="xs mu">${A.esc(S.user(p.desaId)?.name)}</div></td><td>${A.esc(p.category)}</td><td>${A.tag(p.status)}</td></tr>`),
      partnerships: D.partnerships.map(p => `<tr><td><b>${A.esc(V.problemTitle(p))}</b></td><td>${A.esc(S.user(p.desaId)?.name)} × ${A.esc(S.user(p.univId)?.name)}</td><td>${A.ago(p.createdAt)}</td><td>${A.tag(p.status)}</td></tr>`),
      users: D.users.filter(u => u.role !== 'admin').map(u => `<tr><td><b>${A.esc(u.name)}</b><div class="xs mu">${A.esc(u.email)}</div></td><td>${u.role === 'desa' ? 'Desa' : 'Universitas'}</td><td>${A.esc(u.profile.city)}</td><td>${A.tag(u.verified)}</td></tr>`)
    }[t];
    const head = { problems: ['Kebutuhan', 'Kategori', 'Status'], partnerships: ['Kebutuhan', 'Pihak', 'Diajukan', 'Status'], users: ['Akun', 'Peran', 'Lokasi', 'Status'] }[t];
    return V.head('Data platform', 'Seluruh data kebutuhan, kerja sama, dan akun') + `<div class="chips mb">${[['problems', 'Kebutuhan'], ['partnerships', 'Kerja sama'], ['users', 'Akun']].map(x => `<button class="chip ${t === x[0] ? 'on' : ''}" data-act="dtab" data-k="${x[0]}">${x[1]}</button>`).join('')}</div>
      <div class="card flat"><table class="table"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  });
  A.acts.dtab = d => { A.ui.dtab = d.k; A.render(); };

  A.route('/admin/log', ['admin'], () => V.head('Log aktivitas', 'Riwayat aktivitas sistem') + `<div class="card"><div class="tl">${S.data.log.map(l => `<div class="e"><div class="d">${A.ic(l.icon)}</div><div><div class="b">${A.esc(l.text)}</div><div class="xs mu">${A.fmtDT(l.ts)}</div></div></div>`).join('')}</div></div>`);
})(window.App);
