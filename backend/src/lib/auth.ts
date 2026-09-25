import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";

export type AppRole = "desa" | "univ" | "admin";

export async function getCurrentSession() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const serviceSupabase = createServiceSupabaseClient();
  const { data: profile, error: profileError } = await serviceSupabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    return {
      user,
      profile: {
        id: null,
        user_id: user.id,
        role: String(user.user_metadata?.role ?? "desa").toLowerCase(),
        nama: String(user.user_metadata?.nama ?? user.email ?? "Pengguna"),
        email_kontak: user.email,
        kota: null,
        provinsi: null,
        alamat: null,
        nomor_hp: null,
        status_verifikasi: "pending",
        catatan_verifikasi: null,
        verified_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  if (profile.role === "desa") {
    const { data: desaRow } = await serviceSupabase
      .from("desa")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (!desaRow) {
      await serviceSupabase.from("desa").insert({
        profile_id: profile.id,
        kecamatan: null,
        jumlah_penduduk: null,
        luas_km2: null,
        jumlah_umkm: null,
        tentang: null,
        potensi: null,
        fasilitas: null,
        nama_kontak: String(profile.nama || user.email || "Kontak Desa"),
      });
    }
  }

  if (profile.role === "univ") {
    const { data: univRow } = await serviceSupabase
      .from("universitas")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (!univRow) {
      await serviceSupabase.from("universitas").insert({
        profile_id: profile.id,
        bidang_keahlian: null,
        program_studi: null,
        tentang: null,
        program_tercatat: null,
      });
    }
  }

  return { user, profile };
}

export async function requireAuth() {
  const session = await getCurrentSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireRole(allowedRoles: AppRole | AppRole[]) {
  const session = await requireAuth();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!session.profile || !roles.includes(session.profile.role as AppRole)) {
    throw new Error("Forbidden");
  }

  return session;
}
