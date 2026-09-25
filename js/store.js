/* Data & logika bisnis (tanpa backend): disimpan di localStorage.
   Alur: Available -> universitas mengajukan kerja sama (payung, kuota N kelompok) -> Diajukan; desa menyetujui/menolak sekali (kedaluwarsa 7 hari tanpa respons)
   -> Disetujui: kontak kedua pihak terbuka, diskusi teknis di WhatsApp (di luar platform), admin univ mengundang koordinator KKN lewat tautan
   -> koordinator mengisi konfirmasi kesepakatan per kelompok, desa menekan "Sesuai" -> Aktif -> laporan & arsip.
   Kebutuhan terkunci selama ada pengajuan/kerja sama berjalan; terbuka lagi jika ditolak, dibatalkan, atau kedaluwarsa. */
window.App = window.App || {};
(function (A) {
  const KEY = 'sumbangruang.demo.v2', DAY = A.DAY, RESPONSE_DAYS = 7, NUDGE_DAYS = 5, MAX_REVISIONS = 2, VERSION = 5, MAX_ACTIVE = 5;
  const DEFAULT_API_BASES = ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3001'];
  let API_BASE = DEFAULT_API_BASES[0];
  const LOCKED = ['requested', 'connected', 'matched'];

  async function resolveApiBase() {
    for (const base of DEFAULT_API_BASES) {
      try {
        const response = await fetch(`${base}/api/health`, { method: 'GET', mode: 'cors', cache: 'no-store' });
        if (!response.ok) continue;
        const payload = await response.json().catch(() => null);
        if (payload && (payload.service === 'sevakarsa-backend' || payload.status === 'ok')) {
          API_BASE = base;
          return base;
        }
      } catch (error) {
        // Try the next port.
      }
    }

    const fallbackBase = DEFAULT_API_BASES.includes('http://localhost:3002') ? 'http://localhost:3002' : DEFAULT_API_BASES[0];
    API_BASE = fallbackBase;
    return fallbackBase;
  }
  resolveApiBase().catch(() => {});
  let D = null;
  A.LOCKED = LOCKED; A.MAX_ACTIVE = MAX_ACTIVE; A.MAX_REVISIONS = MAX_REVISIONS;

  async function apiJson(url, options = {}) {
    const resolvedBase = await resolveApiBase();
    let finalUrl = url;

    if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
      try {
        const parsed = new URL(url);
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
          finalUrl = `${resolvedBase}${parsed.pathname}${parsed.search}`;
        }
      } catch (error) {
        finalUrl = url;
      }
    } else if (typeof url === 'string') {
      finalUrl = `${resolvedBase}${url.startsWith('/') ? url : `/${url}`}`;
    }

    const response = await fetch(finalUrl, {
      credentials: 'include',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });

    const text = await response.text();
    let payload = null;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = { error: text || 'Request failed' }; }

    if (!response.ok) {
      const errorMessage = payload?.error || `Request failed (${response.status})`;
      throw new Error(errorMessage);
    }

    return payload;
  }

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
      u('u1', 'Universitas Brawijaya', 'univ@demo.ac.id', { fields: ['Teknologi', 'UMKM', 'Pertanian', 'Lingkungan'], programs: ['Teknik Informatika', 'Agribisnis', 'Manajemen', 'Teknologi Bioproses'], history: [H('Digitalisasi UMKM', '2024', 'Desa Tegalrejo', 'Selesai · 12 UMKM terlatih dan toko online aktif'), H('Pengelolaan sampah organik', '2023', 'Desa Sukamaju', 'Selesai · unit kompos komunal berjalan'), H('Literasi digital warga', '2022', 'Desa Pujon', 'Selesai · 40 warga mengikuti pelatihan')], about: 'Perguruan tinggi negeri yang berkomitmen pada pengabdian masyarakat melalui program KKN tematik berkelanjutan.', contactName: 'Nayla Putri', phone: '0812-8888-7777', email: 'kkn@ub.ac.id' }, ['Surat Tugas LPPM.pdf', 'SK Rektor.pdf'], 'approved', 120),
      u('u2', 'Universitas Negeri Malang', 'um@demo.ac.id', { fields: ['Pendidikan', 'Kesehatan', 'Teknologi'], programs: ['Pendidikan Teknik Informatika', 'Kesehatan Masyarakat'], history: [H('Pelatihan UMKM Digital', '2024', 'Desa Sumber Rejeki', 'Selesai · 12 UMKM dilatih'), H('Literasi digital', '2023', 'Desa Pujon', 'Selesai · 50 warga terlatih')], about: 'Fokus pada pendidikan, literasi digital, dan pelayanan kesehatan masyarakat desa.', contactName: 'Rafi Aditya', phone: '0813-4444-5555', email: 'kkn@um.ac.id' }, ['Surat Tugas LPPM.pdf'], 'approved', 110),
      u('u3', 'Universitas Merdeka', 'merdeka@demo.ac.id', { fields: ['Teknologi'], contactName: 'Ibu Wati' }, ['Surat Tugas.pdf', 'Akreditasi.pdf'], 'pending', 0.2)
    ];
    const P = (id, desaId, title, category, city, skills, dur, min, max, status, age, o = {}) => Object.assign({
      id, desaId, title, category, city, province: A.CITIES[city] || 'Jawa Timur', skills, duration: dur, teamMin: min, teamMax: max, status, createdAt: ago(age), deadline: t + 30 * DAY, partnershipId: null,
      desc: '', condition: '', need: '', target: ''
    }, o);
    const problems = [
      P('p1', 'd1', 'Digitalisasi UMKM Desa', 'Teknologi', 'Kab. Malang', ['Web Development', 'UI/UX Design', 'Bisnis', 'Data Analysis'], 2, 3, 5, 'requested', 12, { partnershipId: 'pt1', desc: 'UMKM lokal belum terdigitalisasi sehingga jangkauan pemasaran terbatas dan pencatatan produk dilakukan manual.', condition: 'Terdapat balai desa, akses internet, dan 10 UMKM aktif yang siap dilibatkan. Belum ada toko online maupun pencatatan digital.', need: 'Platform toko online sederhana, pelatihan pemasaran digital, dan panduan penggunaan yang mudah dipahami pelaku UMKM.', target: 'Toko online aktif untuk minimal 10 UMKM, 3 sesi pelatihan, panduan pengguna, dan laporan hasil.' }),
      P('p2', 'd3', 'Sistem Monitoring Kualitas Air', 'Lingkungan', 'Kab. Malang', ['IoT', 'Data Analysis', 'Web Development'], 3, 3, 4, 'connected', 30, { partnershipId: 'pt2', desc: 'Kualitas air sumber desa belum dipantau secara berkala.', condition: 'Ada 3 titik sumber air dan posyandu yang menjadi pusat informasi.', need: 'Sensor sederhana dan dasbor pemantauan yang bisa dibaca perangkat desa.', target: 'Dasbor pemantauan aktif dan SOP tindak lanjut kualitas air.' }),
      P('p3', 'd2', 'Pengelolaan Sampah Organik', 'Lingkungan', 'Kab. Pasuruan', ['Bioteknologi', 'Agribisnis'], 2, 3, 4, 'matched', 60, { partnershipId: 'pt3', desc: 'Sampah organik rumah tangga menumpuk di TPS desa.', condition: 'Belum ada fasilitas pengomposan.', need: 'Sistem pengomposan komunal dan pelatihan warga.', target: 'Unit kompos aktif dan 30 warga terlatih.' }),
      P('p4', 'd1', 'Pemasaran Kopi Desa', 'UMKM', 'Kab. Malang', ['Pemasaran Digital', 'Bisnis', 'Desain Grafis'], 1, 3, 4, 'connected', 20, { partnershipId: 'pt4', desc: 'Kopi desa belum memiliki merek dan kanal pemasaran yang jelas.', condition: 'Produksi kopi rutin, kemasan masih sederhana.', need: 'Branding, kemasan, dan strategi pemasaran digital.', target: 'Merek kopi, katalog produk, dan akun pemasaran aktif.' }),
      P('p5', 'd1', 'Pelatihan Literasi Digital', 'Pendidikan', 'Kab. Malang', ['Pendidikan', 'Web Development'], 1, 2, 4, 'expired', 45, { desc: 'Warga belum akrab dengan layanan digital dasar.', condition: 'Aula tersedia, perangkat terbatas.', need: 'Pelatihan literasi digital untuk warga.', target: '50 warga mengikuti pelatihan.' }),
      P('p6', 'd2', 'Wisata Desa Berbasis Digital', 'Teknologi', 'Kab. Pasuruan', ['Web Development', 'Desain Grafis', 'Pemasaran Digital'], 2, 3, 5, 'available', 8, { desc: 'Wisata pantai belum punya situs dan sistem pemesanan.', condition: 'Pengunjung ramai di akhir pekan tanpa pencatatan.', need: 'Situs wisata, peta digital, dan sistem tiket sederhana.', target: 'Situs wisata live dan pengelola terlatih.' }),
      P('p7', 'd3', 'Posyandu Digital', 'Kesehatan', 'Kab. Malang', ['Kesehatan Masyarakat', 'Web Development', 'Data Analysis'], 3, 3, 4, 'available', 5, { desc: 'Pencatatan posyandu masih manual dan sulit direkap.', condition: 'Ada 4 posyandu aktif dengan kader terlatih.', need: 'Aplikasi pencatatan dan rekap sederhana.', target: 'Aplikasi terpakai di 4 posyandu.' }),
      P('p8', 'd1', 'Pengolahan Limbah Kopi', 'Lingkungan', 'Kab. Malang', ['Bioteknologi', 'Agribisnis'], 2, 3, 4, 'available', 3, { desc: 'Kulit kopi hasil olahan belum dimanfaatkan.', condition: 'Limbah menumpuk saat panen raya.', need: 'Pengolahan kulit kopi menjadi produk bernilai.', target: 'Produk turunan dan pelatihan pengolahan.' }),
      P('p9', 'd1', 'Pelatihan UMKM Digital 2024', 'UMKM', 'Kab. Malang', ['Bisnis', 'Pemasaran Digital'], 3, 3, 4, 'matched', 300, { partnershipId: 'pt6', desc: 'Pelatihan UMKM (arsip).' })
    ];
    const doc = (name, by, ts, kind = 'pdf') => ({ id: A.uid('x'), name, by, ts, kind });
    const coord = (id, name, phone, email) => ({ id, name, phone, email, token: 'tk-' + id, ts: ago(3) });
    const grp = (id, cid, name, status, o = {}) => Object.assign({ id, coordinatorId: cid, name, dpl: 'Dr. Rina W., M.T.', students: 4, start: '2025-07-01', end: '2025-08-30', program: '', note: '', status, submittedAt: null, reviewNote: '', revisions: 0 }, o);
    const partnerships = [
      { id: 'pt1', problemId: 'p1', univId: 'u2', desaId: 'd1', status: 'requested', createdAt: t - 2 * 3600000, message: 'Tim kami berpengalaman melatih UMKM digital dan siap membantu digitalisasi.', quota: 2, responseEnds: t + RESPONSE_DAYS * DAY - 2 * 3600000, coordinators: [coord('k5', 'Rafi Aditya', '0813-4444-5555', 'rafi@um.ac.id')], groups: [], docs: [], log: [{ ts: t - 2 * 3600000, text: 'Kerja sama diajukan oleh Universitas Negeri Malang (kuota 2 kelompok) — menunggu persetujuan desa' }] },
      { id: 'pt2', problemId: 'p2', univId: 'u1', desaId: 'd3', status: 'connected', createdAt: ago(12), approvedAt: ago(6), _nudge: true, message: 'Kami tertarik membantu monitoring air.', quota: 2, coordinators: [coord('k1', 'Bu Dewi Lestari', '0857-1122-3344', 'dewi@ub.ac.id')], groups: [], docs: [], log: [{ ts: ago(12), text: 'Kerja sama diajukan oleh Universitas Brawijaya (kuota 2 kelompok) — menunggu persetujuan desa' }, { ts: ago(6), text: 'Desa menyetujui kerja sama — kontak kedua pihak terbuka' }, { ts: ago(5), text: 'Koordinator diundang: Bu Dewi Lestari' }] },
      { id: 'pt3', problemId: 'p3', univId: 'u2', desaId: 'd2', status: 'matched', createdAt: ago(58), approvedAt: ago(50), activeAt: ago(40), message: '', quota: 1, coordinators: [coord('k3', 'Rafi Aditya', '0813-4444-5555', 'rafi@um.ac.id')], groups: [grp('g3', 'k3', 'Kelompok 1 · Tim Kompos', 'confirmed', { dpl: 'Ir. Bambang S.', students: 12, start: '2025-01-05', end: '2025-03-05', program: 'Unit kompos komunal dan pelatihan warga', submittedAt: ago(41) })], docs: [], log: [{ ts: ago(58), text: 'Kerja sama diajukan oleh Universitas Negeri Malang' }, { ts: ago(50), text: 'Desa menyetujui kerja sama — kontak kedua pihak terbuka' }, { ts: ago(40), text: 'Kerja sama aktif' }] },
      { id: 'pt4', problemId: 'p4', univId: 'u1', desaId: 'd1', status: 'connected', createdAt: ago(2), approvedAt: ago(1.7), message: 'Kami punya pengalaman branding UMKM pangan.', quota: 3, coordinators: [coord('k2', 'Pak Raka Aditya', '0821-9988-7766', 'raka@ub.ac.id')], groups: [grp('g2', 'k2', 'Kelompok 1 · Tim Branding', 'submitted', { students: 5, program: 'Merek kopi desa, katalog produk, dan akun pemasaran aktif', note: 'Akomodasi di balai desa, pelatihan hari Sabtu.', submittedAt: ago(0.2) })], docs: [doc('Ringkasan Kebutuhan.pdf', 'd1', ago(1.5))], log: [{ ts: ago(2), text: 'Kerja sama diajukan oleh Universitas Brawijaya (kuota 3 kelompok) — menunggu persetujuan desa' }, { ts: ago(1.7), text: 'Desa menyetujui kerja sama — kontak kedua pihak terbuka' }, { ts: ago(1.6), text: 'Koordinator diundang: Pak Raka Aditya' }, { ts: ago(0.2), text: 'Koordinator mengirim konfirmasi kesepakatan: Kelompok 1 · Tim Branding' }] },
      { id: 'pt5', problemId: 'p5', univId: 'u1', desaId: 'd1', status: 'expired', createdAt: ago(44), responseEnds: ago(37), message: '', quota: 1, coordinators: [], groups: [], docs: [], log: [{ ts: ago(44), text: 'Kerja sama diajukan oleh Universitas Brawijaya' }, { ts: ago(37), text: 'Desa tidak merespons dalam 7 hari (Kedaluwarsa)' }] },
      { id: 'pt6', problemId: 'p9', univId: 'u2', desaId: 'd1', status: 'matched', completed: true, createdAt: ago(290), approvedAt: ago(285), activeAt: ago(272), message: '', quota: 1, coordinators: [coord('k4', 'Rafi Aditya', '0813-4444-5555', 'rafi@um.ac.id')], groups: [grp('g4', 'k4', 'Kelompok 1 · Tim UMKM', 'confirmed', { dpl: 'Ir. Bambang S.', students: 10, start: '2024-06-01', end: '2024-08-30', program: 'Pelatihan UMKM digital', submittedAt: ago(273) })], docs: [doc('Kesepakatan.pdf', 'u2', ago(275)), doc('Laporan akhir.pdf', 'u2', ago(200), 'report'), doc('Foto kegiatan (12 foto)', 'u2', ago(200), 'photo')], log: [{ ts: ago(290), text: 'Kerja sama diajukan oleh Universitas Negeri Malang' }, { ts: ago(272), text: 'Kerja sama aktif' }, { ts: ago(200), text: 'KKN selesai dan didokumentasikan' }] }
    ];
    const N = (userId, type, text, link, hAgo, read = false) => ({ id: A.uid('n'), userId, type, text, link, ts: t - hAgo * 3600000, read });
    const notifs = [
      N('d1', 'partnership', 'Universitas Negeri Malang mengajukan kerja sama untuk Digitalisasi UMKM Desa (2 kelompok) — menunggu persetujuan Anda', '#/partnerships/pt1', 2),
      N('d1', 'agreement', 'Universitas Brawijaya mengirim konfirmasi kesepakatan Kelompok 1 · Tim Branding (Pemasaran Kopi Desa) — mohon dikonfirmasi', '#/partnerships/pt4', 5),
      N('d1', 'status', 'Kebutuhan "Pengolahan Limbah Kopi" dipublikasikan', '#/desa/problem/p8', 72, true),
      N('u1', 'status', 'Desa Sumber Rejeki menyetujui kerja sama Pemasaran Kopi Desa. Kontak terbuka, lanjutkan diskusi via WhatsApp', '#/partnerships/pt4', 40),
      N('u1', 'deadline', 'Pengingat: konfirmasi kesepakatan Monitoring Kualitas Air belum diisi koordinator', '#/partnerships/pt2', 6),
      N('u1', 'expire', 'Pengajuan "Pelatihan Literasi Digital" kedaluwarsa (desa tidak merespons)', '#/partnerships/pt5', 24 * 30, true),
      N('a1', 'system', '3 akun baru menunggu verifikasi', '#/admin/verify', 1)
    ];
    const log = [
      { ts: t - 1 * 3600000, icon: 'user-plus', text: 'Pendaftaran baru: Universitas Merdeka' },
      { ts: t - 26 * 3600000, icon: 'user-plus', text: 'Pendaftaran baru: Desa Karangploso' },
      { ts: t - 2 * 3600000, icon: 'heart-handshake', text: 'Kerja sama diajukan: Universitas Negeri Malang × Digitalisasi UMKM Desa' },
      { ts: t - 5 * DAY, icon: 'user-plus', text: 'Koordinator diundang: Bu Dewi Lestari (Monitoring Kualitas Air)' },
      { ts: t - 37 * DAY, icon: 'hourglass-empty', text: 'Kedaluwarsa: Pelatihan Literasi Digital' }
    ];
    return { v: VERSION, clock: 0, session: null, sessionUser: null, users, problems, partnerships, notifs, log };
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
  S.reset = () => { D = seed(); D.clock = 0; D.sessionUser = null; save(); };

  function normalizeProfile(rawProfile = {}, rawUser = {}) {
    const profile = rawProfile || {};
    const role = String(profile.role || rawUser.user_metadata?.role || 'desa').toLowerCase();
    const name = String(profile.nama || rawUser.user_metadata?.nama || rawUser.email || 'Pengguna').trim();
    const city = profile.kota || profile.city || 'Kab. Malang';
    const province = profile.provinsi || profile.province || 'Jawa Timur';
    return {
      id: rawUser.id || profile.user_id || profile.id,
      role,
      email: rawUser.email || profile.email_kontak || profile.email || '',
      name,
      verified: profile.status_verifikasi === 'approved' ? 'approved' : profile.status_verifikasi === 'rejected' ? 'rejected' : 'pending',
      createdAt: Date.now(),
      profile: {
        ...profile,
        city,
        province,
        about: profile.tentang || profile.about || '',
        contactName: profile.nama_kontak || profile.contactName || name,
        phone: profile.nomor_hp || profile.phone || '',
        email: profile.email_kontak || profile.email || rawUser.email || '',
        kecamatan: profile.kecamatan || '',
        population: profile.jumlah_penduduk ?? profile.population ?? '',
        area: profile.luas_km2 ?? profile.area ?? '',
        umkm: profile.jumlah_umkm ?? profile.umkm ?? '',
        potentials: Array.isArray(profile.potensi) ? profile.potensi : (Array.isArray(profile.potentials) ? profile.potentials : []),
        facilities: Array.isArray(profile.fasilitas) ? profile.fasilitas : (Array.isArray(profile.facilities) ? profile.facilities : []),
        fields: Array.isArray(profile.bidang_keahlian) ? profile.bidang_keahlian : (Array.isArray(profile.fields) ? profile.fields : []),
        programs: Array.isArray(profile.program_studi) ? profile.program_studi : (Array.isArray(profile.programs) ? profile.programs : []),
        history: Array.isArray(profile.program_tercatat) ? profile.program_tercatat : (Array.isArray(profile.history) ? profile.history : []),
      },
    };
  }

  S.syncProblemsFromBackend = async () => {
    if (!D || !D.session) return [];

    try {
      const payload = await apiJson(`${API_BASE}/api/kebutuhan`);
      const remoteProblems = Array.isArray(payload?.data) ? payload.data.map(item => ({
        id: item.id,
        desaId: item.desaId || item.desa?.id || D.session,
        title: item.title || '',
        category: item.category || 'Teknologi',
        desc: item.desc || '',
        condition: item.condition || '',
        need: item.need || '',
        target: item.target || '',
        duration: Number(item.duration || 2),
        skills: Array.isArray(item.skills) ? item.skills : [],
        teamMin: Number(item.teamMin || 3),
        teamMax: Number(item.teamMax || 5),
        city: item.city || 'Kab. Malang',
        province: item.province || 'Jawa Timur',
        status: item.status || 'draft',
        createdAt: item.createdAt || Date.now(),
        deadline: item.deadline || Date.now() + 30 * DAY,
        partnershipId: null,
      })) : [];

      if (!remoteProblems.length) return [];

      const remoteIds = new Set(remoteProblems.map(item => item.id));
      const merged = [...D.problems.filter(problem => !remoteIds.has(problem.id)), ...remoteProblems];
      D.problems = merged;
      save();
      return remoteProblems;
    } catch (error) {
      console.warn('Problem sync from backend failed:', error);
      return [];
    }
  };

  S.refreshSession = async () => {
    try {
      const data = await apiJson(`${API_BASE}/api/auth/me`);
      if (!data?.user) return D.sessionUser;
      const normalized = normalizeProfile(data.profile, data.user);
      D.sessionUser = normalized;
      D.session = normalized.id;
      save();
      await S.syncProblemsFromBackend();
      return normalized;
    } catch (error) {
      console.warn('Session refresh failed:', error);
      return D.sessionUser;
    }
  };

  /* ---------------------------------------------------------------- lookups */
  S.user = id => {
    if (!id) return null;
    const local = D.users.find(x => x.id === id);
    if (local) return local;
    if (D.sessionUser && D.sessionUser.id === id) return D.sessionUser;
    return null;
  };
  S.me = () => {
    if (!D.session) return null;
    if (D.sessionUser && D.sessionUser.id === D.session) return D.sessionUser;
    return S.user(D.session);
  };
  S.problem = id => D.problems.find(x => x.id === id);
  S.pship = id => D.partnerships.find(x => x.id === id);
  S.problemsOf = desaId => D.problems.filter(p => p.desaId === desaId);
  S.pshipsOf = user => D.partnerships.filter(p => user.role === 'desa' ? p.desaId === user.id : p.univId === user.id);
  S.activeCount = (desaId, exceptId) => D.problems.filter(p => p.desaId === desaId && p.id !== exceptId && ['available', 'requested', 'connected'].includes(p.status)).length;
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

  /* ------------------------------------------------------------------- auth */
  S.login = async (email, password, role) => {
    const emailValue = String(email || '').trim();
    const passwordValue = String(password || '');

    try {
      const data = await apiJson(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: emailValue, password: passwordValue }),
      });

      if (data?.user) {
        const user = data.user;
        const profile = data.profile || {};
        const normalized = normalizeProfile(profile, user);
        const fallbackUser = {
          ...normalized,
          docs: [],
          saved: [],
          vlog: [],
        };
        D.sessionUser = fallbackUser;
        D.session = fallbackUser.id;
        save();
        await S.syncProblemsFromBackend();
        return fallbackUser;
      }
    } catch (error) {
      console.warn('Backend auth unavailable, fallback to local demo login:', error);
    }

    const u = D.users.find(x => x.email.toLowerCase() === emailValue.toLowerCase());
    if (!u || u.password !== passwordValue) fail('Email atau kata sandi salah.');
    const RL = { desa: 'Desa', univ: 'Universitas', admin: 'Super Admin' };
    if (role && u.role !== role) fail(`Akun ini terdaftar sebagai ${RL[u.role]}, bukan ${RL[role]}. Pilih peran yang sesuai.`);
    if (u.verified === 'pending') fail('Akun Anda masih menunggu verifikasi Super Admin (1–2 hari kerja).');
    if (u.verified === 'rejected') fail('Verifikasi akun ditolak. Hubungi admin untuk informasi lebih lanjut.');
    D.sessionUser = null;
    D.session = u.id; save(); return u;
  };
  S.logout = async () => {
    try {
      await apiJson(`${API_BASE}/api/auth/logout`, { method: 'POST' });
    } catch (error) {
      console.warn('Backend logout unavailable:', error);
    }
    D.sessionUser = null;
    D.session = null; save();
  };
  S.register = async f => {
    const payload = {
      email: String(f.email || '').trim(),
      password: String(f.password || ''),
      role: String(f.role || 'desa').trim().toLowerCase(),
      nama: String(f.name || '').trim(),
      kota: f.city || null,
      provinsi: null,
      alamat: null,
      nomor_hp: f.phone || null,
    };

    try {
      const response = await apiJson(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response?.success) {
        return { id: response.user?.id, role: payload.role, email: payload.email, name: payload.nama, verified: 'pending' };
      }
    } catch (error) {
      console.warn('Backend register unavailable, fallback to local demo register:', error);
    }

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
  S.updateProfile = async (userId, patch) => {
    const u = S.user(userId);
    if (!u) fail('Akun tidak ditemukan.');

    const role = String(u.role || 'desa').toLowerCase();
    const profile = { ...(u.profile || {}) };
    Object.assign(profile, patch);
    if (patch.__name) {
      profile.__name = patch.__name;
    }

    const payload = role === 'univ' ? {
      nama: patch.__name || u.name,
      kota: profile.city || u.profile?.city || null,
      provinsi: profile.province || u.profile?.province || null,
      tentang: profile.about || null,
      bidang_keahlian: Array.isArray(profile.fields) ? profile.fields : [],
      program_studi: Array.isArray(profile.programs) ? profile.programs : [],
      program_tercatat: Array.isArray(profile.history) ? profile.history : [],
      email_kontak: profile.email || u.email || null,
      nomor_hp: profile.phone || null,
    } : {
      nama: patch.__name || u.name,
      kota: profile.city || u.profile?.city || null,
      provinsi: profile.province || u.profile?.province || null,
      kecamatan: profile.kecamatan || null,
      jumlah_penduduk: profile.population || null,
      luas_km2: profile.area || null,
      jumlah_umkm: profile.umkm || null,
      tentang: profile.about || null,
      potensi: Array.isArray(profile.potentials) ? profile.potentials : [],
      fasilitas: Array.isArray(profile.facilities) ? profile.facilities : [],
      nama_kontak: profile.contactName || null,
      email_kontak: profile.email || u.email || null,
      nomor_hp: profile.phone || null,
    };

    const endpoint = role === 'univ' ? `${API_BASE}/api/universitas` : `${API_BASE}/api/desa`;
    const response = await apiJson(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const serverProfile = response?.data?.profile || response?.profile || {};
    const normalized = normalizeProfile(serverProfile, {
      id: u.id,
      email: serverProfile.email_kontak || u.email,
      user_metadata: { role, nama: serverProfile.nama || u.name },
    });

    const updatedUser = {
      ...u,
      ...normalized,
      name: normalized.name || u.name,
      profile: {
        ...(u.profile || {}),
        ...(normalized.profile || {}),
        ...profile,
        city: normalized.profile?.city || profile.city || u.profile?.city,
        province: normalized.profile?.province || profile.province || u.profile?.province,
      },
    };
    delete updatedUser.profile.__name;

    const idx = D.users.findIndex(x => x.id === userId);
    if (idx >= 0) D.users[idx] = updatedUser;
    if (D.session === userId) D.sessionUser = updatedUser;
    save();
    return updatedUser;
  };
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
      if (S.activeCount(desaId, id) >= MAX_ACTIVE) fail(`Maksimal ${MAX_ACTIVE} kebutuhan aktif per desa. Selesaikan atau hapus salah satu terlebih dulu.`);
    } else if (!String(data.title || '').trim()) fail('Isi judul kebutuhan terlebih dulu.');
    const d = S.user(desaId); let p = id && S.problem(id);
    const base = { title: data.title, category: data.category || 'Teknologi', desc: data.desc || '', condition: data.condition || '', need: data.need || '', target: data.target || '', duration: +data.duration || 2, skills: data.skills || [], teamMin: +data.teamMin || 3, teamMax: +data.teamMax || 5, city: d.profile.city, province: d.profile.province, deadline: data.deadline ? new Date(data.deadline).getTime() : A.now() + 30 * DAY };
    if (p) { if (!['draft', 'available', 'expired'].includes(p.status)) fail('Kebutuhan yang sedang diajukan atau berjalan tidak bisa diubah.'); Object.assign(p, base); }
    else { p = Object.assign({ id: A.uid('p'), desaId, createdAt: A.now(), partnershipId: null }, base); D.problems.push(p); }
    if (publish) {
      p.status = 'available'; logAct('plus', `Kebutuhan dipublikasikan: ${p.title}`); notify(desaId, 'status', `Kebutuhan "${p.title}" dipublikasikan`, '#/desa/problem/' + p.id);
      D.users.filter(u => u.role === 'univ' && u.verified === 'approved').forEach(u => notify(u.id, 'status', `Kebutuhan baru dipublikasikan: ${p.title} (${d.name})`, '#/univ/problem/' + p.id));
    } else if (p.status !== 'available') p.status = 'draft';
    save();

    const payload = {
      judul: base.title,
      kategori: base.category,
      deskripsi: base.desc,
      kondisi_saat_ini: base.condition,
      kebutuhan_diharapkan: base.need,
      target_output: base.target,
      status: publish ? 'available' : 'draft',
      kompetensi: base.skills,
    };

    const endpoint = id ? `${API_BASE}/api/kebutuhan/${id}` : `${API_BASE}/api/kebutuhan`;
    const method = id ? 'PUT' : 'POST';

    resolveApiBase().then(async (base) => {
      const resolvedEndpoint = id ? `${base}/api/kebutuhan/${id}` : `${base}/api/kebutuhan`;
      return fetch(resolvedEndpoint, {
        method,
        credentials: 'include',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }).then(async response => {
      const text = await response.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch { json = { error: text || 'Request failed' }; }
      if (!response.ok) throw new Error(json?.error || 'Gagal menyimpan kebutuhan ke database.');
      if (json?.data) {
        const item = json.data;
        p.id = item.id || p.id;
        p.title = item.title || p.title;
        p.category = item.category || p.category;
        p.desc = item.desc || p.desc;
        p.condition = item.condition || p.condition;
        p.need = item.need || p.need;
        p.target = item.target || p.target;
        p.status = item.status || p.status;
        p.skills = Array.isArray(item.skills) ? item.skills : p.skills;
        if (!id) { D.problems = D.problems.filter(x => x.id !== p.id); D.problems.push(p); }
        save();
      }
    }).catch(error => {
      console.warn('Backend kebutuhan sync failed, using local demo data:', error);
    });

    return p;
  };
  S.deleteProblem = async id => { const p = S.problem(id); if (!['draft', 'available', 'expired'].includes(p.status)) fail('Kebutuhan yang diajukan atau berjalan tidak bisa dihapus.'); D.problems = D.problems.filter(x => x.id !== id); save(); const base = await resolveApiBase(); fetch(`${base}/api/kebutuhan/${id}`, { method: 'DELETE', credentials: 'include', mode: 'cors' }).catch(() => {}); };
  S.republish = async id => { const p = S.problem(id); if (p.status !== 'expired') fail('Hanya kebutuhan Expired yang bisa dipublikasikan ulang.'); p.status = 'available'; p.partnershipId = null; p.deadline = A.now() + 30 * DAY; logAct('refresh', `Kebutuhan dipublikasikan ulang: ${p.title}`); save(); const base = await resolveApiBase(); fetch(`${base}/api/kebutuhan/${id}`, { method: 'PUT', credentials: 'include', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'available' }) }).catch(() => {}); };

  /* ------------------------------------------------------------ kerja sama (payung) */
  const ACTIVE_PS = ['requested', 'connected', 'matched'];
  S.requestPartnership = (problemId, univId, opts = {}) => {
    const p = S.problem(problemId), u = S.user(univId);
    if (!p) fail('Kebutuhan tidak ditemukan.');
    if (p.status !== 'available') fail(S.isLocked(p) ? 'Kebutuhan ini sedang diajukan/berjalan bersama universitas lain.' : 'Kebutuhan ini sudah tidak tersedia.');
    if (u.verified !== 'approved') fail('Akun belum terverifikasi.');
    const quota = Math.max(1, Math.min(20, +opts.quota || 1)), plan = { period: String(opts.period || '').trim(), students: opts.students ? Math.max(1, +opts.students || 0) : '' };
    const ps = { id: A.uid('pt'), problemId, univId, desaId: p.desaId, status: 'requested', createdAt: A.now(), responseEnds: A.now() + RESPONSE_DAYS * DAY, message: opts.message || '', quota, plan, coordinators: [], groups: [], docs: [], log: [] };
    stamp(ps, `Kerja sama diajukan oleh ${u.name} (kuota ${quota} kelompok) — menunggu persetujuan desa`); D.partnerships.push(ps);
    p.status = 'requested'; p.partnershipId = ps.id;   // terkunci untuk universitas lain sampai desa merespons
    notify(p.desaId, 'partnership', `${u.name} mengajukan kerja sama untuk ${p.title} (${quota} kelompok) — menunggu persetujuan Anda`, '#/partnerships/' + ps.id);
    logAct('heart-handshake', `Kerja sama diajukan: ${u.name} × ${p.title}`); save(); return ps;
  };
  S.cancelRequest = id => {
    const ps = S.pship(id), p = S.problem(ps.problemId);
    if (ps.status !== 'requested') fail('Kerja sama yang sudah disetujui desa tidak bisa dibatalkan sepihak oleh universitas.');
    ps.status = 'declined'; stamp(ps, 'Universitas membatalkan kerja sama'); unlock(p, 'universitas mundur');
    notify(ps.desaId, 'reject', `${nameOf(ps.univId)} membatalkan kerja sama ${p.title}`, '#/desa/problem/' + p.id); save();
  };
  S.respondRequest = (id, decision, note) => {
    const ps = S.pship(id), p = S.problem(ps.problemId);
    if (ps.status !== 'requested') fail('Pengajuan ini sudah direspons.');
    if (decision === 'approve') {
      ps.status = 'connected'; ps.approvedAt = A.now(); p.status = 'connected';
      stamp(ps, 'Desa menyetujui kerja sama — kontak kedua pihak terbuka');
      notify(ps.univId, 'status', `${nameOf(ps.desaId)} menyetujui kerja sama ${p.title}. Kontak terbuka, lanjutkan diskusi via WhatsApp`, '#/partnerships/' + id);
      logAct('circle-check', `Kerja sama disetujui: ${nameOf(ps.univId)} × ${p.title}`);
    } else {
      ps.status = 'rejected'; ps.rejectNote = note || ''; unlock(p, 'ditolak desa');
      stamp(ps, 'Desa menolak kerja sama' + (note ? ': ' + note : ''));
      notify(ps.univId, 'reject', `${nameOf(ps.desaId)} menolak kerja sama ${p.title}`, '#/partnerships/' + id); logAct('circle-x', `Kerja sama ditolak: ${nameOf(ps.univId)} × ${p.title}`);
    }
    save();
  };

  /* koordinator KKN: diundang admin univ lewat tautan (tanpa akun) */
  S.inviteCoordinator = (id, f) => {
    const ps = S.pship(id); if (!ACTIVE_PS.includes(ps.status)) fail('Koordinator hanya bisa diundang pada kerja sama yang masih berjalan.');
    const name = String(f.name || '').trim(), phone = String(f.phone || '').trim(), email = String(f.email || '').trim();
    if (!name) fail('Isi nama koordinator.');
    if (!phone) fail('Isi nomor WhatsApp koordinator agar desa bisa menghubungi.');
    if (ps.coordinators.some(c => c.phone === phone)) fail('Nomor ini sudah diundang.');
    const c = { id: A.uid('k'), name, phone, email, token: A.uid('') + A.uid(''), ts: A.now() };
    ps.coordinators.push(c); stamp(ps, `Koordinator diundang: ${name}`); save(); return c;
  };
  S.removeCoordinator = (id, cid) => {
    const ps = S.pship(id); if (ps.groups.some(g => g.coordinatorId === cid)) fail('Koordinator ini sudah memiliki kelompok.');
    ps.coordinators = ps.coordinators.filter(c => c.id !== cid); save();
  };
  S.slots = ps => ps.groups.filter(g => g.status !== 'closed').length;   // kelompok yang ditutup desa melepas kuota
  S.coordinatorByToken = token => { for (const ps of D.partnerships) { const c = ps.coordinators.find(x => x.token === token); if (c) return { ps, c }; } return null; };

  /* kelompok KKN + konfirmasi kesepakatan (hasil diskusi WhatsApp) */
  const checkGroup = g => {
    if (!String(g.name || '').trim()) fail('Isi nama kelompok.');
    if (!String(g.dpl || '').trim()) fail('Isi nama dosen pembimbing (DPL).');
    if (!(+g.students >= 1)) fail('Isi jumlah mahasiswa.');
    if (!g.start || !g.end) fail('Isi tanggal mulai dan selesai.');
    if (g.end < g.start) fail('Tanggal selesai harus setelah tanggal mulai.');
    if (!String(g.program || '').trim()) fail('Isi program utama.');
  };
  S.saveGroup = (id, cid, data, gid) => {
    const ps = S.pship(id);
    if (!['connected', 'matched'].includes(ps.status)) fail('Kesepakatan hanya bisa diisi setelah desa menyetujui kerja sama.');
    if (!ps.coordinators.some(c => c.id === cid)) fail('Koordinator tidak dikenali.');
    const clean = { name: data.name, dpl: data.dpl, students: data.students, start: data.start, end: data.end, program: data.program, note: data.note || '' };
    let g = gid && ps.groups.find(x => x.id === gid);
    if (g) { if (!['draft', 'revision'].includes(g.status)) fail('Kesepakatan sudah dikirim ke desa.'); Object.assign(g, clean); }
    else {
      if (S.slots(ps) >= ps.quota) fail(`Kuota ${ps.quota} kelompok sudah penuh.`);
      g = Object.assign({ id: A.uid('g'), coordinatorId: cid, status: 'draft', submittedAt: null, reviewNote: '', revisions: 0 }, clean); ps.groups.push(g);
    }
    save(); return g;
  };
  S.validateGroup = (id, gid) => checkGroup(S.pship(id).groups.find(x => x.id === gid));
  S.deleteGroup = (id, gid) => { const ps = S.pship(id), g = ps.groups.find(x => x.id === gid); if (g.status !== 'draft') fail('Hanya draft yang bisa dihapus.'); ps.groups = ps.groups.filter(x => x.id !== gid); save(); };
  S.submitGroup = (id, gid) => {
    const ps = S.pship(id), p = S.problem(ps.problemId), g = ps.groups.find(x => x.id === gid);
    if (!['draft', 'revision'].includes(g.status)) fail('Kesepakatan sudah dikirim.');
    checkGroup(g); g.status = 'submitted'; g.submittedAt = A.now(); g.reviewNote = '';
    stamp(ps, `Koordinator mengirim konfirmasi kesepakatan: ${g.name}`);
    notify(ps.desaId, 'agreement', `${nameOf(ps.univId)} mengirim konfirmasi kesepakatan ${g.name} (${p.title}) — mohon dikonfirmasi`, '#/partnerships/' + id);
    logAct('file-check', `Konfirmasi kesepakatan dikirim: ${g.name} · ${p.title}`); save();
  };
  S.reviewGroup = (id, gid, decision, note) => {
    const ps = S.pship(id), p = S.problem(ps.problemId), g = ps.groups.find(x => x.id === gid);
    if (g.status !== 'submitted') fail('Tidak ada kesepakatan yang menunggu konfirmasi.');
    if (decision === 'confirm') {
      g.status = 'confirmed'; g.reviewNote = '';
      stamp(ps, `Desa menyatakan sesuai: ${g.name}`);
      if (ps.status === 'connected') { ps.status = 'matched'; ps.activeAt = A.now(); p.status = 'matched'; stamp(ps, 'Kerja sama aktif'); logAct('circle-check', `Kerja sama aktif: ${nameOf(ps.univId)} × ${p.title}`); }
      notify(ps.univId, 'status', `Desa menyatakan sesuai untuk ${g.name} (${p.title}). Kerja sama aktif`, '#/partnerships/' + id);
    } else if (decision === 'close') {
      if ((g.revisions || 0) < MAX_REVISIONS) fail(`Kelompok hanya bisa ditutup setelah ${MAX_REVISIONS} kali revisi.`);
      if (!note) fail('Isi alasan menutup kelompok.');
      g.status = 'closed'; g.reviewNote = note;
      stamp(ps, `Desa menutup kelompok ${g.name}: ${note}`);
      notify(ps.univId, 'reject', `Desa menutup kelompok ${g.name} (${p.title}): ${note}`, '#/partnerships/' + id);
    } else {
      if ((g.revisions || 0) >= MAX_REVISIONS) fail(`Batas revisi (${MAX_REVISIONS}x) tercapai. Diskusikan via WhatsApp lalu pilih Sesuai atau tutup kelompok.`);
      if (!note) fail('Isi catatan revisi untuk koordinator.');
      g.revisions = (g.revisions || 0) + 1; g.status = 'revision'; g.reviewNote = note;
      stamp(ps, `Desa meminta revisi (${g.revisions}/${MAX_REVISIONS}): ${g.name}`);
      notify(ps.univId, 'agreement', `Desa meminta revisi kesepakatan ${g.name} (${g.revisions}/${MAX_REVISIONS}). Sampaikan detailnya via WhatsApp`, '#/partnerships/' + id);
    }
    save();
  };
  S.addDoc = (id, userId, name, kind = 'pdf') => { if (!name) fail('Pilih berkas terlebih dulu.'); const ps = S.pship(id); ps.docs.push({ id: A.uid('x'), name, by: userId, ts: A.now(), kind }); stamp(ps, `${nameOf(userId)} menambahkan dokumen: ${name}`); save(); };
  S.completePship = id => { const ps = S.pship(id); if (ps.status !== 'matched') fail('Hanya kerja sama Aktif yang bisa diselesaikan.'); if (!ps.docs.some(d => d.kind === 'report' || /laporan/i.test(d.name))) fail('Unggah laporan akhir sebelum menandai selesai.'); ps.completed = true; stamp(ps, 'KKN selesai dan didokumentasikan'); notify(ps.desaId, 'status', 'KKN ditandai selesai', '#/partnerships/' + id); notify(ps.univId, 'status', 'KKN ditandai selesai', '#/partnerships/' + id); save(); };

  /* ------------------------------------------------------------ waktu & tick */
  S.tick = () => {
    let changed = false; const now = A.now();
    D.partnerships.forEach(ps => {
      const p = S.problem(ps.problemId); if (!p) return;
      if (ps.status === 'requested') {
        if (now > ps.responseEnds) {
          const why = 'Desa tidak merespons dalam ' + RESPONSE_DAYS + ' hari (Kedaluwarsa)';
          ps.status = 'expired'; stamp(ps, why); unlock(p, why); logAct('hourglass-empty', `Kedaluwarsa: ${p.title}`);
          notify(ps.desaId, 'expire', `Pengajuan kerja sama ${p.title} kedaluwarsa, kebutuhan terbuka kembali`, '#/partnerships/' + ps.id); notify(ps.univId, 'expire', `${why}: ${p.title}`, '#/partnerships/' + ps.id); changed = true;
        } else if (!ps._warn && ps.responseEnds - now < DAY) {
          ps._warn = true; const w = `Pengajuan kerja sama ${p.title} menunggu respons desa, sisa kurang dari 24 jam`;
          notify(ps.desaId, 'deadline', w, '#/partnerships/' + ps.id); notify(ps.univId, 'deadline', w, '#/partnerships/' + ps.id); changed = true;
        }
      } else if (ps.status === 'connected' && !ps._nudge && ps.approvedAt && now - ps.approvedAt > NUDGE_DAYS * DAY && !ps.groups.some(g => g.status !== 'draft')) {
        ps._nudge = true; notify(ps.univId, 'deadline', `Pengingat: konfirmasi kesepakatan ${p.title} belum diisi (${NUDGE_DAYS} hari sejak disetujui)`, '#/partnerships/' + ps.id); changed = true;
      }
    });
    D.problems.forEach(p => { if (p.status === 'available' && p.deadline < now) { p.status = 'expired'; changed = true; } });
    if (changed) save(); return changed;
  };
  S.advance = days => { D.clock = (D.clock || 0) + days * DAY; save(); return S.tick(); };
  S.resetClock = () => { D.clock = 0; save(); };
})(window.App);
