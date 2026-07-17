import { NextRequest } from "next/server";
import { proxyDelete } from "@/lib/proxy";

export async function DELETE(req: NextRequest) {
  return proxyDelete(req, "/api/account");
}
