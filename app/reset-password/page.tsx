import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";
import { buildPageMetadata } from "@/lib/metadata";
import { getCurrentUser } from "@/lib/auth";
import { getPostJobCta } from "@/lib/postJobCta";

export const metadata: Metadata = buildPageMetadata({
  title: "Reset Password",
  description: "Set a new password for your RamenHire company account.",
  path: "/reset-password",
});

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();
  const postJobCta = await getPostJobCta(user);
  return (
    <Suspense>
      <ResetPasswordClient user={user} postJobCta={postJobCta} />
    </Suspense>
  );
}
