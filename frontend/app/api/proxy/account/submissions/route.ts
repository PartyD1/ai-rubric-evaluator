import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  return proxyGet(req, "/api/account/submissions", { body: [], status: 200 });
}
