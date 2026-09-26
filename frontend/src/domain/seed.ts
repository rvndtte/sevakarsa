import { CITIES, DAY, LIMITS } from "./constants";
import { uid } from "./ids";
import type {
  ActivityLog,
  Database,
  Desa,
  DesaProfile,
  Coordinator,
  Group,
  GroupStatus,
  Notification,
  NotificationType,
  Partnership,
  PartnershipDoc,
  Problem,
  ProblemStatus,
  ProgramHistory,
  Univ,
  UnivProfile,
  User,
  VerificationStatus,
} from "./types";

/** Data demo awal. Semua waktu relatif terhadap `t` (sekarang). */
export function seedDatabase(t: number): Database {
  const ago = (days: number) => t - days * DAY;
  const hours = (h: number) => t - h * 3_600_000;

  const verifyLog = (ver: VerificationStatus, age: number) =>
    ver === "pending"
      ? [
          { ts: ago(age), text: "Pendaftaran diterima" },
          { ts: ago(age), text: "Menunggu peninjauan admin" },
        ]
      : [
          { ts: ago(age), text: "Pendaftaran diterima" },
          { ts: ago(age - 1), text: "Akun disetujui Super Admin" },
        ];

  const desa = (
    id: string,
    name: string,
    email: string,
    city: string,
    prof: Partial<DesaProfile>,
    docs: string[],
    verified: VerificationStatus = "approved",
    age = 60,
  ): Desa => ({
    id,
    role: "desa",
    email,
    password: "demo123",
    name,
    verified,
    createdAt: ago(age),
    docs,
    vlog: verifyLog(verified, age),
    profile: {
      kecamatan: "-",
      city,
      province: CITIES[city] ?? "Jawa Timur",
      population: 2500,
      area: "10",
      umkm: 10,
      about: "",
      potentials: [],
      facilities: [],
      contactName: "",
      phone: "",
      email,
      ...prof,
    },
  });

  const univ = (
    id: string,
    name: string,
    email: string,
    prof: Partial<UnivProfile>,
    docs: string[],
    verified: VerificationStatus = "approved",
    age = 80,
  ): Univ => ({
    id,
    role: "univ",
    email,
    password: "demo123",
    name,
    verified,
    createdAt: ago(age),
    docs,
    saved: [],
    vlog: verifyLog(verified, age),
    profile: {
      city: "Kota Malang",
      province: "Jawa Timur",
      fields: [],
      programs: [],
      history: [],
      about: "",
      contactName: "",
      phone: "",
      email,
      ...prof,
    },
  });

  const history = (
    title: string,
    year: string,
    desaName: string,
    result: string,
  ): ProgramHistory => ({ id: uid("h"), title, year, desa: desaName, result });

  const users: User[] = [
    {
      id: "a1",
      role: "admin",
      email: "admin@demo.id",
      password: "demo123",
      name: "Super Admin",
      verified: "approved",
      profile: {},
      docs: [],
      vlog: [],
      createdAt: ago(200),
    },
    desa(
      "d1",
      "Desa Sumber Rejeki",
      "desa@demo.id",
      "Kab. Malang",
      {
        kecamatan: "Sumbermanjing",
        population: 3245,
        area: "12,4",
        umkm: 24,
        about:
          "Desa agraris penghasil kopi dan sayuran dengan puluhan UMKM pengolahan pangan yang siap berkembang secara digital.",
        potentials: ["Pertanian", "UMKM", "Wisata"],
        facilities: ["Balai desa", "Akses internet", "Aula pelatihan"],
        contactName: "Pak Budi (Kepala Desa)",
        phone: "0812-3456-7890",
        email: "desa@sumberrejeki.id",
      },
      ["SK Kepala Desa.pdf", "KTP Kepala Desa.jpg"],
      "approved",
      90,
    ),
    desa(
      "d2",
      "Desa Tanjung Sari",
      "tanjung@demo.id",
      "Kab. Pasuruan",
      {
        kecamatan: "Rembang",
        population: 2810,
        area: "9,1",
        umkm: 12,
        about: "Desa pesisir dengan potensi wisata dan pengolahan hasil laut.",
        potentials: ["Wisata", "Perikanan"],
        facilities: ["Balai desa", "Pantai wisata"],
        contactName: "Bu Lestari (Sekdes)",
        phone: "0813-1111-2222",
      },
      ["SK Kepala Desa.pdf"],
      "approved",
      70,
    ),
    desa(
      "d3",
      "Desa Sukamakmur",
      "sukamakmur@demo.id",
      "Kab. Malang",
      {
        kecamatan: "Ngantang",
        population: 4120,
        area: "15",
        umkm: 8,
        about:
          "Desa dengan sumber air pegunungan yang membutuhkan pengelolaan berkelanjutan.",
        potentials: ["Air", "Pertanian"],
        facilities: ["Balai desa", "Posyandu"],
        contactName: "Pak Hadi",
        phone: "0857-0000-1111",
      },
      ["SK Kepala Desa.pdf"],
      "approved",
      65,
    ),
    desa(
      "d4",
      "Desa Tegalrejo",
      "tegalrejo@demo.id",
      "Kab. Malang",
      { kecamatan: "Dau", contactName: "Pak Slamet", phone: "0813-2222-3333" },
      ["SK Kepala Desa.pdf", "KTP Kepala Desa.jpg"],
      "pending",
      0.1,
    ),
    desa(
      "d5",
      "Desa Karangploso",
      "karangploso@demo.id",
      "Kab. Malang",
      {
        kecamatan: "Karangploso",
        contactName: "Bu Rini",
        phone: "0812-9999-0000",
      },
      ["SK Kepala Desa.pdf"],
      "pending",
      1,
    ),
    univ(
      "u1",
      "Universitas Brawijaya",
      "univ@demo.ac.id",
      {
        fields: ["Teknologi", "UMKM", "Pertanian", "Lingkungan"],
        programs: [
          "Teknik Informatika",
          "Agribisnis",
          "Manajemen",
          "Teknologi Bioproses",
        ],
        history: [
          history(
            "Digitalisasi UMKM",
            "2024",
            "Desa Tegalrejo",
            "Selesai · 12 UMKM terlatih dan toko online aktif",
          ),
          history(
            "Pengelolaan sampah organik",
            "2023",
            "Desa Sukamaju",
            "Selesai · unit kompos komunal berjalan",
          ),
          history(
            "Literasi digital warga",
            "2022",
            "Desa Pujon",
            "Selesai · 40 warga mengikuti pelatihan",
          ),
        ],
        about:
          "Perguruan tinggi negeri yang berkomitmen pada pengabdian masyarakat melalui program KKN tematik berkelanjutan.",
        contactName: "Nayla Putri",
        phone: "0812-8888-7777",
        email: "kkn@ub.ac.id",
      },
      ["Surat Tugas LPPM.pdf", "SK Rektor.pdf"],
      "approved",
      120,
    ),
    univ(
      "u2",
      "Universitas Negeri Malang",
      "um@demo.ac.id",
      {
        fields: ["Pendidikan", "Kesehatan", "Teknologi"],
        programs: ["Pendidikan Teknik Informatika", "Kesehatan Masyarakat"],
        history: [
          history(
            "Pelatihan UMKM Digital",
            "2024",
            "Desa Sumber Rejeki",
            "Selesai · 12 UMKM dilatih",
          ),
          history(
            "Literasi digital",
            "2023",
            "Desa Pujon",
            "Selesai · 50 warga terlatih",
          ),
        ],
        about:
          "Fokus pada pendidikan, literasi digital, dan pelayanan kesehatan masyarakat desa.",
        contactName: "Rafi Aditya",
        phone: "0813-4444-5555",
        email: "kkn@um.ac.id",
      },
      ["Surat Tugas LPPM.pdf"],
      "approved",
      110,
    ),
    univ(
      "u3",
      "Universitas Merdeka",
      "merdeka@demo.ac.id",
      { fields: ["Teknologi"], contactName: "Ibu Wati" },
      ["Surat Tugas.pdf", "Akreditasi.pdf"],
      "pending",
      0.2,
    ),
  ];

  /* ---------------------------------------------------------- kebutuhan */
  const problem = (
    id: string,
    desaId: string,
    title: string,
    category: string,
    city: string,
    skills: string[],
    duration: number,
    teamMin: number,
    teamMax: number,
    status: ProblemStatus,
    age: number,
    extra: Partial<Problem> = {},
  ): Problem => ({
    id,
    desaId,
    title,
    category,
    city,
    province: CITIES[city] ?? "Jawa Timur",
    skills,
    duration,
    teamMin,
    teamMax,
    status,
    createdAt: ago(age),
    deadline: t + 30 * DAY,
    partnershipId: null,
    desc: "",
    condition: "",
    need: "",
    target: "",
    ...extra,
  });

  const problems: Problem[] = [
    problem("p1", "d1", "Digitalisasi UMKM Desa", "Teknologi", "Kab. Malang", ["Web Development", "UI/UX Design", "Bisnis", "Data Analysis"], 2, 3, 5, "requested", 12, {
      partnershipId: "pt1",
      desc: "UMKM lokal belum terdigitalisasi sehingga jangkauan pemasaran terbatas dan pencatatan produk dilakukan manual.",
      condition: "Terdapat balai desa, akses internet, dan 10 UMKM aktif yang siap dilibatkan. Belum ada toko online maupun pencatatan digital.",
      need: "Platform toko online sederhana, pelatihan pemasaran digital, dan panduan penggunaan yang mudah dipahami pelaku UMKM.",
      target: "Toko online aktif untuk minimal 10 UMKM, 3 sesi pelatihan, panduan pengguna, dan laporan hasil.",
    }),
    problem("p2", "d3", "Sistem Monitoring Kualitas Air", "Lingkungan", "Kab. Malang", ["IoT", "Data Analysis", "Web Development"], 3, 3, 4, "connected", 30, {
      partnershipId: "pt2",
      desc: "Kualitas air sumber desa belum dipantau secara berkala.",
      condition: "Ada 3 titik sumber air dan posyandu yang menjadi pusat informasi.",
      need: "Sensor sederhana dan dasbor pemantauan yang bisa dibaca perangkat desa.",
      target: "Dasbor pemantauan aktif dan SOP tindak lanjut kualitas air.",
    }),
    problem("p3", "d2", "Pengelolaan Sampah Organik", "Lingkungan", "Kab. Pasuruan", ["Bioteknologi", "Agribisnis"], 2, 3, 4, "matched", 60, {
      partnershipId: "pt3",
      desc: "Sampah organik rumah tangga menumpuk di TPS desa.",
      condition: "Belum ada fasilitas pengomposan.",
      need: "Sistem pengomposan komunal dan pelatihan warga.",
      target: "Unit kompos aktif dan 30 warga terlatih.",
    }),
    problem("p4", "d1", "Pemasaran Kopi Desa", "UMKM", "Kab. Malang", ["Pemasaran Digital", "Bisnis", "Desain Grafis"], 1, 3, 4, "connected", 20, {
      partnershipId: "pt4",
      desc: "Kopi desa belum memiliki merek dan kanal pemasaran yang jelas.",
      condition: "Produksi kopi rutin, kemasan masih sederhana.",
      need: "Branding, kemasan, dan strategi pemasaran digital.",
      target: "Merek kopi, katalog produk, dan akun pemasaran aktif.",
    }),
    problem("p5", "d1", "Pelatihan Literasi Digital", "Pendidikan", "Kab. Malang", ["Pendidikan", "Web Development"], 1, 2, 4, "expired", 45, {
      desc: "Warga belum akrab dengan layanan digital dasar.",
      condition: "Aula tersedia, perangkat terbatas.",
      need: "Pelatihan literasi digital untuk warga.",
      target: "50 warga mengikuti pelatihan.",
    }),
    problem("p6", "d2", "Wisata Desa Berbasis Digital", "Teknologi", "Kab. Pasuruan", ["Web Development", "Desain Grafis", "Pemasaran Digital"], 2, 3, 5, "available", 8, {
      desc: "Wisata pantai belum punya situs dan sistem pemesanan.",
      condition: "Pengunjung ramai di akhir pekan tanpa pencatatan.",
      need: "Situs wisata, peta digital, dan sistem tiket sederhana.",
      target: "Situs wisata live dan pengelola terlatih.",
    }),
    problem("p7", "d3", "Posyandu Digital", "Kesehatan", "Kab. Malang", ["Kesehatan Masyarakat", "Web Development", "Data Analysis"], 3, 3, 4, "available", 5, {
      desc: "Pencatatan posyandu masih manual dan sulit direkap.",
      condition: "Ada 4 posyandu aktif dengan kader terlatih.",
      need: "Aplikasi pencatatan dan rekap sederhana.",
      target: "Aplikasi terpakai di 4 posyandu.",
    }),
    problem("p8", "d1", "Pengolahan Limbah Kopi", "Lingkungan", "Kab. Malang", ["Bioteknologi", "Agribisnis"], 2, 3, 4, "available", 3, {
      desc: "Kulit kopi hasil olahan belum dimanfaatkan.",
      condition: "Limbah menumpuk saat panen raya.",
      need: "Pengolahan kulit kopi menjadi produk bernilai.",
      target: "Produk turunan dan pelatihan pengolahan.",
    }),
    problem("p9", "d1", "Pelatihan UMKM Digital 2024", "UMKM", "Kab. Malang", ["Bisnis", "Pemasaran Digital"], 3, 3, 4, "matched", 300, {
      partnershipId: "pt6",
      desc: "Pelatihan UMKM (arsip).",
    }),
  ];

  /* ---------------------------------------------------------- kerja sama */
  const doc = (
    name: string,
    by: string,
    ts: number,
    kind: PartnershipDoc["kind"] = "pdf",
  ): PartnershipDoc => ({ id: uid("x"), name, by, ts, kind });

  const coordinator = (
    id: string,
    name: string,
    phone: string,
    email: string,
  ): Coordinator => ({ id, name, phone, email, token: "tk-" + id, ts: ago(3) });

  const group = (
    id: string,
    coordinatorId: string,
    name: string,
    status: GroupStatus,
    extra: Partial<Group> = {},
  ): Group => ({
    id,
    coordinatorId,
    name,
    dpl: "Dr. Rina W., M.T.",
    students: 4,
    start: "2025-07-01",
    end: "2025-08-30",
    program: "",
    note: "",
    status,
    submittedAt: null,
    reviewNote: "",
    revisions: 0,
    ...extra,
  });

  const partnerships: Partnership[] = [
    {
      id: "pt1", problemId: "p1", univId: "u2", desaId: "d1", status: "requested",
      createdAt: hours(2),
      message: "Tim kami berpengalaman melatih UMKM digital dan siap membantu digitalisasi.",
      quota: 2,
      plan: { period: "Jul – Agu 2025", students: 8 },
      responseEnds: t + LIMITS.RESPONSE_DAYS * DAY - 2 * 3_600_000,
      coordinators: [coordinator("k5", "Rafi Aditya", "0813-4444-5555", "rafi@um.ac.id")],
      groups: [], docs: [],
      log: [{ ts: hours(2), text: "Kerja sama diajukan oleh Universitas Negeri Malang (kuota 2 kelompok) — menunggu persetujuan desa" }],
    },
    {
      id: "pt2", problemId: "p2", univId: "u1", desaId: "d3", status: "connected",
      createdAt: ago(12), approvedAt: ago(6), _nudge: true,
      message: "Kami tertarik membantu monitoring air.", quota: 2,
      coordinators: [coordinator("k1", "Bu Dewi Lestari", "0857-1122-3344", "dewi@ub.ac.id")],
      groups: [], docs: [],
      log: [
        { ts: ago(12), text: "Kerja sama diajukan oleh Universitas Brawijaya (kuota 2 kelompok) — menunggu persetujuan desa" },
        { ts: ago(6), text: "Desa menyetujui kerja sama — kontak kedua pihak terbuka" },
        { ts: ago(5), text: "Koordinator diundang: Bu Dewi Lestari" },
      ],
    },
    {
      id: "pt3", problemId: "p3", univId: "u2", desaId: "d2", status: "matched",
      createdAt: ago(58), approvedAt: ago(50), activeAt: ago(40),
      message: "", quota: 1,
      coordinators: [coordinator("k3", "Rafi Aditya", "0813-4444-5555", "rafi@um.ac.id")],
      groups: [group("g3", "k3", "Kelompok 1 · Tim Kompos", "confirmed", {
        dpl: "Ir. Bambang S.", students: 12, start: "2025-01-05", end: "2025-03-05",
        program: "Unit kompos komunal dan pelatihan warga", submittedAt: ago(41),
      })],
      docs: [],
      log: [
        { ts: ago(58), text: "Kerja sama diajukan oleh Universitas Negeri Malang" },
        { ts: ago(50), text: "Desa menyetujui kerja sama — kontak kedua pihak terbuka" },
        { ts: ago(40), text: "Kerja sama aktif" },
      ],
    },
    {
      id: "pt4", problemId: "p4", univId: "u1", desaId: "d1", status: "connected",
      createdAt: ago(2), approvedAt: ago(1.7),
      message: "Kami punya pengalaman branding UMKM pangan.", quota: 3,
      coordinators: [coordinator("k2", "Pak Raka Aditya", "0821-9988-7766", "raka@ub.ac.id")],
      groups: [group("g2", "k2", "Kelompok 1 · Tim Branding", "submitted", {
        students: 5,
        program: "Merek kopi desa, katalog produk, dan akun pemasaran aktif",
        note: "Akomodasi di balai desa, pelatihan hari Sabtu.",
        submittedAt: ago(0.2),
      })],
      docs: [doc("Ringkasan Kebutuhan.pdf", "d1", ago(1.5))],
      log: [
        { ts: ago(2), text: "Kerja sama diajukan oleh Universitas Brawijaya (kuota 3 kelompok) — menunggu persetujuan desa" },
        { ts: ago(1.7), text: "Desa menyetujui kerja sama — kontak kedua pihak terbuka" },
        { ts: ago(1.6), text: "Koordinator diundang: Pak Raka Aditya" },
        { ts: ago(0.2), text: "Koordinator mengirim konfirmasi kesepakatan: Kelompok 1 · Tim Branding" },
      ],
    },
    {
      id: "pt5", problemId: "p5", univId: "u1", desaId: "d1", status: "expired",
      createdAt: ago(44), responseEnds: ago(37), message: "", quota: 1,
      coordinators: [], groups: [], docs: [],
      log: [
        { ts: ago(44), text: "Kerja sama diajukan oleh Universitas Brawijaya" },
        { ts: ago(37), text: "Desa tidak merespons dalam 7 hari (Kedaluwarsa)" },
      ],
    },
    {
      id: "pt6", problemId: "p9", univId: "u2", desaId: "d1", status: "matched", completed: true,
      createdAt: ago(290), approvedAt: ago(285), activeAt: ago(272),
      message: "", quota: 1,
      coordinators: [coordinator("k4", "Rafi Aditya", "0813-4444-5555", "rafi@um.ac.id")],
      groups: [group("g4", "k4", "Kelompok 1 · Tim UMKM", "confirmed", {
        dpl: "Ir. Bambang S.", students: 10, start: "2024-06-01", end: "2024-08-30",
        program: "Pelatihan UMKM digital", submittedAt: ago(273),
      })],
      docs: [
        doc("Kesepakatan.pdf", "u2", ago(275)),
        doc("Laporan akhir.pdf", "u2", ago(200), "report"),
        doc("Foto kegiatan (12 foto)", "u2", ago(200), "photo"),
      ],
      log: [
        { ts: ago(290), text: "Kerja sama diajukan oleh Universitas Negeri Malang" },
        { ts: ago(272), text: "Kerja sama aktif" },
        { ts: ago(200), text: "KKN selesai dan didokumentasikan" },
      ],
    },
  ];

  /* ---------------------------------------------------------- notifikasi */
  const notif = (
    userId: string,
    type: NotificationType,
    text: string,
    link: string,
    hoursAgo: number,
    read = false,
  ): Notification => ({ id: uid("n"), userId, type, text, link, ts: hours(hoursAgo), read });

  const notifs: Notification[] = [
    notif("d1", "partnership", "Universitas Negeri Malang mengajukan kerja sama untuk Digitalisasi UMKM Desa (2 kelompok) — menunggu persetujuan Anda", "/partnerships/pt1", 2),
    notif("d1", "agreement", "Universitas Brawijaya mengirim konfirmasi kesepakatan Kelompok 1 · Tim Branding (Pemasaran Kopi Desa) — mohon dikonfirmasi", "/partnerships/pt4", 5),
    notif("d1", "status", 'Kebutuhan "Pengolahan Limbah Kopi" dipublikasikan', "/desa/problems/p8", 72, true),
    notif("u1", "status", "Desa Sumber Rejeki menyetujui kerja sama Pemasaran Kopi Desa. Kontak terbuka, lanjutkan diskusi via WhatsApp", "/partnerships/pt4", 40),
    notif("u1", "deadline", "Pengingat: konfirmasi kesepakatan Monitoring Kualitas Air belum diisi koordinator", "/partnerships/pt2", 6),
    notif("u1", "expire", 'Pengajuan "Pelatihan Literasi Digital" kedaluwarsa (desa tidak merespons)', "/partnerships/pt5", 24 * 30, true),
    notif("a1", "system", "3 akun baru menunggu verifikasi", "/admin/verify", 1),
  ];

  const log: ActivityLog[] = [
    { ts: hours(1), icon: "user-plus", text: "Pendaftaran baru: Universitas Merdeka" },
    { ts: hours(26), icon: "user-plus", text: "Pendaftaran baru: Desa Karangploso" },
    { ts: hours(2), icon: "heart-handshake", text: "Kerja sama diajukan: Universitas Negeri Malang × Digitalisasi UMKM Desa" },
    { ts: ago(5), icon: "user-plus", text: "Koordinator diundang: Bu Dewi Lestari (Monitoring Kualitas Air)" },
    { ts: ago(37), icon: "hourglass-empty", text: "Kedaluwarsa: Pelatihan Literasi Digital" },
  ];

  return { v: 1, clock: 0, session: null, users, problems, partnerships, notifs, log };
}
