/* Data & logika bisnis (tanpa backend): disimpan di localStorage.
   Alur: Available -> (request dikirim) Diajukan/terkunci -> (desa menerima) Reserved 7 hari -> Proposal 7 hari -> Matched | Rejected | Expired.
   Kebutuhan terkunci selama ada request/partnership aktif; terbuka lagi jika ditolak, dibatalkan, atau expired. */
window.App = window.App || {};
(function (A) {
  const KEY = 'sumbangruang.demo.v2', DAY = A.DAY, RESERVE_DAYS = 7, PROPOSAL_DAYS = 7, VERSION = 2;
  const LOCKED = ['requested', 'reserved', 'proposal', 'matched'];
  let D = null;
  A.LOCKED = LOCKED;

  /* ------------------------------------------------------------------ seed */
  function seed() {
    const t = Date.now(), ago = d => t - d * DAY;
    const vlog = (ver, age) => ver === 'pending' ? [{ ts: ago(age), text: 'Pendaftaran diterima' }, { ts: ago(age), text: 'Menunggu peninjauan admin' }] : [{ ts: ago(age), text: 'Pendaftaran diterima' }, { ts: ago(age - 1), text: 'Akun disetujui Super Admin' }];
    const d = (id, name, email, city, prof, docs, ver = 'approved', age = 60) => ({
      id, role: 'desa', email, password: 'demo123', name, verified: ver, createdAt: ago(age), docs, vlog: vlog(ver, age),
      profile: Object.assign({ kecamatan: '-', city, province: A.CITIES[city] || 'Jawa Timur', population: 2500, area: '10', umkm: 10, about: '', potentials: [], facilities: [], contactName: '', phone: '', email }, prof)
    });
    const u = (id, name, email, prof, docs, ver = 'approved', age = 80) => ({
      id, role: 'univ', email, password: 'demo123', name, verified: ver, createdAt: ago(age), docs, saved: [], vlog: vlog(ver, age),
      profile: Object.assign({ city: 'Kota Malang', province: 'Jawa Timur', fields: [], programs: [], history: [], about: '', contactName: '', phone: '', email }, prof)
    });
    const H = (title, year, desa, result) => ({ id: A.uid('h'), title, year, desa, result });
    const users = [
      { id: 'a1', role: 'admin', email: 'admin@demo.id', password: 'demo123', name: 'Super Admin', verified: 'approved', profile: {}, docs: [], vlog: [], createdAt: ago(200) },
      d('d1', 'Desa Sumber Rejeki', 'desa@demo.id', 'Kab. Malang', { kecamatan: 'Sumbermanjing', population: 3245, area: '12,4', umkm: 24, about: 'Desa agraris penghasil kopi dan sayuran dengan puluhan UMKM pengolahan pangan yang siap berkembang secara digital.', potentials: ['Pertanian', 'UMKM', 'Wisata'], facilities: ['Balai desa', 'Akses internet', 'Aula pelatihan'], contactName: 'Pak Budi (Kepala Desa)', phone: '0812-3456-7890', email: 'desa@sumberrejeki.id' }, ['SK Kepala Desa.pdf', 'KTP Kepala Desa.jpg'], 'approved', 90),
      d('d2', 'Desa Tanjung Sari', 'tanjung@demo.id', 'Kab. Pasuruan', { kecamatan: 'Rembang', population: 2810, area: '9,1', umkm: 12, about: 'Desa pesisir dengan potensi wisata dan pengolahan hasil laut.', potentials: ['Wisata', 'Perikanan'], facilities: ['Balai desa', 'Pantai wisata'], contactName: 'Bu Lestari (Sekdes)', phone: '0813-1111-2222' }, ['SK Kepala Desa.pdf'], 'approved', 70),
      d('d3', 'Desa Sukamakmur', 'sukamakmur@demo.id', 'Kab. Malang', { kecamatan: 'Ngantang', population: 4120, area: '15', umkm: 8, about: 'Desa dengan sumber air pegunungan yang membutuhkan pengelolaan berkelanjutan.', potentials: ['Air', 'Pertanian'], facilities: ['Balai desa', 'Posyandu'], contactName: 'Pak Hadi', phone: '0857-0000-1111' }, ['SK Kepala Desa.pdf'], 'approved', 65),
      d('d4', 'Desa Tegalrejo', 'tegalrejo@demo.id', 'Kab. Malang', { kecamatan: 'Dau', contactName: 'Pak Slamet', phone: '0813-2222-3333' }, ['SK Kepala Desa.pdf', 'KTP Kepala Desa.jpg'], 'pending', 0.1),
      d('d5', 'Desa Karangploso', 'karangploso@demo.id', 'Kab. Malang', { kecamatan: 'Karangploso', contactName: 'Bu Rini', phone: '0812-9999-0000' }, ['SK Kepala Desa.pdf'], 'pending', 1),
      u('u1', 'Universitas Brawijaya', 'univ@demo.ac.id', { fields: ['Teknologi', 'UMKM', 'Pertanian', 'Lingkungan'], programs: ['Teknik Informatika', 'Agribisnis', 'Manajemen', 'Teknologi Bioproses'], history: [H('Digitalisasi UMKM', '2024', 'Desa Tegalrejo', 'Matched · 12 UMKM terlatih dan toko online aktif'), H('Pengelolaan sampah organik', '2023', 'Desa Sukamaju', 'Selesai · unit kompos komunal berjalan'), H('Literasi digital warga', '2022', 'Desa Pujon', 'Selesai · 40 warga mengikuti pelatihan')], about: 'Perguruan tinggi negeri yang berkomitmen pada pengabdian masyarakat melalui program KKN tematik berkelanjutan.', contactName: 'Nayla Putri', phone: '0812-8888-7777', email: 'kkn@ub.ac.id' }, ['Surat Tugas LPPM.pdf', 'SK Rektor.pdf'], 'approved', 120),
      u('u2', 'Universitas Negeri Malang', 'um@demo.ac.id', { fields: ['Pendidikan', 'Kesehatan', 'Teknologi'], programs: ['Pendidikan Teknik Informatika', 'Kesehatan Masyarakat'], history: [H('Pelatihan UMKM Digital', '2024', 'Desa Sumber Rejeki', 'Selesai · 12 UMKM dilatih'), H('Literasi digital', '2023', 'Desa Pujon', 'Selesai · 50 warga terlatih')], about: 'Fokus pada pendidikan, literasi digital, dan pelayanan kesehatan masyarakat desa.', contactName: 'Rafi Aditya', phone: '0813-4444-5555', email: 'kkn@um.ac.id' }, ['Surat Tugas LPPM.pdf'], 'approved', 110),
      u('u3', 'Universitas Merdeka', 'merdeka@demo.ac.id', { fields: ['Teknologi'], contactName: 'Ibu Wati' }, ['Surat Tugas.pdf', 'Akreditasi.pdf'], 'pending', 0.2)
    ];
    const P = (id, desaId, title, category, city, skills, dur, min, max, status, age, o = {}) => Object.assign({
      id, desaId, title, category, city, province: A.CITIES[city] || 'Jawa Timur', skills, duration: dur, teamMin: min, teamMax: max, status, createdAt: ago(age), deadline: t + 30 * DAY, partnershipId: null,
      desc: '', condition: '', need: '', target: ''
    }, o);
    const problems = [
      P('p1', 'd1', 'Digitalisasi UMKM Desa', 'Teknologi', 'Kab. Malang', ['Web Development', 'UI/UX Design', 'Bisnis', 'Data Analysis'], 2, 3, 5, 'requested', 12, { partnershipId: 'pt1', desc: 'UMKM lokal belum terdigitalisasi sehingga jangkauan pemasaran terbatas dan pencatatan produk dilakukan manual.', condition: 'Terdapat balai desa, akses internet, dan 10 UMKM aktif yang siap dilibatkan. Belum ada toko online maupun pencatatan digital.', need: 'Platform toko online sederhana, pelatihan pemasaran digital, dan panduan penggunaan yang mudah dipahami pelaku UMKM.', target: 'Toko online aktif untuk minimal 10 UMKM, 3 sesi pelatihan, panduan pengguna, dan laporan hasil.' }),
      P('p2', 'd3', 'Sistem Monitoring Kualitas Air', 'Lingkungan', 'Kab. Malang', ['IoT', 'Data Analysis', 'Web Development'], 3, 3, 4, 'proposal', 30, { partnershipId: 'pt2', desc: 'Kualitas air sumber desa belum dipantau secara berkala.', condition: 'Ada 3 titik sumber air dan posyandu yang menjadi pusat informasi.', need: 'Sensor sederhana dan dasbor pemantauan yang bisa dibaca perangkat desa.', target: 'Dasbor pemantauan aktif dan SOP tindak lanjut kualitas air.' }),
      P('p3', 'd2', 'Pengelolaan Sampah Organik', 'Lingkungan', 'Kab. Pasuruan', ['Bioteknologi', 'Agribisnis'], 2, 3, 4, 'matched', 60, { partnershipId: 'pt3', desc: 'Sampah organik rumah tangga menumpuk di TPS desa.', condition: 'Belum ada fasilitas pengomposan.', need: 'Sistem pengomposan komunal dan pelatihan warga.', target: 'Unit kompos aktif dan 30 warga terlatih.' }),
      P('p4', 'd1', 'Pemasaran Kopi Desa', 'UMKM', 'Kab. Malang', ['Pemasaran Digital', 'Bisnis', 'Desain Grafis'], 1, 3, 4, 'reserved', 20, { partnershipId: 'pt4', desc: 'Kopi desa belum memiliki merek dan kanal pemasaran yang jelas.', condition: 'Produksi kopi rutin, kemasan masih sederhana.', need: 'Branding, kemasan, dan strategi pemasaran digital.', target: 'Merek kopi, katalog produk, dan akun pemasaran aktif.' }),
      P('p5', 'd1', 'Pelatihan Literasi Digital', 'Pendidikan', 'Kab. Malang', ['Pendidikan', 'Web Development'], 1, 2, 4, 'expired', 45, { desc: 'Warga belum akrab dengan layanan digital dasar.', condition: 'Aula tersedia, perangkat terbatas.', need: 'Pelatihan literasi digital untuk warga.', target: '50 warga mengikuti pelatihan.' }),
      P('p6', 'd2', 'Wisata Desa Berbasis Digital', 'Teknologi', 'Kab. Pasuruan', ['Web Development', 'Desain Grafis', 'Pemasaran Digital'], 2, 3, 5, 'available', 8, { desc: 'Wisata pantai belum punya situs dan sistem pemesanan.', condition: 'Pengunjung ramai di akhir pekan tanpa pencatatan.', need: 'Situs wisata, peta digital, dan sistem tiket sederhana.', target: 'Situs wisata live dan pengelola terlatih.' }),
      P('p7', 'd3', 'Posyandu Digital', 'Kesehatan', 'Kab. Malang', ['Kesehatan Masyarakat', 'Web Development', 'Data Analysis'], 3, 3, 4, 'available', 5, { desc: 'Pencatatan posyandu masih manual dan sulit direkap.', condition: 'Ada 4 posyandu aktif dengan kader terlatih.', need: 'Aplikasi pencatatan dan rekap sederhana.', target: 'Aplikasi terpakai di 4 posyandu.' }),
      P('p8', 'd1', 'Pengolahan Limbah Kopi', 'Lingkungan', 'Kab. Malang', ['Bioteknologi', 'Agribisnis'], 2, 3, 4, 'available', 3, { desc: 'Kulit kopi hasil olahan belum dimanfaatkan.', condition: 'Limbah menumpuk saat panen raya.', need: 'Pengolahan kulit kopi menjadi produk bernilai.', target: 'Produk turunan dan pelatihan pengolahan.' }),
      P('p9', 'd1', 'Pelatihan UMKM Digital 2024', 'UMKM', 'Kab. Malang', ['Bisnis', 'Pemasaran Digital'], 3, 3, 4, 'matched', 300, { partnershipId: 'pt6', desc: 'Pelatihan UMKM (arsip).' })
    ];
    const blankProp = () => ({ status: 'draft', title: '', file: null, coordinators: [], advisors: [], formation: '', start: '', end: '' });
    const doc = (name, by, ts, kind = 'pdf') => ({ id: A.uid('x'), name, by, ts, kind });
    const partnerships = [
      { id: 'pt1', problemId: 'p1', univId: 'u2', desaId: 'd1', status: 'requested', createdAt: t - 2 * 3600000, message: 'Tim kami berpengalaman melatih UMKM digital dan siap membantu digitalisasi.', proposal: null, agenda: [], docs: [], log: [{ ts: t - 2 * 3600000, text: 'Request partnership dikirim oleh Universitas Negeri Malang' }] },
      { id: 'pt2', problemId: 'p2', univId: 'u1', desaId: 'd3', status: 'proposal', createdAt: ago(12), message: 'Kami tertarik membantu monitoring air.', reservationEnds: ago(5), proposalEnds: t + 3 * DAY + 4 * 3600000, proposal: blankProp(), agenda: [{ id: 'g1', text: 'Survei titik sumber air', done: true }], docs: [], log: [{ ts: ago(12), text: 'Request partnership dikirim' }, { ts: ago(11), text: 'Desa menerima request — Reservation dimulai' }, { ts: ago(5), text: 'Tahap proposal dimulai (batas 7 hari)' }] },
      { id: 'pt3', problemId: 'p3', univId: 'u2', desaId: 'd2', status: 'matched', createdAt: ago(58), reservationEnds: ago(45), proposalEnds: ago(38), proposal: { status: 'accepted', title: 'Unit Kompos Komunal', file: { name: 'Proposal Unit Kompos.pdf', size: 210000, data: null }, coordinators: ['Rafi Aditya'], advisors: ['Ir. Bambang S.'], formation: 12, start: '2025-01-05', end: '2025-03-05', submittedAt: ago(40) }, agenda: [], docs: [doc('Proposal Unit Kompos.pdf', 'u2', ago(40))], log: [{ ts: ago(58), text: 'Request partnership dikirim' }, { ts: ago(45), text: 'Desa menerima request' }, { ts: ago(38), text: 'Proposal diterima — Matched' }] },
      { id: 'pt4', problemId: 'p4', univId: 'u1', desaId: 'd1', status: 'reserved', createdAt: ago(2), message: 'Kami punya pengalaman branding UMKM pangan.', reservationEnds: t + 5 * DAY + 14 * 3600000, proposal: null, agenda: [{ id: 'g2', text: 'Pemaparan kebutuhan', done: true }, { id: 'g3', text: 'Tanya jawab & klarifikasi', done: true }, { id: 'g4', text: 'Kesepakatan awal', done: false }], docs: [doc('Ringkasan Kebutuhan.pdf', 'd1', ago(1.5))], log: [{ ts: ago(2), text: 'Request partnership dikirim oleh Universitas Brawijaya' }, { ts: ago(1.7), text: 'Desa menerima request — Reservation dimulai (7 hari)' }] },
      { id: 'pt5', problemId: 'p5', univId: 'u1', desaId: 'd1', status: 'expired', createdAt: ago(44), reservationEnds: ago(30), proposal: null, agenda: [], docs: [], log: [{ ts: ago(44), text: 'Request partnership dikirim' }, { ts: ago(43), text: 'Desa menerima request' }, { ts: ago(30), text: 'Waktu reservation habis — Expired' }] },
      { id: 'pt6', problemId: 'p9', univId: 'u2', desaId: 'd1', status: 'matched', completed: true, createdAt: ago(290), reservationEnds: ago(280), proposalEnds: ago(272), proposal: { status: 'accepted', title: 'Pelatihan UMKM Digital', file: { name: 'Proposal Pelatihan UMKM.pdf', size: 180000, data: null }, coordinators: ['Rafi Aditya'], advisors: ['Ir. Bambang S.'], formation: 10, start: '2024-06-01', end: '2024-08-30', submittedAt: ago(275) }, agenda: [], docs: [doc('Proposal.pdf', 'u2', ago(275)), doc('Laporan akhir.pdf', 'u2', ago(200), 'report'), doc('Foto kegiatan (12 foto)', 'u2', ago(200), 'photo')], log: [{ ts: ago(290), text: 'Request partnership dikirim' }, { ts: ago(272), text: 'Proposal diterima — Matched' }, { ts: ago(200), text: 'KKN selesai dan didokumentasikan' }] }
    ];
    const N = (userId, type, text, link, hAgo, read = false) => ({ id: A.uid('n'), userId, type, text, link, ts: t - hAgo * 3600000, read });
    const notifs = [
      N('d1', 'partnership', 'Universitas Negeri Malang mengajukan partnership untuk Digitalisasi UMKM Desa', '#/partnerships/pt1', 2),
      N('d1', 'deadline', 'Masa diskusi dengan Universitas Brawijaya berakhir 5 hari lagi', '#/partnerships/pt4', 5),
      N('d1', 'status', 'Kebutuhan "Pengolahan Limbah Kopi" dipublikasikan', '#/desa/problem/p8', 72, true),
      N('u1', 'partnership', 'Desa Sumber Rejeki menerima request untuk Pemasaran Kopi Desa', '#/partnerships/pt4', 40),
      N('u1', 'deadline', 'Deadline proposal Monitoring Kualitas Air tinggal 3 hari', '#/partnerships/pt2', 6),
      N('u1', 'expire', 'Reservation "Pelatihan Literasi Digital" berakhir (Expired)', '#/partnerships/pt5', 24 * 30, true),
      N('a1', 'system', '3 akun baru menunggu verifikasi', '#/admin/verify', 1)
    ];
    const log = [
      { ts: t - 1 * 3600000, icon: 'user-plus', text: 'Pendaftaran baru: Universitas Merdeka' },
      { ts: t - 26 * 3600000, icon: 'user-plus', text: 'Pendaftaran baru: Desa Karangploso' },
      { ts: t - 2 * 3600000, icon: 'heart-handshake', text: 'Request partnership: Universitas Negeri Malang × Digitalisasi UMKM Desa' },
      { ts: t - 5 * DAY, icon: 'file-text', text: 'Tahap proposal dimulai: Monitoring Kualitas Air' },
      { ts: t - 30 * DAY, icon: 'hourglass-empty', text: 'Reservation expired: Pelatihan Literasi Digital' }
    ];
    return { v: VERSION, clock: 0, session: null, users, problems, partnerships, notifs, log };
  }

  /* --------------------------------------------------------------- storage */
  function save() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { A.toast && A.toast('Penyimpanan browser penuh. Gunakan berkas lebih kecil.', 'err'); } }
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) { D = JSON.parse(raw); if (D.v === VERSION) return; } } catch (e) { }
    try { Object.keys(localStorage).filter(k => k.startsWith('sumbangruang.demo.') && k !== KEY).forEach(k => localStorage.removeItem(k)); } catch (e) { }
    D = seed(); save();
  }
  A.now = () => Date.now() + (D ? D.clock || 0 : 0);
  const S = A.Store = { load, save, get data() { return D; } };
  S.reset = () => { D = seed(); D.clock = 0; save(); };

  /* ---------------------------------------------------------------- lookups */
  S.user = id => D.users.find(x => x.id === id);
  S.me = () => D.session ? S.user(D.session) : null;
  S.problem = id => D.problems.find(x => x.id === id);
  S.pship = id => D.partnerships.find(x => x.id === id);
  S.problemsOf = desaId => D.problems.filter(p => p.desaId === desaId);
  S.pshipsOf = user => D.partnerships.filter(p => user.role === 'desa' ? p.desaId === user.id : p.univId === user.id);
  S.requestsFor = problemId => D.partnerships.filter(p => p.problemId === problemId && p.status === 'requested');
  S.activePship = (problemId, univId) => D.partnerships.find(p => p.problemId === problemId && p.univId === univId && LOCKED.includes(p.status));
  S.lastPship = (problemId, univId) => D.partnerships.filter(p => p.problemId === problemId && p.univId === univId).sort((a, b) => b.createdAt - a.createdAt)[0];
  S.isLocked = p => LOCKED.includes(p.status);
  S.notifsOf = uid => D.notifs.filter(n => n.userId === uid).sort((a, b) => b.ts - a.ts);
  S.unread = uid => D.notifs.filter(n => n.userId === uid && !n.read).length;
  S.otherParty = (ps, me) => S.user(me.role === 'desa' ? ps.univId : ps.desaId);

  /* -------------------------------------------------------------- internals */
  const fail = m => { throw new Error(m); };
  const stamp = (ps, text) => ps.log.push({ ts: A.now(), text });
  const notify = (userId, type, text, link) => D.notifs.push({ id: A.uid('n'), userId, type, text, link, ts: A.now(), read: false });
  const logAct = (icon, text) => D.log.unshift({ ts: A.now(), icon, text });
  const nameOf = id => (S.user(id) || {}).name || '?';
  const unlock = (p, why) => { p.status = 'available'; p.partnershipId = null; logAct('lock-open', `Kebutuhan terbuka kembali: ${p.title} (${why})`); };
  const blankProp = () => ({ status: 'draft', title: '', file: null, coordinators: [], advisors: [], formation: '', start: '', end: '' });

  /* ------------------------------------------------------------------- auth */
  S.login = (email, password, role) => {
    const u = D.users.find(x => x.email.toLowerCase() === String(email).toLowerCase());
    if (!u || u.password !== password) fail('Email atau kata sandi salah.');
    const RL = { desa: 'Desa', univ: 'Universitas', admin: 'Super Admin' };
    if (role && u.role !== role) fail(`Akun ini terdaftar sebagai ${RL[u.role]}, bukan ${RL[role]}. Pilih peran yang sesuai.`);
    if (u.verified === 'pending') fail('Akun Anda masih menunggu verifikasi Super Admin (1–2 hari kerja).');
    if (u.verified === 'rejected') fail('Verifikasi akun ditolak. Hubungi admin untuk informasi lebih lanjut.');
    D.session = u.id; save(); return u;
  };
  S.logout = () => { D.session = null; save(); };
  S.register = f => {
    if (!f.name || !f.email || !f.password) fail('Lengkapi nama, email, dan kata sandi.');
    if (f.password.length < 6) fail('Kata sandi minimal 6 karakter.');
    if (D.users.some(x => x.email.toLowerCase() === f.email.toLowerCase())) fail('Email sudah terdaftar.');
    const docs = (f.docs || []).filter(x => x && x.name).map(x => x.name);
    if (!docs.length) fail('Unggah minimal satu dokumen pendukung untuk verifikasi.');
    const role = f.role === 'univ' ? 'univ' : 'desa', prefix = role === 'desa' ? 'Desa ' : 'Universitas ';
    const name = f.name.startsWith(prefix) ? f.name : prefix + f.name, city = f.city || 'Kab. Malang';
    const u = {
      id: A.uid(role === 'desa' ? 'd' : 'u'), role, email: f.email, password: f.password, name, verified: 'pending', createdAt: A.now(), docs, saved: [],
      vlog: [{ ts: A.now(), text: 'Pendaftaran diterima' }, { ts: A.now(), text: 'Menunggu peninjauan admin' }],
      profile: role === 'desa' ? { kecamatan: '', city, province: A.CITIES[city] || '', population: '', area: '', umkm: '', about: '', potentials: [], facilities: [], contactName: f.contactName || '', phone: f.phone || '', email: f.email }
        : { city, province: A.CITIES[city] || '', fields: [], programs: [], history: [], about: '', contactName: f.contactName || '', phone: f.phone || '', email: f.email }
    };
    D.users.push(u); logAct('user-plus', `Pendaftaran baru: ${name}`);
    D.users.filter(x => x.role === 'admin').forEach(a => notify(a.id, 'system', `Akun baru menunggu verifikasi: ${name}`, '#/admin/verify'));
    save(); return u;
  };
  S.verify = (userId, decision, note) => {
    const u = S.user(userId); if (!u) fail('Akun tidak ditemukan.');
    if (decision === 'reject' && !note) fail('Isi alasan penolakan.');
    u.verified = decision === 'approve' ? 'approved' : 'rejected';
    u.vlog.push({ ts: A.now(), text: decision === 'approve' ? 'Akun disetujui Super Admin' : 'Akun ditolak: ' + note });
    logAct(decision === 'approve' ? 'user-check' : 'user-x', `${u.name} ${decision === 'approve' ? 'diverifikasi' : 'ditolak verifikasinya'}`);
    save();
  };
  S.updateProfile = (userId, patch) => { const u = S.user(userId); Object.assign(u.profile, patch); if (patch.__name) { u.name = patch.__name; delete u.profile.__name; } save(); };
  S.toggleSave = (userId, problemId) => { const u = S.user(userId); u.saved = u.saved || []; const i = u.saved.indexOf(problemId); i >= 0 ? u.saved.splice(i, 1) : u.saved.push(problemId); save(); return i < 0; };
  S.addHistory = (userId, h) => { if (!h.title) fail('Judul program wajib diisi.'); S.user(userId).profile.history.push({ id: A.uid('h'), title: h.title, year: h.year || '-', desa: h.desa || '-', result: h.result || '-' }); save(); };
  S.delHistory = (userId, id) => { const pr = S.user(userId).profile; pr.history = pr.history.filter(x => x.id !== id); save(); };

  /* --------------------------------------------------------------- problems */
  S.saveProblem = (desaId, data, publish, id) => {
    const need = ['title', 'category', 'desc'];
    if (publish) {
      need.push('condition', 'need', 'target');
      for (const k of need) if (!String(data[k] || '').trim()) fail('Lengkapi semua bagian wajib sebelum mempublikasikan.');
      if (!data.skills || !data.skills.length) fail('Pilih minimal satu kompetensi yang dibutuhkan.');
    } else if (!String(data.title || '').trim()) fail('Isi judul kebutuhan terlebih dulu.');
    const d = S.user(desaId); let p = id && S.problem(id);
    const base = { title: data.title, category: data.category || 'Teknologi', desc: data.desc || '', condition: data.condition || '', need: data.need || '', target: data.target || '', duration: +data.duration || 2, skills: data.skills || [], teamMin: +data.teamMin || 3, teamMax: +data.teamMax || 5, city: d.profile.city, province: d.profile.province, deadline: data.deadline ? new Date(data.deadline).getTime() : A.now() + 30 * DAY };
    if (p) { if (!['draft', 'available', 'expired'].includes(p.status)) fail('Kebutuhan yang sedang diajukan atau berjalan tidak bisa diubah.'); Object.assign(p, base); }
    else { p = Object.assign({ id: A.uid('p'), desaId, createdAt: A.now(), partnershipId: null }, base); D.problems.push(p); }
    if (publish) {
      p.status = 'available'; logAct('plus', `Kebutuhan dipublikasikan: ${p.title}`); notify(desaId, 'status', `Kebutuhan "${p.title}" dipublikasikan`, '#/desa/problem/' + p.id);
      D.users.filter(u => u.role === 'univ' && u.verified === 'approved').forEach(u => notify(u.id, 'status', `Kebutuhan baru dipublikasikan: ${p.title} (${d.name})`, '#/univ/problem/' + p.id));
    } else if (p.status !== 'available') p.status = 'draft';
    save(); return p;
  };
  S.deleteProblem = id => { const p = S.problem(id); if (!['draft', 'available', 'expired'].includes(p.status)) fail('Kebutuhan yang diajukan atau berjalan tidak bisa dihapus.'); D.problems = D.problems.filter(x => x.id !== id); save(); };
  S.republish = id => { const p = S.problem(id); if (p.status !== 'expired') fail('Hanya kebutuhan Expired yang bisa dipublikasikan ulang.'); p.status = 'available'; p.partnershipId = null; p.deadline = A.now() + 30 * DAY; logAct('refresh', `Kebutuhan dipublikasikan ulang: ${p.title}`); save(); };

  /* ------------------------------------------------------------ partnership */
  S.requestPartnership = (problemId, univId, message) => {
    const p = S.problem(problemId), u = S.user(univId);
    if (!p) fail('Kebutuhan tidak ditemukan.');
    if (p.status !== 'available') fail(S.isLocked(p) ? 'Kebutuhan ini sedang diajukan/berjalan bersama universitas lain.' : 'Kebutuhan ini sudah tidak tersedia.');
    if (u.verified !== 'approved') fail('Akun belum terverifikasi.');
    const ps = { id: A.uid('pt'), problemId, univId, desaId: p.desaId, status: 'requested', createdAt: A.now(), message: message || '', proposal: null, agenda: [], docs: [], log: [] };
    stamp(ps, `Request partnership dikirim oleh ${u.name}`); D.partnerships.push(ps);
    p.status = 'requested'; p.partnershipId = ps.id;   // kebutuhan terkunci
    notify(p.desaId, 'partnership', `${u.name} mengajukan partnership untuk ${p.title}`, '#/partnerships/' + ps.id);
    logAct('heart-handshake', `Request partnership: ${u.name} × ${p.title}`); save(); return ps;
  };
  S.cancelRequest = id => {
    const ps = S.pship(id), p = S.problem(ps.problemId); if (ps.status !== 'requested') fail('Request sudah diproses.');
    ps.status = 'declined'; stamp(ps, 'Request dibatalkan oleh universitas'); unlock(p, 'request dibatalkan');
    notify(ps.desaId, 'reject', `${nameOf(ps.univId)} membatalkan request untuk ${p.title}`, '#/desa/problem/' + p.id); save();
  };
  S.declineRequest = id => {
    const ps = S.pship(id), p = S.problem(ps.problemId); if (ps.status !== 'requested') fail('Request sudah diproses.');
    ps.status = 'declined'; stamp(ps, 'Request ditolak oleh desa'); unlock(p, 'request ditolak');
    notify(ps.univId, 'reject', `Request untuk "${p.title}" ditolak desa`, '#/partnerships/' + id); save();
  };
  S.acceptRequest = id => {
    const ps = S.pship(id), p = S.problem(ps.problemId);
    if (ps.status !== 'requested') fail('Request sudah diproses.');
    ps.status = 'reserved'; ps.reservationEnds = A.now() + RESERVE_DAYS * DAY; p.status = 'reserved'; p.partnershipId = ps.id;
    stamp(ps, `Desa menerima request — Reservation dimulai (${RESERVE_DAYS} hari)`);
    notify(ps.univId, 'partnership', `${nameOf(p.desaId)} menerima request untuk ${p.title}`, '#/partnerships/' + id);
    logAct('heart-handshake', `Reserved: ${nameOf(ps.univId)} × ${p.title}`); save();
  };
  S.addAgenda = (id, text) => { if (!text.trim()) return; S.pship(id).agenda.push({ id: A.uid('g'), text: text.trim(), done: false }); save(); };
  S.toggleAgenda = (id, gid) => { const g = S.pship(id).agenda.find(x => x.id === gid); g.done = !g.done; save(); };
  S.addDoc = (id, userId, name, kind = 'pdf') => { if (!name) fail('Pilih berkas terlebih dulu.'); const ps = S.pship(id); ps.docs.push({ id: A.uid('x'), name, by: userId, ts: A.now(), kind }); stamp(ps, `${nameOf(userId)} menambahkan dokumen: ${name}`); save(); };
  S.startProposal = id => {
    const ps = S.pship(id), p = S.problem(ps.problemId);
    if (ps.status !== 'reserved') fail('Tahap proposal hanya bisa dimulai dari status Reserved.');
    ps.status = 'proposal'; ps.proposalEnds = A.now() + PROPOSAL_DAYS * DAY; p.status = 'proposal';
    ps.proposal = ps.proposal || blankProp();
    stamp(ps, `Masa diskusi selesai — tahap proposal dimulai (batas ${PROPOSAL_DAYS} hari)`);
    notify(ps.desaId, 'proposal', `${nameOf(ps.univId)} memulai penyusunan proposal untuk ${p.title}`, '#/partnerships/' + id);
    logAct('file-text', `Tahap proposal: ${p.title}`); save();
  };
  S.saveProposal = (id, data) => {
    const ps = S.pship(id);
    if (ps.status !== 'proposal') fail('Proposal tidak bisa diubah pada tahap ini.');
    if (['submitted', 'accepted'].includes(ps.proposal.status)) fail('Proposal sudah dikirim.');
    Object.assign(ps.proposal, data, { status: ps.proposal.status === 'revision' ? 'revision' : 'draft' }); save();
  };
  const checkProp = m => {
    if (!String(m.title || '').trim()) fail('Isi judul proposal.');
    if (!m.file) fail('Unggah berkas proposal (PDF).');
    if (!m.coordinators || !m.coordinators.length) fail('Tambahkan minimal satu koordinator KKN.');
    if (!m.advisors || !m.advisors.length) fail('Tambahkan minimal satu dosen pembimbing.');
    if (!(+m.formation >= 1)) fail('Isi jumlah formasi anggota KKN (total orang).');
    if (!m.start || !m.end) fail('Isi tanggal mulai dan selesai.');
    if (m.end < m.start) fail('Tanggal selesai harus setelah tanggal mulai.');
  };
  S.validateProposal = id => checkProp(S.pship(id).proposal);
  S.submitProposal = (id, data) => {
    const ps = S.pship(id), p = S.problem(ps.problemId);
    if (ps.status !== 'proposal') fail('Pengiriman proposal hanya pada tahap Proposal.');
    if (A.now() > ps.proposalEnds) fail('Waktu pengiriman proposal telah habis.');
    const m = Object.assign({}, ps.proposal, data);
    checkProp(m);
    Object.assign(ps.proposal, m, { formation: +m.formation, status: 'submitted', submittedAt: A.now(), reviewNote: '' });
    stamp(ps, 'Proposal dikirim ke desa');
    notify(ps.desaId, 'proposal', `Proposal baru dari ${nameOf(ps.univId)}: ${ps.proposal.title}`, '#/partnerships/' + id);
    logAct('inbox', `Proposal dikirim: ${p.title}`); save();
  };
  S.reviewProposal = (id, decision, note) => {
    const ps = S.pship(id), p = S.problem(ps.problemId);
    if (ps.proposal?.status !== 'submitted') fail('Tidak ada proposal yang menunggu review.');
    if (decision !== 'accept' && !note) fail('Berikan catatan untuk universitas.');
    ps.proposal.reviewNote = note || '';
    if (decision === 'accept') {
      ps.status = 'matched'; ps.proposal.status = 'accepted'; p.status = 'matched';
      stamp(ps, 'Proposal diterima — Matched');
      notify(ps.univId, 'status', `Proposal diterima! ${p.title} kini Matched`, '#/partnerships/' + id); logAct('circle-check', `Matched: ${nameOf(ps.univId)} × ${p.title}`);
    } else if (decision === 'revision') {
      ps.proposal.status = 'revision'; ps.proposalEnds = Math.max(ps.proposalEnds, A.now()) + 3 * DAY;
      stamp(ps, 'Desa meminta revisi proposal (+3 hari)');
      notify(ps.univId, 'proposal', `Desa meminta revisi proposal ${p.title}`, '#/partnerships/' + id);
    } else {
      ps.status = 'rejected'; ps.proposal.status = 'rejected'; unlock(p, 'proposal ditolak');
      stamp(ps, 'Proposal ditolak — Rejected');
      notify(ps.univId, 'reject', `Proposal untuk ${p.title} ditolak`, '#/partnerships/' + id); logAct('circle-x', `Rejected: ${nameOf(ps.univId)} × ${p.title}`);
    }
    save();
  };
  S.completePship = id => { const ps = S.pship(id); if (ps.status !== 'matched') fail('Hanya partnership Matched yang bisa diselesaikan.'); if (!ps.docs.some(d => d.kind === 'report' || /laporan/i.test(d.name))) fail('Unggah laporan akhir sebelum menandai selesai.'); ps.completed = true; stamp(ps, 'KKN selesai dan didokumentasikan'); notify(ps.desaId, 'status', 'KKN ditandai selesai', '#/partnerships/' + id); notify(ps.univId, 'status', 'KKN ditandai selesai', '#/partnerships/' + id); save(); };

  /* ------------------------------------------------------------ waktu & tick */
  S.tick = () => {
    let changed = false; const now = A.now();
    D.partnerships.forEach(ps => {
      const p = S.problem(ps.problemId); if (!p) return;
      const expire = why => { ps.status = 'expired'; stamp(ps, why); unlock(p, why); logAct('hourglass-empty', `Expired: ${p.title}`); notify(ps.desaId, 'expire', `${why}: ${p.title} terbuka kembali`, '#/partnerships/' + ps.id); notify(ps.univId, 'expire', `${why}: ${p.title}`, '#/partnerships/' + ps.id); changed = true; };
      if (ps.status === 'reserved' && now > ps.reservationEnds) expire('Waktu reservation habis (Expired)');
      else if (ps.status === 'proposal' && now > ps.proposalEnds && !['submitted', 'accepted'].includes(ps.proposal?.status)) expire('Waktu pengiriman proposal habis (Expired)');
      else if ((ps.status === 'reserved' || ps.status === 'proposal') && !ps._warn) {
        const end = ps.status === 'reserved' ? ps.reservationEnds : ps.proposalEnds;
        if (end - now < DAY && !(ps.proposal?.status === 'submitted')) { ps._warn = true; const w = `Waktu ${ps.status === 'reserved' ? 'diskusi' : 'proposal'} ${p.title} kurang dari 24 jam`; notify(ps.univId, 'deadline', w, '#/partnerships/' + ps.id); notify(ps.desaId, 'deadline', w, '#/partnerships/' + ps.id); changed = true; }
      }
    });
    D.problems.forEach(p => { if (p.status === 'available' && p.deadline < now) { p.status = 'expired'; changed = true; } });
    if (changed) save(); return changed;
  };
  S.advance = days => { D.clock = (D.clock || 0) + days * DAY; save(); return S.tick(); };
  S.resetClock = () => { D.clock = 0; save(); };
})(window.App);
