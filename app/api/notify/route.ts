import { NextRequest, NextResponse } from "next/server";
import { sendAdminNotification } from "@/lib/email";
import {
  jobPostTemplate,
  applicationTemplate,
  subscriberTemplate,
  type JobPostData,
  type ApplicationData,
  type SubscriberData,
} from "@/lib/email-templates";

type NotifyBody =
  | ({ type: "job_post" } & JobPostData)
  | ({ type: "application" } & ApplicationData)
  | ({ type: "subscriber" } & SubscriberData);

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: NotifyBody;
  try {
    body = (await req.json()) as NotifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let subject: string;
  let html: string;

  if (body.type === "job_post") {
    ({ subject, html } = jobPostTemplate(body));
  } else if (body.type === "application") {
    ({ subject, html } = applicationTemplate(body));
  } else if (body.type === "subscriber") {
    ({ subject, html } = subscriberTemplate(body));
  } else {
    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  }

  await sendAdminNotification(subject, html);
  return NextResponse.json({ ok: true });
}
