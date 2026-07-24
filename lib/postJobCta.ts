import { getOwnCompany, type CurrentUser } from "./auth";
import type { Company } from "./companies";

export type PostJobCta = {
  label: string;
  href: string;
};

type MinimalCompany = Pick<Company, "status" | "deleted_at">;

// Single source of truth for the site's one "Post a Job" CTA (header, hero,
// launch popup) so all three read the same auth/approval state instead of
// drifting out of sync. Pass knownCompany when the caller already fetched
// the row (account/post-job pages) to avoid a redundant query.
export async function getPostJobCta(
  user: CurrentUser | null,
  knownCompany?: MinimalCompany | null
): Promise<PostJobCta> {
  if (!user) {
    return { label: "Register Your Company", href: "/companies/register" };
  }

  const company = knownCompany !== undefined ? knownCompany : await getOwnCompany(user.id);

  if (company && company.status === "approved" && !company.deleted_at) {
    return { label: "Post a Job", href: "/post-job" };
  }

  // No company, unverified/pending/rejected, or deletion requested — /account
  // already explains the exact state, so this is a safe universal fallback.
  return { label: "Post a Job", href: "/account" };
}
