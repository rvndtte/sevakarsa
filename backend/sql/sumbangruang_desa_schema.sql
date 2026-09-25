CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. User profile (role-aware, 1 profile per auth user)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('desa', 'univ', 'admin')),
  nama TEXT NOT NULL,
  email_kontak TEXT,
  kota TEXT,
  provinsi TEXT,
  alamat TEXT,
  nomor_hp TEXT,
  status_verifikasi TEXT NOT NULL DEFAULT 'pending'
    CHECK (status_verifikasi IN ('pending', 'approved', 'rejected')),
  catatan_verifikasi TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Desa profile
CREATE TABLE IF NOT EXISTS public.desa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  kecamatan TEXT,
  jumlah_penduduk INTEGER,
  luas_km2 NUMERIC(10,2),
  jumlah_umkm INTEGER,
  tentang TEXT,
  potensi TEXT[],
  fasilitas TEXT[],
  nama_kontak TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Universitas profile
CREATE TABLE IF NOT EXISTS public.universitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  bidang_keahlian TEXT[],
  program_studi TEXT[],
  tentang TEXT,
  program_tercatat TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Competencies
CREATE TABLE IF NOT EXISTS public.kompetensi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.kompetensi (nama)
VALUES
  ('Web Development'),
  ('UI/UX Design'),
  ('Data Analysis'),
  ('Bisnis'),
  ('IoT'),
  ('Bioteknologi'),
  ('Agribisnis'),
  ('Pendidikan'),
  ('Kesehatan Masyarakat'),
  ('Desain Grafis'),
  ('Manajemen Proyek'),
  ('Pemasaran Digital')
ON CONFLICT (nama) DO NOTHING;

