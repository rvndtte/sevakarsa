/* Halaman bersama desa & universitas: daftar partnership, ruang partnership (informasi/proposal/status), status, notifikasi */
(function (A) {
  const S = A.Store, V = A.V = {};

  V.head = (title, sub = '', actions = '', back = '') => `<div class="head"><div>${back ? `<a class="back" data-act="back">${A.ic('arrow-left')} ${back}</a>` : ''}<h1 class="title">${title}</h1>${sub ? `<div class="subtitle">${sub}</div>` : ''}</div><div class="row wrap">${actions}</div></div>`;
  V.stat = (icon, color, value, label) => `<div class="card stat"><div class="ib ${color}">${A.ic(icon)}</div><div><div class="v">${value}</div><div class="l">${label}</div></div></div>`;
  V.progress = ps => ({ requested: 10, reserved: 35, proposal: ps.proposal && ps.proposal.status === 'submitted' ? 80 : 60, matched: 100 }[ps.status] || 0);
  V.deadline = ps => ps.status === 'reserved' ? { end: ps.reservationEnds, label: 'Sisa waktu diskusi' } : (ps.status === 'proposal' && !['submitted', 'accepted'].includes(ps.proposal?.status)) ? { end: ps.proposalEnds, label: 'Sisa waktu kirim proposal' } : null;
  V.cdBox = ps => {
    const d = V.deadline(ps); if (!d) return '';
    return `<div class="cd ${d.end - A.now() < A.DAY ? 'hot' : ''}">${A.ic('clock-hour-4', '')}<div><div class="v">${A.cd(d.end)}</div><div class="xs mu">${d.label}</div></div></div>`;
  };
  V.problemTitle = ps => { const p = S.problem(ps.problemId); return p ? p.title : '-'; };
  V.size = n => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';

  /* ---------- informasi pihak (dipakai kartu, modal, ruang partnership) ---------- */
  V.wa = phone => { let d = String(phone || '').replace(/\D/g, ''); if (d.startsWith('0')) d = '62' + d.slice(1); return d; };
  V.contact = u => {
    const pr = u.profile;
    return `<div class="col gap8"><div class="row">${A.ic('user', 'mu')} ${A.esc(pr.contactName || '-')}</div><div class="row">${A.ic('phone', 'mu')} ${A.esc(pr.phone || '-')}</div><div class="row">${A.ic('mail', 'mu')} ${A.esc(pr.email || '-')}</div>
      <div class="row wrap mt4">${pr.phone ? `<a class="btn sm green" target="_blank" rel="noopener" href="https://wa.me/${V.wa(pr.phone)}">${A.ic('brand-whatsapp')} WhatsApp</a><a class="btn sm out" href="tel:${A.esc(pr.phone)}">${A.ic('phone')} Telepon</a>` : ''}${pr.email ? `<a class="btn sm out" href="mailto:${A.esc(pr.email)}">${A.ic('mail')} Email</a>` : ''}</div></div>`;
  };
  V.histList = (h, limit) => (h || []).slice(0, limit || 99).map(x => `<div class="item" style="padding:10px 12px"><span class="ib s c-green">${A.ic('circle-check')}</span><div class="grow"><div class="b sm">${A.esc(x.title)} <span class="mu">· ${A.esc(x.year)}</span></div><div class="xs mu">${A.esc(x.desa)} — ${A.esc(x.result)}</div></div></div>`).join('') || '<span class="mu sm">Belum ada program tercatat.</span>';
  V.partyBody = (u, limit) => {
    const pr = u.profile;
    if (u.role === 'desa') return `<p>${A.esc(pr.about || 'Belum ada deskripsi.')}</p>
      <div class="g3 mt12"><div><div class="label">Penduduk</div><b>${A.esc(pr.population || '-')}</b></div><div><div class="label">Luas</div><b>${A.esc(pr.area || '-')} km²</b></div><div><div class="label">UMKM</div><b>${A.esc(pr.umkm || '-')}</b></div></div>
      <div class="label mt16">Potensi desa</div><div class="chips">${(pr.potentials || []).map(x => A.chipTag(x)).join('') || '<span class="mu sm">—</span>'}</div>
      <div class="label mt16">Fasilitas</div><div class="chips">${(pr.facilities || []).map(x => A.chipTag(x, 'gray')).join('') || '<span class="mu sm">—</span>'}</div>
      <div class="label mt16">Kontak</div>${V.contact(u)}`;
    return `<p>${A.esc(pr.about || 'Belum ada deskripsi.')}</p>
      <div class="label mt16">Bidang keahlian</div><div class="chips">${(pr.fields || []).map(x => A.chipTag(x, 'blue')).join('') || '<span class="mu sm">—</span>'}</div>
      <div class="label mt16">Program studi</div><div class="chips">${(pr.programs || []).map(x => A.chipTag(x, 'gray')).join('') || '<span class="mu sm">—</span>'}</div>
      <div class="label mt16">Program yang pernah diambil</div><div class="list mt8">${V.histList(pr.history, limit)}</div>${limit && (pr.history || []).length > limit ? `<button class="btn sm out mt8" data-act="viewUniv" data-id="${u.id}">Lihat semua (${pr.history.length})</button>` : ''}
      <div class="label mt16">Kontak</div>${V.contact(u)}`;
  };
  V.partyCard = (u, label) => `<div class="card"><div class="row sp top"><div class="row">${A.avatar(u.name, u.role === 'univ' ? 'av-d' : '')}<div><div class="b" style="font-size:16px">${A.esc(u.name)}</div><div class="xs mu">${A.ic('map-pin')} ${A.esc(u.profile.city)}, ${A.esc(u.profile.province)}</div></div></div><span class="tag ${u.role === 'desa' ? '' : 'blue'}">${label}</span></div><div class="mt16">${V.partyBody(u, 3)}</div></div>`;
  A.acts.viewUniv = d => { const u = S.user(d.id); A.modal({ wide: true, title: A.esc(u.name), body: `<p class="mu sm">${A.ic('map-pin')} ${A.esc(u.profile.city)}, ${A.esc(u.profile.province)}</p><div class="mt8">${V.partyBody(u)}</div>`, actions: [{ label: 'Tutup', cls: 'out' }] }); };
  A.acts.viewDesa = d => { const u = S.user(d.id); A.modal({ wide: true, title: A.esc(u.name), body: `<p class="mu sm">${A.ic('map-pin')} ${A.esc(u.profile.city)}, ${A.esc(u.profile.province)}</p><div class="mt8">${V.partyBody(u)}</div>`, actions: [{ label: 'Tutup', cls: 'out' }] }); };

  /* ================= daftar partnership ================= */
  A.route('/partnerships', ['desa', 'univ'], (_, me) => {
    const f = A.ui.pfilter || 'all', all = S.pshipsOf(me).sort((a, b) => b.createdAt - a.createdAt);
    const grp = { all: () => true, active: p => ['requested', 'reserved', 'proposal'].includes(p.status), matched: p => p.status === 'matched', closed: p => ['rejected', 'expired', 'declined'].includes(p.status) };
    const list = all.filter(grp[f]);
    const chip = (k, l) => `<button class="chip ${f === k ? 'on' : ''}" data-act="pfilter" data-k="${k}">${l} <span class="n">${all.filter(grp[k]).length}</span></button>`;
    const rows = list.map(ps => {
      const p = S.problem(ps.problemId), o = S.otherParty(ps, me), d = V.deadline(ps), pr = o.profile;
      const inline = '';
      const brief = me.role === 'desa' ? `<div class="mt8 sm" style="border-top:1px dashed var(--border);padding-top:8px"><div class="label">Deskripsi partner</div><div class="mu" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${A.esc(pr.about || 'Belum ada deskripsi.')}</div><div class="chips mt8">${(pr.fields || []).slice(0, 4).map(x => A.chipTag(x, 'blue')).join('')}<span class="tag gray">${(pr.history || []).length} program pernah diambil</span></div></div>` : '';
      return `<div class="card tight click" data-act="openPship" data-id="${ps.id}"><div class="row top">${A.photo(p?.id, 't')}<div class="grow"><div class="row wrap"><b style="font-size:15px">${A.esc(p?.title)}</b>${A.tag(ps.completed ? 'done' : ps.status)}</div>
        <div class="sm mu mt4">${A.ic('building-community')} ${A.esc(o?.name)} · ${A.ic('map-pin')} ${A.esc(p?.city)}</div>
        <div class="row mt8"><div class="bar thin grow" style="max-width:180px"><i style="width:${V.progress(ps)}%"></i></div>${d ? `<span class="xs mu">${A.ic('clock')} ${A.cd(d.end)}</span>` : `<span class="xs mu">Diajukan ${A.ago(ps.createdAt)}</span>`}</div>${brief}</div>
        <div class="col gap8" style="align-items:flex-end">${inline}${me.role === 'desa' ? `<button class="btn sm out" data-act="viewUniv" data-id="${o.id}">Profil univ</button>` : ''}</div></div></div>`;
    }).join('');
    return V.head('Partnership', me.role === 'desa' ? 'Request dan kolaborasi dengan universitas' : 'Partnership dan proposal yang Anda ajukan') +
      `<div class="chips mb">${chip('all', 'Semua')}${chip('active', 'Berjalan')}${chip('matched', 'Matched')}${chip('closed', 'Berakhir')}</div>
      <div class="list mt16">${rows || `<div class="card">${A.empty('heart-handshake', 'Belum ada partnership.', me.role === 'univ' ? '<a class="btn sm mt12" href="#/univ/discover">Jelajahi desa</a>' : '')}</div>`}</div>`;
  });
  A.acts.pfilter = d => { A.ui.pfilter = d.k; A.render(); };
  A.acts.openPship = (d, el, e) => { if (e.target.closest('button')) return; A.go('/partnerships/' + d.id); };

  /* ================= ruang partnership ================= */
  const STAGES = ['Pengajuan', 'Diskusi', 'Proposal', 'Review', 'Matched'];
  const stageIdx = ps => ps.status === 'matched' ? 4 : ps.status === 'proposal' ? (ps.proposal?.status === 'submitted' ? 3 : 2) : ps.status === 'reserved' ? 1 : ps.status === 'rejected' ? 3 : ps.status === 'expired' ? (ps.proposalEnds ? 2 : 1) : 0;
  V.stepper = ps => {
    const cur = stageIdx(ps), bad = ['rejected', 'expired', 'declined'].includes(ps.status);
    return `<div class="stepper">${STAGES.map((l, i) => `${i ? `<span class="ln ${i <= cur ? 'ok' : ''}"></span>` : ''}<div class="st ${i < cur || (i === cur && ps.status === 'matched') ? 'ok' : i === cur ? (bad ? '' : 'on') : ''}"><span class="n">${i < cur || (i === cur && ps.status === 'matched') ? A.ic('check') : i + 1}</span>${l}</div>`).join('')}</div>`;
  };

  A.route('/partnerships/:id', ['desa', 'univ'], ({ id }, me) => {
    const ps = S.pship(id), p = ps && S.problem(ps.problemId);
    if (!ps || (ps.desaId !== me.id && ps.univId !== me.id)) return V.head('Partnership tidak ditemukan') + `<div class="card">${A.empty('mood-empty', 'Partnership tidak ditemukan atau bukan milik Anda.', '<a class="btn sm mt12" href="#/partnerships">Kembali</a>')}</div>`;
    const univ = S.user(ps.univId), desa = S.user(ps.desaId);
    const tabs = [['info', 'Informasi kedua pihak'], ['proposal', 'Proposal'], ['status', 'Status & riwayat']];
    const tab = A.ui.tab[id] || (ps.status === 'proposal' || ps.status === 'matched' ? 'proposal' : 'info');
    const banner = ps.status === 'reserved' ? `<div class="card warn mt16">${A.ic('lock')} <b>Diskusi berjalan.</b> <span class="sm">${me.role === 'desa' ? 'Universitas yang lebih dulu mengajukan otomatis masuk diskusi agar penilaian tidak bias nama kampus. Keputusan diterima atau tidaknya diambil saat review proposal.' : 'Kebutuhan ini tereservasi untuk Anda selama masa diskusi. Desa tidak menyeleksi pengajuan; keputusan diambil saat review proposal.'}</span>${me.role === 'univ' ? `<div class="row mt8"><button class="btn sm red" data-act="cancelReq" data-id="${ps.id}">Mundur dari diskusi</button></div>` : ''}</div>` :
      ps.status === 'rejected' ? `<div class="card mt16" style="background:var(--red-100);border-color:#F0C2BC">${A.ic('circle-x')} <b>Proposal ditolak.</b> Kebutuhan terbuka kembali.${ps.proposal?.reviewNote ? `<div class="sm mt4">Catatan desa: ${A.esc(ps.proposal.reviewNote)}</div>` : ''}</div>` :
        ps.status === 'expired' ? `<div class="card mt16" style="background:var(--cream-200)">${A.ic('hourglass-empty')} <b>Waktu habis (Expired).</b> Kebutuhan terbuka kembali.</div>` :
          ps.status === 'declined' ? `<div class="card mt16" style="background:var(--cream-200)">${A.ic('info-circle')} Request ini tidak dilanjutkan. Kebutuhan terbuka kembali.</div>` : '';
    return `${V.head(A.esc(p.title), `${A.esc(desa.name)} × ${A.esc(univ.name)}`, `${A.tag(ps.completed ? 'done' : ps.status, 'lg')}${V.cdBox(ps)}`, 'Kembali')}
      <div class="card tight">${V.stepper(ps)}</div>${banner}
      <div class="g32 mt16"><div>
        <div class="tabs">${tabs.map(t => `<button class="${tab === t[0] ? 'on' : ''}" data-act="ptab" data-id="${id}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>
        ${tab === 'info' ? V.infoTab(ps, univ, desa) : tab === 'proposal' ? V.proposal(ps, me, univ, p) : V.statusTab(ps)}
      </div><div class="col">${V.sidePanel(ps, me, p)}</div></div>`;
  });
  A.acts.ptab = d => { A.ui.tab[d.id] = d.t; A.render(); };
  A.acts.cancelReq = d => A.confirm('Mundur dari diskusi?', 'Kebutuhan akan terbuka kembali untuk universitas lain.', () => A.run(() => { S.cancelRequest(d.id); A.toast('Anda mundur dari diskusi.'); A.go('/partnerships'); }), { danger: true, label: 'Mundur' });

  /* ---------- informasi kedua pihak (pengganti roomchat) ---------- */
  V.infoTab = (ps, univ, desa) => `${ps.status === 'reserved' ? `<div class="card soft tight mb">${A.ic('info-circle')} Masa diskusi berjalan (<b>${A.cd(ps.reservationEnds)}</b>). Hubungi pihak lain lewat kontak di bawah, catat kesepakatan di agenda, lalu lanjutkan ke tahap proposal.</div>` : ''}
    <div class="g2">${V.partyCard(desa, 'Desa')}${V.partyCard(univ, 'Universitas')}</div>`;

  /* ---------- proposal ---------- */
  const fileRow = (ps, f, withReplace) => `<div class="item"><span class="ib s c-blue">${A.ic('file-type-pdf')}</span><div class="grow"><div class="b sm">${A.esc(f.name)}</div><div class="xs mu">${V.size(f.size)}</div></div><button type="button" class="btn sm out" data-act="openFile" data-id="${ps.id}">${A.ic('eye')} Lihat</button>${withReplace ? '' : ''}</div>`;
  const propView = (ps, pr) => `<div class="col">
    <div><div class="label">Judul proposal</div><b style="font-size:16px">${A.esc(pr.title)}</b></div>
    <div><div class="label">Berkas proposal</div>${pr.file ? fileRow(ps, pr.file) : '<span class="mu sm">Belum ada berkas.</span>'}</div>
    <div class="g2"><div><div class="label">Koordinator KKN</div><div class="chips">${(pr.coordinators || []).map(n => A.chipTag(n, 'blue')).join('') || '—'}</div></div>
      <div><div class="label">Dosen pembimbing</div><div class="chips">${(pr.advisors || []).map(n => A.chipTag(n, 'purple')).join('') || '—'}</div></div></div>
    <div class="g2"><div><div class="label">Formasi anggota KKN</div><b>${pr.formation || '-'} orang (total)</b></div><div><div class="label">Timeline</div><b>${pr.start ? A.fmtDate(pr.start) : '-'} – ${pr.end ? A.fmtDate(pr.end) : '-'}</b></div></div>
    ${pr.reviewNote ? `<div class="card soft tight"><div class="label">Catatan review desa</div>${A.esc(pr.reviewNote)}</div>` : ''}</div>`;

  const people = (pr, kind, label, ph) => `<div class="field"><label>${label} *</label>
    <div class="chips" style="margin-bottom:6px">${(pr[kind] || []).map((n, i) => `<span class="tag blue lg">${A.esc(n)} <a data-act="delPerson" data-kind="${kind}" data-i="${i}" data-id="${pr.__id}" style="cursor:pointer">${A.ic('x')}</a></span>`).join('') || '<span class="mu sm">Belum ada nama.</span>'}</div>
    <div class="row"><input type="text" id="new-${kind}" placeholder="${ph}" data-enter="#add-${kind}"><button type="button" class="btn out" id="add-${kind}" data-act="addPerson" data-kind="${kind}" data-id="${pr.__id}">${A.ic('plus')} Tambah</button></div></div>`;

  V.proposal = (ps, me, univ, p) => {
    const pr = ps.proposal;
    if (ps.status === 'requested' || ps.status === 'declined') return `<div class="card">${A.empty('file-text', 'Proposal tersedia setelah masa reservation & diskusi berjalan.')}</div>`;
    if (ps.status === 'reserved') return `<div class="card"><h3>Tahap proposal</h3><p class="mu">Selama masa diskusi (${A.cd(ps.reservationEnds)}), kedua pihak menyepakati kebutuhan. Setelah siap, universitas melanjutkan ke tahap proposal (batas pengiriman 7 hari).</p>
      <div class="mt16">${me.role === 'univ' ? `<button class="btn" data-act="startProposal" data-id="${ps.id}">Lanjut ke proposal ${A.ic('arrow-right')}</button>` : `<div class="tag amber lg">Menunggu universitas memulai proposal</div>`}</div></div>`;
    if (!pr) return `<div class="card">${A.empty('file-text', ps.status === 'expired' ? 'Waktu habis sebelum proposal dimulai.' : 'Belum ada proposal.')}</div>`;
    const editable = me.role === 'univ' && ps.status === 'proposal' && ['draft', 'revision'].includes(pr.status);
    if (editable) {
      const x = Object.assign({}, pr, { __id: ps.id });
      return `<div class="card"><div class="row sp"><h3 class="nb">Susun proposal</h3>${pr.status === 'revision' ? A.tag('revision') : A.tag('draft')}</div>
        ${pr.status === 'revision' && pr.reviewNote ? `<div class="card warn tight mt12"><div class="label">Catatan revisi dari desa</div>${A.esc(pr.reviewNote)}</div>` : ''}
        <form class="mt16" data-submit="noop" id="pform" novalidate>
          <div class="field"><label>Judul proposal *</label><input type="text" name="title" value="${A.esc(pr.title)}" placeholder="mis. Program Digitalisasi UMKM Desa"></div>
          <div class="field"><label>Berkas proposal (PDF) *</label>${pr.file ? fileRow(ps, pr.file) : ''}<input type="file" accept="application/pdf,.pdf" data-change="propFile" data-id="${ps.id}" style="margin-top:${pr.file ? '8px' : '0'}"><span class="hint">${pr.file ? 'Pilih berkas lain untuk mengganti. ' : ''}PDF, maksimal 2 MB (disimpan di browser untuk demo).</span></div>
          ${people(x, 'coordinators', 'Koordinator KKN', 'Nama koordinator KKN')}
          ${people(x, 'advisors', 'Dosen pembimbing', 'Nama dosen pembimbing')}
          <div class="g3"><div class="field"><label>Total formasi anggota KKN *</label><input type="number" name="formation" min="1" max="200" value="${A.esc(pr.formation)}" placeholder="mis. 12"><span class="hint">Jumlah orang seluruhnya.</span></div><div class="field"><label>Mulai *</label><input type="date" name="start" value="${pr.start || ''}"></div><div class="field"><label>Selesai *</label><input type="date" name="end" value="${pr.end || ''}"></div></div>
          <div class="row"><button type="button" class="btn out" data-act="proposalDraft" data-id="${ps.id}">Simpan draft</button><button type="button" class="btn" data-act="proposalSend" data-id="${ps.id}">Kirim proposal ${A.ic('send')}</button></div></form></div>`;
    }
    if (pr.status === 'submitted' && me.role === 'desa') {
      return `<div class="card"><div class="row sp"><h3 class="nb">Review proposal</h3>${A.tag('submitted')}</div><div class="mt16">${propView(ps, Object.assign({}, pr, { reviewNote: '' }))}</div><div class="divider"></div>
        <div class="field"><label>Catatan untuk universitas</label><textarea id="note-${ps.id}" data-draft="note-${ps.id}" placeholder="Wajib diisi jika meminta revisi atau menolak"></textarea></div>
        <div class="row wrap"><button class="btn" data-act="review" data-id="${ps.id}" data-d="accept">${A.ic('check')} Terima proposal</button><button class="btn out" data-act="review" data-id="${ps.id}" data-d="revision">Minta revisi</button><button class="btn red" data-act="review" data-id="${ps.id}" data-d="reject">${A.ic('x')} Tolak</button></div></div>`;
    }
    const wait = pr.status === 'submitted' ? `<div class="card warn tight mb">${A.ic('hourglass-empty')} Proposal terkirim — menunggu review desa.</div>` : pr.status === 'draft' && me.role === 'desa' ? `<div class="card warn tight mb">${A.ic('hourglass-empty')} Universitas sedang menyusun proposal. Sisa waktu: ${ps.proposalEnds ? A.cd(ps.proposalEnds) : '-'}</div>` : '';
    return `${wait}<div class="card"><div class="row sp"><h3 class="nb">Proposal</h3>${A.tag(pr.status === 'accepted' ? 'matched' : pr.status)}</div><div class="mt16">${pr.title || pr.file ? propView(ps, pr) : A.empty('file-text', 'Proposal belum diisi.')}</div></div>`;
  };
  A.acts.noop = () => { };
  const propData = el => { const f = A.formData(el.closest('form')); return { title: f.title || '', formation: f.formation || '', start: f.start || '', end: f.end || '' }; };
  const savedKeep = (id, el) => { S.saveProposal(id, propData(el)); };
  A.acts.startProposal = d => A.confirm('Lanjut ke tahap proposal?', 'Masa diskusi berakhir dan Anda punya 7 hari untuk mengirim proposal.', () => A.run(() => { S.startProposal(d.id); A.ui.tab[d.id] = 'proposal'; A.toast('Tahap proposal dimulai.'); }), { label: 'Mulai proposal' });
  A.acts.proposalDraft = (d, el) => A.run(() => { savedKeep(d.id, el); A.toast('Draft proposal disimpan.'); });
  A.acts.addPerson = (d, el) => {
    const form = el.closest('form'), inp = form.querySelector('#new-' + d.kind), name = inp.value.trim();
    if (!name) return A.toast('Isi nama terlebih dulu.', 'err');
    A.run(() => { const pr = S.pship(d.id).proposal; S.saveProposal(d.id, Object.assign(propData(el), { [d.kind]: [...(pr[d.kind] || []), name] })); });
  };
  A.acts.delPerson = (d, el) => A.run(() => { const pr = S.pship(d.id).proposal, l = [...(pr[d.kind] || [])]; l.splice(+d.i, 1); S.saveProposal(d.id, Object.assign(propData(el), { [d.kind]: l })); });
  A.acts.propFile = (v, el, d) => {
    const f = el.files && el.files[0]; if (!f) return;
    if (!/pdf$/i.test(f.name) && f.type !== 'application/pdf') { el.value = ''; return A.toast('Berkas harus berformat PDF.', 'err'); }
    if (f.size > 2 * 1024 * 1024) { el.value = ''; return A.toast('Ukuran berkas maksimal 2 MB.', 'err'); }
    const r = new FileReader();
    r.onload = () => A.run(() => { S.saveProposal(d.id, Object.assign(propData(el), { file: { name: f.name, size: f.size, data: r.result } })); A.toast('Berkas proposal terunggah.'); });
    r.onerror = () => A.toast('Gagal membaca berkas.', 'err');
    r.readAsDataURL(f);
  };
  A.acts.openFile = d => {
    const pr = S.pship(d.id).proposal, f = pr && pr.file;
    if (!f || !f.data) return A.toast('Ini berkas contoh (demo) — isinya tidak tersimpan. Unggah PDF sendiri untuk mencoba pratinjau.', 'err');
    try { const b = atob(f.data.split(',')[1]), u8 = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u8[i] = b.charCodeAt(i); window.open(URL.createObjectURL(new Blob([u8], { type: 'application/pdf' })), '_blank'); } catch (e) { A.toast('Tidak dapat membuka berkas.', 'err'); }
  };
  A.acts.proposalSend = (d, el) => { try { savedKeep(d.id, el); S.validateProposal(d.id); } catch (e) { A.render(); return A.toast(e.message, 'err'); } A.confirm('Kirim proposal?', 'Setelah dikirim, proposal tidak bisa diubah kecuali desa meminta revisi.', () => A.run(() => { S.submitProposal(d.id, propData(el)); A.toast('Proposal terkirim ke desa.'); }), { label: 'Kirim proposal' }); };
  A.acts.review = d => {
    const note = (A.$('#note-' + d.id) || {}).value || '', txt = { accept: ['Terima proposal?', 'Partnership menjadi Matched dan KKN dapat dilaksanakan.', 'Terima'], revision: ['Minta revisi?', 'Universitas mendapat tambahan waktu 3 hari untuk memperbaiki.', 'Minta revisi'], reject: ['Tolak proposal?', 'Partnership menjadi Rejected dan kebutuhan terbuka kembali untuk universitas lain.', 'Tolak'] }[d.d];
    if (d.d !== 'accept' && !note.trim()) return A.toast('Isi catatan untuk universitas terlebih dulu.', 'err');
    A.confirm(txt[0], txt[1], () => A.run(() => { S.reviewProposal(d.id, d.d, note.trim()); A.ui.draft['note-' + d.id] = ''; A.toast({ accept: 'Proposal diterima — Matched!', revision: 'Permintaan revisi dikirim.', reject: 'Proposal ditolak — kebutuhan terbuka kembali.' }[d.d]); }), { danger: d.d === 'reject', label: txt[2] });
  };

  /* ---------- status & riwayat ---------- */
  V.timeline = ps => `<div class="tl">${ps.log.slice().sort((a, b) => a.ts - b.ts).map((e, i, arr) => `<div class="e"><div class="d ${i === arr.length - 1 ? 'now' : ''}">${A.ic(i === arr.length - 1 ? 'point' : 'check')}</div><div><div class="b">${A.esc(e.text)}</div><div class="xs mu">${A.fmtDT(e.ts)}</div></div></div>`).join('')}</div>`;
  V.statusTab = ps => `<div class="card"><h3>Riwayat proses</h3>${V.timeline(ps)}</div>`;

  /* ---------- panel samping ---------- */
  V.sidePanel = (ps, me, p) => {
    const live = ['reserved', 'proposal', 'matched'].includes(ps.status);
    const agenda = live ? `<div class="card"><h3>Agenda & kesepakatan</h3><div class="col gap8">${ps.agenda.map(g => `<label class="row" style="cursor:pointer"><input type="checkbox" ${g.done ? 'checked' : ''} data-change="toggleAgenda" data-id="${ps.id}" data-g="${g.id}" style="accent-color:var(--green-500);width:16px;height:16px"><span style="${g.done ? 'text-decoration:line-through;color:var(--muted)' : ''}">${A.esc(g.text)}</span></label>`).join('') || '<span class="mu sm">Belum ada agenda.</span>'}</div>
      <form class="row mt12" data-submit="addAgenda" data-id="${ps.id}"><input type="text" name="text" placeholder="Tambah agenda..." style="padding:8px 12px"><button class="btn sm">${A.ic('plus')}</button></form></div>` : '';
    const docs = live || ps.status === 'expired' ? `<div class="card"><h3>Dokumen</h3><div class="col gap8">${ps.docs.map(dc => `<div class="item" style="padding:8px 12px"><span class="ib s c-green">${A.ic(dc.kind === 'photo' ? 'photo' : 'file-text')}</span><div class="grow"><div class="b sm">${A.esc(dc.name)}</div><div class="xs mu">${A.esc(S.user(dc.by)?.name)} · ${A.fmtDate(dc.ts)}</div></div></div>`).join('') || '<span class="mu sm">Belum ada dokumen.</span>'}</div>
      ${live ? `<form class="mt12" data-submit="addDoc" data-id="${ps.id}"><div class="field" style="margin-bottom:8px"><input type="file" name="file"></div>${ps.status === 'matched' ? `<div class="field" style="margin-bottom:8px"><select name="kind"><option value="pdf">Dokumen lain</option><option value="report">Laporan akhir</option><option value="photo">Dokumentasi foto</option></select></div>` : ''}<button class="btn sm out block">${A.ic('upload')} Tambah dokumen</button></form>` : ''}</div>` : '';
    const done = ps.status === 'matched' ? `<div class="card soft"><h3>Pelaksanaan KKN</h3><p class="sm mu">${ps.completed ? 'KKN sudah ditandai selesai dan masuk arsip riwayat desa.' : 'Setelah kegiatan selesai, unggah <b>Laporan akhir</b> lalu tandai selesai.'}</p>${ps.completed ? `<div class="mt8">${A.tag('done', 'lg')}</div>` : `<button class="btn sm mt12" data-act="complete" data-id="${ps.id}">${A.ic('flag-check')} Tandai KKN selesai</button>`}</div>` : '';
    const msg = ps.message ? `<div class="card"><h3>Pesan pengajuan</h3><p class="sm">${A.esc(ps.message)}</p></div>` : '';
    const link = me.role === 'univ' ? `<a class="btn out block" href="#/univ/problem/${p.id}">Lihat detail kebutuhan</a>` : `<a class="btn out block" href="#/desa/problem/${p.id}">Lihat detail kebutuhan</a>`;
    return `${msg}${agenda}${docs}${done}${link}`;
  };
  A.acts.toggleAgenda = (v, el, d) => A.run(() => S.toggleAgenda(d.id, d.g));
  A.acts.addAgenda = (f, form, d) => A.run(() => S.addAgenda(d.id, f.text || ''));
  A.acts.addDoc = (f, form, d) => { const me = S.me(); A.run(() => { S.addDoc(d.id, me.id, f.file && f.file.name, f.kind || 'pdf'); A.toast('Dokumen ditambahkan.'); }); };
  A.acts.complete = d => A.run(() => { S.completePship(d.id); A.toast('KKN ditandai selesai.'); });

  /* ================= status page ================= */
  A.route('/status', ['desa', 'univ'], (_, me) => {
    const all = S.pshipsOf(me).sort((a, b) => b.createdAt - a.createdAt);
    if (!all.length) return V.head('Status partnership', 'Pantau posisi proses Anda') + `<div class="card">${A.empty('timeline-event', 'Belum ada partnership.', me.role === 'univ' ? '<a class="btn sm mt12" href="#/univ/discover">Jelajahi desa</a>' : '')}</div>`;
    const sel = S.pship(A.ui.statusSel) && all.includes(S.pship(A.ui.statusSel)) ? S.pship(A.ui.statusSel) : all.find(p => ['reserved', 'proposal', 'matched'].includes(p.status)) || all[0];
    const p = S.problem(sel.problemId), o = S.otherParty(sel, me);
    const idx = { requested: 0, declined: 0, rejected: 2, expired: sel.proposalEnds ? 2 : 1, reserved: 1, proposal: 2, matched: 3 }[sel.status];
    const bad = ['rejected', 'expired'].includes(sel.status);
    const nodes = [['Available', 'circle-dot', p.createdAt], ['Reserved', 'lock', sel.reservationEnds ? sel.reservationEnds - 7 * A.DAY : null], ['Proposal', 'file-text', sel.proposalEnds ? sel.proposalEnds - 7 * A.DAY : null], ['Matched', 'circle-check', sel.status === 'matched' ? sel.log[sel.log.length - 1]?.ts : null]];
    const fill = Math.max(0, Math.min(3, sel.status === 'matched' ? 3 : idx)) / 3 * 75;
    return `${V.head('Status partnership', 'Perjalanan kolaborasi dari pengajuan hingga dampak nyata')}
      <div class="row wrap mb"><span class="sm mu">Pilih partnership:</span><select data-change="statusSel" style="max-width:380px">${all.map(x => `<option value="${x.id}" ${x.id === sel.id ? 'selected' : ''}>${A.esc(S.problem(x.problemId)?.title)} — ${A.esc(S.otherParty(x, me)?.name)}</option>`).join('')}</select></div>
      <div class="dark"><div class="row sp wrap"><div><div class="f" style="font-size:24px">${A.esc(p.title)}</div><div class="sm" style="color:#B8C8BD">${A.esc(S.user(p.desaId).name)} · ${A.esc(S.user(sel.univId).name)}</div></div>${A.tag(sel.completed ? 'done' : sel.status, 'lg')}</div>
        <div class="dtl"><div class="fill" style="width:${fill}%"></div>${nodes.map((n, i) => { const ok = i < idx || sel.status === 'matched', now = i === idx && !bad && sel.status !== 'matched' || (sel.status === 'matched' && i === 3); return `<div class="nd ${ok || now ? 'ok' : ''} ${now ? 'now' : ''}"><div class="c">${A.ic(n[1])}</div><b>${n[0]}</b><small>${n[2] ? A.fmtDate(n[2]) : '—'}</small></div>`; }).join('')}</div>
        <div class="branch"><div class="${sel.status === 'rejected' ? 'on' : ''}"><div class="row b">${A.ic('circle-x')} Rejected</div><div class="sm" style="color:#B8C8BD">Proposal ditolak desa. Kebutuhan terbuka kembali.</div></div><div class="${sel.status === 'expired' ? 'on' : ''}"><div class="row b">${A.ic('hourglass-empty')} Expired</div><div class="sm" style="color:#B8C8BD">Waktu 1 minggu habis. Kebutuhan terbuka kembali.</div></div></div>
        ${V.deadline(sel) ? `<div class="row mt16">${A.ic('clock')} <span>${V.deadline(sel).label}: <b>${A.cd(V.deadline(sel).end)}</b></span></div>` : ''}
        <div class="mt16"><a class="btn lime" href="#/partnerships/${sel.id}">Buka partnership ${A.ic('arrow-right')}</a></div></div>
      <div class="g2 mt16"><div class="card"><h3>Semua status</h3><div class="list">${all.map(x => `<div class="item click" data-act="statusPick" data-id="${x.id}"><div class="grow"><div class="b">${A.esc(S.problem(x.problemId)?.title)}</div><div class="xs mu">${A.esc(S.otherParty(x, me)?.name)}</div></div>${A.tag(x.completed ? 'done' : x.status)}</div>`).join('')}</div></div>
        <div class="card"><h3>Riwayat: ${A.esc(o.name)}</h3>${V.timeline(sel)}</div></div>`;
  });
  A.acts.statusSel = v => { A.ui.statusSel = v; A.render(); };
  A.acts.statusPick = d => { A.ui.statusSel = d.id; A.render(); window.scrollTo(0, 0); };

  /* ================= notifikasi ================= */
  const GROUPS = { partnership: ['partnership'], proposal: ['proposal'], deadline: ['deadline', 'expire'], status: ['status', 'reject', 'system'] };
  A.route('/notifications', ['desa', 'univ', 'admin'], (_, me) => {
    const f = A.ui.nfilter || 'all', all = S.notifsOf(me.id), list = f === 'all' || !GROUPS[f] ? all : all.filter(n => GROUPS[f].includes(n.type));
    const chip = (k, l) => `<button class="chip ${f === k ? 'on' : ''}" data-act="nfilter" data-k="${k}">${l}</button>`;
    const item = n => { const [ic, cl] = A.NOTIF[n.type] || A.NOTIF.system; return `<div class="item click" data-act="openNotif" data-id="${n.id}" style="background:${n.read ? 'var(--cream-50)' : '#fff'};${n.read ? '' : 'border-color:var(--border)'}"><div class="ib ci ${cl}">${A.ic(ic)}</div><div class="grow"><div class="${n.read ? '' : 'b'}">${A.esc(n.text)}</div><div class="xs mu">${A.ago(n.ts)}</div></div>${n.read ? '' : '<span style="width:9px;height:9px;border-radius:50%;background:var(--green-500)"></span>'}</div>`; };
    const today = list.filter(n => A.now() - n.ts < A.DAY), before = list.filter(n => A.now() - n.ts >= A.DAY);
    return V.head('Notifikasi', 'Pemberitahuan partnership, proposal, deadline, dan perubahan status', `<button class="btn out sm" data-act="readAll">Tandai semua dibaca</button>`) +
      `<div class="chips">${chip('all', 'Semua')}${chip('partnership', 'Partnership')}${chip('proposal', 'Proposal')}${chip('deadline', 'Deadline')}${chip('status', 'Status')}</div>
      ${list.length ? `${today.length ? `<div class="label mt24">Hari ini</div><div class="list">${today.map(item).join('')}</div>` : ''}${before.length ? `<div class="label mt24">Sebelumnya</div><div class="list">${before.map(item).join('')}</div>` : ''}` : `<div class="card mt16">${A.empty('bell-off', 'Tidak ada notifikasi.')}</div>`}`;
  });
  A.acts.nfilter = d => { A.ui.nfilter = d.k; A.render(); };
  A.acts.readAll = () => { S.data.notifs.filter(n => n.userId === S.me().id).forEach(n => n.read = true); S.save(); A.render(); };
  A.acts.openNotif = d => { const n = S.data.notifs.find(x => x.id === d.id); n.read = true; S.save(); if (n.link) A.go(n.link.replace(/^#/, '')); else A.render(); };
})(window.App);
