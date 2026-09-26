/* Teks dan data statis landing page, dipisah dari komponen tampilan. */
import type { Tone } from "@/components/ui/tone";

export const SECTIONS = [
  { id: "problem", label: "Masalah" },
  { id: "how", label: "Cara kerja" },
  { id: "impact", label: "Dampak" },
  { id: "benefit", label: "Manfaat" },
  { id: "faq", label: "FAQ" },
] as const;

export interface StoryStep {
  number: string;
  status: string;
  tone: Tone;
  title: string;
  body: string;
}

export const STORY_STEPS: StoryStep[] = [
  {
    number: "01",
    status: "Available",
    tone: "green",
    title: "Desa mengajukan kebutuhan",
    body: "Desa membuat profil, lalu mempublikasikan masalah beserta kompetensi yang dibutuhkan. Kebutuhan tampil terbuka bagi semua universitas.",
  },
  {
    number: "02",
    status: "Diajukan",
    tone: "blue",
    title: "Universitas mengajukan",
    body: "Universitas menjelajah kebutuhan desa lalu mengajukan kerja sama dengan kuota kelompok. Desa menyetujui atau menolak sekali; kebutuhan terkunci untuk pihak lain selama menunggu.",
  },
  {
    number: "03",
    status: "Disetujui",
    tone: "amber",
    title: "Kontak & kesepakatan",
    body: "Kontak kedua pihak terbuka dan diskusi berlanjut di WhatsApp. Koordinator KKN mengirim konfirmasi kesepakatan tiap kelompok, desa tinggal menekan Sesuai.",
  },
  {
    number: "04",
    status: "Aktif",
    tone: "purple",
    title: "KKN & dokumentasi",
    body: "Kerja sama Aktif. Pelaksanaan, laporan, dan arsip dokumentasi tersimpan sebagai riwayat desa.",
  },
];

/** Posisi scroll (0–1) tiap langkah story, dipakai tombol rail. */
export const STORY_STEP_PROGRESS = [0.02, 0.27, 0.52, 0.78];

export const PROBLEM_CARDS = [
  { icon: "unlink", tone: "red", title: "Kebutuhan desa tidak sampai ke kampus" },
  { icon: "target-arrow", tone: "amber", title: "Program KKN tidak tepat sasaran" },
  { icon: "users-group", tone: "blue", title: "Kompetensi mahasiswa tidak dipertemukan" },
  { icon: "file-off", tone: "purple", title: "Tidak ada jejak & keberlanjutan" },
] as const satisfies readonly { icon: string; tone: Tone; title: string }[];

export interface StatSlide {
  kind: "stat";
  icon: string;
  tag: string;
  value: number;
  decimals: number;
  label: string;
  body: string;
  source: string;
}
export interface CardsSlide {
  kind: "cards";
}
export type ProblemSlide = StatSlide | CardsSlide;

export const PROBLEM_SLIDES: ProblemSlide[] = [
  {
    kind: "stat",
    icon: "map-2",
    tag: "Potensi yang luas",
    value: 75753,
    decimals: 0,
    label: "desa di seluruh Indonesia",
    body: "Setiap desa punya kebutuhan nyata, dan setiap tahun ribuan mahasiswa mencari tempat mengabdi lewat KKN. Potensinya sangat besar, tetapi belum tersalurkan dengan baik.",
    source: "BPS, Potensi Desa 2024 (75.753 desa; 84.276 dengan kelurahan & permukiman transmigrasi)",
  },
  {
    kind: "stat",
    icon: "alert-triangle",
    tag: "Kesenjangan",
    value: 10463,
    decimals: 0,
    label: "desa masih tertinggal atau sangat tertinggal",
    body: "Sekitar 1 dari 7 desa belum mencapai status berkembang. Justru desa-desa inilah yang paling membutuhkan tangan dan keahlian dari kampus.",
    source: "Kemendes PDTT, Indeks Desa Membangun 2024: 6.100 tertinggal + 4.363 sangat tertinggal dari 75.265 desa",
  },
  {
    kind: "stat",
    icon: "school",
    tag: "Tenaga muda",
    value: 8.96,
    decimals: 2,
    label: "juta mahasiswa di 2.694 perguruan tinggi",
    body: "Kompetensi mahasiswa sangat beragam, namun penempatan KKN sering ditentukan dari sisi kampus, bukan dari masalah dan keahlian yang benar-benar dibutuhkan desa.",
    source: "BPS, 2021 (data nasional terbaru yang kami temukan)",
  },
  { kind: "cards" },
];

