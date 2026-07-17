/**
 * Shared helper for Next.js API routes that proxy to the FastAPI backend with
 * an internal auth header. Centralizes the fetch → status-passthrough logic
 * (including the content-type guard for non-JSON responses, e.g. an HTML
 * error page during a backend cold start) so each route file only declares
 * its path and unauthorized fallback.
 */
import { NextRequest, NextResponse } from "next/server";
import { getInternalAuthHeader } from "@/lib/internal-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type UnauthorizedFallback = { body: unknown; status: number };

const DEFAULT_UNAUTHORIZED: UnauthorizedFallback = { body: { detail: "Unauthorized" }, status: 401 };

async function proxyRequest(
  req: NextRequest,
  path: string,
  method: "GET" | "DELETE",
  unauthorized: UnauthorizedFallback
): Promise<NextResponse> {
  const authHeader = await getInternalAuthHeader(req);
  if (!authHeader.Authorization) {
    return NextResponse.json(unauthorized.body, { status: unauthorized.status });
  }

  const res = await fetch(`${API_URL}${path}`, { method, headers: authHeader });

  if (method === "DELETE") {
    return new NextResponse(null, { status: res.status });
  }

  // Guard against a non-JSON response (e.g. an HTML 502/504 during a cold start).
  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : { detail: await res.text() };
  return NextResponse.json(data, { status: res.status });
}

export function proxyGet(
  req: NextRequest,
  path: string,
  unauthorized: UnauthorizedFallback = DEFAULT_UNAUTHORIZED
): Promise<NextResponse> {
  return proxyRequest(req, path, "GET", unauthorized);
}

export function proxyDelete(
  req: NextRequest,
  path: string,
  unauthorized: UnauthorizedFallback = DEFAULT_UNAUTHORIZED
): Promise<NextResponse> {
  return proxyRequest(req, path, "DELETE", unauthorized);
}
