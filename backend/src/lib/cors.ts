import { NextRequest, NextResponse } from "next/server";

export function applyCorsHeaders(response: NextResponse, request?: NextRequest | Request) {
  const origin = request?.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:8000";

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Vary", "Origin");

  return response;
}

export function createCorsPreflightResponse(request?: NextRequest | Request) {
  const response = new NextResponse(null, { status: 204 });
  return applyCorsHeaders(response, request);
}
