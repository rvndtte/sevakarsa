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
    ...row,
    id: row.id,
    profileId: row.profile_id,
    role: "desa",
    name: profile?.name || row.nama || "Desa",
    city: profile?.city || "Kab. Malang",
    province: profile?.province || "Jawa Timur",
    about: row.tentang || profile?.about || "",
    profile,
  };
}

function normalizeUniversitas(row: any = null) {
  if (!row) return null;

  const profile = normalizeProfile(row.profiles || row.profile || null);

  return {
    ...row,
    id: row.id,
    profileId: row.profile_id,
    role: "univ",
    name: profile?.name || row.nama || "Universitas",
    city: profile?.city || "Kota Malang",
    province: profile?.province || "Jawa Timur",
    about: row.tentang || profile?.about || "",
    profile,
  };
}

function normalizeKerjaSama(row: any = null) {
  if (!row) return null;

  return {
    id: row.id,
    problemId: row.kebutuhan_id ?? row.problemId ?? row.kebutuhan?.id,
    univId: row.universitas_id ?? row.univId ?? row.universitas?.id,
    desaId: row.desa_id ?? row.desaId ?? row.desa?.id,
    status: row.status ?? "requested",
    createdAt: row.created_at ? new Date(row.created_at).getTime() : null,
    approvedAt: row.approved_at ? new Date(row.approved_at).getTime() : null,
    activeAt: row.active_at ? new Date(row.active_at).getTime() : null,
    completedAt: row.completed_at ? new Date(row.completed_at).getTime() : null,
    message: row.pesan || row.message || "",
    quota: Number(row.kuota_kelompok ?? row.quota ?? 1),
    plan: row.plan || { period: "", students: "" },
    coordinators: Array.isArray(row.coordinators) ? row.coordinators : [],
    groups: Array.isArray(row.groups) ? row.groups : [],
    docs: Array.isArray(row.docs) ? row.docs : [],
    log: Array.isArray(row.log) ? row.log : [],
    problem: row.kebutuhan || null,
    desa: normalizeDesa(row.desa || null),
    universitas: normalizeUniversitas(row.universitas || null),
  };
}

export async function GET() {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabaseClient();

    if (session.profile.role === "admin") {
      const { data, error } = await supabase
        .from("kerja_sama")
        .select("*, kebutuhan(*, desa(*, profiles(*))), desa(*, profiles(*)), universitas(*, profiles(*))")
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data: (data || []).map(normalizeKerjaSama) });
    }

    let query = supabase
      .from("kerja_sama")
      .select("*, kebutuhan(*, desa(*, profiles(*))), desa(*, profiles(*)), universitas(*, profiles(*))");

    if (session.profile.role === "desa") {
      const { data: desa } = await supabase
        .from("desa")
        .select("id")
        .eq("profile_id", session.profile.id)
        .maybeSingle();

      if (!desa) {
        return NextResponse.json({ error: "Profil desa tidak ditemukan." }, { status: 404 });
      }

      query = query.eq("desa_id", desa.id);
    } else if (session.profile.role === "univ") {
      const { data: univ } = await supabase
        .from("universitas")
        .select("id")
        .eq("profile_id", session.profile.id)
        .maybeSingle();

      if (!univ) {
        return NextResponse.json({ error: "Profil universitas tidak ditemukan." }, { status: 404 });
      }

      query = query.eq("universitas_id", univ.id);
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: (data || []).map(normalizeKerjaSama) });
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

    const kebutuhanId = body.kebutuhan_id;
    const desaId = body.desa_id;

    if (!kebutuhanId || !desaId) {
      return NextResponse.json({ error: "kebutuhan_id dan desa_id wajib diisi." }, { status: 400 });
    }

    const { data: universitas } = await supabase
      .from("universitas")
      .select("id")
      .eq("profile_id", session.profile.id)
      .maybeSingle();

    if (!universitas) {
      return NextResponse.json({ error: "Profil universitas belum dibuat." }, { status: 400 });
    }

    const { data: kebutuhan, error: kebutuhanError } = await supabase
      .from("kebutuhan")
      .select("id, desa_id, status")
      .eq("id", kebutuhanId)
      .maybeSingle();

    if (kebutuhanError || !kebutuhan) {
      return NextResponse.json({ error: kebutuhanError?.message ?? "Kebutuhan tidak ditemukan." }, { status: 404 });
    }

    if (kebutuhan.desa_id !== desaId) {
      return NextResponse.json({ error: "Kebutuhan dan desa tidak sesuai." }, { status: 400 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("kerja_sama")
      .insert({
        kebutuhan_id: kebutuhanId,
        desa_id: desaId,
        universitas_id: universitas.id,
        status: body.status ?? "requested",
        kuota_kelompok: body.kuota_kelompok ?? 1,
        pesan: body.pesan ?? null,
        catatan_tolak: body.catatan_tolak ?? null,
      })
      .select()
      .single();

    if (insertError || !inserted) {
      return NextResponse.json({ error: insertError?.message ?? "Gagal membuat kerja sama." }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: inserted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
