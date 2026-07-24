import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Lands here from the emailed reset link (?code=...). Exchanges the PKCE code
// for a real session (cookie set as a side effect), then redirects to the
// actual "set new password" form — the code itself is single-use and must
// never be shown in the form page's URL.
export async function GET(req: NextRequest): Promise<NextResponse> {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${req.nextUrl.origin}/reset-password?error=missing_code`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${req.nextUrl.origin}/reset-password?error=invalid_or_expired`);
    }

    return NextResponse.redirect(`${req.nextUrl.origin}/reset-password`);
  } catch (err) {
    console.error("Password reset code exchange failed:", err);
    return NextResponse.redirect(`${req.nextUrl.origin}/reset-password?error=invalid_or_expired`);
  }
}
