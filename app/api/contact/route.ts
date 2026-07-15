import { NextRequest, NextResponse } from "next/server";
import { sendAdminNotification } from "@/lib/email";
import { contactMessageTemplate } from "@/lib/email-templates";
import { checkRateLimit, getClientIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

type ContactBody = {
  name: string;
  email: string;
  reason: string | null;
  message: string;
  honeypot?: string;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);

  const allowed = await checkRateLimit(`contact:${ip}`, 5, 60);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited", message: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  let body: ContactBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "Something went wrong. Please try again." }, { status: 400 });
  }

  // Honeypot: real users never see or fill this field. Silently "succeed"
  // rather than erroring, same as the other forms, so as not to tip off
  // the bot that it was caught.
  if (body.honeypot && body.honeypot.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  if (!body.name || !body.email || !body.message) {
    return NextResponse.json(
      { error: "missing_fields", message: "Something went wrong. Please try again." },
      { status: 400 }
    );
  }

  const { subject, html } = contactMessageTemplate({
    name: body.name,
    email: body.email,
    reason: body.reason,
    message: body.message,
    created_at: new Date().toISOString(),
  });
  await sendAdminNotification(subject, html);

  return NextResponse.json({ ok: true });
}
