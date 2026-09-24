/* Halaman publik: landing, login, register */
(function (A) {
  const hills = `<svg viewBox="0 0 200 250" preserveAspectRatio="none"><rect width="200" height="250" fill="#C8DFD0"/><circle cx="150" cy="50" r="18" fill="#F6E7A8" opacity=".85"/><ellipse cx="40" cy="170" rx="100" ry="90" fill="#6C9A7C"/><ellipse cx="160" cy="200" rx="110" ry="90" fill="#3F6B54"/><ellipse cx="90" cy="270" rx="150" ry="70" fill="#22432F"/><rect x="60" y="176" width="16" height="10" rx="2" fill="#C97A56"/><rect x="100" y="190" width="18" height="11" rx="2" fill="#C97A56"/><rect x="140" y="182" width="14" height="9" rx="2" fill="#C97A56"/></svg>`;

  A.route('/', null, () => {
    const me = A.Store.me();
    const D = A.Store.data, desa = D.users.filter(u => u.role === 'desa' && u.verified === 'approved').length, uni = D.users.filter(u => u.role === 'univ' && u.verified === 'approved').length, coll = D.partnerships.filter(p => p.status === 'matched').length;
    const cta = me ? `<a class="btn lime lg" href="#${A.home(me)}">Buka dasbor ${A.ic('arrow-right')}</a>` : `<a class="btn lime lg" href="#/register">Mulai sekarang ${A.ic('arrow-right')}</a><a class="btn outd lg" href="#how">Pelajari lebih lanjut</a>`;
    return `<div class="pub">
    <div class="hero"><div class="pubnav"><a class="brand" href="#/" style="padding:0">${A.ic('leaf')}SumbangRuang</a>
      <div class="links"><a href="#/" style="color:var(--lime)">Beranda</a><a href="#/" data-act="scroll" data-to="how">Cara kerja</a><a href="#/" data-act="scroll" data-to="benefit">Manfaat</a><a href="#/" data-act="scroll" data-to="faq">FAQ</a></div>
      <div class="row">${me ? `<a class="btn lime sm" href="#${A.home(me)}">Dasbor</a>` : `<a class="btn outd sm" href="#/login">Masuk</a><a class="btn lime sm" href="#/register">Daftar</a>`}</div></div>
      <div class="hg"><div><h1>Dari Desa,<br>Untuk <em>Masa Depan</em></h1>
        <p class="lead">Platform yang menghubungkan desa yang memiliki kebutuhan dengan universitas dan tim mahasiswa yang memiliki kompetensi untuk membantu — berdasarkan kebutuhan, permasalahan, dan keahlian.</p>
        <div class="row mt24 wrap">${cta}</div>
        <div class="hstats"><div><div class="v">${desa}+</div><small>Desa terdaftar</small></div><div><div class="v">${uni}+</div><small>Universitas</small></div><div><div class="v">${coll}+</div><small>Kolaborasi</small></div></div></div>
        <div class="hpic"><div class="img">${hills}</div><div class="blob"></div><div class="pill">Solusi nyata untuk desa</div></div></div></div>

    <div class="section" id="how"><h2>Cara kerja platform</h2><p class="mu">Dari kebutuhan desa hingga dokumentasi KKN, semuanya tercatat dalam satu alur.</p>
      <div class="g4 mt24">
        ${[['Desa mengajukan kebutuhan', 'Desa membuat profil, lalu mempublikasikan masalah beserta kompetensi yang dibutuhkan.'], ['Universitas mengajukan', 'Universitas menjelajah kebutuhan desa lalu mengajukan partnership. Kebutuhan yang diajukan terkunci untuk pihak lain.'], ['Reservation & proposal', 'Setelah request diterima, ada diskusi 1 minggu, lalu universitas mengirim proposal dalam 1 minggu.'], ['KKN & dokumentasi', 'Proposal diterima → Matched. Pelaksanaan, laporan, dan arsip tersimpan sebagai riwayat.']].map((s, i) => `<div class="card stepcard"><div class="n">${i + 1}</div><h4>${s[0]}</h4><p class="mu sm">${s[1]}</p></div>`).join('')}
      </div></div>

    <div class="section" id="benefit"><h2>Manfaat untuk semua pihak</h2>
      <div class="g2 mt24">
        <div class="card"><h3>${A.ic('home-heart')} Untuk desa</h3><div class="col gap8">${['Masalah terdengar oleh banyak kampus', 'Solusi sesuai kebutuhan nyata desa', 'Proposal bisa dibandingkan dan dievaluasi', 'Riwayat & dokumentasi tersimpan rapi'].map(t => `<div class="row">${A.ic('circle-check', 'mu')}<span>${t}</span></div>`).join('')}</div></div>
        <div class="card"><h3>${A.ic('building-community')} Untuk universitas</h3><div class="col gap8">${['Temukan desa yang bisa dibantu tim Anda', 'Kebutuhan desa yang jelas dan terdokumentasi', 'Program KKN lebih terarah dan terukur', 'Jejak dampak yang terdokumentasi'].map(t => `<div class="row">${A.ic('circle-check', 'mu')}<span>${t}</span></div>`).join('')}</div></div>
      </div></div>

    <div class="section" id="faq"><h2>Pertanyaan umum</h2>
      <div class="col gap8 mt24">${[['Siapa yang memverifikasi akun?', 'Super Admin memeriksa dokumen pendukung dalam 1–2 hari kerja sebelum akun desa atau universitas aktif penuh.'], ['Berapa lama masa diskusi dan proposal?', 'Setelah desa menerima request, ada masa reservation & diskusi 1 minggu. Setelah itu universitas punya 1 minggu untuk mengirim proposal. Jika lewat, status menjadi Expired.'], ['Apa arti status Available, Reserved, Proposal, Matched?', 'Available: terbuka untuk request. Setelah ada request, kebutuhan terkunci (abu-abu) untuk universitas lain. Reserved: sedang diskusi. Proposal: menyusun/menunggu review. Matched: proposal diterima. Jika request/proposal ditolak atau waktu habis (Rejected/Expired), kebutuhan terbuka kembali.']].map(f => `<details class="card tight"><summary class="b" style="cursor:pointer">${f[0]}</summary><p class="mu mt8">${f[1]}</p></details>`).join('')}</div></div>

    <div class="cta"><div><h2>Siap berkolaborasi?</h2><p style="color:#2A3B18">Bergabung sebagai desa atau universitas — atau coba dulu lewat panel demo di pojok kanan bawah.</p></div>
      <div class="row wrap"><a class="btn lg" href="#/register">Daftar sebagai desa</a><a class="btn out lg" href="#/register">Daftar sebagai universitas</a></div></div>
    <div class="foot">Prototipe demo SumbangRuang · data tersimpan di browser Anda, tanpa server</div></div>`;
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
})(window.App);
