import { NextRequest, NextResponse } from "next/server";

import { applyCorsHeaders, createCorsPreflightResponse } from "@/lib/cors";
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";

export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      const response = NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 },
      );
      return applyCorsHeaders(response, request);
    }

    const response = NextResponse.json({ success: true, message: "Login berhasil." });
    const supabase = await createServerSupabaseClient(response);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      const errResponse = NextResponse.json({ error: error?.message ?? "Login gagal." }, { status: 401 });
      return applyCorsHeaders(errResponse, request);
    }

    const serviceSupabase = createServiceSupabaseClient();
    const { data: profileRow } = await serviceSupabase
      .from("profiles")
      .select("*")
      .eq("user_id", data.user.id)
      .maybeSingle();

    const profile =
      profileRow ?? {
        id: null,
        user_id: data.user.id,
        role: String(data.user.user_metadata?.role ?? "desa").toLowerCase(),
        nama: String(data.user.user_metadata?.nama ?? data.user.email ?? "Pengguna"),
        email_kontak: data.user.email,
        kota: null,
        provinsi: null,
        alamat: null,
        nomor_hp: null,
        status_verifikasi: "pending",
        catatan_verifikasi: null,
        verified_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

    const finalResponse = NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      profile,
    });

    for (const cookie of response.cookies.getAll()) {
      finalResponse.cookies.set(cookie.name, cookie.value, cookie.options);
    }

    return applyCorsHeaders(finalResponse, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const response = NextResponse.json({ error: message }, { status: 500 });
    return applyCorsHeaders(response, request);
  }
}
