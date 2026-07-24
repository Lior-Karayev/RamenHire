import type { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";
import { buildPageMetadata } from "@/lib/metadata";
import { getCurrentUser } from "@/lib/auth";
import { getPostJobCta } from "@/lib/postJobCta";

export const metadata: Metadata = buildPageMetadata({
  title: "Forgot Password",
  description: "Reset the password for your RamenHire company account.",
  path: "/forgot-password",
});

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  const postJobCta = await getPostJobCta(user);
  return <ForgotPasswordClient user={user} postJobCta={postJobCta} />;
}
