import { NextRequest, NextResponse } from "next/server";

import { applyCorsHeaders, createCorsPreflightResponse } from "@/lib/cors";
import { requireAuth } from "@/lib/auth";

export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const profile = session.profile
      ? {
          ...session.profile,
          city: session.profile.kota || session.profile.city || "Kab. Malang",
          province: session.profile.provinsi || session.profile.province || "Jawa Timur",
          about: session.profile.tentang || session.profile.about || "",
          contactName: session.profile.nama_kontak || session.profile.contactName || session.profile.nama || "",
          phone: session.profile.nomor_hp || session.profile.phone || "",
          email: session.profile.email_kontak || session.profile.email || session.user.email || "",
          kecamatan: session.profile.kecamatan || "",
          population: session.profile.jumlah_penduduk ?? session.profile.population ?? "",
          area: session.profile.luas_km2 ?? session.profile.area ?? "",
          umkm: session.profile.jumlah_umkm ?? session.profile.umkm ?? "",
          potentials: Array.isArray(session.profile.potensi) ? session.profile.potensi : [],
          facilities: Array.isArray(session.profile.fasilitas) ? session.profile.fasilitas : [],
          fields: Array.isArray(session.profile.bidang_keahlian) ? session.profile.bidang_keahlian : [],
          programs: Array.isArray(session.profile.program_studi) ? session.profile.program_studi : [],
          history: Array.isArray(session.profile.program_tercatat) ? session.profile.program_tercatat : [],
        }
      : null;

    const response = NextResponse.json({
      user: session.user,
      profile,
    });
    return applyCorsHeaders(response, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    const response = NextResponse.json({ error: message }, { status });
    return applyCorsHeaders(response, request);
  }
}
