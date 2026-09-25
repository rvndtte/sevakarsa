/* Halaman peran Universitas: dashboard, discovery, detail kebutuhan, profil */
(function (A) {
  const S = A.Store, V = A.V;

  /* ================= dashboard ================= */
  A.route('/univ', ['univ'], (_, me) => {
    const ps = S.pshipsOf(me), running = ps.filter(x => ['requested', 'connected'].includes(x.status)).sort((a, b) => b.createdAt - a.createdAt);
    const avail = S.data.problems.filter(p => p.status === 'available').sort((a, b) => b.createdAt - a.createdAt);
    const notifs = S.notifsOf(me.id).slice(0, 4), pr = me.profile;
    const complete = Math.min(100, (pr.about ? 25 : 0) + (pr.fields.length ? 20 : 0) + (pr.programs.length ? 15 : 0) + (pr.history.length ? 25 : 0) + (pr.contactName && pr.phone ? 15 : 0));
    return V.head(`Halo, ${A.esc(pr.contactName || me.name)}`, `Ringkasan aktivitas KKN ${A.esc(me.name)}`, `<a class="btn" href="#/univ/discover">${A.ic('compass')} Jelajahi desa</a>`) +
      `<div class="g4">${V.stat('heart-handshake', 'c-amber', ps.filter(x => ['requested', 'connected'].includes(x.status)).length, 'Kerja sama berjalan')}${V.stat('file-check', 'c-blue', V.pendingGroups(ps), 'Menunggu konfirmasi desa')}${V.stat('circle-check', 'c-purple', ps.filter(x => x.status === 'matched').length, 'Aktif')}${V.stat('compass', 'c-green', avail.length, 'Kebutuhan tersedia')}</div>
      <div class="g32 mt16"><div class="col">
        <div class="card"><div class="row sp"><h3 class="nb">Kebutuhan desa terbaru</h3><a class="xs b" style="color:var(--green-500)" href="#/univ/discover">Lihat semua</a></div><div class="list mt12">${avail.slice(0, 3).map(p => `<a class="item click" href="#/univ/problem/${p.id}">${A.photo(p.id, 't')}<div class="grow"><div class="b">${A.esc(p.title)}</div><div class="xs mu">${A.esc(S.user(p.desaId).name)} · ${A.esc(p.city)}</div><div class="chips mt8">${A.chipTag(p.category, 'blue')}</div></div>${A.ic('chevron-right', 'mu')}</a>`).join('') || A.empty('compass', 'Belum ada kebutuhan tersedia.')}</div></div>
        <div class="card"><h3>Kerja sama & kesepakatan</h3>${running.length ? `<div class="list">${running.map(r => { const d = V.deadline(r); return `<a class="item click" href="#/partnerships/${r.id}"><div class="grow"><div class="b">${A.esc(V.problemTitle(r))}</div><div class="xs mu">${A.esc(S.user(r.desaId).name)}</div><div class="bar thin mt8"><i style="width:${V.progress(r)}%"></i></div></div><div class="center">${A.tag(r.status)}<div class="xs mu mt4">${d ? `${A.ic('clock')} ${A.cd(d.end)}` : `${V.slots(r)}/${r.quota} kelompok`}</div></div></a>`; }).join('')}</div>` : A.empty('heart-handshake', 'Belum ada kerja sama berjalan.')}</div>
      </div><div class="col">
        <div class="card"><div class="row sp"><h3 class="nb">Notifikasi & aktivitas</h3><a class="xs b" style="color:var(--green-500)" href="#/notifications">Semua</a></div><div class="list mt12">${notifs.map(n => { const [ic, cl] = A.NOTIF[n.type] || A.NOTIF.system; return `<div class="row top"><div class="ib s ci ${cl}">${A.ic(ic)}</div><div><div class="sm ${n.read ? '' : 'b'}">${A.esc(n.text)}</div><div class="xs mu">${A.ago(n.ts)}</div></div></div>`; }).join('') || '<span class="mu sm">Tidak ada notifikasi.</span>'}</div></div>
        <div class="card soft"><h3>Kelengkapan profil</h3><p class="sm mu">Profil yang lengkap membantu desa mengenal institusi Anda.</p><div class="bar mt8"><i style="width:${complete}%"></i></div><div class="xs mu mt4">${complete}% lengkap</div><a class="btn sm out mt12" href="#/univ/profile">Lengkapi profil</a></div>
      </div></div>`;
  });

  /* ================= discovery ================= */
  const VISIBLE = ['available', 'requested', 'connected'];
  const list = me => {
    const f = A.ui.filters, q = f.q.toLowerCase();
    const rows = S.data.problems.filter(p => VISIBLE.includes(p.status) || (f.all && ['matched', 'expired'].includes(p.status)))
      .filter(p => !q || (p.title + ' ' + p.desc + ' ' + S.user(p.desaId).name + ' ' + p.category).toLowerCase().includes(q))
      .filter(p => !f.cat || p.category === f.cat).filter(p => !f.city || p.city === f.city);
    const rank = p => S.isLocked(p) && !S.activePship(p.id, me.id) ? 1 : 0;   // yang terkunci di bawah
    return rows.sort((a, b) => rank(a) - rank(b) || (f.sort === 'deadline' ? a.deadline - b.deadline : b.createdAt - a.createdAt));
  };
  const results = me => {
    const rows = list(me);
    const html = rows.map(p => {
      const mine = S.activePship(p.id, me.id), locked = S.isLocked(p) && !mine, saved = (me.saved || []).includes(p.id);
      const lockLabel = p.status === 'requested' ? 'Sedang diajukan universitas lain' : 'Sedang berjalan bersama universitas lain';
      return `<div class="card tight ${locked ? 'locked' : 'click'}" data-act="openUP" data-id="${p.id}" style="cursor:pointer"><div class="row">${A.photo(p.id, 't')}<div class="grow"><div class="row wrap"><b style="font-size:16px">${A.esc(p.title)}</b>${mine ? A.tag(mine.status) : ''}${!mine && p.status !== 'available' && !locked ? A.tag(p.status) : ''}</div>
        <div class="sm mu mt4">${A.ic('building-community')} ${A.esc(S.user(p.desaId).name)} · ${A.ic('map-pin')} ${A.esc(p.city)}</div>
        <div class="chips mt8">${A.chipTag(p.category, 'blue')}${p.skills.slice(0, 3).map(s => A.chipTag(s, 'gray')).join('')}</div>
        ${locked ? `<div class="lockbadge mt8">${A.ic('lock')} ${lockLabel}</div>` : ''}</div>
        ${locked ? '' : `<button class="iconbtn" data-act="toggleSave" data-id="${p.id}" title="Simpan" style="${saved ? 'color:var(--amber-500)' : ''}">${A.ic(saved ? 'bookmark-filled' : 'bookmark')}</button>`}</div></div>`;
    }).join('');
    return { html: html || `<div class="card">${A.empty('search-off', 'Tidak ada kebutuhan yang cocok dengan filter.')}</div>`, n: rows.length };
  };
  const refresh = () => { const me = S.me(), r = results(me), el = A.$('#results'), c = A.$('#rcount'); if (el) el.innerHTML = r.html; if (c) c.textContent = r.n + ' kebutuhan ditemukan'; };

  A.route('/univ/discover', ['univ'], (_, me) => {
    const f = A.ui.filters, r = results(me), cities = [...new Set(S.data.problems.map(p => p.city))];
    const chipSort = (k, l) => `<button class="chip ${f.sort === k ? 'on' : ''}" data-act="fSort" data-k="${k}">${l}</button>`;
    return V.head('Jelajahi Desa', 'Temukan kebutuhan desa yang bisa dibantu tim Anda') +
      `<div class="searchbox">${A.ic('search', 'mu')}<input type="text" value="${A.esc(f.q)}" placeholder="Cari nama desa, kategori, atau kata kunci..." data-input="fQ"></div>
      <div class="row wrap mt12"><select data-change="fSel" data-k="cat" style="width:auto"><option value="">Semua kategori</option>${A.CATEGORIES.map(c => `<option ${f.cat === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
        <select data-change="fSel" data-k="city" style="width:auto"><option value="">Semua lokasi</option>${cities.map(c => `<option ${f.city === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
        
        <label class="check"><input type="checkbox" ${f.all ? 'checked' : ''} data-change="fAll">Tampilkan juga yang selesai/kedaluwarsa</label>
        ${f.q || f.cat || f.city || f.dur ? `<button class="btn ghost sm" data-act="fClear">${A.ic('x')} Reset filter</button>` : ''}</div>
      <div class="card soft tight mt12 sm">${A.ic('info-circle')} Kebutuhan berwarna <b>abu-abu</b> sedang diajukan atau berjalan bersama universitas lain. Kebutuhan itu terbuka kembali jika kerja samanya ditolak, dibatalkan, atau kedaluwarsa.</div>
      <div class="row sp wrap mt24 mb"><div class="f" style="font-size:18px" id="rcount">${r.n} kebutuhan ditemukan</div><div class="row">${chipSort('new', 'Terbaru')}${chipSort('deadline', 'Deadline')}</div></div>
      <div class="list" id="results">${r.html}</div>`;
  });
  A.acts.fQ = v => { A.ui.filters.q = v; refresh(); };
  A.acts.fSel = (v, el, d) => { A.ui.filters[d.k] = v; A.render(); };
  A.acts.fAll = v => { A.ui.filters.all = v; A.render(); };
  A.acts.fSort = d => { A.ui.filters.sort = d.k; A.render(); };
  A.acts.fClear = () => { Object.assign(A.ui.filters, { q: '', cat: '', city: '', dur: '' }); A.render(); };
  A.acts.openUP = (d, el, e) => { if (e.target.closest('button')) return; A.go('/univ/problem/' + d.id); };
  A.acts.toggleSave = (d, el, e) => { e.stopPropagation(); const on = S.toggleSave(S.me().id, d.id); A.toast(on ? 'Disimpan ke daftar Anda.' : 'Dihapus dari simpanan.'); A.render(); };

  /* ================= detail kebutuhan (univ) ================= */
  A.route('/univ/problem/:id', ['univ'], ({ id }, me) => {
    const p = S.problem(id);
    if (!p || p.status === 'draft') return V.head('Tidak ditemukan') + `<div class="card">${A.empty('mood-empty', 'Kebutuhan tidak ditemukan.', '<a class="btn sm mt12" href="#/univ/discover">Kembali</a>')}</div>`;
    const mine = S.activePship(id, me.id), last = S.lastPship(id, me.id), saved = (me.saved || []).includes(id), desa = S.user(p.desaId), locked = S.isLocked(p) && !mine;
    let cta;
    if (mine) cta = `<a class="btn" href="#/partnerships/${mine.id}">Buka kerja sama ${A.ic('arrow-right')}</a>`;
    else if (p.status === 'available') cta = `<button class="btn" data-act="applyPship" data-id="${id}">Ajukan kerja sama ${A.ic('arrow-right')}</button>`;
    else cta = `<button class="btn" disabled>${A.ic('lock')} Terkunci</button>`;
    return `${V.head(A.esc(p.title), `${A.ic('map-pin')} ${A.esc(desa.name)} · ${A.esc(p.city)}`, `${locked ? '' : A.tag(p.status, 'lg')}`, 'Kembali')}
      ${locked ? `<div class="card tight mb" style="background:var(--cream-200)">${A.ic('lock')} <b>${p.status === 'requested' ? 'Kebutuhan ini sedang diajukan universitas lain.' : 'Kebutuhan ini sedang berjalan bersama universitas lain.'}</b> <span class="sm mu">Akan terbuka kembali jika kerja samanya ditolak, dibatalkan, atau kedaluwarsa.</span></div>` : ''}
      <div class="card row wrap mb"><div class="grow"><div class="b">${locked ? 'Tidak dapat diajukan saat ini' : mine ? 'Anda sudah terlibat di kebutuhan ini' : 'Tertarik membantu desa ini?'}</div><div class="sm mu">${locked ? 'Anda tetap bisa membaca detailnya.' : 'Ajukan sekali di level universitas dengan kuota kelompok. Setelah desa menyetujui, kontak terbuka dan koordinator KKN Anda berdiskusi dengan desa lewat WhatsApp.'}</div></div>
        <div class="row wrap">${cta}${locked ? '' : `<button class="btn out" data-act="toggleSave" data-id="${id}">${A.ic(saved ? 'bookmark-filled' : 'bookmark')} ${saved ? 'Tersimpan' : 'Simpan'}</button>`}</div></div>
      ${last && !mine && ['rejected', 'expired', 'declined'].includes(last.status) ? `<div class="card warn tight mb">${A.ic('info-circle')} Pengajuan Anda sebelumnya: ${A.tag(last.status)} — Anda dapat mengajukan lagi jika kebutuhan Available.</div>` : ''}
      <div class="g32 ${locked ? 'locked' : ''}"><div class="col">${V.problemBody(p)}</div>
        <div class="col">${V.problemSide(p)}<div class="card"><h3>Tentang desa</h3><div class="row">${A.avatar(desa.name)}<div><div class="b">${A.esc(desa.name)}</div><div class="xs mu">${A.esc(desa.profile.city)}</div></div></div><p class="sm mu mt12">${A.esc(desa.profile.about || '')}</p><button class="btn sm out mt12" data-act="viewDesa" data-id="${desa.id}">Lihat profil desa</button></div></div></div>`;
  });
  A.acts.applyPship = d => {
    const p = S.problem(d.id);
    A.modal({ title: 'Ajukan kerja sama', body: `<p class="mu sm">Untuk <b>${A.esc(p.title)}</b>. Setelah dikirim, kebutuhan ini <b>terkunci</b> untuk universitas lain sampai desa menyetujui atau menolak (kedaluwarsa jika 7 hari tanpa respons). Setelah disetujui, kontak terbuka dan koordinator KKN yang Anda undang berdiskusi dengan desa lewat WhatsApp.</p>
      <div class="field mt12"><label>Kuota kelompok KKN *</label><input type="number" id="applyquota" min="1" max="20" value="1" style="max-width:140px"><span class="hint">Jumlah kelompok yang akan ditempatkan di desa ini.</span></div>
      <div class="g2"><div class="field"><label>Perkiraan periode</label><input type="text" id="applyperiod" placeholder="mis. Jul – Agu 2025"></div><div class="field"><label>Perkiraan total mahasiswa</label><input type="number" id="applystudents" min="1" max="500" placeholder="mis. 20"></div></div>
      <div class="hint" style="margin:-4px 0 12px">Opsional, cukup perkiraan kasar untuk seluruh kelompok. Detail per kelompok diisi koordinator setelah disetujui.</div>
      <div class="field"><label>Pesan untuk desa</label><textarea id="applymsg" placeholder="Ceritakan singkat pengalaman dan alasan tim Anda tertarik..."></textarea></div>`,
      actions: [{ label: 'Batal' }, { label: 'Kirim pengajuan', cls: '', onClick: () => { const msg = A.$('#applymsg').value, quota = A.$('#applyquota').value, period = A.$('#applyperiod').value, students = A.$('#applystudents').value; let ps; try { ps = S.requestPartnership(d.id, S.me().id, { message: msg.trim(), quota, period, students }); } catch (e) { A.toast(e.message, 'err'); return false; } A.toast('Kerja sama diajukan — menunggu persetujuan desa.'); A.go('/partnerships/' + ps.id); A.render(); } }] });
  };

  /* ================= profil universitas ================= */
  A.route('/univ/profile', ['univ'], (_, me) => {
    const pr = me.profile, edit = A.ui.edit.uprofile;
    if (edit) return `${V.head('Edit profil universitas', 'Informasi ini terlihat oleh desa mitra', '', 'Batal')}<div class="col" style="max-width:860px">
      <form class="card" data-submit="saveUnivProfile" novalidate>
        <div class="g2"><div class="field"><label>Nama universitas</label><input type="text" name="name" value="${A.esc(me.name)}"></div><div class="field"><label>Kabupaten / Kota</label><select name="city">${Object.keys(A.CITIES).map(c => `<option ${pr.city === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div></div>
        <div class="field"><label>Tentang institusi</label><textarea name="about">${A.esc(pr.about)}</textarea></div>
        <div class="field"><label>Bidang keahlian</label><div class="chips">${A.CATEGORIES.map(c => `<label class="check"><input type="checkbox" name="fields[]" value="${c}" ${pr.fields.includes(c) ? 'checked' : ''}>${c}</label>`).join('')}</div></div>
        <div class="field"><label>Program studi</label><input type="text" name="programs" value="${A.esc(pr.programs.join(', '))}"><span class="hint">Pisahkan dengan koma.</span></div>
        <div class="g3"><div class="field"><label>Nama kontak</label><input type="text" name="contactName" value="${A.esc(pr.contactName)}"></div><div class="field"><label>Telepon / WhatsApp</label><input type="text" name="phone" value="${A.esc(pr.phone)}"></div><div class="field"><label>Email kontak</label><input type="email" name="email" value="${A.esc(pr.email)}"></div></div>
        <div class="row"><button class="btn">Simpan profil</button><button type="button" class="btn out" data-act="editUProfile" data-on="0">Selesai</button></div></form>
      <div class="card"><h3>Program yang pernah diambil</h3><div class="list">${pr.history.map(x => `<div class="item"><div class="grow"><b>${A.esc(x.title)}</b> <span class="mu sm">· ${A.esc(x.year)} · ${A.esc(x.desa)}</span><div class="xs mu">${A.esc(x.result)}</div></div><button class="btn sm red" data-act="delHist" data-id="${x.id}">${A.ic('trash')}</button></div>`).join('') || '<span class="mu sm">Belum ada program tercatat.</span>'}</div>
        <form class="mt16" data-submit="addHist"><div class="g2"><div class="field"><label>Judul program</label><input type="text" name="title" placeholder="mis. Digitalisasi UMKM"></div><div class="field"><label>Tahun</label><input type="text" name="year" placeholder="2024"></div></div>
          <div class="g2"><div class="field"><label>Desa mitra</label><input type="text" name="desa" placeholder="mis. Desa Tegalrejo"></div><div class="field"><label>Hasil singkat</label><input type="text" name="result" placeholder="mis. 12 UMKM terlatih"></div></div><button class="btn">${A.ic('plus')} Tambah program</button></form></div></div>`;
    return `${V.head('Profil Universitas', 'Informasi institusi yang terlihat oleh desa mitra', `<button class="btn out" data-act="editUProfile" data-on="1">${A.ic('edit')} Edit profil</button>`)}
      <div class="card flat"><div class="photo cover">${A.photo(me.id, 'cover')}</div><div class="row" style="padding:0 24px 22px;margin-top:-34px">${A.avatar(me.name, 'lg av-d')}<div><div class="f" style="font-size:24px;margin-top:34px">${A.esc(me.name)}</div><div class="sm mu">${A.ic('map-pin')} ${A.esc(pr.city)}, ${A.esc(pr.province)} · ${A.tag('approved')}</div></div></div></div>
      <div class="g2 mt16">${V.stat('school', 'c-blue', pr.programs.length, 'Program studi')}${V.stat('history', 'c-green', pr.history.length, 'Program KKN yang pernah diambil')}</div>
      <div class="g32 mt16"><div class="col"><div class="card"><h3>Tentang institusi</h3><p>${A.esc(pr.about || 'Belum diisi.')}</p><div class="label mt16">Bidang keahlian</div><div class="chips">${pr.fields.map(x => A.chipTag(x, 'blue')).join('') || '<span class="mu sm">—</span>'}</div><div class="label mt16">Program studi</div><div class="chips">${pr.programs.map(x => A.chipTag(x, 'gray')).join('') || '<span class="mu sm">—</span>'}</div></div>
        <div class="card"><h3>Program yang pernah diambil</h3><div class="list">${V.histList(pr.history)}</div></div></div>
        <div class="col"><div class="card"><h3>Kontak</h3>${V.contact(me)}</div>
          <div class="card"><h3>Dokumen verifikasi</h3><div class="col gap8">${me.docs.map(d => `<div class="row">${A.ic('file-text', 'mu')} <span class="sm">${A.esc(d)}</span></div>`).join('')}</div></div></div></div>`;
  });
  A.acts.editUProfile = d => { A.ui.edit.uprofile = d.on === '1'; A.render(); };
  A.acts.saveUnivProfile = f => {
    try {
      if (!f.name) throw new Error('Nama wajib diisi.');
      const me = S.me();
      A.run(() => {
        return S.updateProfile(me.id, {
          __name: f.name,
          city: f.city,
          province: A.CITIES[f.city],
          about: f.about,
          fields: f.fields || [],
          programs: A.csv(f.programs),
          contactName: f.contactName,
          phone: f.phone,
          email: f.email,
        }).then(() => {
          A.ui.edit.uprofile = false;
          A.toast('Profil universitas disimpan.');
          A.render();
        }).catch(error => {
          A.toast(error.message || 'Gagal menyimpan profil universitas.', 'err');
        });
      });
    } catch (error) {
      A.toast(error.message || 'Gagal menyimpan profil universitas.', 'err');
    }
  };
  A.acts.addHist = f => A.run(() => { S.addHistory(S.me().id, f); A.toast('Program ditambahkan.'); });
  A.acts.delHist = d => A.run(() => S.delHistory(S.me().id, d.id));
})(window.App);
