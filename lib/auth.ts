import { createSupabaseServerClient } from "./supabase-server";
import { supabaseAdmin } from "./supabase-admin";
import type { Company } from "./companies";

export type CurrentUser = {
  id: string;
  email: string;
};

// Server-side only — reads the session cookie via createSupabaseServerClient.
// Returns null for both "not logged in" and "session invalid/expired", since
// callers only ever need to distinguish logged-in from not.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;
  return { id: user.id, email: user.email };
}

// Resolves the company row linked to a given Auth user id — the "who am I,
// as a company" lookup repeated across every self-service route/page
// (account settings, post-job gating, job-listings CRUD). Centralized here
// so all of them stay in sync rather than each re-writing the same query.
export async function getOwnCompany(authUserId: string): Promise<Company | null> {
  const { data } = await supabaseAdmin
    .from("companies")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle<Company>();

  return data ?? null;
}
