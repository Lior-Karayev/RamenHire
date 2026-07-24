import { NextResponse } from "next/server";
import { getCurrentUser, getOwnCompany } from "@/lib/auth";

// Lets Header (rendered on every page, many of which don't otherwise fetch
// the caller's own company row) resolve the "Company Page" dropdown link
// without every page having to thread a slug prop down from its server
// component. Returns null slug for logged-out users or accounts with no
// linked/deleted company — Header just omits the link in that case.
export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ slug: null });
  }

  const company = await getOwnCompany(user.id);
  if (!company || company.deleted_at) {
    return NextResponse.json({ slug: null });
  }

  return NextResponse.json({ slug: company.slug });
}
