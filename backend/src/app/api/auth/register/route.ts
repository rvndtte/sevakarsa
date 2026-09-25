import { NextRequest, NextResponse } from "next/server";

import { applyCorsHeaders, createCorsPreflightResponse } from "@/lib/cors";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const role = String(body.role ?? "").trim().toLowerCase();
    const nama = String(body.nama ?? "").trim();

    if (!email || !password || !nama || !["desa", "univ", "admin"].includes(role)) {
      const response = NextResponse.json(
        {
          error: "Email, password, role, dan nama wajib diisi.",
        },
        { status: 400 },
      );
      return applyCorsHeaders(response, request);
    }

    const serviceSupabase = createServiceSupabaseClient();

    const { data: authUser, error: createUserError } =
      await serviceSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role,
          nama,
        },
      });

    if (createUserError || !authUser?.user) {
      const response = NextResponse.json(
        {
          error: createUserError?.message ?? "Gagal membuat user.",
        },
        { status: 400 },
      );
      return applyCorsHeaders(response, request);
    }

    const { data: profile, error: profileError } = await serviceSupabase
      .from("profiles")
      .insert({
        user_id: authUser.user.id,
        role,
        nama,
        email_kontak: email,
        kota: body.kota ?? null,
        provinsi: body.provinsi ?? null,
        alamat: body.alamat ?? null,
        nomor_hp: body.nomor_hp ?? null,
      })
      .select()
      .single();

    if (profileError || !profile) {
      const response = NextResponse.json(
        {
          error: profileError?.message ?? "Gagal membuat profil user.",
        },
        { status: 400 },
      );
      return applyCorsHeaders(response, request);
    }

    if (role === "desa") {
      const { error: desaError } = await serviceSupabase.from("desa").insert({
        profile_id: profile.id,
        kecamatan: body.kecamatan ?? null,
        jumlah_penduduk: body.jumlah_penduduk ?? null,
        luas_km2: body.luas_km2 ?? null,
        jumlah_umkm: body.jumlah_umkm ?? null,
        tentang: body.tentang ?? null,
        potensi: Array.isArray(body.potensi) ? body.potensi : null,
        fasilitas: Array.isArray(body.fasilitas) ? body.fasilitas : null,
        nama_kontak: body.nama_kontak ?? nama,
      });

      if (desaError) {
        const response = NextResponse.json({ error: desaError.message }, { status: 400 });
        return applyCorsHeaders(response, request);
      }
    }

    if (role === "univ") {
      const { error: univError } = await serviceSupabase.from("universitas").insert({
        profile_id: profile.id,
        bidang_keahlian: Array.isArray(body.bidang_keahlian) ? body.bidang_keahlian : null,
        program_studi: Array.isArray(body.program_studi) ? body.program_studi : null,
        tentang: body.tentang ?? null,
        program_tercatat: Array.isArray(body.program_tercatat) ? body.program_tercatat : null,
      });

      if (univError) {
        const response = NextResponse.json({ error: univError.message }, { status: 400 });
        return applyCorsHeaders(response, request);
      }
    }

    const response = NextResponse.json({
      success: true,
      user: authUser.user,
      profile,
      role,
    });
    return applyCorsHeaders(response, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const response = NextResponse.json({ error: message }, { status: 500 });
    return applyCorsHeaders(response, request);
  }
}
