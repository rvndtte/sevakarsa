/* Halaman peran Desa: dashboard, kebutuhan (listing/wizard/detail), riwayat, profil */
(function (A) {
  const S = A.Store, V = A.V;
  const isActiveP = p => ['available', 'requested', 'reserved', 'proposal'].includes(p.status);

  /* ================= dashboard ================= */
  A.route('/desa', ['desa'], (_, me) => {
    const probs = S.problemsOf(me.id), ps = S.pshipsOf(me);
    const reqs = ps.filter(x => x.status === 'requested'), running = ps.filter(x => ['reserved', 'proposal'].includes(x.status)), inbox = ps.filter(x => x.proposal?.status === 'submitted' && x.status === 'proposal');
    const notifs = S.notifsOf(me.id).slice(0, 4);
    const done = ps.filter(x => x.status === 'matched').slice(0, 3);
    return V.head('Dashboard Desa', `Pantau kebutuhan dan kolaborasi ${A.esc(me.name)}`, `<a class="btn" href="#/desa/problems/new">${A.ic('plus')} Ajukan kebutuhan</a>`) +
      `<div class="g4">${V.stat('file-text', 'c-green', probs.filter(isActiveP).length, 'Kebutuhan aktif')}${V.stat('building-community', 'c-blue', reqs.length, 'Universitas tertarik')}${V.stat('heart-handshake', 'c-amber', running.length, 'Partnership berjalan')}${V.stat('inbox', 'c-purple', inbox.length, 'Proposal masuk')}</div>
      <div class="g32 mt16"><div class="col">
        <div class="card"><h3>Universitas yang tertarik</h3>${reqs.length ? `<div class="list">${reqs.map(r => { const u = S.user(r.univId), p = S.problem(r.problemId); return `<div class="item"><a href="#/partnerships/${r.id}" class="row grow" style="min-width:0">${A.avatar(u.name, 'av-d')}<div class="grow"><div class="b">${A.esc(u.name)}</div><div class="xs mu">${A.esc(p.title)} · ${A.ago(r.createdAt)}</div><div class="xs mu" style="display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden">${A.esc(u.profile.about || '')}</div></div></a><button class="btn sm out" data-act="viewUniv" data-id="${u.id}">Profil</button><button class="btn sm" data-act="acceptReq" data-id="${r.id}">Terima</button></div>`; }).join('')}</div>` : A.empty('inbox', 'Belum ada request masuk.')}</div>
        <div class="card"><h3>Proposal masuk</h3>${inbox.length ? `<div class="list">${inbox.map(r => `<a class="item click" href="#/partnerships/${r.id}"><div class="ib s c-blue">${A.ic('file-text')}</div><div class="grow"><div class="b">${A.esc(r.proposal.title)}</div><div class="xs mu">${A.esc(S.user(r.univId).name)} · dikirim ${A.ago(r.proposal.submittedAt)}</div></div>${A.tag('submitted')}</a>`).join('')}</div>` : A.empty('file-text', 'Tidak ada proposal yang menunggu review.')}</div>
        <div class="card"><h3>Partnership berjalan</h3>${running.length ? `<div class="list">${running.map(r => `<a class="item click" href="#/partnerships/${r.id}">${A.photo(r.problemId, 't')}<div class="grow"><div class="b">${A.esc(V.problemTitle(r))}</div><div class="xs mu">${A.esc(S.user(r.univId).name)}</div><div class="bar thin mt8"><i style="width:${V.progress(r)}%"></i></div></div><div class="center">${A.tag(r.status)}<div class="xs mu mt4">${A.ic('clock')} ${A.cd(V.deadline(r)?.end || A.now())}</div></div></a>`).join('')}</div>` : A.empty('heart-handshake', 'Belum ada partnership berjalan.')}</div>
      </div><div class="col">
        <div class="card"><div class="row sp"><h3 class="nb">Notifikasi</h3><a class="xs b" style="color:var(--green-500)" href="#/notifications">Semua</a></div><div class="list mt12">${notifs.map(n => { const [ic, cl] = A.NOTIF[n.type] || A.NOTIF.system; return `<div class="row top"><div class="ib s ci ${cl}">${A.ic(ic)}</div><div><div class="sm ${n.read ? '' : 'b'}">${A.esc(n.text)}</div><div class="xs mu">${A.ago(n.ts)}</div></div></div>`; }).join('') || '<span class="mu sm">Tidak ada notifikasi.</span>'}</div></div>
        <div class="card"><div class="row sp"><h3 class="nb">Riwayat kerja sama</h3><a class="xs b" style="color:var(--green-500)" href="#/desa/history">Semua</a></div><div class="list mt12">${done.map(d => `<a class="item click" href="#/partnerships/${d.id}"><div class="grow"><div class="b sm">${A.esc(V.problemTitle(d))}</div><div class="xs mu">${A.esc(S.user(d.univId).name)}</div></div>${A.tag(d.completed ? 'done' : 'matched')}</a>`).join('') || '<span class="mu sm">Belum ada.</span>'}</div></div>
      </div></div>`;
  });

  /* ================= daftar kebutuhan ================= */
  A.route('/desa/problems', ['desa'], (_, me) => {
    const f = A.ui.prfilter || 'all', all = S.problemsOf(me.id).sort((a, b) => b.createdAt - a.createdAt), list = f === 'all' ? all : all.filter(p => p.status === f);
    const chip = k => `<button class="chip ${f === k ? 'on' : ''}" data-act="prfilter" data-k="${k}">${k === 'all' ? 'Semua' : A.tag(k).replace(/<[^>]+>/g, '')} <span class="n">${k === 'all' ? all.length : all.filter(p => p.status === k).length}</span></button>`;
    const rows = list.map(p => {
      const nreq = S.requestsFor(p.id).length, canEdit = ['draft', 'available', 'expired'].includes(p.status);
      return `<tr class="click" data-act="openProblem" data-id="${p.id}"><td><b>${A.esc(p.title)}</b><div class="xs mu">${A.ic('map-pin')} ${A.esc(p.city)}${nreq ? ` · <span class="b" style="color:var(--blue-700)">${nreq} request</span>` : ''}</div></td><td>${A.chipTag(p.category, 'blue')}</td><td class="sm mu">${A.esc(p.skills.slice(0, 3).join(', '))}${p.skills.length > 3 ? ' +' + (p.skills.length - 3) : ''}</td><td>${p.duration} bln</td><td>${A.tag(p.status)}</td>
        <td><div class="row" style="justify-content:flex-end">${canEdit ? `<a class="btn sm out" href="#/desa/problems/${p.id}/edit" data-act="stop">${A.ic('edit')}</a><button class="btn sm red" data-act="delProblem" data-id="${p.id}">${A.ic('trash')}</button>` : ''}</div></td></tr>`;
    }).join('');
    return V.head('Kebutuhan Saya', 'Kelola masalah yang ingin dibantu lewat program KKN', `<a class="btn" href="#/desa/problems/new">${A.ic('plus')} Buat kebutuhan baru</a>`) +
      `<div class="chips mb">${['all', 'available', 'requested', 'reserved', 'proposal', 'matched', 'draft', 'expired'].map(chip).join('')}</div>
      <div class="card flat">${rows ? `<table class="table"><thead><tr><th>Kebutuhan</th><th>Kategori</th><th>Kompetensi</th><th>Durasi</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>` : A.empty('file-text', 'Belum ada kebutuhan pada filter ini.', `<a class="btn sm mt12" href="#/desa/problems/new">Buat kebutuhan</a>`)}</div>`;
  });
  A.acts.prfilter = d => { A.ui.prfilter = d.k; A.render(); };
  A.acts.stop = (d, el, e) => e.stopPropagation();
  A.acts.openProblem = (d, el, e) => { if (e.target.closest('a,button')) return; A.go('/desa/problem/' + d.id); };
  A.acts.delProblem = (d, el, e) => { e.stopPropagation(); const p = S.problem(d.id); A.confirm('Hapus kebutuhan?', `"${A.esc(p.title)}" akan dihapus. Request yang masuk akan dibatalkan.`, () => A.run(() => { S.deleteProblem(d.id); A.toast('Kebutuhan dihapus.'); }), { danger: true, label: 'Hapus' }); };

  /* ================= wizard buat/ubah kebutuhan ================= */
  const blank = () => ({ title: '', category: 'Teknologi', desc: '', condition: '', need: '', target: '', duration: 2, teamMin: 3, teamMax: 5, deadline: new Date(A.now() + 30 * A.DAY).toISOString().slice(0, 10), skills: [] });
  const wizRoute = ({ id }, me) => {
    const key = id || 'new';
    if (!A.ui.wizard || A.ui.wizard.key !== key) {
      const p = id && S.problem(id);
      if (id && (!p || p.desaId !== me.id)) return V.head('Tidak ditemukan') + `<div class="card">${A.empty('mood-empty', 'Kebutuhan tidak ditemukan.')}</div>`;
      A.ui.wizard = { key, id: id || null, step: 1, data: p ? Object.assign(blank(), { title: p.title, category: p.category, desc: p.desc, condition: p.condition, need: p.need, target: p.target, duration: p.duration, teamMin: p.teamMin, teamMax: p.teamMax, skills: p.skills.slice(), deadline: new Date(p.deadline).toISOString().slice(0, 10) }) : blank() };
    }
    const w = A.ui.wizard, d = w.data, steps = ['Masalah', 'Kondisi & harapan', 'Target & durasi', 'Kompetensi'];
    const stepper = `<div class="card tight"><div class="stepper">${steps.map((s, i) => `${i ? `<span class="ln ${i < w.step ? 'ok' : ''}"></span>` : ''}<div class="st ${i + 1 < w.step ? 'ok' : i + 1 === w.step ? 'on' : ''}"><span class="n">${i + 1 < w.step ? A.ic('check') : i + 1}</span>${s}</div>`).join('')}</div></div>`;
    const inp = (k, label, type = 'text', ph = '', extra = '') => `<div class="field"><label>${label}</label><input type="${type}" value="${A.esc(d[k])}" placeholder="${ph}" data-input="wizField" data-k="${k}" ${extra}></div>`;
    const ta = (k, label, ph, hint = '') => `<div class="field"><label>${label}</label><textarea placeholder="${ph}" data-input="wizField" data-k="${k}">${A.esc(d[k])}</textarea>${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
    let body = '';
    if (w.step === 1) body = `<h3>Jelaskan masalahnya</h3>${inp('title', 'Judul kebutuhan *', 'text', 'mis. Digitalisasi UMKM Desa')}<div class="field"><label>Kategori *</label><select data-change="wizField" data-k="category">${A.CATEGORIES.map(c => `<option ${d.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>${ta('desc', 'Permasalahan *', 'Apa masalah yang dihadapi desa?', 'Tuliskan dengan contoh nyata agar kampus paham konteksnya.')}<div class="card soft tight">${A.ic('map-pin')} Lokasi otomatis dari profil: <b>${A.esc(S.me().profile.city)}, ${A.esc(S.me().profile.province)}</b></div>`;
    if (w.step === 2) body = `<h3>Kondisi saat ini & harapan</h3>${ta('condition', 'Kondisi desa saat ini *', 'Fasilitas, sumber daya, dan situasi terkini', 'Contoh: ada balai desa, internet, 10 UMKM aktif.')}${ta('need', 'Kebutuhan yang diharapkan *', 'Bantuan apa yang diharapkan dari universitas?')}`;
    if (w.step === 3) body = `<h3>Target, durasi, dan tim</h3>${ta('target', 'Target / output yang diharapkan *', 'Hasil konkret yang ingin dicapai')}<div class="g2"><div class="field"><label>Durasi program</label><select data-change="wizField" data-k="duration">${[1, 2, 3, 4, 6].map(n => `<option value="${n}" ${+d.duration === n ? 'selected' : ''}>${n} bulan</option>`).join('')}</select></div>${inp('deadline', 'Batas pendaftaran universitas', 'date')}</div><div class="g2">${inp('teamMin', 'Anggota tim minimal', 'number', '', 'min="1" max="20"')}${inp('teamMax', 'Anggota tim maksimal', 'number', '', 'min="1" max="20"')}</div>`;
    if (w.step === 4) body = `<h3>Kompetensi yang dibutuhkan</h3><p class="mu sm">Pilih keahlian yang dibutuhkan. Informasi ini ditampilkan kepada universitas.</p><div class="chips mt12">${A.SKILLS.map(s => `<label class="check"><input type="checkbox" ${d.skills.includes(s) ? 'checked' : ''} data-change="wizSkill" data-k="${s}">${s}</label>`).join('')}</div>
      <div class="divider"></div><div class="label">Ringkasan</div><div class="kv"><span>Judul</span><b>${A.esc(d.title || '-')}</b></div><div class="kv"><span>Kategori</span><b>${A.esc(d.category)}</b></div><div class="kv"><span>Durasi</span><b>${d.duration} bulan</b></div><div class="kv"><span>Tim</span><b>${d.teamMin}–${d.teamMax} anggota</b></div><div class="kv"><span>Kompetensi</span><b>${d.skills.length} dipilih</b></div>`;
    return V.head(w.id ? 'Ubah kebutuhan' : 'Buat kebutuhan baru', 'Isi bertahap agar kebutuhan mudah dipahami universitas', '', 'Kembali') + stepper +
      `<div class="card mt16" style="max-width:760px">${body}<div class="row sp mt16"><div class="row"><button class="btn out" data-act="wizDraft">Simpan draft</button></div><div class="row">${w.step > 1 ? `<button class="btn out" data-act="wizBack">Kembali</button>` : ''}${w.step < 4 ? `<button class="btn" data-act="wizNext">Lanjut ${A.ic('arrow-right')}</button>` : `<button class="btn" data-act="wizPublish">${A.ic('send')} Publikasikan</button>`}</div></div></div>`;
  };
  A.route('/desa/problems/new', ['desa'], (p, me) => wizRoute(p, me));
  A.route('/desa/problems/:id/edit', ['desa'], (p, me) => wizRoute(p, me));
  A.acts.wizField = (v, el, d) => { A.ui.wizard.data[d.k] = v; };
  A.acts.wizSkill = (v, el, d) => { const s = A.ui.wizard.data.skills, i = s.indexOf(d.k); if (v && i < 0) s.push(d.k); if (!v && i >= 0) s.splice(i, 1); };
  const needs = { 1: [['title', 'Judul'], ['desc', 'Permasalahan']], 2: [['condition', 'Kondisi desa'], ['need', 'Kebutuhan']], 3: [['target', 'Target / output']] };
  A.acts.wizNext = () => { const w = A.ui.wizard, miss = (needs[w.step] || []).find(([k]) => !String(w.data[k] || '').trim()); if (miss) return A.toast(`${miss[1]} wajib diisi.`, 'err'); if (w.step === 3 && +w.data.teamMin > +w.data.teamMax) return A.toast('Anggota minimal tidak boleh melebihi maksimal.', 'err'); w.step++; A.render(); };
  A.acts.wizBack = () => { A.ui.wizard.step--; A.render(); };
  A.acts.wizDraft = () => { const w = A.ui.wizard; A.run(() => { const p = S.saveProblem(S.me().id, w.data, false, w.id); w.id = p.id; A.toast('Draft tersimpan.'); A.ui.wizard = null; A.go('/desa/problems'); }); };
  A.acts.wizPublish = () => { const w = A.ui.wizard; A.confirm('Publikasikan kebutuhan?', 'Kebutuhan akan terlihat oleh universitas terverifikasi dan mulai menerima request partnership.', () => A.run(() => { const p = S.saveProblem(S.me().id, w.data, true, w.id); A.ui.wizard = null; A.toast('Kebutuhan dipublikasikan!'); A.go('/desa/problem/' + p.id); }), { label: 'Publikasikan' }); };

  /* ================= detail kebutuhan (desa) ================= */
  V.problemBody = p => `<div class="card"><div class="label">Permasalahan</div><p>${A.esc(p.desc)}</p><div class="label mt16">Kondisi desa saat ini</div><p>${A.esc(p.condition || '-')}</p><div class="label mt16">Kebutuhan yang diharapkan</div><p>${A.esc(p.need || '-')}</p><div class="label mt16">Target / output</div><p>${A.esc(p.target || '-')}</p></div>`;
  V.problemSide = p => `<div class="card"><h3>Ringkasan</h3><div class="kv"><span>Kategori</span><b>${A.esc(p.category)}</b></div><div class="kv"><span>Lokasi</span><b>${A.esc(p.city)}</b></div><div class="kv"><span>Durasi</span><b>${p.duration} bulan</b></div><div class="kv"><span>Tim</span><b>${p.teamMin}–${p.teamMax} anggota</b></div><div class="kv"><span>Batas pendaftaran</span><b>${A.fmtDate(p.deadline)}</b></div><div class="kv"><span>Status</span>${A.tag(p.status)}</div></div>
    <div class="card"><h3>Kompetensi dibutuhkan</h3><div class="chips">${p.skills.map(s => A.chipTag(s)).join('')}</div></div>`;

  A.route('/desa/problem/:id', ['desa'], ({ id }, me) => {
    const p = S.problem(id);
    if (!p || p.desaId !== me.id) return V.head('Tidak ditemukan') + `<div class="card">${A.empty('mood-empty', 'Kebutuhan tidak ditemukan.', '<a class="btn sm mt12" href="#/desa/problems">Kembali</a>')}</div>`;
    const reqs = S.requestsFor(id), active = p.partnershipId && S.pship(p.partnershipId);
    const past = S.data.partnerships.filter(x => x.problemId === id && ['rejected', 'expired', 'declined'].includes(x.status));
    const canEdit = ['draft', 'available', 'expired'].includes(p.status);
    const acts = `${canEdit ? `<a class="btn out" href="#/desa/problems/${p.id}/edit">${A.ic('edit')} Ubah</a>` : ''}${p.status === 'expired' ? `<button class="btn" data-act="republish" data-id="${p.id}">${A.ic('refresh')} Publikasikan ulang</button>` : ''}${p.status === 'draft' ? `<a class="btn" href="#/desa/problems/${p.id}/edit">Lanjutkan & publikasikan</a>` : ''}`;
    const reqCard = r => { const u = S.user(r.univId); return `<div class="card tight"><div class="row">${A.avatar(u.name, 'av-d')}<div class="grow"><div class="b">${A.esc(u.name)}</div><div class="xs mu">${A.esc(u.profile.city)} · ${(u.profile.history || []).length} program pernah diambil · diajukan ${A.ago(r.createdAt)}</div></div></div><div class="mt12"><div class="label">Deskripsi universitas</div><p class="sm">${A.esc(u.profile.about || 'Belum ada deskripsi.')}</p></div>${r.message ? `<div class="card soft tight mt12 sm">“${A.esc(r.message)}”</div>` : ''}<div class="row mt12 wrap"><button class="btn sm" data-act="acceptReq" data-id="${r.id}">Terima</button><button class="btn sm red" data-act="declineReq" data-id="${r.id}">Tolak</button><button class="btn sm out" data-act="viewUniv" data-id="${u.id}">Lihat profil lengkap</button></div></div>`; };
    return `${V.head(A.esc(p.title), `${A.ic('map-pin')} ${A.esc(p.city)} · ${A.esc(p.category)}`, `${A.tag(p.status, 'lg')}${acts}`, 'Kembali')}
      <div class="g32"><div class="col">${V.problemBody(p)}
        ${p.status === 'requested' ? `<div class="card"><h3>Request dari universitas <span class="tag blue">${reqs.length}</span></h3><div class="card warn tight mb sm">${A.ic('lock')} Kebutuhan ini <b>terkunci</b> untuk universitas lain selama request diproses. Jika Anda menolak, kebutuhan terbuka kembali.</div><div class="list">${reqs.map(reqCard).join('')}</div></div>` : ''}
        ${p.status === 'available' ? `<div class="card">${A.empty('inbox', 'Belum ada universitas yang mengajukan. Kebutuhan Anda tampil di halaman Jelajahi Desa milik universitas.')}</div>` : ''}
        ${active ? `<div class="card soft"><h3>Partnership aktif</h3><div class="row">${A.avatar(S.user(active.univId).name, 'av-d')}<div class="grow"><div class="b">${A.esc(S.user(active.univId).name)}</div><div class="xs mu">${A.tag(active.status)}</div></div><a class="btn sm" href="#/partnerships/${active.id}">Buka partnership ${A.ic('arrow-right')}</a></div></div>` : ''}
        ${past.length ? `<div class="card"><h3>Riwayat pengajuan</h3><div class="list">${past.map(x => `<a class="item click" href="#/partnerships/${x.id}"><div class="grow"><b>${A.esc(S.user(x.univId).name)}</b><div class="xs mu">${A.ago(x.createdAt)}</div></div>${A.tag(x.status)}</a>`).join('')}</div></div>` : ''}
      </div><div class="col">${V.problemSide(p)}</div></div>`;
  });
  A.acts.republish = d => A.run(() => { S.republish(d.id); A.toast('Kebutuhan dipublikasikan ulang.'); });

  /* ================= riwayat & dokumentasi ================= */
  A.route('/desa/history', ['desa'], (_, me) => {
    const f = A.ui.hfilter || 'all', all = S.pshipsOf(me).filter(x => !['requested', 'declined'].includes(x.status)).sort((a, b) => b.createdAt - a.createdAt);
    const g = { all: () => true, done: x => x.completed, run: x => ['reserved', 'proposal'].includes(x.status) || (x.status === 'matched' && !x.completed), closed: x => ['rejected', 'expired'].includes(x.status) };
    const chip = (k, l) => `<button class="chip ${f === k ? 'on' : ''}" data-act="hfilter" data-k="${k}">${l} <span class="n">${all.filter(g[k]).length}</span></button>`;
    const cards = all.filter(g[f]).map(x => {
      const p = S.problem(x.problemId), u = S.user(x.univId);
      return `<div class="card"><div class="row sp top wrap"><div><div class="f" style="font-size:18px">${A.esc(p.title)}</div><div class="sm mu">${A.esc(u.name)} · ${A.fmtDate(x.createdAt)}</div></div>${A.tag(x.completed ? 'done' : x.status, 'lg')}</div>
        <div class="g3 mt16"><div><div class="label">Proposal & hasil</div>${x.proposal?.title ? `<div class="item mt8" style="padding:8px 12px"><span class="ib s c-blue">${A.ic('file-text')}</span><span class="sm b">${A.esc(x.proposal.title)}</span></div>` : '<span class="mu sm">—</span>'}${x.proposal?.formation ? `<div class="chips mt8">${A.chipTag('Formasi ' + x.proposal.formation + ' orang')}${(x.proposal.coordinators || []).map(n => A.chipTag('Koord. ' + n, 'blue')).join('')}</div>` : ''}</div>
          <div><div class="label">Dokumen & laporan</div><div class="col gap8 mt8">${x.docs.map(dc => `<div class="item" style="padding:8px 12px"><span class="ib s c-green">${A.ic(dc.kind === 'photo' ? 'photo' : 'file-text')}</span><span class="sm b">${A.esc(dc.name)}</span></div>`).join('') || '<span class="mu sm">Belum ada dokumen.</span>'}</div></div>
          <div><div class="label">Riwayat proses</div>${V.timeline(x)}</div></div>
        <div class="row mt12"><a class="btn sm out" href="#/partnerships/${x.id}">Buka partnership</a></div></div>`;
    }).join('');
    return V.head('Riwayat & Dokumentasi', 'Arsip kolaborasi desa dengan universitas: proposal, hasil kegiatan, laporan, dan dokumentasi') + `<div class="chips mb">${chip('all', 'Semua')}${chip('done', 'Selesai')}${chip('run', 'Berjalan')}${chip('closed', 'Berakhir')}</div><div class="list mt16">${cards || `<div class="card">${A.empty('history', 'Belum ada riwayat kerja sama.')}</div>`}</div>`;
  });
  A.acts.hfilter = d => { A.ui.hfilter = d.k; A.render(); };

  /* ================= profil desa ================= */
  A.route('/desa/profile', ['desa'], (_, me) => {
    const pr = me.profile, edit = A.ui.edit.profile, probs = S.problemsOf(me.id).filter(isActiveP);
    if (edit) return `${V.head('Edit profil desa', '', '', 'Batal')}<form class="card" style="max-width:820px" data-submit="saveDesaProfile" novalidate>
      <div class="g2"><div class="field"><label>Nama desa</label><input type="text" name="name" value="${A.esc(me.name)}"></div><div class="field"><label>Kecamatan</label><input type="text" name="kecamatan" value="${A.esc(pr.kecamatan)}"></div></div>
      <div class="g3"><div class="field"><label>Kabupaten / Kota</label><select name="city">${Object.keys(A.CITIES).map(c => `<option ${pr.city === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div><div class="field"><label>Penduduk</label><input type="number" name="population" value="${A.esc(pr.population)}"></div><div class="field"><label>Luas (km²)</label><input type="text" name="area" value="${A.esc(pr.area)}"></div></div>
      <div class="field"><label>Jumlah UMKM aktif</label><input type="number" name="umkm" value="${A.esc(pr.umkm)}" style="max-width:200px"></div>
      <div class="field"><label>Tentang desa</label><textarea name="about">${A.esc(pr.about)}</textarea></div>
      <div class="g2"><div class="field"><label>Potensi desa</label><input type="text" name="potentials" value="${A.esc((pr.potentials || []).join(', '))}"><span class="hint">Pisahkan dengan koma.</span></div><div class="field"><label>Fasilitas</label><input type="text" name="facilities" value="${A.esc((pr.facilities || []).join(', '))}"><span class="hint">Pisahkan dengan koma.</span></div></div>
      <div class="g3"><div class="field"><label>Nama kontak</label><input type="text" name="contactName" value="${A.esc(pr.contactName)}"></div><div class="field"><label>Telepon</label><input type="text" name="phone" value="${A.esc(pr.phone)}"></div><div class="field"><label>Email kontak</label><input type="email" name="email" value="${A.esc(pr.email)}"></div></div>
      <div class="row"><button class="btn">Simpan profil</button><button type="button" class="btn out" data-act="editProfile" data-on="0">Batal</button></div></form>`;
    return `${V.head('Profil Desa', 'Informasi umum desa yang dilihat universitas', `<button class="btn out" data-act="editProfile" data-on="1">${A.ic('edit')} Edit profil</button>`)}
      <div class="card flat"><div class="photo cover">${A.photo(me.id, 'cover').replace('class="photo cover"', 'class="photo cover" style="border-radius:0"')}</div><div class="row" style="padding:0 24px 22px;margin-top:-34px">${A.avatar(me.name, 'lg')}<div><div class="f" style="font-size:24px;margin-top:34px">${A.esc(me.name)}</div><div class="sm mu">${A.ic('map-pin')} Kec. ${A.esc(pr.kecamatan || '-')}, ${A.esc(pr.city)}, ${A.esc(pr.province)} · ${A.tag('approved')}</div></div></div></div>
      <div class="g4 mt16">${V.stat('users', 'c-green', pr.population || '-', 'Penduduk')}${V.stat('map', 'c-blue', (pr.area || '-') + (pr.area ? ' km²' : ''), 'Luas wilayah')}${V.stat('building-store', 'c-amber', pr.umkm || '-', 'UMKM aktif')}${V.stat('file-text', 'c-purple', probs.length, 'Kebutuhan aktif')}</div>
      <div class="g32 mt16"><div class="col"><div class="card"><h3>Tentang & potensi desa</h3><p>${A.esc(pr.about || 'Belum diisi.')}</p><div class="label mt16">Potensi</div><div class="chips">${(pr.potentials || []).map(x => A.chipTag(x)).join('') || '<span class="mu sm">—</span>'}</div><div class="label mt16">Fasilitas</div><div class="chips">${(pr.facilities || []).map(x => A.chipTag(x, 'gray')).join('') || '<span class="mu sm">—</span>'}</div></div>
        <div class="card"><h3>Bidang yang membutuhkan dukungan</h3><div class="list">${probs.map(p => `<a class="item click" href="#/desa/problem/${p.id}"><div class="grow b">${A.esc(p.title)}</div>${A.chipTag(p.category, 'blue')}${A.tag(p.status)}</a>`).join('') || '<span class="mu sm">Belum ada kebutuhan aktif.</span>'}</div></div></div>
        <div class="col"><div class="card"><h3>Lokasi</h3><div style="height:140px;border-radius:12px;background:var(--green-100);display:flex;align-items:center;justify-content:center;color:var(--green-500);font-size:34px">${A.ic('map-pin')}</div><p class="sm mu mt8">${A.esc(pr.city)}, ${A.esc(pr.province)}</p></div>
          <div class="card"><h3>Kontak</h3><div class="col gap8"><div class="row">${A.ic('user')} ${A.esc(pr.contactName || '-')}</div><div class="row">${A.ic('phone')} ${A.esc(pr.phone || '-')}</div><div class="row">${A.ic('mail')} ${A.esc(pr.email || '-')}</div></div></div>
          <div class="card"><h3>Dokumen verifikasi</h3><div class="col gap8">${me.docs.map(d => `<div class="row">${A.ic('file-text', 'mu')} <span class="sm">${A.esc(d)}</span></div>`).join('')}</div></div></div></div>`;
  });
  A.acts.editProfile = d => { A.ui.edit.profile = d.on === '1'; A.render(); };
  A.acts.saveDesaProfile = f => A.run(() => {
    if (!f.name) throw new Error('Nama desa wajib diisi.');
    const me = S.me(); S.updateProfile(me.id, { __name: f.name.startsWith('Desa ') ? f.name : 'Desa ' + f.name, kecamatan: f.kecamatan, city: f.city, province: A.CITIES[f.city], population: f.population, area: f.area, umkm: f.umkm, about: f.about, potentials: A.csv(f.potentials), facilities: A.csv(f.facilities), contactName: f.contactName, phone: f.phone, email: f.email });
    A.ui.edit.profile = false; A.toast('Profil desa disimpan.');
  });
})(window.App);
