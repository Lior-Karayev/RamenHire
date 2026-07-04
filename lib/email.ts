import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAdminNotification(subject: string, html: string): Promise<void> {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
      to: "liork03@gmail.com",
      subject,
      html,
    });
    if (error) {
      console.error("Resend API error:", JSON.stringify(error));
    } else {
      console.log(`Admin notification sent (id: ${data?.id}): ${subject}`);
    }
  } catch (err) {
    console.error("Failed to send admin notification:", err);
  }
}
