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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("kerja_sama")
      .select("*, kebutuhan(*, desa(*, profiles(*))), desa(*, profiles(*)), universitas(*, profiles(*))")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "Kerja sama tidak ditemukan." }, { status: 404 });
    }

    if (session.profile.role === "admin") {
      return NextResponse.json({ data });
    }

    const { data: desaRecord } = await supabase
      .from("desa")
      .select("id")
      .eq("profile_id", session.profile.id)
      .maybeSingle();

    const { data: univRecord } = await supabase
      .from("universitas")
      .select("id")
      .eq("profile_id", session.profile.id)
      .maybeSingle();

    if (
      (session.profile.role === "desa" && data.desa_id !== desaRecord?.id) ||
      (session.profile.role === "univ" && data.universitas_id !== univRecord?.id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: normalizeKerjaSama(data) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const supabase = await createServerSupabaseClient();
    const body = await request.json();

    const { data: existing, error: findError } = await supabase
      .from("kerja_sama")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (findError || !existing) {
      return NextResponse.json({ error: findError?.message ?? "Kerja sama tidak ditemukan." }, { status: 404 });
    }

    if (session.profile.role !== "admin") {
      const { data: desaRecord } = await supabase
        .from("desa")
        .select("id")
        .eq("profile_id", session.profile.id)
        .maybeSingle();

      const { data: univRecord } = await supabase
        .from("universitas")
        .select("id")
        .eq("profile_id", session.profile.id)
        .maybeSingle();

      if (
        (session.profile.role === "desa" && existing.desa_id !== desaRecord?.id) ||
        (session.profile.role === "univ" && existing.universitas_id !== univRecord?.id)
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const updatePayload = {
      status: body.status ?? existing.status,
      kuota_kelompok: body.kuota_kelompok ?? existing.kuota_kelompok,
      pesan: body.pesan ?? existing.pesan,
      catatan_tolak: body.catatan_tolak ?? existing.catatan_tolak,
      approved_at: body.approved_at ?? existing.approved_at,
      active_at: body.active_at ?? existing.active_at,
      completed_at: body.completed_at ?? existing.completed_at,
    };

    const { data: updated, error: updateError } = await supabase
      .from("kerja_sama")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: updateError?.message ?? "Gagal memperbarui kerja sama." }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: normalizeKerjaSama(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
