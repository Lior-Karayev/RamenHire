import { createClient } from "@supabase/supabase-js";

// service_role bypasses RLS — this file must never be imported from a
// "use client" component or any file that ships to the browser bundle.
// Only import from Server Components and Route Handlers.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase admin environment variables");
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