export const SDGS = [
  { no: "4", title: "Pendidikan Berkualitas", color: "#C5192D", text: "KKN menjadi pembelajaran kontekstual: mahasiswa menerapkan keilmuan pada masalah nyata." },
  { no: "8", title: "Pekerjaan Layak & Pertumbuhan Ekonomi", color: "#A21942", text: "Solusi berbasis kompetensi mendorong ekonomi dan usaha lokal desa." },
  { no: "10", title: "Berkurangnya Kesenjangan", color: "#DD1367", text: "Desa di mana pun punya kesempatan yang sama untuk terlihat dan dibantu kampus." },
  { no: "11", title: "Kota & Permukiman Berkelanjutan", color: "#FD9D24", text: "Perbaikan infrastruktur, lingkungan, dan layanan dasar permukiman desa." },
  { no: "17", title: "Kemitraan untuk Mencapai Tujuan", color: "#19486A", text: "Inti platform: kemitraan desa, universitas, dan mahasiswa yang terukur dan terdokumentasi." },
];

export const IMPACTS = [
  { icon: "target-arrow", title: "Tepat sasaran", text: "Program dimulai dari kebutuhan yang dinyatakan desa sendiri." },
  { icon: "scale", title: "Terbuka & adil", text: "Setiap desa terlihat oleh banyak universitas, bukan hanya yang punya koneksi." },
  { icon: "chart-line", title: "Terukur", text: "Status, kesepakatan, dan laporan tercatat sehingga dampak bisa dievaluasi." },
  { icon: "history", title: "Berkelanjutan", text: "Riwayat dokumentasi tersimpan sebagai fondasi kolaborasi berikutnya." },
];

export const PERKS = {
  desa: [
    "Masalah terdengar oleh banyak kampus",
    "Solusi sesuai kebutuhan nyata desa",
    "Anda cukup menyetujui, diskusi teknis lewat WhatsApp",
    "Riwayat & dokumentasi tersimpan rapi",
  ],
  univ: [
    "Temukan desa yang bisa dibantu tim Anda",
    "Kebutuhan desa yang jelas dan terdokumentasi",
    "Program KKN lebih terarah dan terukur",
    "Jejak dampak yang terdokumentasi",
  ],
};

