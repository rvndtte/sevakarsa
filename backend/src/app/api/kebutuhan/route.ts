import { NextResponse } from "next/server";

import { applyCorsHeaders, createCorsPreflightResponse } from "@/lib/cors";
import { requireAuth, requireRole } from "@/lib/auth";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

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

function normalizeKebutuhan(row: any = null) {
  if (!row) return null;

  const desaProfile = row.desa?.profiles || row.desa?.profile || null;
  const skills = Array.isArray(row.kebutuhan_kompetensi)
    ? row.kebutuhan_kompetensi
        .map((item: any) => item.kompetensi?.nama || item.nama || "")
        .filter(Boolean)
    : Array.isArray(row.skills)
      ? row.skills
      : [];

  return {
    id: row.id,
    desaId: row.desa_id ?? row.desa?.id,
    title: row.judul || row.title || "",
    category: row.kategori || row.category || "Teknologi",
    city: desaProfile?.kota || row.city || "Kab. Malang",
    province: desaProfile?.provinsi || row.province || "Jawa Timur",
    skills,
    duration: Number(row.duration ?? 2),
    teamMin: Number(row.teamMin ?? row.team_min ?? 3),
    teamMax: Number(row.teamMax ?? row.team_max ?? 5),
    status: row.status || "draft",
    createdAt: new Date(row.created_at || Date.now()).getTime(),
    deadline: row.deadline ? new Date(row.deadline).getTime() : Date.now() + 30 * 86400000,
    desc: row.deskripsi || row.desc || "",
    condition: row.kondisi_saat_ini || row.condition || "",
    need: row.kebutuhan_diharapkan || row.need || "",
    target: row.target_output || row.target || "",
    desa: row.desa ? { ...row.desa, profile: normalizeProfile(desaProfile) } : null,
  };
}

async function resolveKompetensiIds(supabase: any, values: unknown) {
  if (!Array.isArray(values) || values.length === 0) return [];

  const items = values.filter((value) => typeof value === "string" && value.trim().length > 0);
  if (items.length === 0) return [];

  const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  const ids = items.filter((value) => isUuid(value));
  const names = items.filter((value) => !isUuid(value));

  if (names.length === 0) {
    return ids;
  }

  const { data, error } = await supabase
    .from("kompetensi")
    .select("id, nama")
    .in("nama", names);

  if (error) {
    throw new Error(error.message);
  }

  const mappedIds = (data || []).map((entry: any) => entry.id).filter(Boolean);
  return [...new Set([...ids, ...mappedIds])];
}

export async function OPTIONS(request: Request) {
  return createCorsPreflightResponse(request);
}

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const supabase = createServiceSupabaseClient();

    if (session.profile.role === "desa") {
      const { data: desa } = await supabase
        .from("desa")
        .select("id")
        .eq("profile_id", session.profile.id)
        .maybeSingle();

      const { data, error } = await supabase
        .from("kebutuhan")
        .select("*, kebutuhan_kompetensi(*, kompetensi(*)), desa(*, profiles(*))")
        .eq("desa_id", desa?.id)
        .order("created_at", { ascending: false });

      if (error) {
        return applyCorsHeaders(NextResponse.json({ error: error.message }, { status: 400 }), request);
      }

      return applyCorsHeaders(NextResponse.json({ data: (data || []).map(normalizeKebutuhan) }), request);
    }

    if (session.profile.role === "admin") {
      const { data, error } = await supabase
        .from("kebutuhan")
        .select("*, kebutuhan_kompetensi(*, kompetensi(*)), desa(*, profiles(*))")
        .order("created_at", { ascending: false });

      if (error) {
        return applyCorsHeaders(NextResponse.json({ error: error.message }, { status: 400 }), request);
      }

      return applyCorsHeaders(NextResponse.json({ data: (data || []).map(normalizeKebutuhan) }), request);
    }

    const { data, error } = await supabase
      .from("kebutuhan")
      .select("*, kebutuhan_kompetensi(*, kompetensi(*)), desa(*, profiles(*))")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (error) {
      return applyCorsHeaders(NextResponse.json({ error: error.message }, { status: 400 }), request);
    }

    return applyCorsHeaders(NextResponse.json({ data: (data || []).map(normalizeKebutuhan) }), request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return applyCorsHeaders(NextResponse.json({ error: message }, { status }), request);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("desa");
    const supabase = createServiceSupabaseClient();
    const body = await request.json();

    const { data: desa } = await supabase
      .from("desa")
      .select("id")
      .eq("profile_id", session.profile.id)
      .maybeSingle();

    if (!desa) {
      return applyCorsHeaders(NextResponse.json({ error: "Profil desa belum dibuat." }, { status: 400 }), request);
    }

    const payload = {
      desa_id: desa.id,
      judul: body.judul ?? body.title,
      kategori: body.kategori ?? body.category,
      deskripsi: body.deskripsi ?? body.desc ?? null,
      kondisi_saat_ini: body.kondisi_saat_ini ?? body.condition ?? null,
      kebutuhan_diharapkan: body.kebutuhan_diharapkan ?? body.need ?? null,
      target_output: body.target_output ?? body.target ?? null,
      status: body.status ?? "draft",
    };

    const { data: kebutuhan, error: kebutuhanError } = await supabase
      .from("kebutuhan")
      .insert(payload)
      .select()
      .single();

    if (kebutuhanError || !kebutuhan) {
      return applyCorsHeaders(NextResponse.json({ error: kebutuhanError?.message ?? "Gagal membuat kebutuhan." }, { status: 400 }), request);
    }

    const kompetensiIds = await resolveKompetensiIds(supabase, body.kompetensi_ids ?? body.kompetensi ?? body.skills ?? []);

    if (kompetensiIds.length > 0) {
      const rows = kompetensiIds.map((kompetensiId: string) => ({
        kebutuhan_id: kebutuhan.id,
        kompetensi_id: kompetensiId,
      }));

      const { error: kompetensiError } = await supabase.from("kebutuhan_kompetensi").insert(rows);

      if (kompetensiError) {
        return applyCorsHeaders(NextResponse.json({ error: kompetensiError.message }, { status: 400 }), request);
      }
    }

    return applyCorsHeaders(NextResponse.json({ success: true, data: normalizeKebutuhan(kebutuhan) }), request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return applyCorsHeaders(NextResponse.json({ error: message }, { status }), request);
  }
}
