import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendAdminNotification } from "@/lib/email";
import { subscriberTemplate } from "@/lib/email-templates";
import { checkRateLimit, getClientIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

type SubscribeBody = {
  full_name: string;
  email: string;
  role_types: string[] | null;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);

  const allowed = await checkRateLimit(`subscribe:${ip}`, 3, 60);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited", message: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  let body: SubscribeBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "Something went wrong. Please try again." }, { status: 400 });
  }

  if (!body.full_name || !body.email) {
    return NextResponse.json(
      { error: "missing_fields", message: "Something went wrong. Please try again." },
      { status: 400 }
    );
  }

  const { error: insertError } = await supabaseAdmin.from("subscribers").insert({
    full_name: body.full_name,
    email: body.email,
    role_types: body.role_types && body.role_types.length > 0 ? body.role_types : null,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "duplicate_email", message: "You're already subscribed with this email." },
        { status: 409 }
      );
    }
    console.error("Subscriber insert failed:", insertError);
    return NextResponse.json(
      { error: "insert_failed", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  const created_at = new Date().toISOString();
  const { subject, html } = subscriberTemplate({
    full_name: body.full_name,
    email: body.email,
    role_types: body.role_types ?? [],
    created_at,
  });
  await sendAdminNotification(subject, html);

  return NextResponse.json({ ok: true });
}
