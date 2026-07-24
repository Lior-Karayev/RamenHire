"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import Header from "@/components/Header";
import type { CurrentUser } from "@/lib/auth";
import type { PostJobCta } from "@/lib/postJobCta";

type Status = "idle" | "loading" | "error";

const INPUT_CLS =
  "w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors appearance-none";
const INPUT_STYLE = {
  borderColor: "#E5E0D8",
  backgroundColor: "#FFFFFF",
  color: "#1A1A1A",
};

type FocusEl = React.FocusEvent<HTMLInputElement>;
function focusOrange(e: FocusEl) { e.currentTarget.style.borderColor = "#C8501A"; }
function blurGray(e: FocusEl)   { e.currentTarget.style.borderColor = "#E5E0D8"; }

type Props = {
  user: CurrentUser | null;
  postJobCta: PostJobCta;
};

export default function ResetPasswordClient({ user, postJobCta }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkError = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setStatus("error");
        setError(body.message ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  if (linkError) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7", color: "#1A1A1A" }}>
        <Header zIndex={50} user={user} postJobCta={postJobCta} />
        <main className="max-w-md mx-auto px-6 py-16 text-center">
          <p className="text-5xl mb-6">🍜</p>
          <h1 className="text-2xl font-semibold mb-3" style={{ color: "#1A1A1A" }}>
            This link isn&apos;t valid
          </h1>
          <p className="text-base mb-8" style={{ color: "#6B6560" }}>
            The reset link is missing, expired, or already used.
          </p>
          <a
            href="/forgot-password"
            className="inline-flex items-center px-5 py-3 rounded-lg text-sm font-medium"
            style={{ backgroundColor: "#1A1A1A", color: "#FAF9F7" }}
          >
            Request a new link
          </a>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7", color: "#1A1A1A" }}>
      <Header zIndex={50} user={user} postJobCta={postJobCta} />

      <main className="max-w-md mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold mb-2" style={{ color: "#1A1A1A" }}>
            Set a new password
          </h1>
          <p className="text-base" style={{ color: "#6B6560" }}>
            Choose a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
              New password <span style={{ color: "#C8501A" }}>*</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT_CLS}
              style={INPUT_STYLE}
              onFocus={focusOrange}
              onBlur={blurGray}
            />
          </div>

          {status === "error" && (
            <p className="text-sm -mt-2" style={{ color: "#C8501A" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-3.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            style={{
              backgroundColor: status === "loading" ? "#D4845A" : "#C8501A",
              color: "#FAF9F7",
              cursor: status === "loading" ? "not-allowed" : "pointer",
            }}
          >
            {status === "loading" && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {status === "loading" ? "Saving…" : "Save New Password"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
