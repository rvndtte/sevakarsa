import { NextRequest, NextResponse } from "next/server";

import { applyCorsHeaders, createCorsPreflightResponse } from "@/lib/cors";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, message: "Logout berhasil." });
    const supabase = await createServerSupabaseClient(response);
    const { error } = await supabase.auth.signOut();

    if (error) {
      const errResponse = NextResponse.json({ error: error.message }, { status: 400 });
      return applyCorsHeaders(errResponse, request);
    }

    return applyCorsHeaders(response, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const response = NextResponse.json({ error: message }, { status: 500 });
    return applyCorsHeaders(response, request);
  }
}
