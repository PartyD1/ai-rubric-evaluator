import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return proxyGet(req, `/api/admin/users/${userId}/submissions`);
}
