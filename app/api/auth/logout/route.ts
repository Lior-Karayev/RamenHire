import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Logout failed:", err);
    return NextResponse.json(
      { error: "logout_failed", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