export const FAQS = [
  {
    q: "Apa itu SevaKarsa?",
    a: "Platform yang mempertemukan desa dengan universitas untuk program KKN. Desa mempublikasikan kebutuhan nyata, universitas mengajukan kerja sama, dan seluruh alurnya tercatat rapi sampai dokumentasi akhir.",
  },
  {
    q: "Siapa saja yang bisa menggunakan SevaKarsa?",
    a: "Ada dua jenis akun: desa (pengaju kebutuhan) dan universitas (pengaju kerja sama). Pengelolaan dan verifikasi dilakukan oleh Super Admin. Mahasiswa peserta tidak perlu akun; koordinator KKN cukup menerima tautan konfirmasi.",
  },
  {
    q: "Siapa yang memverifikasi akun?",
    a: "Super Admin memeriksa dokumen pendukung dalam 1–2 hari kerja sebelum akun desa atau universitas aktif penuh.",
  },
  {
    q: "Dokumen apa yang perlu disiapkan saat mendaftar?",
    a: "Isi profil lengkap beserta kontak penanggung jawab, lalu unggah dokumen pendukung yang menunjukkan identitas lembaga (misalnya surat keterangan desa atau surat tugas kampus). Admin akan memeriksanya sebelum akun aktif.",
  },
  {
    q: "Apakah diskusi dilakukan di platform?",
    a: "Tidak. Setelah desa menyetujui kerja sama, kontak kedua pihak terbuka dan diskusi teknis dilakukan lewat WhatsApp. Platform hanya membuka kontak dan mencatat hasil kesepakatan.",
  },
  {
    q: "Apa arti status Available, Diajukan, Disetujui, Aktif?",
    a: "Available: terbuka untuk pengajuan. Diajukan: menunggu keputusan desa (kedaluwarsa jika 7 hari tanpa respons) dan kebutuhan terkunci untuk universitas lain. Disetujui: kontak terbuka, koordinator berdiskusi dengan desa. Aktif: desa menyatakan kesepakatan sesuai. Jika ditolak, dibatalkan, atau kedaluwarsa, kebutuhan terbuka kembali.",
  },
  {
    q: "Berapa banyak kebutuhan yang bisa dipublikasikan desa?",
    a: "Setiap desa dapat memiliki hingga 5 kebutuhan aktif sekaligus. Kebutuhan yang sudah selesai atau ditutup tersimpan di riwayat dan tidak dihitung lagi.",
  },
  {
    q: "Apa yang terjadi jika desa tidak merespons pengajuan?",
    a: "Desa punya waktu 7 hari untuk menyetujui atau menolak. Jika lewat, pengajuan kedaluwarsa otomatis dan kebutuhan kembali terbuka bagi universitas lain.",
  },
  {
    q: "Bisakah beberapa universitas mengajukan ke kebutuhan yang sama?",
    a: "Pada satu waktu hanya satu pengajuan yang diproses. Selama menunggu keputusan desa, kebutuhan terkunci untuk universitas lain, dan terbuka kembali jika pengajuan ditolak, dibatalkan, atau kedaluwarsa.",
  },
  {
    q: "Apa maksud kuota kelompok?",
    a: "Universitas menentukan berapa kelompok KKN yang akan diterjunkan (maksimal 20). Kesepakatan dikonfirmasi per kelompok, sehingga tiap kelompok punya koordinator dan catatan sendiri.",
  },
  {
    q: "Bagaimana kesepakatan dikonfirmasi?",
    a: "Koordinator KKN tiap kelompok mengirim konfirmasi lewat tautan khusus. Desa tinggal menekan Sesuai jika isinya cocok, atau meminta revisi (maksimal 2 kali per kelompok) bila ada yang perlu diperbaiki.",
  },
  {
    q: "Bagaimana jika universitas lupa mengisi kesepakatan?",
    a: "Sekitar 5 hari setelah pengajuan disetujui, universitas mendapat pengingat untuk melengkapi kesepakatan kelompoknya.",
  },
  {
    q: "Apakah koordinator KKN perlu membuat akun?",
    a: "Tidak. Koordinator mengakses halaman konfirmasi lewat tautan unik yang dikirim universitas, tanpa perlu mendaftar.",
  },
  {
    q: "Bagaimana saya tahu ada perkembangan pada pengajuan?",
    a: "Setiap perubahan status, seperti pengajuan masuk, disetujui, ditolak, atau kesepakatan dikonfirmasi, muncul sebagai notifikasi di dashboard Anda.",
  },
  {
    q: "Di mana dokumentasi dan riwayat kerja sama disimpan?",
    a: "Semua kerja sama tersimpan sebagai riwayat di akun desa maupun universitas, sehingga jejak dampak dapat ditinjau kembali kapan saja.",
  },
  {
    q: "Apakah saya bisa mencoba dulu tanpa mendaftar?",
    a: "Bisa. Gunakan panel demo di pojok kanan bawah untuk masuk sebagai desa, universitas, atau admin. Data demo tersimpan di browser Anda saja, bukan di server.",
  },
];
