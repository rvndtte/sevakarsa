import { NextResponse } from "next/server";

import { applyCorsHeaders, createCorsPreflightResponse } from "@/lib/cors";
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

function normalizeKebutuhan(row: any = null) {
  if (!row) return null;

  const desaProfile = row.desa?.profiles || row.desa?.profile || null;
  const skills = Array.isArray(row.kebutuhan_kompetensi)
    ? row.kebutuhan_kompetensi
        .map((item: any) => item.kompetensi?.nama || item.nama || "")
        .filter(Boolean)
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
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("kebutuhan")
      .select("*, kebutuhan_kompetensi(*, kompetensi(*)), desa(*, profiles(*))")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return applyCorsHeaders(NextResponse.json({ error: error.message }, { status: 400 }), request);
    }

    if (!data) {
      return applyCorsHeaders(NextResponse.json({ error: "Kebutuhan tidak ditemukan." }, { status: 404 }), request);
    }

    if (
      session.profile.role !== "admin" &&
      session.profile.role !== "desa" &&
      data.status !== "available"
    ) {
      return applyCorsHeaders(NextResponse.json({ error: "Forbidden" }, { status: 403 }), request);
    }

    return applyCorsHeaders(NextResponse.json({ data: normalizeKebutuhan(data) }), request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return applyCorsHeaders(NextResponse.json({ error: message }, { status }), request);
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

    const { data: kebutuhan, error: findError } = await supabase
      .from("kebutuhan")
      .select("*, desa(*)")
      .eq("id", id)
      .maybeSingle();

    if (findError || !kebutuhan) {
      return applyCorsHeaders(NextResponse.json({ error: findError?.message ?? "Kebutuhan tidak ditemukan." }, { status: 404 }), request);
    }

    const { data: desa } = await supabase
      .from("desa")
      .select("id")
      .eq("profile_id", session.profile.id)
      .maybeSingle();

    if (session.profile.role !== "admin" && kebutuhan.desa_id !== desa?.id) {
      return applyCorsHeaders(NextResponse.json({ error: "Forbidden" }, { status: 403 }), request);
    }

    const { data: updated, error: updateError } = await supabase
      .from("kebutuhan")
      .update({
        judul: body.judul ?? kebutuhan.judul,
        kategori: body.kategori ?? kebutuhan.kategori,
        deskripsi: body.deskripsi ?? kebutuhan.deskripsi,
        kondisi_saat_ini: body.kondisi_saat_ini ?? kebutuhan.kondisi_saat_ini,
        kebutuhan_diharapkan: body.kebutuhan_diharapkan ?? kebutuhan.kebutuhan_diharapkan,
        target_output: body.target_output ?? kebutuhan.target_output,
        status: body.status ?? kebutuhan.status,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updated) {
      return applyCorsHeaders(NextResponse.json({ error: updateError?.message ?? "Gagal memperbarui kebutuhan." }, { status: 400 }), request);
    }

    const kompetensiIds = await resolveKompetensiIds(supabase, body.kompetensi_ids ?? body.kompetensi ?? body.skills ?? []);

    if (kompetensiIds.length > 0 || Array.isArray(body.kompetensi_ids) || Array.isArray(body.kompetensi) || Array.isArray(body.skills)) {
      await supabase.from("kebutuhan_kompetensi").delete().eq("kebutuhan_id", id);

      if (kompetensiIds.length > 0) {
        const rows = kompetensiIds.map((kompetensiId: string) => ({
          kebutuhan_id: id,
          kompetensi_id: kompetensiId,
        }));

        const { error: kompetensiError } = await supabase.from("kebutuhan_kompetensi").insert(rows);

        if (kompetensiError) {
          return applyCorsHeaders(NextResponse.json({ error: kompetensiError.message }, { status: 400 }), request);
        }
      }
    }

    return applyCorsHeaders(NextResponse.json({ success: true, data: normalizeKebutuhan(updated) }), request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return applyCorsHeaders(NextResponse.json({ error: message }, { status }), request);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const { data: kebutuhan, error: findError } = await supabase
      .from("kebutuhan")
      .select("*, desa(*)")
      .eq("id", id)
      .maybeSingle();

    if (findError || !kebutuhan) {
      return applyCorsHeaders(NextResponse.json({ error: findError?.message ?? "Kebutuhan tidak ditemukan." }, { status: 404 }), request);
    }

    const { data: desa } = await supabase
      .from("desa")
      .select("id")
      .eq("profile_id", session.profile.id)
      .maybeSingle();

    if (session.profile.role !== "admin" && kebutuhan.desa_id !== desa?.id) {
      return applyCorsHeaders(NextResponse.json({ error: "Forbidden" }, { status: 403 }), request);
    }

    const { error: deleteError } = await supabase.from("kebutuhan_kompetensi").delete().eq("kebutuhan_id", id);
    if (deleteError) {
      return applyCorsHeaders(NextResponse.json({ error: deleteError.message }, { status: 400 }), request);
    }

    const { error: removeError } = await supabase.from("kebutuhan").delete().eq("id", id);
    if (removeError) {
      return applyCorsHeaders(NextResponse.json({ error: removeError.message }, { status: 400 }), request);
    }

    return applyCorsHeaders(NextResponse.json({ success: true }), request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return applyCorsHeaders(NextResponse.json({ error: message }, { status }), request);
  }
}
