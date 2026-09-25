/* Halaman bersama desa & universitas: daftar kerja sama, ruang kerja sama (informasi/kesepakatan/status), halaman koordinator KKN, status, notifikasi */
(function (A) {
  const S = A.Store, V = A.V = {};
  const OPEN = ['connected', 'matched'], LIVE = ['requested', 'connected', 'matched'], CLOSED = ['rejected', 'expired', 'declined'];

  V.head = (title, sub = '', actions = '', back = '') => `<div class="head"><div>${back ? `<a class="back" data-act="back">${A.ic('arrow-left')} ${back}</a>` : ''}<h1 class="title">${title}</h1>${sub ? `<div class="subtitle">${sub}</div>` : ''}</div><div class="row wrap">${actions}</div></div>`;
  V.stat = (icon, color, value, label) => `<div class="card stat"><div class="ib ${color}">${A.ic(icon)}</div><div><div class="v">${value}</div><div class="l">${label}</div></div></div>`;
  V.progress = ps => ps.status === 'matched' ? 100 : ps.status === 'connected' ? (ps.groups.some(g => g.status === 'submitted') ? 75 : 50) : ps.status === 'requested' ? 20 : 0;
  V.deadline = ps => ps.status === 'requested' ? { end: ps.responseEnds, label: 'Sisa waktu respons desa' } : null;
  V.cdBox = ps => {
    const d = V.deadline(ps); if (!d) return '';
    return `<div class="cd ${d.end - A.now() < A.DAY ? 'hot' : ''}">${A.ic('clock-hour-4', '')}<div><div class="v">${A.cd(d.end)}</div><div class="xs mu">${d.label}</div></div></div>`;
  };
  V.problemTitle = ps => { const p = S.problem(ps.problemId); return p ? p.title : '-'; };
  V.slots = ps => S.slots(ps);
  V.pendingGroups = list => list.reduce((n, ps) => n + ps.groups.filter(g => g.status === 'submitted').length, 0);

  /* ---------- kontak (serah terima; diskusi teknis di WhatsApp, di luar platform) ---------- */
  V.wa = phone => { let d = String(phone || '').replace(/\D/g, ''); if (d.startsWith('0')) d = '62' + d.slice(1); return d; };
  V.waMsg = (ps, toDesa) => {
    const p = S.problem(ps.problemId), desa = S.user(ps.desaId), univ = S.user(ps.univId);
    return toDesa ? `Halo ${desa.profile.contactName || desa.name}, kami dari ${univ.name} terkait kerja sama "${p.title}" yang disetujui lewat SumbangRuang. Boleh kami diskusi jadwal dan kebutuhan teknisnya?`
      : `Halo, kami dari ${desa.name} terkait kerja sama "${p.title}" di SumbangRuang. Kapan bisa kita diskusikan jadwal dan kebutuhannya?`;
  };
  V.waBtn = (phone, text, cls = 'green') => `<a class="btn sm ${cls}" target="_blank" rel="noopener" href="https://wa.me/${V.wa(phone)}${text ? '?text=' + encodeURIComponent(text) : ''}">${A.ic('brand-whatsapp')} Hubungi via WhatsApp</a>`;
  V.contactRows = (c, waText) => `<div class="col gap8"><div class="row">${A.ic('user', 'mu')} ${A.esc(c.name || '-')}</div><div class="row">${A.ic('phone', 'mu')} ${A.esc(c.phone || '-')}</div>${c.email ? `<div class="row">${A.ic('mail', 'mu')} ${A.esc(c.email)}</div>` : ''}
      <div class="row wrap mt4">${c.phone ? `${V.waBtn(c.phone, waText)}<a class="btn sm out" href="tel:${A.esc(c.phone)}">${A.ic('phone')} Telepon</a>` : ''}${c.email ? `<a class="btn sm out" href="mailto:${A.esc(c.email)}">${A.ic('mail')} Email</a>` : ''}</div></div>`;
  V.contact = (u, waText) => V.contactRows({ name: u.profile.contactName, phone: u.profile.phone, email: u.profile.email }, waText);
  V.histList = (h, limit) => (h || []).slice(0, limit || 99).map(x => `<div class="item" style="padding:10px 12px"><span class="ib s c-green">${A.ic('circle-check')}</span><div class="grow"><div class="b sm">${A.esc(x.title)} <span class="mu">· ${A.esc(x.year)}</span></div><div class="xs mu">${A.esc(x.desa)} — ${A.esc(x.result)}</div></div></div>`).join('') || '<span class="mu sm">Belum ada program tercatat.</span>';
  /* ct: false = kontak dikunci; string/true = kontak terbuka (string dipakai sebagai pesan pembuka WhatsApp) */
  V.contactBlock = (u, ct) => `<div class="label mt16">Kontak</div>${ct === false || ct === undefined ? `<div class="sm mu">${A.ic('lock')} Kontak terbuka setelah desa menyetujui kerja sama.</div>` : V.contact(u, typeof ct === 'string' ? ct : '')}`;
  V.partyBody = (u, limit, ct) => {
    const pr = u.profile;
    if (u.role === 'desa') return `<p>${A.esc(pr.about || 'Belum ada deskripsi.')}</p>
      <div class="g3 mt12"><div><div class="label">Penduduk</div><b>${A.esc(pr.population || '-')}</b></div><div><div class="label">Luas</div><b>${A.esc(pr.area || '-')} km²</b></div><div><div class="label">UMKM</div><b>${A.esc(pr.umkm || '-')}</b></div></div>
      <div class="label mt16">Potensi desa</div><div class="chips">${(pr.potentials || []).map(x => A.chipTag(x)).join('') || '<span class="mu sm">—</span>'}</div>
      <div class="label mt16">Fasilitas</div><div class="chips">${(pr.facilities || []).map(x => A.chipTag(x, 'gray')).join('') || '<span class="mu sm">—</span>'}</div>${V.contactBlock(u, ct)}`;
    return `<p>${A.esc(pr.about || 'Belum ada deskripsi.')}</p>
      <div class="label mt16">Bidang keahlian</div><div class="chips">${(pr.fields || []).map(x => A.chipTag(x, 'blue')).join('') || '<span class="mu sm">—</span>'}</div>
      <div class="label mt16">Program studi</div><div class="chips">${(pr.programs || []).map(x => A.chipTag(x, 'gray')).join('') || '<span class="mu sm">—</span>'}</div>
      <div class="label mt16">Program yang pernah diambil</div><div class="list mt8">${V.histList(pr.history, limit)}</div>${limit && (pr.history || []).length > limit ? `<button class="btn sm out mt8" data-act="viewUniv" data-id="${u.id}">Lihat semua (${pr.history.length})</button>` : ''}${V.contactBlock(u, ct)}`;
  };
  V.partyCard = (u, label, ct) => `<div class="card"><div class="row sp top"><div class="row">${A.avatar(u.name, u.role === 'univ' ? 'av-d' : '')}<div><div class="b" style="font-size:16px">${A.esc(u.name)}</div><div class="xs mu">${A.ic('map-pin')} ${A.esc(u.profile.city)}, ${A.esc(u.profile.province)}</div></div></div><span class="tag ${u.role === 'desa' ? '' : 'blue'}">${label}</span></div><div class="mt16">${V.partyBody(u, 3, ct)}</div></div>`;
  const profileModal = d => { const u = S.user(d.id); A.modal({ wide: true, title: A.esc(u.name), body: `<p class="mu sm">${A.ic('map-pin')} ${A.esc(u.profile.city)}, ${A.esc(u.profile.province)}</p><div class="mt8">${V.partyBody(u)}</div>`, actions: [{ label: 'Tutup', cls: 'out' }] }); };
  A.acts.viewUniv = profileModal; A.acts.viewDesa = profileModal;

  /* ================= daftar kerja sama ================= */
  A.route('/partnerships', ['desa', 'univ'], (_, me) => {
    const f = A.ui.pfilter || 'all', all = S.pshipsOf(me).sort((a, b) => b.createdAt - a.createdAt);
    const grp = { all: () => true, active: p => ['requested', 'connected'].includes(p.status), matched: p => p.status === 'matched', closed: p => CLOSED.includes(p.status) };
    const list = all.filter(grp[f]);
    const chip = (k, l) => `<button class="chip ${f === k ? 'on' : ''}" data-act="pfilter" data-k="${k}">${l} <span class="n">${all.filter(grp[k]).length}</span></button>`;
    const rows = list.map(ps => {
      const p = S.problem(ps.problemId), o = S.otherParty(ps, me), d = V.deadline(ps), pr = o.profile, wait = ps.groups.filter(g => g.status === 'submitted').length;
      const brief = me.role === 'desa' ? `<div class="mt8 sm" style="border-top:1px dashed var(--border);padding-top:8px"><div class="label">Deskripsi universitas</div><div class="mu" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${A.esc(pr.about || 'Belum ada deskripsi.')}</div><div class="chips mt8">${(pr.fields || []).slice(0, 4).map(x => A.chipTag(x, 'blue')).join('')}<span class="tag gray">${(pr.history || []).length} program pernah diambil</span></div></div>` : '';
      const btns = me.role === 'desa' && ps.status === 'requested' ? `<button class="btn sm" data-act="approveReq" data-id="${ps.id}">${A.ic('check')} Setujui</button><button class="btn sm out" data-act="rejectReq" data-id="${ps.id}">Tolak</button>` : '';
      return `<div class="card tight click" data-act="openPship" data-id="${ps.id}"><div class="row top">${A.photo(p?.id, 't')}<div class="grow"><div class="row wrap"><b style="font-size:15px">${A.esc(p?.title)}</b>${A.tag(ps.completed ? 'done' : ps.status)}${wait && me.role === 'desa' ? `<span class="tag blue">${wait} kesepakatan menunggu Anda</span>` : ''}</div>
        <div class="sm mu mt4">${A.ic('building-community')} ${A.esc(o?.name)} · ${A.ic('map-pin')} ${A.esc(p?.city)} · ${V.slots(ps)}/${ps.quota} kelompok</div>
        <div class="row mt8"><div class="bar thin grow" style="max-width:180px"><i style="width:${V.progress(ps)}%"></i></div>${d ? `<span class="xs mu">${A.ic('clock')} ${A.cd(d.end)}</span>` : `<span class="xs mu">Diajukan ${A.ago(ps.createdAt)}</span>`}</div>${brief}</div>
        <div class="col gap8" style="align-items:flex-end">${btns}${me.role === 'desa' ? `<button class="btn sm out" data-act="viewUniv" data-id="${o.id}">Profil univ</button>` : ''}</div></div></div>`;
    }).join('');
    return V.head('Kerja Sama', me.role === 'desa' ? 'Pengajuan dan kolaborasi dengan universitas' : 'Kerja sama yang Anda ajukan dan kelompok KKN-nya') +
      `<div class="chips mb">${chip('all', 'Semua')}${chip('active', 'Berjalan')}${chip('matched', 'Aktif')}${chip('closed', 'Berakhir')}</div>
      <div class="list mt16">${rows || `<div class="card">${A.empty('heart-handshake', 'Belum ada kerja sama.', me.role === 'univ' ? '<a class="btn sm mt12" href="#/univ/discover">Jelajahi desa</a>' : '')}</div>`}</div>`;
  });
  A.acts.pfilter = d => { A.ui.pfilter = d.k; A.render(); };
  A.acts.openPship = (d, el, e) => { if (e.target.closest('button,a')) return; A.go('/partnerships/' + d.id); };

  /* ================= ruang kerja sama ================= */
  const STAGES = ['Diajukan', 'Disetujui', 'Kesepakatan', 'Aktif'];
  const stageIdx = ps => ps.status === 'matched' ? 3 : ps.status === 'connected' ? (ps.groups.some(g => g.status === 'submitted') ? 2 : 1) : ps.status === 'rejected' ? 1 : 0;
  V.stepper = ps => {
    const cur = stageIdx(ps), bad = CLOSED.includes(ps.status), done = ps.status === 'matched';
    return `<div class="stepper">${STAGES.map((l, i) => `${i ? `<span class="ln ${i <= cur && !bad ? 'ok' : ''}"></span>` : ''}<div class="st ${i < cur || (i === cur && done) ? 'ok' : i === cur ? (bad ? '' : 'on') : ''}"><span class="n">${i < cur || (i === cur && done) ? A.ic('check') : i + 1}</span>${l}</div>`).join('')}</div>`;
  };

  A.route('/partnerships/:id', ['desa', 'univ'], ({ id }, me) => {
    const ps = S.pship(id), p = ps && S.problem(ps.problemId);
    if (!ps || (ps.desaId !== me.id && ps.univId !== me.id)) return V.head('Kerja sama tidak ditemukan') + `<div class="card">${A.empty('mood-empty', 'Kerja sama tidak ditemukan atau bukan milik Anda.', '<a class="btn sm mt12" href="#/partnerships">Kembali</a>')}</div>`;
    const univ = S.user(ps.univId), desa = S.user(ps.desaId), isDesa = me.role === 'desa';
    const tabs = [['info', 'Informasi kedua pihak'], ['kelompok', 'Kesepakatan & kelompok'], ['status', 'Status & riwayat']];
    const tab = A.ui.tab[id] || (OPEN.includes(ps.status) ? 'kelompok' : 'info');
    const banner = ps.status === 'requested' ? (isDesa
      ? `<div class="card warn mt16">${A.ic('inbox')} <b>Pengajuan kerja sama menunggu keputusan Anda.</b> <span class="sm">Setujui atau tolak sekali saja di level universitas. Setelah disetujui, kontak koordinator langsung terbuka dan diskusi teknis dilanjutkan lewat WhatsApp. Jika tidak direspons dalam 7 hari, pengajuan kedaluwarsa.</span><div class="row wrap mt8"><button class="btn" data-act="approveReq" data-id="${ps.id}">${A.ic('check')} Setujui kerja sama</button><button class="btn out" data-act="rejectReq" data-id="${ps.id}">Tolak</button></div></div>`
      : `<div class="card warn mt16">${A.ic('hourglass-empty')} <b>Menunggu persetujuan desa.</b> <span class="sm">Kontak desa terbuka setelah disetujui. Anda bisa mengundang koordinator KKN sekarang agar siap berdiskusi dengan desa.</span><div class="row mt8"><button class="btn sm red" data-act="cancelReq" data-id="${ps.id}">Batalkan pengajuan</button></div></div>`) :
      ps.status === 'connected' ? `<div class="card soft mt16">${A.ic('brand-whatsapp')} <b>Kerja sama disetujui.</b> <span class="sm">Kontak kedua pihak sudah terbuka. Diskusi teknis dilakukan di WhatsApp; setelah sepakat, koordinator mengirim konfirmasi kesepakatan per kelompok dan desa tinggal menekan &quot;Sesuai&quot;.</span><div class="xs mu mt4">Kerja sama yang sudah disetujui tidak dapat dibatalkan sepihak oleh universitas.</div></div>` :
        ps.status === 'rejected' ? `<div class="card mt16" style="background:var(--red-100);border-color:#F0C2BC">${A.ic('circle-x')} <b>Kerja sama ditolak desa.</b> Kebutuhan terbuka kembali.${ps.rejectNote ? `<div class="sm mt4">Catatan desa: ${A.esc(ps.rejectNote)}</div>` : ''}</div>` :
          ps.status === 'expired' ? `<div class="card mt16" style="background:var(--cream-200)">${A.ic('hourglass-empty')} <b>Kedaluwarsa.</b> Desa tidak merespons dalam 7 hari. Kebutuhan terbuka kembali.</div>` :
            ps.status === 'declined' ? `<div class="card mt16" style="background:var(--cream-200)">${A.ic('info-circle')} Kerja sama ini dibatalkan universitas. Kebutuhan terbuka kembali.</div>` : '';
    return `${V.head(A.esc(p.title), `${A.esc(desa.name)} × ${A.esc(univ.name)}`, `${A.tag(ps.completed ? 'done' : ps.status, 'lg')}${V.cdBox(ps)}`, 'Kembali')}
      <div class="card tight">${V.stepper(ps)}</div>${banner}
      <div class="g32 mt16"><div>
        <div class="tabs">${tabs.map(t => `<button class="${tab === t[0] ? 'on' : ''}" data-act="ptab" data-id="${id}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>
        ${tab === 'info' ? V.infoTab(ps, univ, desa) : tab === 'kelompok' ? V.groupsTab(ps, me) : V.statusTab(ps)}
      </div><div class="col">${V.sidePanel(ps, me, p)}</div></div>`;
  });
  A.acts.ptab = d => { A.ui.tab[d.id] = d.t; A.render(); };
  A.acts.cancelReq = d => A.confirm('Batalkan kerja sama?', 'Kebutuhan akan terbuka kembali untuk universitas lain.', () => A.run(() => { S.cancelRequest(d.id); A.toast('Kerja sama dibatalkan.'); A.go('/partnerships'); }), { danger: true, label: 'Batalkan' });
  A.acts.approveReq = (d, el, e) => { if (e) e.stopPropagation(); A.confirm('Setujui kerja sama?', 'Kontak kedua pihak akan terbuka dan universitas dapat mengundang koordinator KKN untuk berdiskusi dengan Anda via WhatsApp.', () => A.run(() => { S.respondRequest(d.id, 'approve'); A.ui.tab[d.id] = 'info'; A.toast('Kerja sama disetujui — kontak kedua pihak terbuka.'); }), { label: 'Setujui' }); };
  A.acts.rejectReq = (d, el, e) => {
    if (e) e.stopPropagation();
    A.modal({ title: 'Tolak kerja sama?', body: `<p class="mu sm">Kebutuhan akan terbuka kembali untuk universitas lain.</p><div class="field mt12"><label>Catatan untuk universitas (opsional)</label><textarea id="rejnote" placeholder="mis. jadwal belum sesuai"></textarea></div>`,
      actions: [{ label: 'Batal' }, { label: 'Tolak', cls: 'red', onClick: () => { try { S.respondRequest(d.id, 'reject', A.$('#rejnote').value.trim()); } catch (er) { A.toast(er.message, 'err'); return false; } A.toast('Kerja sama ditolak.'); A.render(); } }] });
  };

  /* ---------- informasi kedua pihak: kontak terbuka setelah disetujui ---------- */
  V.infoTab = (ps, univ, desa) => {
    const open = OPEN.includes(ps.status);
    return `${open ? `<div class="card soft tight mb">${A.ic('brand-whatsapp')} Diskusikan jadwal, jumlah mahasiswa, dan program utama lewat WhatsApp (tombol di bawah membawa pesan pembuka otomatis). Platform hanya mencatat hasilnya lewat <b>konfirmasi kesepakatan</b>.</div>` : ps.status === 'requested' ? `<div class="card soft tight mb">${A.ic('lock')} Kontak kedua pihak terbuka setelah desa menyetujui kerja sama.</div>` : ''}
    <div class="g2">${V.partyCard(desa, 'Desa', open ? V.waMsg(ps, true) : false)}${V.partyCard(univ, 'Universitas', open ? V.waMsg(ps, false) : false)}</div>`;
  };

  /* ---------- kesepakatan per kelompok ---------- */
  V.groupCard = (ps, g, ctx) => {
    const c = ps.coordinators.find(x => x.id === g.coordinatorId);
    const rev = g.revisions || 0, limit = rev >= A.MAX_REVISIONS, review = ctx === 'desa' && g.status === 'submitted', edit = ctx === 'coord' && ['draft', 'revision'].includes(g.status);
    return `<div class="card"><div class="row sp top wrap"><div><div class="f" style="font-size:18px">${A.esc(g.name)}</div><div class="xs mu">Koordinator: ${A.esc(c ? c.name : '-')}${g.submittedAt ? ` · dikirim ${A.ago(g.submittedAt)}` : ''}</div></div>${A.tag(g.status, 'lg')}</div>
      <div class="g3 mt16"><div><div class="label">Dosen pembimbing</div><b>${A.esc(g.dpl || '-')}</b></div><div><div class="label">Jumlah mahasiswa</div><b>${g.students ? A.esc(g.students) + ' orang' : '-'}</b></div><div><div class="label">Periode</div><b>${g.start ? A.fmtDate(g.start) : '-'} – ${g.end ? A.fmtDate(g.end) : '-'}</b></div></div>
      <div class="label mt16">Program utama</div><p>${A.esc(g.program || '-')}</p>${g.note ? `<div class="label mt16">Catatan koordinator</div><p>${A.esc(g.note)}</p>` : ''}
      ${rev ? `<div class="xs mu mt12">${A.ic('refresh')} Revisi ${rev} dari ${A.MAX_REVISIONS}</div>` : ''}
      ${g.status === 'revision' && g.reviewNote ? `<div class="card warn tight mt12"><div class="label">Catatan revisi dari desa</div>${A.esc(g.reviewNote)}</div>` : ''}
      ${g.status === 'closed' && g.reviewNote ? `<div class="card tight mt12" style="background:var(--cream-200)"><div class="label">Alasan desa menutup kelompok</div>${A.esc(g.reviewNote)}</div>` : ''}
      ${review && !limit ? `<div class="divider"></div><div class="field"><label>Catatan (wajib jika meminta revisi)</label><textarea id="gnote-${g.id}" data-draft="gnote-${g.id}" placeholder="Bagian mana yang belum sesuai? Detailnya bisa dibahas via WhatsApp."></textarea></div><div class="row wrap"><button class="btn" data-act="reviewGroup" data-id="${ps.id}" data-g="${g.id}" data-d="confirm">${A.ic('check')} Sesuai</button><button class="btn out" data-act="reviewGroup" data-id="${ps.id}" data-g="${g.id}" data-d="revision">Perlu revisi (${rev + 1}/${A.MAX_REVISIONS})</button></div>` : ''}
      ${review && limit ? `<div class="divider"></div><div class="card warn tight">${A.ic('brand-whatsapp')} <b>Batas revisi (${A.MAX_REVISIONS}x) tercapai.</b> <span class="sm">Diskusikan langsung dengan koordinator lewat WhatsApp, lalu pilih <b>Sesuai</b> atau tutup kelompok ini dengan alasan.</span>${c ? `<div class="mt8">${V.waBtn(c.phone, V.waMsg(ps, false))}</div>` : ''}</div><div class="field mt12"><label>Alasan (wajib jika menutup kelompok)</label><textarea id="gnote-${g.id}" data-draft="gnote-${g.id}" placeholder="mis. jadwal dan formasi tidak bisa disepakati"></textarea></div><div class="row wrap"><button class="btn" data-act="reviewGroup" data-id="${ps.id}" data-g="${g.id}" data-d="confirm">${A.ic('check')} Sesuai</button><button class="btn red" data-act="reviewGroup" data-id="${ps.id}" data-g="${g.id}" data-d="close">Tutup kelompok</button></div>` : ''}
      ${edit ? `<div class="row wrap mt16"><button class="btn out" data-act="groupForm" data-id="${ps.id}" data-cid="${g.coordinatorId}" data-gid="${g.id}">${A.ic('edit')} Ubah</button><button class="btn" data-act="sendGroup" data-id="${ps.id}" data-g="${g.id}">Kirim ke desa ${A.ic('send')}</button>${g.status === 'draft' ? `<button class="btn red" data-act="delGroup" data-id="${ps.id}" data-g="${g.id}">${A.ic('trash')}</button>` : ''}</div>` : ''}</div>`;
  };
  V.groupsTab = (ps, me) => {
    if (!OPEN.includes(ps.status)) return `<div class="card">${A.empty('file-check', ps.status === 'requested' ? 'Konfirmasi kesepakatan tersedia setelah desa menyetujui kerja sama.' : 'Tidak ada kesepakatan.')}</div>`;
    const isDesa = me.role === 'desa', gs = ps.groups;
    return `<div class="card soft tight mb">${A.ic('users')} <b>${V.slots(ps)} dari ${ps.quota} kelompok</b> <span class="sm mu">· ${isDesa ? 'Koordinator mengirim konfirmasi kesepakatan tiap kelompok setelah berdiskusi dengan Anda via WhatsApp. Tinggal tekan &quot;Sesuai&quot; atau minta revisi.' : 'Koordinator mengisi konfirmasi kesepakatan lewat tautan undangan (lihat panel Koordinator KKN).'}</span></div>
      <div class="col">${gs.map(g => V.groupCard(ps, g, isDesa ? 'desa' : 'univ')).join('') || `<div class="card">${A.empty('file-check', isDesa ? 'Belum ada konfirmasi kesepakatan dari koordinator.' : 'Belum ada kelompok. Undang koordinator agar dapat mengisi konfirmasi kesepakatan.')}</div>`}</div>`;
  };
  A.acts.reviewGroup = d => {
    const note = (A.$('#gnote-' + d.g) || {}).value || '', ok = d.d === 'confirm', close = d.d === 'close';
    if (!ok && !note.trim()) return A.toast(close ? 'Isi alasan menutup kelompok terlebih dulu.' : 'Isi catatan revisi untuk koordinator terlebih dulu.', 'err');
    const txt = ok ? ['Konfirmasi kesepakatan sesuai?', 'Kelompok ini tercatat sesuai kesepakatan.', 'Sesuai', 'Kesepakatan dikonfirmasi.'] : close ? ['Tutup kelompok ini?', 'Kelompok ditutup dan kuotanya dilepas. Koordinator menerima alasan Anda. Keputusan ini tidak bisa dibatalkan.', 'Tutup kelompok', 'Kelompok ditutup.'] : ['Minta revisi?', 'Koordinator akan diberi tahu untuk memperbarui kesepakatan.', 'Minta revisi', 'Permintaan revisi dikirim.'];
    A.confirm(txt[0], txt[1], () => A.run(() => { S.reviewGroup(d.id, d.g, d.d, note.trim()); A.ui.draft['gnote-' + d.g] = ''; A.toast(txt[3]); }), { danger: close, label: txt[2] });
  };

  /* ---------- koordinator KKN (undangan via tautan, tanpa akun) ---------- */
  V.coordLink = c => location.href.split('#')[0] + '#/koordinator/' + c.token;
  V.coordCard = (ps, me) => {
    const isUniv = me.role === 'univ', open = OPEN.includes(ps.status);
    const rows = ps.coordinators.map(c => {
      const n = ps.groups.filter(g => g.coordinatorId === c.id).length;
      return `<div class="item" style="padding:10px 12px;align-items:flex-start">${A.avatar(c.name, 'av-d')}<div class="grow"><div class="b sm">${A.esc(c.name)}</div><div class="xs mu">${n} kelompok${isUniv || open ? ` · ${A.esc(c.phone)}` : ''}</div>
        <div class="row wrap mt8">${isUniv ? `<button class="btn sm out" data-act="copyLink" data-id="${ps.id}" data-cid="${c.id}">${A.ic('link')} Salin tautan</button><a class="btn sm out" href="#/koordinator/${c.token}">${A.ic('external-link')} Buka</a>${n ? '' : `<button class="btn sm red" data-act="delCoord" data-id="${ps.id}" data-cid="${c.id}">${A.ic('trash')}</button>`}` : open ? V.waBtn(c.phone, V.waMsg(ps, false)) : ''}</div></div></div>`;
    }).join('');
    const hidden = !isUniv && !open && ps.coordinators.length;
    return `<div class="card"><div class="row sp"><h3 class="nb">Koordinator KKN</h3><span class="tag gray">${V.slots(ps)}/${ps.quota} kelompok</span></div>
      <div class="col gap8 mt12">${hidden ? `<span class="mu sm">${A.ic('lock')} ${ps.coordinators.length} koordinator ditunjuk. Kontak terbuka setelah Anda menyetujui.</span>` : rows || `<span class="mu sm">Belum ada koordinator.${isUniv ? ' Undang koordinator agar bisa berdiskusi dengan desa dan mengisi kesepakatan tiap kelompok.' : ''}</span>`}</div>
      ${isUniv && LIVE.includes(ps.status) ? `<button class="btn sm block mt12" data-act="inviteCoord" data-id="${ps.id}">${A.ic('user-plus')} Undang koordinator KKN</button><div class="xs mu mt8">Koordinator menerima tautan pribadi, tanpa perlu membuat akun. Satu kerja sama bisa punya beberapa koordinator (per fakultas atau klaster).</div>` : ''}</div>`;
  };
  A.acts.inviteCoord = d => A.modal({ title: 'Undang koordinator KKN', body: `<p class="mu sm">Koordinator akan mendapat tautan pribadi untuk berdiskusi dengan desa dan mengisi konfirmasi kesepakatan per kelompok.</p>
    <div class="field mt12"><label>Nama koordinator *</label><input type="text" id="ic-name" placeholder="mis. Bu Dewi Lestari"></div>
    <div class="g2"><div class="field"><label>Nomor WhatsApp *</label><input type="text" id="ic-phone" placeholder="08xx-xxxx-xxxx"></div><div class="field"><label>Email</label><input type="email" id="ic-email" placeholder="opsional"></div></div>`,
    actions: [{ label: 'Batal' }, { label: 'Buat undangan', cls: '', onClick: () => { try { S.inviteCoordinator(d.id, { name: A.$('#ic-name').value, phone: A.$('#ic-phone').value, email: A.$('#ic-email').value }); } catch (e) { A.toast(e.message, 'err'); return false; } A.toast('Undangan dibuat. Salin tautannya untuk dikirim ke koordinator (demo: email tidak benar-benar terkirim).'); A.render(); } }] });
  A.acts.delCoord = d => A.confirm('Hapus koordinator?', 'Tautan undangannya tidak berlaku lagi.', () => A.run(() => { S.removeCoordinator(d.id, d.cid); A.toast('Koordinator dihapus.'); }), { danger: true, label: 'Hapus' });
  A.acts.copyLink = d => {
    const c = S.pship(d.id).coordinators.find(x => x.id === d.cid), link = V.coordLink(c);
    const ok = () => A.toast('Tautan koordinator disalin.');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(ok, () => A.modal({ title: 'Tautan koordinator', body: `<input type="text" readonly value="${A.esc(link)}" onclick="this.select()">`, actions: [{ label: 'Tutup' }] }));
    else A.modal({ title: 'Tautan koordinator', body: `<input type="text" readonly value="${A.esc(link)}" onclick="this.select()">`, actions: [{ label: 'Tutup' }] });
  };

  /* form kelompok (dipakai halaman koordinator) */
  A.acts.groupForm = d => {
    const ps = S.pship(d.id), g = d.gid ? ps.groups.find(x => x.id === d.gid) : { name: `Kelompok ${ps.groups.length + 1}`, dpl: '', students: '', start: '', end: '', program: '', note: '' };
    A.modal({ wide: true, title: d.gid ? 'Ubah kesepakatan' : 'Kelompok baru', body: `<p class="mu sm">Isi ringkasan hasil diskusi dengan desa. Tidak perlu menulis ulang isi percakapan.</p>
      <div class="g2 mt12"><div class="field"><label>Nama kelompok *</label><input type="text" id="gf-name" value="${A.esc(g.name)}"></div><div class="field"><label>Dosen pembimbing (DPL) *</label><input type="text" id="gf-dpl" value="${A.esc(g.dpl)}"></div></div>
      <div class="g3"><div class="field"><label>Jumlah mahasiswa *</label><input type="number" id="gf-students" min="1" max="200" value="${A.esc(g.students)}"></div><div class="field"><label>Mulai *</label><input type="date" id="gf-start" value="${g.start || ''}"></div><div class="field"><label>Selesai *</label><input type="date" id="gf-end" value="${g.end || ''}"></div></div>
      <div class="field"><label>Program utama *</label><input type="text" id="gf-program" value="${A.esc(g.program)}" placeholder="mis. toko online 10 UMKM dan pelatihan pemasaran digital"></div>
      <div class="field"><label>Catatan (opsional)</label><textarea id="gf-note" placeholder="mis. akomodasi di balai desa, pelatihan hari Sabtu">${A.esc(g.note)}</textarea></div>`,
      actions: [{ label: 'Batal' }, { label: 'Simpan draft', cls: '', onClick: () => {
        const v = k => A.$('#gf-' + k).value.trim();
        try { S.saveGroup(d.id, d.cid, { name: v('name'), dpl: v('dpl'), students: v('students'), start: v('start'), end: v('end'), program: v('program'), note: v('note') }, d.gid); } catch (e) { A.toast(e.message, 'err'); return false; }
        A.toast('Draft kesepakatan disimpan.'); A.render();
      } }] });
  };
  A.acts.sendGroup = d => { try { S.validateGroup(d.id, d.g); } catch (e) { return A.toast(e.message, 'err'); } A.confirm('Kirim kesepakatan ke desa?', 'Setelah dikirim, kesepakatan tidak bisa diubah kecuali desa meminta revisi.', () => A.run(() => { S.submitGroup(d.id, d.g); A.toast('Konfirmasi kesepakatan terkirim ke desa.'); }), { label: 'Kirim' }); };
  A.acts.delGroup = d => A.confirm('Hapus draft kelompok?', 'Draft ini akan dihapus.', () => A.run(() => { S.deleteGroup(d.id, d.g); A.toast('Draft dihapus.'); }), { danger: true, label: 'Hapus' });

  /* halaman koordinator: diakses lewat tautan undangan, tanpa login */
  A.route('/koordinator/:token', null, ({ token }, me) => {
    const wrap = c => `<div style="max-width:920px;margin:0 auto;padding:28px 16px 80px">${c}</div>`;
    const f = S.coordinatorByToken(token);
    if (!f) return wrap(`<div class="card">${A.empty('link-off', 'Tautan koordinator tidak valid atau sudah dihapus.', '<a class="btn sm mt12" href="#/">Ke beranda</a>')}</div>`);
    const { ps, c } = f, p = S.problem(ps.problemId), desa = S.user(ps.desaId), univ = S.user(ps.univId), open = OPEN.includes(ps.status);
    const mine = ps.groups.filter(g => g.coordinatorId === c.id), room = me && (me.id === ps.univId || me.id === ps.desaId);
    const state = ps.status === 'requested' ? `<div class="card warn mb">${A.ic('hourglass-empty')} <b>Menunggu desa menyetujui kerja sama.</b> <span class="sm">Setelah disetujui, kontak desa dan formulir kesepakatan terbuka di halaman ini.</span></div>` : CLOSED.includes(ps.status) ? `<div class="card mb" style="background:var(--cream-200)">${A.ic('info-circle')} Kerja sama ini sudah berakhir (${A.tag(ps.status).replace(/<[^>]+>/g, '')}).</div>` : '';
    const body = open ? `<div class="card soft tight mb">${A.ic('brand-whatsapp')} Diskusikan jadwal dan program dengan desa lewat WhatsApp, lalu catat hasilnya sebagai <b>konfirmasi kesepakatan</b> di bawah.</div>
      <div class="g2"><div class="card"><h3>Kontak desa</h3><div class="b">${A.esc(desa.name)}</div><div class="xs mu mb">${A.ic('map-pin')} ${A.esc(desa.profile.city)}</div>${V.contact(desa, V.waMsg(ps, true))}</div>
        <div class="card"><h3>Kerja sama</h3><div class="kv"><span>Kebutuhan</span><b>${A.esc(p.title)}</b></div><div class="kv"><span>Universitas</span><b>${A.esc(univ.name)}</b></div><div class="kv"><span>Kuota</span><b>${V.slots(ps)} / ${ps.quota} kelompok</b></div><div class="kv"><span>Status</span>${A.tag(ps.status)}</div></div></div>
      <div class="row sp wrap mt24 mb"><div class="f" style="font-size:18px">Kelompok Anda</div>${V.slots(ps) < ps.quota ? `<button class="btn" data-act="groupForm" data-id="${ps.id}" data-cid="${c.id}">${A.ic('plus')} Tambah kelompok</button>` : '<span class="tag gray">Kuota penuh</span>'}</div>
      <div class="col">${mine.map(g => V.groupCard(ps, g, 'coord')).join('') || `<div class="card">${A.empty('users', 'Belum ada kelompok. Tambahkan kelompok setelah sepakat dengan desa.')}</div>`}</div>` : '';
    return wrap(`<div class="row sp wrap mb"><a href="#/" class="f" style="font-size:18px;color:var(--forest-900);display:flex;align-items:center;gap:6px">${A.ic('leaf')}SumbangRuang</a>${room ? `<a class="btn sm out" href="#/partnerships/${ps.id}">${A.ic('arrow-left')} Kembali ke aplikasi</a>` : ''}</div>
      <h1 class="title">Halo, ${A.esc(c.name)}</h1><div class="subtitle mb">Koordinator KKN ${A.esc(univ.name)} · ${A.esc(p.title)}</div>${state}${body}`);
  }, 'public');

  /* ---------- status & riwayat ---------- */
  V.timeline = ps => `<div class="tl">${ps.log.slice().sort((a, b) => a.ts - b.ts).map((e, i, arr) => `<div class="e"><div class="d ${i === arr.length - 1 ? 'now' : ''}">${A.ic(i === arr.length - 1 ? 'point' : 'check')}</div><div><div class="b">${A.esc(e.text)}</div><div class="xs mu">${A.fmtDT(e.ts)}</div></div></div>`).join('')}</div>`;
  V.statusTab = ps => `<div class="card"><h3>Riwayat proses</h3>${V.timeline(ps)}</div>`;

  /* ---------- panel samping ---------- */
  V.sidePanel = (ps, me, p) => {
    const live = OPEN.includes(ps.status);
    const docs = live ? `<div class="card"><h3>Dokumen</h3><div class="col gap8">${ps.docs.map(dc => `<div class="item" style="padding:8px 12px"><span class="ib s c-green">${A.ic(dc.kind === 'photo' ? 'photo' : 'file-text')}</span><div class="grow"><div class="b sm">${A.esc(dc.name)}</div><div class="xs mu">${A.esc(S.user(dc.by)?.name)} · ${A.fmtDate(dc.ts)}</div></div></div>`).join('') || '<span class="mu sm">Belum ada dokumen.</span>'}</div>
      <form class="mt12" data-submit="addDoc" data-id="${ps.id}"><div class="field" style="margin-bottom:8px"><input type="file" name="file"></div>${ps.status === 'matched' ? `<div class="field" style="margin-bottom:8px"><select name="kind"><option value="pdf">Dokumen lain</option><option value="report">Laporan akhir</option><option value="photo">Dokumentasi foto</option></select></div>` : ''}<button class="btn sm out block">${A.ic('upload')} Tambah dokumen</button></form></div>` : '';
    const done = ps.status === 'matched' ? `<div class="card soft"><h3>Pelaksanaan KKN</h3><p class="sm mu">${ps.completed ? 'KKN sudah ditandai selesai dan masuk arsip riwayat desa.' : 'Setelah kegiatan selesai, unggah <b>Laporan akhir</b> lalu tandai selesai.'}</p>${ps.completed ? `<div class="mt8">${A.tag('done', 'lg')}</div>` : `<button class="btn sm mt12" data-act="complete" data-id="${ps.id}">${A.ic('flag-check')} Tandai KKN selesai</button>`}</div>` : '';
    const pl = ps.plan || {}, msg = `<div class="card"><h3>Rencana pengajuan</h3>${ps.message ? `<p class="sm">${A.esc(ps.message)}</p>` : ''}<div class="kv mt8"><span>Kuota</span><b>${ps.quota} kelompok</b></div>${pl.period ? `<div class="kv"><span>Perkiraan periode</span><b>${A.esc(pl.period)}</b></div>` : ''}${pl.students ? `<div class="kv"><span>Perkiraan mahasiswa</span><b>${A.esc(pl.students)} orang (total)</b></div>` : ''}${(S.user(ps.univId).profile.fields || []).length ? `<div class="label mt12">Bidang keahlian univ</div><div class="chips">${S.user(ps.univId).profile.fields.map(x => A.chipTag(x, 'blue')).join('')}</div>` : ''}</div>`;
    const link = me.role === 'univ' ? `<a class="btn out block" href="#/univ/problem/${p.id}">Lihat detail kebutuhan</a>` : `<a class="btn out block" href="#/desa/problem/${p.id}">Lihat detail kebutuhan</a>`;
    return `${msg}${V.coordCard(ps, me)}${docs}${done}${link}`;
  };
  A.acts.addDoc = (f, form, d) => { const me = S.me(); A.run(() => { S.addDoc(d.id, me.id, f.file && f.file.name, f.kind || 'pdf'); A.toast('Dokumen ditambahkan.'); }); };
  A.acts.complete = d => A.run(() => { S.completePship(d.id); A.toast('KKN ditandai selesai.'); });

  /* ================= status page ================= */
  A.route('/status', ['desa', 'univ'], (_, me) => {
    const all = S.pshipsOf(me).sort((a, b) => b.createdAt - a.createdAt);
    if (!all.length) return V.head('Status kerja sama', 'Pantau posisi proses Anda') + `<div class="card">${A.empty('timeline-event', 'Belum ada kerja sama.', me.role === 'univ' ? '<a class="btn sm mt12" href="#/univ/discover">Jelajahi desa</a>' : '')}</div>`;
    const sel = S.pship(A.ui.statusSel) && all.includes(S.pship(A.ui.statusSel)) ? S.pship(A.ui.statusSel) : all.find(p => LIVE.includes(p.status)) || all[0];
    const p = S.problem(sel.problemId), o = S.otherParty(sel, me);
    const idx = { requested: 1, declined: 1, rejected: 1, expired: 1, connected: 2, matched: 3 }[sel.status];
    const bad = CLOSED.includes(sel.status);
    const nodes = [['Available', 'circle-dot', p.createdAt], ['Diajukan', 'send', sel.createdAt], ['Disetujui', 'lock-open', sel.approvedAt], ['Aktif', 'circle-check', sel.activeAt]];
    const fill = Math.max(0, Math.min(3, sel.status === 'matched' ? 3 : idx)) / 3 * 75;
    return `${V.head('Status kerja sama', 'Perjalanan kolaborasi dari pengajuan hingga dampak nyata')}
      <div class="row wrap mb"><span class="sm mu">Pilih kerja sama:</span><select data-change="statusSel" style="max-width:380px">${all.map(x => `<option value="${x.id}" ${x.id === sel.id ? 'selected' : ''}>${A.esc(S.problem(x.problemId)?.title)} — ${A.esc(S.otherParty(x, me)?.name)}</option>`).join('')}</select></div>
      <div class="dark"><div class="row sp wrap"><div><div class="f" style="font-size:24px">${A.esc(p.title)}</div><div class="sm" style="color:#B8C8BD">${A.esc(S.user(p.desaId).name)} · ${A.esc(S.user(sel.univId).name)} · ${sel.groups.filter(g => g.status === 'confirmed').length}/${sel.quota} kelompok sesuai</div></div>${A.tag(sel.completed ? 'done' : sel.status, 'lg')}</div>
        <div class="dtl"><div class="fill" style="width:${fill}%"></div>${nodes.map((n, i) => { const ok = i < idx || sel.status === 'matched', now = (i === idx && !bad && sel.status !== 'matched') || (sel.status === 'matched' && i === 3); return `<div class="nd ${ok || now ? 'ok' : ''} ${now ? 'now' : ''}"><div class="c">${A.ic(n[1])}</div><b>${n[0]}</b><small>${n[2] ? A.fmtDate(n[2]) : '—'}</small></div>`; }).join('')}</div>
        <div class="branch"><div class="${sel.status === 'rejected' ? 'on' : ''}"><div class="row b">${A.ic('circle-x')} Ditolak</div><div class="sm" style="color:#B8C8BD">Desa menolak pengajuan. Kebutuhan terbuka kembali.</div></div><div class="${sel.status === 'expired' ? 'on' : ''}"><div class="row b">${A.ic('hourglass-empty')} Kedaluwarsa</div><div class="sm" style="color:#B8C8BD">Desa tidak merespons dalam 7 hari. Kebutuhan terbuka kembali.</div></div></div>
        ${V.deadline(sel) ? `<div class="row mt16">${A.ic('clock')} <span>${V.deadline(sel).label}: <b>${A.cd(V.deadline(sel).end)}</b></span></div>` : ''}
        <div class="mt16"><a class="btn lime" href="#/partnerships/${sel.id}">Buka kerja sama ${A.ic('arrow-right')}</a></div></div>
      <div class="g2 mt16"><div class="card"><h3>Semua status</h3><div class="list">${all.map(x => `<div class="item click" data-act="statusPick" data-id="${x.id}"><div class="grow"><div class="b">${A.esc(S.problem(x.problemId)?.title)}</div><div class="xs mu">${A.esc(S.otherParty(x, me)?.name)}</div></div>${A.tag(x.completed ? 'done' : x.status)}</div>`).join('')}</div></div>
        <div class="card"><h3>Riwayat: ${A.esc(o.name)}</h3>${V.timeline(sel)}</div></div>`;
  });
  A.acts.statusSel = v => { A.ui.statusSel = v; A.render(); };
  A.acts.statusPick = d => { A.ui.statusSel = d.id; A.render(); window.scrollTo(0, 0); };

  /* ================= notifikasi ================= */
  const GROUPS = { partnership: ['partnership'], agreement: ['agreement'], deadline: ['deadline', 'expire'], status: ['status', 'reject', 'system'] };
  A.route('/notifications', ['desa', 'univ', 'admin'], (_, me) => {
    const f = A.ui.nfilter || 'all', all = S.notifsOf(me.id), list = f === 'all' || !GROUPS[f] ? all : all.filter(n => GROUPS[f].includes(n.type));
    const chip = (k, l) => `<button class="chip ${f === k ? 'on' : ''}" data-act="nfilter" data-k="${k}">${l}</button>`;
    const item = n => { const [ic, cl] = A.NOTIF[n.type] || A.NOTIF.system; return `<div class="item click" data-act="openNotif" data-id="${n.id}" style="background:${n.read ? 'var(--cream-50)' : '#fff'};${n.read ? '' : 'border-color:var(--border)'}"><div class="ib ci ${cl}">${A.ic(ic)}</div><div class="grow"><div class="${n.read ? '' : 'b'}">${A.esc(n.text)}</div><div class="xs mu">${A.ago(n.ts)}</div></div>${n.read ? '' : '<span style="width:9px;height:9px;border-radius:50%;background:var(--green-500)"></span>'}</div>`; };
    const today = list.filter(n => A.now() - n.ts < A.DAY), before = list.filter(n => A.now() - n.ts >= A.DAY);
    return V.head('Notifikasi', 'Pemberitahuan kerja sama, kesepakatan, pengingat, dan perubahan status', `<button class="btn out sm" data-act="readAll">Tandai semua dibaca</button>`) +
      `<div class="chips">${chip('all', 'Semua')}${chip('partnership', 'Kerja sama')}${chip('agreement', 'Kesepakatan')}${chip('deadline', 'Pengingat')}${chip('status', 'Status')}</div>
      ${list.length ? `${today.length ? `<div class="label mt24">Hari ini</div><div class="list">${today.map(item).join('')}</div>` : ''}${before.length ? `<div class="label mt24">Sebelumnya</div><div class="list">${before.map(item).join('')}</div>` : ''}` : `<div class="card mt16">${A.empty('bell-off', 'Tidak ada notifikasi.')}</div>`}`;
  });
  A.acts.nfilter = d => { A.ui.nfilter = d.k; A.render(); };
  A.acts.readAll = () => { S.data.notifs.filter(n => n.userId === S.me().id).forEach(n => n.read = true); S.save(); A.render(); };
  A.acts.openNotif = d => { const n = S.data.notifs.find(x => x.id === d.id); n.read = true; S.save(); if (n.link) A.go(n.link.replace(/^#/, '')); else A.render(); };
})(window.App);
