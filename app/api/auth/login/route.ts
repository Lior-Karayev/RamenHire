import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { checkRateLimit, getClientIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

type LoginBody = {
  email: string;
  password: string;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);

  // Separate bucket from every other form's rate limit (register:, contact:,
  // etc.) — login attempts are a distinct abuse vector (credential stuffing)
  // and shouldn't share a budget with unrelated form submissions.
  const allowed = await checkRateLimit(`login:${ip}`, 10, 15);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited", message: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  let body: LoginBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "Something went wrong. Please try again." }, { status: 400 });
  }

  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: "missing_fields", message: "Enter your email and password." },
      { status: 400 }
    );
  }

  // Second bucket keyed by the account itself, not just the caller's IP — an
  // IP-only bucket never trips for a distributed attacker (botnet, many
  // egress IPs) brute-forcing one specific known account. Same limits as the
  // IP bucket; normalized so case variants of the same email share a budget.
  const emailAllowed = await checkRateLimit(`login:email:${body.email.trim().toLowerCase()}`, 10, 15);
  if (!emailAllowed) {
    return NextResponse.json({ error: "rate_limited", message: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      return NextResponse.json(
        { error: "invalid_credentials", message: "Incorrect email or password." },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Login failed:", err);
    return NextResponse.json(
      { error: "login_failed", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
