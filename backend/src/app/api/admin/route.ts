import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    await requireRole("admin");
    const supabase = await createServerSupabaseClient();

    const [desaResult, univResult, pendingResult, kebutuhanResult] = await Promise.all([
      supabase.from("desa").select("id", { count: "exact", head: true }),
      supabase.from("universitas").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("status_verifikasi", "pending"),
      supabase.from("kebutuhan").select("id", { count: "exact", head: true }),
    ]);

    if (desaResult.error || univResult.error || pendingResult.error || kebutuhanResult.error) {
      return NextResponse.json(
        {
          error:
            desaResult.error?.message ??
            univResult.error?.message ??
            pendingResult.error?.message ??
            kebutuhanResult.error?.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      data: {
        total_desa: desaResult.count ?? 0,
        total_universitas: univResult.count ?? 0,
        pending_verifikasi: pendingResult.count ?? 0,
        total_kebutuhan: kebutuhanResult.count ?? 0,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole("admin");
    const supabase = await createServerSupabaseClient();
    const body = await request.json();

    const profileId = body.profile_id;
    const newStatus = body.status;

    if (!profileId || !newStatus) {
      return NextResponse.json({ error: "profile_id dan status wajib diisi." }, { status: 400 });
    }

    if (!['pending', 'approved', 'rejected'].includes(newStatus)) {
      return NextResponse.json({ error: "Status verifikasi tidak valid." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        status_verifikasi: newStatus,
        catatan_verifikasi: body.catatan_verifikasi ?? null,
        verified_at: newStatus === "pending" ? null : new Date().toISOString(),
      })
      .eq("id", profileId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Gagal mengubah status profil." }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
