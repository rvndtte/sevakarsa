import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const normalized = {
      ...data,
      id: data.user_id || data.id,
      name: data.nama || user.user_metadata?.nama || user.email,
      email: data.email_kontak || user.email,
      city: data.kota || "Kab. Malang",
      province: data.provinsi || "Jawa Timur",
      contactName: data.nama_kontak || data.nama || "",
      phone: data.nomor_hp || "",
      about: data.tentang || "",
      role: data.role || user.user_metadata?.role || "desa",
    };

    return NextResponse.json({ data: normalized });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