-- 5. Kebutuhan desa
CREATE TABLE IF NOT EXISTS public.kebutuhan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  desa_id UUID NOT NULL REFERENCES public.desa(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  kategori TEXT NOT NULL,
  deskripsi TEXT,
  kondisi_saat_ini TEXT,
  kebutuhan_diharapkan TEXT,
  target_output TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','available','requested','connected','matched','expired','rejected','declined','closed','done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kebutuhan_kompetensi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kebutuhan_id UUID NOT NULL REFERENCES public.kebutuhan(id) ON DELETE CASCADE,
  kompetensi_id UUID NOT NULL REFERENCES public.kompetensi(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_kebutuhan_kompetensi UNIQUE (kebutuhan_id, kompetensi_id)
);

-- 6. Kerja sama
CREATE TABLE IF NOT EXISTS public.kerja_sama (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kebutuhan_id UUID NOT NULL REFERENCES public.kebutuhan(id) ON DELETE CASCADE,
  desa_id UUID NOT NULL REFERENCES public.desa(id) ON DELETE CASCADE,
  universitas_id UUID NOT NULL REFERENCES public.universitas(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','connected','matched','rejected','expired','declined','closed','done')),
  kuota_kelompok INTEGER NOT NULL DEFAULT 1,
  pesan TEXT,
  catatan_tolak TEXT,
  approved_at TIMESTAMPTZ,
  active_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Koordinator KKN
CREATE TABLE IF NOT EXISTS public.koordinator_kerja_sama (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kerja_sama_id UUID NOT NULL REFERENCES public.kerja_sama(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  nomor_hp TEXT,
  email TEXT,
  token_undangan TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Kelompok konfirmasi
CREATE TABLE IF NOT EXISTS public.kelompok_konfirmasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kerja_sama_id UUID NOT NULL REFERENCES public.kerja_sama(id) ON DELETE CASCADE,
  koordinator_id UUID NOT NULL REFERENCES public.koordinator_kerja_sama(id) ON DELETE CASCADE,
  nama_kelompok TEXT NOT NULL,
  dpl TEXT,
  jumlah_mahasiswa INTEGER,
  tgl_mulai DATE,
  tgl_selesai DATE,
  program_utama TEXT,
  catatan TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','confirmed','revision','closed')),
  review_note TEXT,
  revisi_ke INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Dokumen verifikasi umum
CREATE TABLE IF NOT EXISTS public.dokumen_verifikasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entitas_type TEXT NOT NULL CHECK (entitas_type IN ('desa','univ')),
  entitas_id UUID NOT NULL,
  jenis_dokumen TEXT NOT NULL,
  nama_file TEXT NOT NULL,
  file_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  catatan_admin TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Dokumen kerja sama
CREATE TABLE IF NOT EXISTS public.dokumen_kerja_sama (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kerja_sama_id UUID NOT NULL REFERENCES public.kerja_sama(id) ON DELETE CASCADE,
  nama_file TEXT NOT NULL,
  file_path TEXT NOT NULL,
  tipe TEXT NOT NULL CHECK (tipe IN ('pdf','report','photo')),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Notifikasi
CREATE TABLE IF NOT EXISTS public.notifikasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipe TEXT NOT NULL,
  judul TEXT,
  pesan TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Log aktivitas
CREATE TABLE IF NOT EXISTS public.log_aktivitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role TEXT CHECK (actor_role IN ('admin','desa','univ','system')),
  aksi TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_desa_profile_id ON public.desa(profile_id);
CREATE INDEX IF NOT EXISTS idx_universitas_profile_id ON public.universitas(profile_id);
CREATE INDEX IF NOT EXISTS idx_kebutuhan_desa ON public.kebutuhan(desa_id);
CREATE INDEX IF NOT EXISTS idx_kebutuhan_status ON public.kebutuhan(status);
CREATE INDEX IF NOT EXISTS idx_kebutuhan_kompetensi_keb ON public.kebutuhan_kompetensi(kebutuhan_id);
CREATE INDEX IF NOT EXISTS idx_kerja_sama_desa ON public.kerja_sama(desa_id);
CREATE INDEX IF NOT EXISTS idx_kerja_sama_univ ON public.kerja_sama(universitas_id);
CREATE INDEX IF NOT EXISTS idx_kerja_sama_status ON public.kerja_sama(status);
CREATE INDEX IF NOT EXISTS idx_dokumen_verif_user ON public.dokumen_verifikasi(user_id);
CREATE INDEX IF NOT EXISTS idx_notifikasi_user ON public.notifikasi(user_id);
CREATE INDEX IF NOT EXISTS idx_log_user ON public.log_aktivitas(user_id);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kompetensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kebutuhan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kebutuhan_kompetensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kerja_sama ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.koordinator_kerja_sama ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kelompok_konfirmasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokumen_verifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokumen_kerja_sama ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_aktivitas ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies
CREATE POLICY "profiles_self" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "admin_profiles_all" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
);

CREATE POLICY "desa_self" ON public.desa FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = desa.profile_id AND p.user_id = auth.uid())
);
CREATE POLICY "desa_update_self" ON public.desa FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = desa.profile_id AND p.user_id = auth.uid())
);

CREATE POLICY "univ_self" ON public.universitas FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = universitas.profile_id AND p.user_id = auth.uid())
);
CREATE POLICY "univ_update_self" ON public.universitas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = universitas.profile_id AND p.user_id = auth.uid())
);

CREATE POLICY "kompetensi_public" ON public.kompetensi FOR SELECT USING (true);

CREATE POLICY "kebutuhan_owner" ON public.kebutuhan FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.desa d
    JOIN public.profiles p ON p.id = d.profile_id
    WHERE d.id = kebutuhan.desa_id AND p.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.desa d
    JOIN public.profiles p ON p.id = d.profile_id
    WHERE d.id = kebutuhan.desa_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "kebutuhan_public_available" ON public.kebutuhan FOR SELECT USING (status = 'available');

CREATE POLICY "kerja_sama_related" ON public.kerja_sama FOR SELECT USING (
  desa_id IN (SELECT d.id FROM public.desa d JOIN public.profiles p ON p.id = d.profile_id WHERE p.user_id = auth.uid())
  OR universitas_id IN (SELECT u.id FROM public.universitas u JOIN public.profiles p ON p.id = u.profile_id WHERE p.user_id = auth.uid())
);

CREATE POLICY "kerja_sama_insert_univ" ON public.kerja_sama FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.universitas u
    JOIN public.profiles p ON p.id = u.profile_id
    WHERE u.id = kerja_sama.universitas_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "dok_verif_self" ON public.dokumen_verifikasi FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "dok_verif_insert_self" ON public.dokumen_verifikasi FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "notif_self" ON public.notifikasi FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notif_update_self" ON public.notifikasi FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "log_admin" ON public.log_aktivitas FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "log_self" ON public.log_aktivitas FOR SELECT USING (user_id = auth.uid());
