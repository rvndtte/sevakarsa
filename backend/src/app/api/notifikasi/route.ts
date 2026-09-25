import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function normalizeNotification(row: any = null) {
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    type: row.tipe ?? row.type ?? "status",
    text: row.pesan ?? row.text ?? row.judul ?? "",
    link: row.link ?? "#",
    read: Boolean(row.is_read ?? row.read ?? false),
    ts: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

export async function GET() {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("notifikasi")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: (data || []).map(normalizeNotification) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabaseClient();
    const body = await request.json();

    if (body.mark_all_read) {
      const { data, error } = await supabase
        .from("notifikasi")
        .update({ is_read: true })
        .eq("user_id", session.user.id)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, data: (data || []).map(normalizeNotification) });
    }

    if (!body.id) {
      return NextResponse.json({ error: "id notifikasi wajib diisi." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("notifikasi")
      .update({ is_read: body.is_read ?? true })
      .eq("id", body.id)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Notifikasi tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: normalizeNotification(data) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
