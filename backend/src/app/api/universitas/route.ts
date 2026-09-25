import { NextResponse } from "next/server";

import { requireAuth, requireRole } from "@/lib/auth";
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
    fields: Array.isArray(row.bidang_keahlian) ? row.bidang_keahlian : profile?.fields || [],
    programs: Array.isArray(row.program_studi) ? row.program_studi : profile?.programs || [],
    history: Array.isArray(row.program_tercatat) ? row.program_tercatat : profile?.history || [],
    contactName: profile?.contactName || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
    profile,
  };
}

export async function GET() {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabaseClient();

    if (session.profile.role === "admin") {
      const { data, error } = await supabase
        .from("universitas")
        .select("*, profiles(*)")
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data: (data || []).map(normalizeUniversitas) });
    }

    if (session.profile.role === "univ") {
      const { data, error } = await supabase
        .from("universitas")
        .select("*, profiles(*)")
        .eq("profile_id", session.profile.id)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data: normalizeUniversitas(data) });
    }

    const { data, error } = await supabase
      .from("universitas")
      .select("*, profiles(*)")
      .eq("profiles.status_verifikasi", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: (data || []).map(normalizeUniversitas) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("univ");
    const supabase = await createServerSupabaseClient();
    const body = await request.json();

    const { data: existing } = await supabase
      .from("universitas")
      .select("*")
      .eq("profile_id", session.profile.id)
      .maybeSingle();

    const payload = {
      profile_id: session.profile.id,
      bidang_keahlian: Array.isArray(body.bidang_keahlian) ? body.bidang_keahlian : null,
      program_studi: Array.isArray(body.program_studi) ? body.program_studi : null,
      tentang: body.tentang ?? null,
      program_tercatat: Array.isArray(body.program_tercatat) ? body.program_tercatat : null,
    };

    const { data: univData, error: univError } = existing
      ? await supabase.from("universitas").update(payload).eq("id", existing.id).select().single()
      : await supabase.from("universitas").insert(payload).select().single();

    if (univError || !univData) {
      return NextResponse.json({ error: univError?.message ?? "Gagal menyimpan universitas." }, { status: 400 });
    }

    const { data: profileData, error: profileError } = await supabase
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
        universitas: normalizeUniversitas(univData),
        profile: normalizeProfile(profileData),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
