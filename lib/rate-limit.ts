import { NextRequest } from "next/server";
import { supabaseAdmin } from "./supabase-admin";

// x-vercel-forwarded-for is preferred: per Vercel's docs it's identical to
// x-forwarded-for in the normal case, but stays correct if this app is ever
// put behind another proxy (e.g. Cloudflare) in front of Vercel — a scenario
// where x-forwarded-for could be overwritten by that intermediate layer.
// x-forwarded-for itself is still safe to fall back to on Vercel today:
// Vercel's edge overwrites it and explicitly refuses to forward
// client-supplied values, specifically to prevent IP spoofing.
export function getClientIp(req: NextRequest): string {
  const vercelForwardedFor = req.headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) return vercelForwardedFor.split(",")[0].trim();
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// Backed by the rate_limit_hits table (service_role only, see migration
// 20260707000006). A row-count-then-insert check is plenty for this site's
// traffic volume — no need for Redis/Upstash given the low request rate.
export async function checkRateLimit(
  bucketKey: string,
  max: number,
  windowMinutes: number
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const { count, error: countError } = await supabaseAdmin
    .from("rate_limit_hits")
    .select("*", { count: "exact", head: true })
    .eq("bucket_key", bucketKey)
    .gte("created_at", windowStart);

  if (countError) {
    // Fail open rather than blocking legitimate users if the rate-limit
    // check itself breaks — this table has no bearing on data integrity.
    console.error("Rate limit check failed:", countError);
    return true;
  }

  if ((count ?? 0) >= max) return false;

  const { error: insertError } = await supabaseAdmin
    .from("rate_limit_hits")
    .insert({ bucket_key: bucketKey });

  if (insertError) console.error("Rate limit hit-recording failed:", insertError);

  return true;
}

export const RATE_LIMIT_MESSAGE =
  "Too many submissions from this device recently, please try again later.";
