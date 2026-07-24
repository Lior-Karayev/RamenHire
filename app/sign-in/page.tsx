import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SignInClient from "./SignInClient";
import { buildPageMetadata } from "@/lib/metadata";
import { getCurrentUser } from "@/lib/auth";
import { getPostJobCta } from "@/lib/postJobCta";

export const metadata: Metadata = buildPageMetadata({
  title: "Sign In",
  description: "Sign in to your RamenHire company account.",
  path: "/sign-in",
});

export default async function SignInPage() {
  const user = await getCurrentUser();
  // Already signed in — this form makes no sense to show again.
  if (user) redirect("/account");
  const postJobCta = await getPostJobCta(user);
  return <SignInClient user={user} postJobCta={postJobCta} />;
}
