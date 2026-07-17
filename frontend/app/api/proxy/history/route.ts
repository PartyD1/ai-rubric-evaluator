import { NextRequest, NextResponse } from "next/server";
import { proxyGet } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const eventCode = req.nextUrl.searchParams.get("event_code");
  if (!eventCode) {
    return NextResponse.json({ detail: "event_code required" }, { status: 400 });
  }

  return proxyGet(
    req,
    `/api/history?event_code=${encodeURIComponent(eventCode)}`,
    { body: [], status: 200 }
  );
}
