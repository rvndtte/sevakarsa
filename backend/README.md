# Sevakarsa Backend

Backend Next.js yang disiapkan untuk platform Sevakarsa dengan integrasi Supabase dan skema database private-by-default.

## Struktur utama

- `src/app/api` : endpoint API server-side
- `src/lib/supabase` : konfigurasi client dan server Supabase
- `src/middleware.ts` : proteksi route untuk halaman dashboard
- `sql/sumbangruang_desa_schema.sql` : schema SQL untuk Supabase
- `.env.example` : contoh environment variable

## Private Supabase setup

Untuk menjaga Supabase tetap private, ikuti aturan berikut:

1. Jangan pernah menaruh `SUPABASE_SERVICE_ROLE_KEY` ke frontend.
2. Gunakan `NEXT_PUBLIC_SUPABASE_ANON_KEY` hanya untuk browser client jika memang diperlukan.
3. Aktifkan Row Level Security di PostgreSQL/Supabase.
4. Akses data sensitif hanya melalui server-side API Route atau server action.
5. Pastikan file SQL di [sql/sumbangruang_desa_schema.sql](sql/sumbangruang_desa_schema.sql) dijalankan di Supabase SQL Editor.

## Langkah cepat

```bash
cd backend
cp .env.example .env.local
npm install
npm run dev
```

Lalu buka:

- http://localhost:3000
- http://localhost:3000/api/health

## Variabel environment

Isi file `.env.local` dengan credential dari Supabase project kamu:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase SQL

Jalankan isi file [sql/sumbangruang_desa_schema.sql](sql/sumbangruang_desa_schema.sql) di Supabase SQL Editor. Setelah itu, buat project storage dan konfigurasi RLS sesuai kebutuhan real-world aplikasi.

## Catatan penting

> Proyek ini sudah dibuat dengan backend yang siap, tetapi saat ini mesin lokal sedang memakai Node 18.8.0. Untuk build dan runtime yang lebih aman, sebaiknya gunakan Node 20 LTS atau lingkungan Vercel/Render yang sudah sesuai.
