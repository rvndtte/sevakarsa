import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
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
    potentials: Array.isArray(row.potensi) ? row.potensi : [],
    facilities: Array.isArray(row.fasilitas) ? row.fasilitas : [],
    contactName: row.nama_kontak || profile?.contactName || "",
    phone: profile?.phone || row.nomor_hp || "",
    email: profile?.email || row.email_kontak || "",
    profile,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("desa")
      .select("*, profiles(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "Desa tidak ditemukan." }, { status: 404 });
    }

    if (
      session.profile.role !== "admin" &&
      session.profile.role !== "desa" &&
      data.profile_id !== session.profile.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: normalizeDesa(data) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const supabase = await createServerSupabaseClient();
    const body = await request.json();

    const { data: desa, error: desaReadError } = await supabase
      .from("desa")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (desaReadError || !desa) {
      return NextResponse.json({ error: desaReadError?.message ?? "Desa tidak ditemukan." }, { status: 404 });
    }

    if (session.profile.role !== "admin" && desa.profile_id !== session.profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: updatedDesa, error: updateError } = await supabase
      .from("desa")
      .update({
        kecamatan: body.kecamatan ?? desa.kecamatan,
        jumlah_penduduk: body.jumlah_penduduk ?? desa.jumlah_penduduk,
        luas_km2: body.luas_km2 ?? desa.luas_km2,
        jumlah_umkm: body.jumlah_umkm ?? desa.jumlah_umkm,
        tentang: body.tentang ?? desa.tentang,
        potensi: Array.isArray(body.potensi) ? body.potensi : desa.potensi,
        fasilitas: Array.isArray(body.fasilitas) ? body.fasilitas : desa.fasilitas,
        nama_kontak: body.nama_kontak ?? desa.nama_kontak,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updatedDesa) {
      return NextResponse.json({ error: updateError?.message ?? "Gagal memperbarui desa." }, { status: 400 });
    }

    const { data: updatedProfile, error: profileError } = await supabase
      .from("profiles")
      .update({
        nama: body.nama ?? session.profile.nama,
        email_kontak: body.email_kontak ?? session.profile.email_kontak,
        kota: body.kota ?? session.profile.kota,
        provinsi: body.provinsi ?? session.profile.provinsi,
        alamat: body.alamat ?? session.profile.alamat,
        nomor_hp: body.nomor_hp ?? session.profile.nomor_hp,
      })
      .eq("id", session.profile.id)
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        desa: updatedDesa,
        profile: updatedProfile,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
