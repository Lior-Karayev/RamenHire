import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ResetPasswordBody = {
  password: string;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: ResetPasswordBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "Something went wrong. Please try again." }, { status: 400 });
  }

  if (!body.password || body.password.length < 8) {
    return NextResponse.json(
      { error: "weak_password", message: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  try {
    const supabase = await createSupabaseServerClient();

    // Requires the session set by GET /reset-password/confirm's code exchange
    // — there is no other way to reach this state with a valid session.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "no_session", message: "Your reset link has expired. Please request a new one." },
        { status: 401 }
      );
    }

    const { error } = await supabase.auth.updateUser({ password: body.password });
    if (error) {
      return NextResponse.json(
        { error: "update_failed", message: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Password reset failed:", err);
    return NextResponse.json(
      { error: "reset_failed", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
