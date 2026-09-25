/* Halaman publik: landing, login, register */
(function (A) {
  const hills = `<svg viewBox="0 0 400 480" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4E7B0"/><stop offset=".55" stop-color="#CFE5D3"/><stop offset="1" stop-color="#B5D5C0"/></linearGradient></defs><rect width="400" height="480" fill="url(#sky)"/><circle cx="292" cy="96" r="38" fill="#FBF1C4"/><circle cx="292" cy="96" r="58" fill="#FBF1C4" opacity=".35"/><path d="M0 250 Q90 190 190 240 T400 220 V480 H0Z" fill="#8DB89D"/><path d="M0 300 Q120 240 230 290 T400 275 V480 H0Z" fill="#5F9376"/><path d="M0 355 Q100 305 210 345 T400 335 V480 H0Z" fill="#3F6B54"/><path d="M0 410 Q140 370 260 405 T400 395 V480 H0Z" fill="#22432F"/><g><rect x="86" y="292" width="34" height="22" fill="#E3B28F"/><path d="M80 292 L103 272 L126 292Z" fill="#C0583A"/><rect x="98" y="300" width="9" height="14" fill="#7A3E2A"/></g><g><rect x="232" y="318" width="40" height="26" fill="#EBC9A8"/><path d="M226 318 L252 294 L278 318Z" fill="#B24B31"/><rect x="246" y="328" width="10" height="16" fill="#7A3E2A"/><rect x="260" y="326" width="8" height="8" fill="#F6E7A8"/></g><g><rect x="150" y="334" width="26" height="18" fill="#E3B28F"/><path d="M146 334 L163 319 L180 334Z" fill="#C0583A"/></g><g fill="#2C5A41"><path d="M40 330 l14 -34 l14 34Z"/><path d="M36 346 l18 -38 l18 38Z"/><path d="M330 322 l12 -30 l12 30Z"/><path d="M326 338 l16 -34 l16 34Z"/></g><g fill="#5B3A29"><rect x="52" y="346" width="4" height="10"/><rect x="340" y="338" width="4" height="10"/></g></svg>`;

  const story = [['01', 'Available', 'tg-green', 'Desa mengajukan kebutuhan', 'Desa membuat profil, lalu mempublikasikan masalah beserta kompetensi yang dibutuhkan. Kebutuhan tampil terbuka bagi semua universitas.'], ['02', 'Reserved', 'tg-amber', 'Universitas mengajukan', 'Universitas menjelajah kebutuhan desa lalu mengajukan partnership. Kebutuhan yang diajukan terkunci untuk pihak lain.'], ['03', 'Proposal', 'tg-blue', 'Reservation & proposal', 'Setelah request diterima ada diskusi 1 minggu, lalu universitas mengirim proposal dalam 1 minggu. Jika lewat, status menjadi Expired.'], ['04', 'Matched', 'tg-purple', 'KKN & dokumentasi', 'Proposal diterima, status Matched. Pelaksanaan, laporan, dan arsip dokumentasi tersimpan sebagai riwayat desa.']];
  const problems = [['unlink', 'c-red', 'Kebutuhan desa tidak sampai ke kampus', 'Masalah desa hanya diketahui lewat kenalan atau jalur informal, sehingga banyak kampus tidak pernah tahu apa yang sebenarnya dibutuhkan.'], ['target-arrow', 'c-amber', 'Program KKN tidak tepat sasaran', 'Tema dan kegiatan sering ditentukan dari sisi kampus, bukan dari masalah nyata desa, sehingga hasilnya kurang terasa manfaatnya.'], ['users-group', 'c-blue', 'Kompetensi mahasiswa tidak dipertemukan', 'Desa yang butuh keahlian tertentu tidak punya cara mudah menemukan tim yang sesuai, dan sebaliknya.'], ['file-off', 'c-purple', 'Tidak ada jejak & keberlanjutan', 'Setelah KKN selesai, dokumentasi tercecer dan program tidak dilanjutkan, sehingga desa berikutnya mengulang dari nol.']];
  const sdgs = [['4', 'Pendidikan Berkualitas', '#C5192D', 'KKN menjadi pembelajaran kontekstual: mahasiswa menerapkan keilmuan pada masalah nyata.'], ['8', 'Pekerjaan Layak & Pertumbuhan Ekonomi', '#A21942', 'Solusi berbasis kompetensi mendorong ekonomi dan usaha lokal desa.'], ['10', 'Berkurangnya Kesenjangan', '#DD1367', 'Desa di mana pun punya kesempatan yang sama untuk terlihat dan dibantu kampus.'], ['11', 'Kota & Permukiman Berkelanjutan', '#FD9D24', 'Perbaikan infrastruktur, lingkungan, dan layanan dasar permukiman desa.'], ['17', 'Kemitraan untuk Mencapai Tujuan', '#19486A', 'Inti platform: kemitraan desa, universitas, dan mahasiswa yang terukur dan terdokumentasi.']];
  const impacts = [['target-arrow', 'Tepat sasaran', 'Program dimulai dari kebutuhan yang dinyatakan desa sendiri.'], ['scale', 'Terbuka & adil', 'Setiap desa terlihat oleh banyak universitas, bukan hanya yang punya koneksi.'], ['chart-line', 'Terukur', 'Status, proposal, dan laporan tercatat sehingga dampak bisa dievaluasi.'], ['history', 'Berkelanjutan', 'Riwayat dokumentasi tersimpan sebagai fondasi kolaborasi berikutnya.']];
  const perks = t => t.map(x => `<div class="row top gap8">${A.ic('circle-check-filled', 'chk')}<span>${x}</span></div>`).join('');

  A.route('/', null, () => {
    const me = A.Store.me();
    const D = A.Store.data, desa = D.users.filter(u => u.role === 'desa' && u.verified === 'approved').length, uni = D.users.filter(u => u.role === 'univ' && u.verified === 'approved').length, coll = D.partnerships.filter(p => p.status === 'matched').length;
    const cta = me ? `<a class="btn lime lg" href="#${A.home(me)}">Buka dasbor ${A.ic('arrow-right')}</a>` : `<a class="btn lime lg" href="#/register">Mulai sekarang ${A.ic('arrow-right')}</a><a class="btn outd lg" href="#/" data-act="scroll" data-to="how">Pelajari lebih lanjut</a>`;
    return `<div class="pub"><div class="pprog"></div>
    <div class="fnav"><a class="brand" href="#/" style="padding:0">${A.ic('leaf')}SumbangRuang</a>
      <div class="links">${[['problem', 'Masalah'], ['how', 'Cara kerja'], ['impact', 'Dampak'], ['benefit', 'Manfaat'], ['faq', 'FAQ']].map(l => `<a href="#/" data-act="scroll" data-to="${l[0]}">${l[1]}</a>`).join('')}</div>
      ${me ? `<a class="btn lime sm" href="#${A.home(me)}">Dasbor</a>` : `<a class="btn lime sm" href="#/register">Daftar</a>`}</div>
    <div class="hero"><div class="pubnav"><a class="brand" href="#/" style="padding:0">${A.ic('leaf')}SumbangRuang</a>
      <div class="links"><a href="#/" data-act="scroll" data-to="problem">Masalah</a><a href="#/" data-act="scroll" data-to="how">Cara kerja</a><a href="#/" data-act="scroll" data-to="impact">Dampak</a><a href="#/" data-act="scroll" data-to="benefit">Manfaat</a><a href="#/" data-act="scroll" data-to="faq">FAQ</a></div>
      <div class="row">${me ? `<a class="btn lime sm" href="#${A.home(me)}">Dasbor</a>` : `<a class="btn outd sm" href="#/login">Masuk</a><a class="btn lime sm" href="#/register">Daftar</a>`}</div></div>
      <div class="hg"><div class="rise"><span class="eyebrow">${A.ic('sparkles')}Platform KKN Desa & Universitas</span>
        <h1>Dari Desa,<br>Untuk <em>Masa Depan</em></h1>
        <p class="lead">Platform yang menghubungkan desa yang memiliki kebutuhan dengan universitas dan tim mahasiswa yang memiliki kompetensi untuk membantu, berdasarkan kebutuhan, permasalahan, dan keahlian.</p>
        <div class="row mt24 wrap">${cta}</div>
        <div class="hstats"><div><div class="v">${desa}+</div><small>Desa terdaftar</small></div><div><div class="v">${uni}+</div><small>Universitas</small></div><div><div class="v">${coll}+</div><small>Kolaborasi</small></div></div></div>
        <div class="hpic rise d2"><div class="scene" aria-hidden="true"></div><div class="img">${hills}<img src="https://images.unsplash.com/photo-1716731049987-c5ec344a9c80?auto=format&fit=crop&w=1000&h=1000&q=80" alt="Pemandangan udara permukiman desa dengan atap genteng dan sawah" loading="eager" onerror="this.remove()"></div><div class="blob"></div>
          <div class="float f1"><div class="ib ci c-green s">${A.ic('home-heart')}</div><div><div class="b sm">Perbaikan irigasi desa</div><div class="xs mu">Butuh: Teknik Sipil, Pertanian</div></div></div>
          <div class="float f2">${A.ic('heart-handshake', 'lm')}<div><div class="b sm">Matched</div><div class="xs mu">Desa ⇄ Universitas</div></div></div>
          <div class="pill">Solusi nyata untuk desa</div></div></div></div>

    <div class="prob" id="problem"><div class="section"><span class="kick">Permasalahan</span><h2>Niat baik KKN belum selalu sampai ke tempat yang tepat</h2>
      <p class="sub mu">Ribuan mahasiswa turun ke desa setiap tahun, tetapi penyaluran program KKN masih sering terputus dari kebutuhan nyata masyarakat.</p>
      <div class="g4 mt24 probg">${problems.map(p => `<div class="card pcard"><div class="ib ${p[1]}">${A.ic(p[0])}</div><h3>${p[2]}</h3><p class="mu sm">${p[3]}</p></div>`).join('')}</div>
</div>
      <div class="bridge"><b>Bagaimana SumbangRuang menjawabnya?</b><span>${A.ic('arrow-down')}</span></div></div>

    <section class="story" id="how"><div class="stick"><div class="story-scene" aria-hidden="true"></div><div class="warm"></div>
      <div class="story-top"><span class="kick lm">Cara kerja</span><h2>Satu alur, dari kebutuhan hingga dokumentasi</h2></div>
      <div class="story-panel">${story.map(x => `<div class="sp"><div class="no">${x[0]}</div><span class="tag ${x[2].slice(3)} lg">${x[1]}</span><h3>${x[3]}</h3><p>${x[4]}</p></div>`).join('')}</div>
      <div class="story-hint">Gulir untuk menjalankan alur ${A.ic('arrow-down')}</div>
      <div class="story-rail"><div class="rline"><i class="rfill"></i></div>${story.map((x, i) => `<button class="rn" data-act="storyGo" data-i="${i}"><span class="rd"></span><b>${x[1]}</b><small>${x[3]}</small></button>`).join('')}</div>
    </div></section>
    <div class="story-wave" aria-hidden="true"><div class="sun"></div><svg viewBox="0 0 1440 240" preserveAspectRatio="none">
      <g class="drift d1"><path d="M-40 120 C180 60 360 80 540 110 S900 150 1080 100 S1340 60 1500 90 V240 H-40Z" fill="#183B2A"/></g>
      <g class="drift d2"><path d="M-40 150 C200 110 420 120 620 145 S1000 175 1200 140 S1400 118 1500 130 V240 H-40Z" fill="#1F5138"/>
        <g fill="#0B1F16"><path d="M250 136l7-14 7 14z"/><path d="M262 138l9-18 9 18z"/><path d="M1010 158l8-16 8 16z"/><path d="M1026 160l7-13 7 13z"/></g></g>
      <path d="M0 182 C240 150 480 160 720 178 S1160 196 1440 166 V240 H0Z" fill="#4C8C63"/>
      <g><rect x="640" y="164" width="26" height="15" fill="#F0DCC0"/><path d="M636 164l17-13 17 13z" fill="#C0583A"/><rect x="684" y="168" width="20" height="12" fill="#F0DCC0"/><path d="M680 168l14-11 14 11z" fill="#B24B31"/><rect x="1130" y="170" width="22" height="13" fill="#F0DCC0"/><path d="M1126 170l15-12 15 12z" fill="#C0583A"/></g>
      <g fill="#2C5A41"><path d="M560 178l8-16 8 16z"/><path d="M578 180l6-12 6 12z"/><path d="M780 182l8-17 8 17z"/><path d="M1220 176l8-16 8 16z"/><path d="M1240 178l6-12 6 12z"/><path d="M180 172l8-16 8 16z"/></g>
      <path d="M0 208 C300 188 620 198 940 204 S1320 194 1440 200 V240 H0Z" fill="#2A6B4A"/>
      <path d="M0 226 C320 212 700 220 1040 224 S1360 216 1440 220 V240 H0Z" fill="#10291D"/></svg></div>

    <div class="section" id="impact"><span class="kick">Dampak</span><h2>Selaras dengan Tujuan Pembangunan Berkelanjutan</h2>
      <p class="sub mu">SumbangRuang berkontribusi pada agenda SDGs melalui kolaborasi desa dan perguruan tinggi.</p>
      <div class="sdgs mt24">${sdgs.map(s => `<div class="sdg" style="--c:${s[2]}"><div class="sn">${s[0]}</div><div><div class="b">SDG ${s[0]} · ${s[1]}</div><p class="sm">${s[3]}</p></div></div>`).join('')}</div>
      <h3 class="mt32 imph">Dampak yang diharapkan</h3>
      <div class="g4 mt16">${impacts.map(i => `<div class="card pcard"><div class="ib c-green">${A.ic(i[0])}</div><h3>${i[1]}</h3><p class="mu sm">${i[2]}</p></div>`).join('')}</div></div>

    <div class="section" id="benefit"><span class="kick">Manfaat</span><h2>Manfaat untuk semua pihak</h2>
      <div class="g2 mt24">
        <div class="card perk"><div class="perkh"><div class="ib c-green">${A.ic('home-heart')}</div><h3>Untuk desa</h3></div><div class="col gap8">${perks(['Masalah terdengar oleh banyak kampus', 'Solusi sesuai kebutuhan nyata desa', 'Proposal bisa dibandingkan dan dievaluasi', 'Riwayat & dokumentasi tersimpan rapi'])}</div></div>
        <div class="card perk"><div class="perkh"><div class="ib c-blue">${A.ic('building-community')}</div><h3>Untuk universitas</h3></div><div class="col gap8">${perks(['Temukan desa yang bisa dibantu tim Anda', 'Kebutuhan desa yang jelas dan terdokumentasi', 'Program KKN lebih terarah dan terukur', 'Jejak dampak yang terdokumentasi'])}</div></div>
      </div></div>

    <div class="section" id="faq"><span class="kick">FAQ</span><h2>Pertanyaan umum</h2>
      <div class="col gap8 mt24">${[['Siapa yang memverifikasi akun?', 'Super Admin memeriksa dokumen pendukung dalam 1–2 hari kerja sebelum akun desa atau universitas aktif penuh.'], ['Berapa lama masa diskusi dan proposal?', 'Setelah desa menerima request, ada masa reservation & diskusi 1 minggu. Setelah itu universitas punya 1 minggu untuk mengirim proposal. Jika lewat, status menjadi Expired.'], ['Apa arti status Available, Reserved, Proposal, Matched?', 'Available: terbuka untuk request. Setelah ada request, kebutuhan terkunci (abu-abu) untuk universitas lain. Reserved: sedang diskusi. Proposal: menyusun/menunggu review. Matched: proposal diterima. Jika request/proposal ditolak atau waktu habis (Rejected/Expired), kebutuhan terbuka kembali.']].map(f => `<details class="card tight faq"><summary class="b">${f[0]}${A.ic('chevron-down', 'chev')}</summary><p class="mu mt8">${f[1]}</p></details>`).join('')}</div></div>

    <div class="cta"><div><h2>Siap berkolaborasi?</h2><p style="color:#2A3B18;margin-top:6px">Bergabung sebagai desa atau universitas, atau coba dulu lewat panel demo di pojok kanan bawah.</p></div>
      <div class="row wrap"><a class="btn lg" href="#/register">Daftar sebagai desa</a><a class="btn out lg" href="#/register">Daftar sebagai universitas</a></div></div>
    <div class="foot"><a class="brand" href="#/" style="padding:0;justify-content:center">${A.ic('leaf')}SumbangRuang</a><div class="sm mt8">Prototipe demo · data tersimpan di browser Anda, tanpa server</div></div></div>`;
  }, 'public');

  A.acts.scroll = d => setTimeout(() => { const el = document.getElementById(d.to); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 30);

  /* ---------- login ---------- */
  const authLeft = `<div class="authL"><a class="brand" href="#/">${A.ic('leaf')}SumbangRuang</a><div><h2>Kolaborasi kecil hari ini, dampak besar untuk esok.</h2>
    <div class="verifybox">${A.ic('shield-check', '')}<div><div class="b">Akun diverifikasi Super Admin</div><div class="sm" style="color:#B8C8BD;margin-top:2px">Setelah mendaftar, dokumen Anda diperiksa dalam 1–2 hari kerja sebelum akun aktif penuh.</div></div></div></div>
    <div class="sm" style="color:#9FB2A6">© SumbangRuang · Prototipe demo</div></div>`;

  A.route('/login', null, () => {
    const role = A.ui.loginRole || 'desa';
    return `<div class="authwrap">${authLeft}<div class="authR">
      <div class="seg"><a class="on" href="#/login">Masuk</a><a href="#/register">Daftar</a></div>
      <h1 class="title mt16">Selamat datang kembali</h1><p class="mu mt4">Masuk sebagai:</p>
      <form data-submit="login" class="mt12" novalidate>
        <div class="rolepick" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:16px">
          ${[['desa', 'home-heart', 'Desa'], ['univ', 'building-community', 'Universitas'], ['admin', 'shield-check', 'Admin']].map(r => `<label><input type="radio" name="role" value="${r[0]}" ${role === r[0] ? 'checked' : ''} data-change="setLoginRole">${A.ic(r[1])}<span class="b">${r[2]}</span></label>`).join('')}</div>
        <div class="field"><label>Email</label><input type="email" name="email" placeholder="nama@desa.go.id" autocomplete="username"></div>
        <div class="field"><label>Kata sandi</label><input type="password" name="password" placeholder="••••••••" autocomplete="current-password"></div>
        <button class="btn lg block">Masuk ${A.ic('arrow-right')}</button></form>
      <p class="center mu mt16">Belum punya akun? <a href="#/register" class="b" style="color:var(--green-500)">Daftar</a></p>
      <div class="demobox"><div class="b">${A.ic('flask')} Akun demo (kata sandi: <code>demo123</code>)</div>
        <div class="row wrap mt8"><button class="btn sm out" data-act="demoLogin" data-email="desa@demo.id">Desa Sumber Rejeki</button><button class="btn sm out" data-act="demoLogin" data-email="univ@demo.ac.id">Universitas Brawijaya</button><button class="btn sm out" data-act="demoLogin" data-email="admin@demo.id">Super Admin</button></div></div>
    </div></div>`;
  }, 'public');
  A.acts.setLoginRole = v => { A.ui.loginRole = v; };
  A.acts.login = f => {
    try { const u = A.Store.login(f.email, f.password, f.role); A.toast('Selamat datang, ' + u.name); A.go(A.home(u)); A.render(); } catch (e) { A.toast(e.message, 'err'); }
  };

  /* ---------- register ---------- */
  A.route('/register', null, () => {
    const role = A.ui.regRole || 'desa';
    return `<div class="authwrap">${authLeft}<div class="authR">
      <div class="seg"><a href="#/login">Masuk</a><a class="on" href="#/register">Daftar</a></div>
      <h1 class="title mt16">Buat akun baru</h1><p class="mu mt4">Daftar sebagai:</p>
      <form data-submit="register" class="mt12" novalidate>
        <div class="rolepick" style="margin-bottom:16px">${[['desa', 'home-heart', 'Desa', 'Ajukan kebutuhan'], ['univ', 'building-community', 'Universitas', 'Cari & bantu desa']].map(r => `<label><input type="radio" name="role" value="${r[0]}" ${role === r[0] ? 'checked' : ''} data-change="setRegRole">${A.ic(r[1], '')}<div><div class="b">${r[2]}</div><div class="xs mu">${r[3]}</div></div></label>`).join('')}</div>
        <div class="field"><label>${role === 'desa' ? 'Nama desa' : 'Nama universitas / tim'}</label><input type="text" name="name" placeholder="${role === 'desa' ? 'mis. Sumber Makmur' : 'mis. Institut Teknologi Nusantara'}"></div>
        <div class="g2"><div class="field"><label>Email</label><input type="email" name="email" placeholder="nama@email.com"></div>
          <div class="field"><label>Kata sandi</label><input type="password" name="password" placeholder="min. 6 karakter"></div></div>
        <div class="g2"><div class="field"><label>Kabupaten / Kota</label><select name="city">${Object.keys(A.CITIES).map(c => `<option>${c}</option>`).join('')}</select></div>
          <div class="field"><label>Nama kontak</label><input type="text" name="contactName" placeholder="Nama penanggung jawab"></div></div>
        <div class="field"><label>Dokumen pendukung verifikasi</label><input type="file" name="docs[]" multiple><span class="hint">${role === 'desa' ? 'Contoh: SK Kepala Desa, KTP Kepala Desa.' : 'Contoh: Surat tugas LPPM, SK institusi.'} (berkas tidak diunggah ke server, hanya nama berkas yang disimpan)</span></div>
        <button class="btn lg block">Kirim pendaftaran ${A.ic('send')}</button></form>
      <p class="center mu mt16">Sudah punya akun? <a href="#/login" class="b" style="color:var(--green-500)">Masuk</a></p></div></div>`;
  }, 'public');
  A.acts.setRegRole = v => { A.ui.regRole = v; A.render(); };
  A.acts.register = f => { try { const u = A.Store.register(f); A.ui.registered = u.id; A.go('/registered'); A.render(); } catch (e) { A.toast(e.message, 'err'); } };

  A.route('/registered', null, () => {
    const u = A.Store.user(A.ui.registered);
    return `<div class="authwrap">${authLeft}<div class="authR"><div class="ib ci c-green" style="width:64px;height:64px;font-size:30px">${A.ic('mail-check')}</div>
      <h1 class="title mt16">Pendaftaran terkirim</h1>
      <p class="mu mt8">${u ? `Akun <b>${A.esc(u.name)}</b> sedang menunggu verifikasi` : 'Akun Anda menunggu verifikasi'} Super Admin (1–2 hari kerja). Anda baru bisa masuk setelah akun disetujui.</p>
      <div class="demobox"><div class="b">${A.ic('flask')} Coba sendiri di demo</div><p class="sm mt4">Masuk sebagai Super Admin, buka <b>Verifikasi Akun</b>, lalu setujui akun ini. Setelah itu Anda bisa masuk dengan email dan kata sandi tadi.</p>
        <button class="btn sm mt8" data-act="adminVerifyDemo">Buka panel admin ${A.ic('arrow-right')}</button></div>
      <a class="btn out mt16" href="#/login">Ke halaman masuk</a></div></div>`;
  }, 'public');
  A.acts.adminVerifyDemo = () => { const a = A.Store.data.users.find(x => x.role === 'admin'); A.Store.data.session = a.id; A.Store.save(); A.ui.verifySel = A.ui.registered; A.ui.verifyTab = 'pending'; A.go('/admin/verify'); A.render(); };

  A.reveal = () => {
    if (!A.$('.pub .hero')) return;
    const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

    /* hitung naik untuk statistik hero */
    A.$$('.hstats .v').forEach(el => {
      const n = parseInt(el.textContent, 10), suf = el.textContent.replace(/^\d+/, '');
      if (reduce || !n) return;
      const t0 = performance.now(), dur = 1300;
      const tick = t => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(tick); };
      el.textContent = '0' + suf; requestAnimationFrame(tick);
    });

    /* judul dipecah per kata */
    A.$$('.pub .section h2').forEach(h => { if (h.querySelector('.w')) return; h.innerHTML = h.textContent.split(' ').map((w, i) => `<span class="w"><span style="--i:${i}">${w}</span></span>`).join(' '); });
    A.$$('.pub .section').forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .8) s.classList.add('seen'); });

    /* spotlight kartu mengikuti kursor */
    if (!A._pubSpot) { A._pubSpot = true; document.addEventListener('pointermove', e => { const c = e.target.closest && e.target.closest('.pcard,.sdg,.perk,.faq'); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); }, { passive: true }); }

    /* reveal: varian arah + jeda berurutan per grup */
    const els = A.$$('.pub .section h2, .pub .section .kick, .pub .section .sub, .pub .imph, .pub .bridge b, .pub .perk, .pub .pcard, .pub .sdg, .pub .faq, .pub .cta, .pub .foot');
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(el => el.classList.add('rv', 'in', 'done')); }
    else {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); setTimeout(() => e.target.classList.add('done'), 1100); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
      els.forEach(el => {
        const sib = [...el.parentElement.children].filter(c => c.matches('.pcard,.sdg,.perk,.faq')), i = Math.max(0, sib.indexOf(el));
        el.classList.add('rv');
        if (el.matches('.perk')) el.classList.add(i % 2 ? 'rv-r' : 'rv-l');
        else if (el.matches('.pcard,.sdg')) el.classList.add('rv-z');
        el.style.setProperty('--d', (sib.length > 1 ? i * 110 : el.matches('h2') ? 80 : el.matches('.sub') ? 160 : 0) + 'ms');
        if (el.getBoundingClientRect().top < innerHeight * .96) { el.classList.add('in'); setTimeout(() => el.classList.add('done'), 1100); } else io.observe(el);
      });
    }

    /* scroll: progress bar, navigasi mengambang, parallax hero */
    if (A._pubScroll) return; A._pubScroll = true;
    let tick = false;
    const frame = () => {
      tick = false;
      const hero = A.$('.pub .hero'); if (!hero) return;
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight, hh = hero.offsetHeight;
      const bar = A.$('.pprog'); if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      const fn = A.$('.fnav'); if (fn) fn.classList.toggle('show', y > hh * .8);
      if (!reduce && y < hh * 1.2) {
        const pic = A.$('.hpic .img'); if (pic) pic.style.translate = `0 ${y * .07}px`;
        const fl = A.$$('.hpic .float'); fl.forEach((f, i) => f.style.translate = `0 ${-y * (.05 + i * .04)}px`);
        const hg = A.$('.hero .hg > .rise:first-child'); if (hg) hg.style.translate = `0 ${y * .12}px`;
      }
      A.$$('.pub .section').forEach(s => { const t = s.getBoundingClientRect().top; s.style.setProperty('--sy', t); if (t < innerHeight * .8) s.classList.add('seen'); });
      const ids = ['problem', 'how', 'impact', 'benefit', 'faq']; let cur = '';
      ids.forEach(id => { const s = document.getElementById(id); if (s && s.getBoundingClientRect().top < innerHeight * .4) cur = id; });
      A.$$('.fnav .links a').forEach(a => a.classList.toggle('on', a.dataset.to === cur));
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  };
})(window.App);
