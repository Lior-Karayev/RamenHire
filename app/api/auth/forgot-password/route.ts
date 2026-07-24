import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { checkRateLimit, getClientIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

type ForgotPasswordBody = {
  email: string;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);

  const allowed = await checkRateLimit(`forgot-password:${ip}`, 5, 60);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited", message: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  let body: ForgotPasswordBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "Something went wrong. Please try again." }, { status: 400 });
  }

  if (!body.email) {
    return NextResponse.json({ error: "missing_fields", message: "Enter your email." }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.resetPasswordForEmail(body.email, {
      redirectTo: `${req.nextUrl.origin}/reset-password/confirm`,
    });
  } catch (err) {
    console.error("Password reset request failed:", err);
    // Fall through to the generic response below regardless — see note.
  }

  // Always the same response whether or not the email exists — otherwise this
  // endpoint would let someone enumerate which emails have a company account.
  return NextResponse.json({
    ok: true,
    message: "If that email has an account, a password reset link is on its way.",
  });
}
