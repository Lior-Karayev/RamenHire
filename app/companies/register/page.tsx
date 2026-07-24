import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RegisterClient from "./RegisterClient";
import { buildPageMetadata } from "@/lib/metadata";
import { getCurrentUser } from "@/lib/auth";
import { getPostJobCta } from "@/lib/postJobCta";

export const metadata: Metadata = buildPageMetadata({
  title: "Register Your Company",
  description:
    "Create a free public profile for your bootstrapped, profitable company on RamenHire. Manually reviewed before going live.",
  path: "/companies/register",
});

export default async function RegisterPage() {
  const user = await getCurrentUser();
  // Already signed in — registering again makes no sense for this session.
  if (user) redirect("/account");
  const postJobCta = await getPostJobCta(user);
  return <RegisterClient user={user} postJobCta={postJobCta} />;
}
