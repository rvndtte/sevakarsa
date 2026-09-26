# SevaKarsa — Frontend

Platform yang menghubungkan desa dengan universitas untuk program KKN.
Next.js (App Router) · TypeScript · Tailwind CSS v4 · Three.js.

Saat ini **belum ada backend**: data disimpan di `localStorage` browser (lapisan `src/domain`).
Saat backend siap, cukup lapisan itu yang diganti dengan pemanggil API (lihat "Menyambung ke backend").

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm test           # tes aturan bisnis (Vitest)
npm run typecheck
npm run lint
```

Akun demo (kata sandi `demo123`): `desa@demo.id`, `univ@demo.ac.id`, `admin@demo.id`.
Panel demo di pojok kanan bawah untuk berganti akun, memajukan waktu (uji kedaluwarsa & pengingat), dan mereset data.
Halaman koordinator (tanpa login) dapat dicoba di `/koordinator/tk-k2`.

## Struktur

```
src/
├── app/                     Routing saja. Setiap page.tsx hanya merender satu "screen".
│   ├── page.tsx             Landing
│   ├── (auth)/              login, register, registered
│   ├── (app)/               Halaman berpanel samping, dijaga per peran
│   │   ├── desa/  univ/  admin/
│   │   ├── (collab)/        partnerships, status (desa + univ)
│   │   └── notifications/
│   └── koordinator/[token]/ Halaman koordinator (tanpa login)
├── features/                Layar & komponen per fitur (desa, univ, admin, partnership, auth, landing, …)
├── components/
│   ├── ui/                  Komponen dasar (Button, Card, Field, Modal, …), tanpa logika bisnis
│   ├── layout/              AppShell, RoleOnly (guard peran), DemoPanel
│   └── providers/           Toast, konfirmasi berbasis Promise, pemuat data
├── domain/                  Logika bisnis murni, tanpa React/DOM
│   ├── types.ts  constants.ts  seed.ts
│   ├── database.ts          Penyimpanan (memori + localStorage) — satu-satunya titik I/O
│   ├── queries.ts           Pembacaan data
│   ├── services/            Aturan bisnis: auth, problems, partnerships, notifications, scheduler
│   └── __tests__/
├── three/                   Three.js
│   ├── ThreeCanvas.tsx      Host React: ukuran, jeda saat tak terlihat, dispose
│   ├── controller.ts        Kontrak SceneController + renderer/pointer bersama
│   ├── primitives.ts        Pulau, rumah, pohon, kampus, mahasiswa
│   └── scenes/              HeroScene, ProblemScene, StoryScene
├── hooks/                   useDatabase, useAction, useRequireRole, useInView, …
└── lib/                     cn, format, routes, whatsapp
```

## Konvensi

- **Page tipis, feature tebal.** `app/**/page.tsx` hanya memanggil komponen `*Screen` dari `features/`.
- **Aturan bisnis hanya di `domain/services`.** UI memanggil service lewat `useAction()`, yang menangkap
  `DomainError` dan menampilkannya sebagai toast. Jangan menaruh aturan (batas revisi, kuota, dll.) di komponen.
- **Path aplikasi dari `lib/routes.ts`**, bukan string di komponen.
- **Tailwind saja.** Token warna/font/animasi ada di `app/globals.css` (`@theme`). Warna dinamai semantik
  (`forest`, `leaf`, `honey`, `lake`, `brick`, `plum`, `cream`).
- **Scene 3D berisi kode imperatif Three.js** dan tidak tahu React. Data dari React masuk lewat `three/inputs.ts`.

## Alur bisnis (ringkas)

`Available → Diajukan → Disetujui → Aktif → Selesai`, cabang `Ditolak`, `Kedaluwarsa` (desa tak merespons 7 hari), `Dibatalkan`.

1. Univ mengajukan kerja sama (kuota kelompok) → kebutuhan terkunci.
2. Desa menyetujui/menolak sekali → kontak kedua pihak terbuka.
3. Diskusi teknis di WhatsApp (di luar platform); admin univ mengundang koordinator lewat tautan tanpa akun.
4. Koordinator mengisi konfirmasi kesepakatan per kelompok; desa menekan **Sesuai** atau **Perlu revisi** (maks. 2×,
   setelah itu Sesuai atau Tutup kelompok dengan alasan).
5. Univ tidak dapat membatalkan setelah disetujui.

## Menyambung ke backend

`domain/services/*` adalah prototipe backend: tiap fungsi (`requestPartnership`, `respondRequest`, `saveGroup`, …)
menjadi satu endpoint, `scheduler.tick()` menjadi job terjadwal, dan `database.ts` diganti klien API.
Komponen hanya bergantung pada tanda tangan fungsi service dan hook `useDatabaseVersion`, sehingga UI sebagian besar
tidak perlu diubah.

## Folder `legacy/`

Prototipe awal (HTML + JS vanilla) sebelum migrasi ke Next.js. Hanya arsip referensi,
tidak dipakai oleh aplikasi. Buka `legacy/index.html` langsung di browser bila perlu.
