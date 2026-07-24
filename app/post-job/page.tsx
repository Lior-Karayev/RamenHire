import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PostJobClient from "./PostJobClient";
import { buildPageMetadata } from "@/lib/metadata";
import { getCurrentUser, getOwnCompany } from "@/lib/auth";
import { getPostJobCta } from "@/lib/postJobCta";

export const metadata: Metadata = buildPageMetadata({
  title: "Post a Job",
  description:
    "List your open role on RamenHire and reach candidates who specifically want to work at bootstrapped, profitable startups. Free during early access.",
  path: "/post-job",
});

export default async function PostJobPage() {
  const user = await getCurrentUser();
  // Not logged in — same destination as the header's own Post-a-Job link
  // when logged out, so direct navigation and the header CTA agree.
  if (!user) redirect("/companies/register");

  const company = await getOwnCompany(user.id);

  // No linked company at all (shouldn't normally happen — every account is
  // created alongside a company row at registration), not yet approved, or
  // deletion has been requested (found while wiring up Step F1 — a deleted-
  // but-still-"approved" company must not be able to publish new listings)
  // — send to /account, which already has the right messaging for every
  // non-approved/deleted state. Draft-posting for unverified companies is
  // explicitly deferred to a future sprint.
  if (!company || company.status !== "approved" || company.deleted_at) redirect("/account");

  const postJobCta = await getPostJobCta(user, company);

  return <PostJobClient user={user} postJobCta={postJobCta} />;
}
