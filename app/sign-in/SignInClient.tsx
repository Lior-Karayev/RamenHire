"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function SignInClient({ user, postJobCta }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7", color: "#1A1A1A" }}>
      <Header zIndex={50} user={user} postJobCta={postJobCta} />

      <main className="max-w-md mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold mb-2" style={{ color: "#1A1A1A" }}>
            Sign in
          </h1>
          <p className="text-base" style={{ color: "#6B6560" }}>
            Sign in to your company account to manage your listings and profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
              Email <span style={{ color: "#C8501A" }}>*</span>
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLS}
              style={INPUT_STYLE}
              onFocus={focusOrange}
              onBlur={blurGray}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium" style={{ color: "#1A1A1A" }}>
                Password <span style={{ color: "#C8501A" }}>*</span>
              </label>
              <a href="/forgot-password" className="text-xs" style={{ color: "#C8501A" }}>
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              required
              autoComplete="current-password"
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
            {status === "loading" ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-sm text-center" style={{ color: "#6B6560" }}>
            Don&apos;t have a company account?{" "}
            <a href="/companies/register" style={{ color: "#C8501A" }}>
              Register your company
            </a>
          </p>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
