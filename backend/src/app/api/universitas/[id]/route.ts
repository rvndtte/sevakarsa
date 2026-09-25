import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function normalizeProfile(profile: any = null) {
  if (!profile) return null;

  return {
    ...profile,
    id: profile.id,
    role: String(profile.role || "univ").toLowerCase(),
    name: profile.nama || profile.name || "",
    city: profile.kota || profile.city || "Kota Malang",
    province: profile.provinsi || profile.province || "Jawa Timur",
    about: profile.tentang || profile.about || "",
    contactName: profile.nama_kontak || profile.contactName || profile.nama || "",
    phone: profile.nomor_hp || profile.phone || "",
    email: profile.email_kontak || profile.email || "",
  };
}

function normalizeUniversitas(row: any = null) {
  if (!row) return null;

  const profile = normalizeProfile(row.profiles || row.profile || null);

  return {
    id: row.id,
    profileId: row.profile_id,
    role: "univ",
    name: profile?.name || row.nama || "Universitas",
    city: profile?.city || "Kota Malang",
    province: profile?.province || "Jawa Timur",
    about: row.tentang || profile?.about || "",
    fields: Array.isArray(row.bidang_keahlian) ? row.bidang_keahlian : [],
    programs: Array.isArray(row.program_studi) ? row.program_studi : [],
    history: Array.isArray(row.program_tercatat) ? row.program_tercatat : [],
    contactName: profile?.contactName || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
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
      .from("universitas")
      .select("*, profiles(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "Universitas tidak ditemukan." }, { status: 404 });
    }

    if (
      session.profile.role !== "admin" &&
      session.profile.role !== "univ" &&
      data.profile_id !== session.profile.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: normalizeUniversitas(data) });
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

    const { data: univ, error: univReadError } = await supabase
      .from("universitas")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (univReadError || !univ) {
      return NextResponse.json({ error: univReadError?.message ?? "Universitas tidak ditemukan." }, { status: 404 });
    }

    if (session.profile.role !== "admin" && univ.profile_id !== session.profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: updatedUniv, error: updateError } = await supabase
      .from("universitas")
      .update({
        bidang_keahlian: Array.isArray(body.bidang_keahlian) ? body.bidang_keahlian : univ.bidang_keahlian,
        program_studi: Array.isArray(body.program_studi) ? body.program_studi : univ.program_studi,
        tentang: body.tentang ?? univ.tentang,
        program_tercatat: Array.isArray(body.program_tercatat) ? body.program_tercatat : univ.program_tercatat,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updatedUniv) {
      return NextResponse.json({ error: updateError?.message ?? "Gagal memperbarui universitas." }, { status: 400 });
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
        universitas: updatedUniv,
        profile: updatedProfile,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
