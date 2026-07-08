import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
const ADMIN_EMAIL = "hello@ramenhire.com";

async function sendEmail(to: string, subject: string, html: string, context: string): Promise<void> {
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error(`Resend API error (${context}):`, JSON.stringify(error));
    } else {
      console.log(`${context} sent (id: ${data?.id}): ${subject}`);
    }
  } catch (err) {
    console.error(`Failed to send ${context}:`, err);
  }
}

export async function sendAdminNotification(subject: string, html: string): Promise<void> {
  return sendEmail(ADMIN_EMAIL, subject, html, "Admin notification");
}

export async function sendCompanyConfirmation(to: string, subject: string, html: string): Promise<void> {
  return sendEmail(to, subject, html, "Company confirmation");
}
