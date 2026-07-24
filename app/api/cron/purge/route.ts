import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { runSoftDeletePurge, runUnverifiedAccountPurge } from "@/lib/purge";

// Triggered by Vercel Cron (see vercel.json), which sends
// `Authorization: Bearer ${CRON_SECRET}` automatically when a cron job is
// configured against this path — the same secret must be set as an env var
// on Vercel (separate from this local value) before deploying. Fails closed
// if CRON_SECRET isn't configured at all, rather than comparing against
// "Bearer undefined".
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual throws on length mismatch rather than returning false —
  // comparing against a same-length buffer first keeps this branch constant-
  // time too, just against a value that can never match.
  if (bufA.length !== bufB.length) return timingSafeEqual(bufA, bufA) && false;
  return timingSafeEqual(bufA, bufB);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("CRON_SECRET is not set — rejecting by default.");
    return NextResponse.json({ error: "not_configured" }, { status: 401 });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  if (!safeCompare(authHeader, `Bearer ${secret}`)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const softDeleteResult = await runSoftDeletePurge();
    const unverifiedResult = await runUnverifiedAccountPurge();
    return NextResponse.json({ ok: true, ...softDeleteResult, ...unverifiedResult });
  } catch (err) {
    console.error("Purge cron failed:", err);
    return NextResponse.json({ error: "purge_failed" }, { status: 500 });
  }
}
