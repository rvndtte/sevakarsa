import { NextResponse } from "next/server";

import { requireAuth, requireRole } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function normalizeProfile(profile: any = null) {
  if (!profile) return null;

  return {
    ...profile,
    id: profile.id,
    role: String(profile.role || "desa").toLowerCase(),
    name: profile.nama || profile.name || "",
    city: profile.kota || profile.city || "Kab. Malang",
    province: profile.provinsi || profile.province || "Jawa Timur",
    about: profile.tentang || profile.about || "",
    contactName: profile.nama_kontak || profile.contactName || profile.nama || "",
    phone: profile.nomor_hp || profile.phone || "",
    email: profile.email_kontak || profile.email || "",
  };
}

function normalizeDesa(row: any = null) {
  if (!row) return null;

  const profile = normalizeProfile(row.profiles || row.profile || null);

  return {
    id: row.id,
    profileId: row.profile_id,
    role: "desa",
    name: profile?.name || row.nama || "Desa",
    city: profile?.city || "Kab. Malang",
    province: profile?.province || "Jawa Timur",
    about: row.tentang || profile?.about || "",
    kecamatan: row.kecamatan || "",
    population: row.jumlah_penduduk ?? profile?.population ?? "",
    area: row.luas_km2 ?? profile?.area ?? "",
    umkm: row.jumlah_umkm ?? profile?.umkm ?? "",
    potentials: Array.isArray(row.potensi) ? row.potensi : profile?.potentials || [],
    facilities: Array.isArray(row.fasilitas) ? row.fasilitas : profile?.facilities || [],
    contactName: row.nama_kontak || profile?.contactName || "",
    phone: profile?.phone || row.nomor_hp || "",
    email: profile?.email || row.email_kontak || "",
    profile,
  };
}

export async function GET() {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabaseClient();

    if (session.profile.role === "admin") {
      const { data, error } = await supabase
        .from("desa")
        .select("*, profiles(*)")
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data: (data || []).map(normalizeDesa) });
    }

    if (session.profile.role === "desa") {
      const { data, error } = await supabase
        .from("desa")
        .select("*, profiles(*)")
        .eq("profile_id", session.profile.id)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data: normalizeDesa(data) });
    }

    const { data, error } = await supabase
      .from("desa")
      .select("*, profiles(*)")
      .eq("profiles.status_verifikasi", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: (data || []).map(normalizeDesa) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("desa");
    const supabase = await createServerSupabaseClient();
    const body = await request.json();

    const { data: existing } = await supabase
      .from("desa")
      .select("*")
      .eq("profile_id", session.profile.id)
      .maybeSingle();

    const payload = {
      profile_id: session.profile.id,
      kecamatan: body.kecamatan ?? null,
      jumlah_penduduk: body.jumlah_penduduk ?? null,
      luas_km2: body.luas_km2 ?? null,
      jumlah_umkm: body.jumlah_umkm ?? null,
      tentang: body.tentang ?? null,
      potensi: Array.isArray(body.potensi) ? body.potensi : null,
      fasilitas: Array.isArray(body.fasilitas) ? body.fasilitas : null,
      nama_kontak: body.nama_kontak ?? session.profile.nama ?? null,
    };

    const { data: desaData, error: desaError } = existing
      ? await supabase.from("desa").update(payload).eq("id", existing.id).select().single()
      : await supabase.from("desa").insert(payload).select().single();

    if (desaError || !desaData) {
      return NextResponse.json({ error: desaError?.message ?? "Gagal menyimpan desa." }, { status: 400 });
    }

    const profilePayload = {
      nama: body.nama ?? session.profile.nama,
      email_kontak: body.email_kontak ?? session.profile.email_kontak,
      kota: body.kota ?? session.profile.kota,
      provinsi: body.provinsi ?? session.profile.provinsi,
      alamat: body.alamat ?? session.profile.alamat,
      nomor_hp: body.nomor_hp ?? session.profile.nomor_hp,
    };

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .update(profilePayload)
      .eq("id", session.profile.id)
      .select()
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: profileError?.message ?? "Gagal memperbarui profil." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        desa: normalizeDesa(desaData),
        profile: normalizeProfile(profileData),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
