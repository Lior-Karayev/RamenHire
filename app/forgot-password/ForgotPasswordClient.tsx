"use client";

import { useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import Header from "@/components/Header";
import type { CurrentUser } from "@/lib/auth";
import type { PostJobCta } from "@/lib/postJobCta";

type Status = "idle" | "loading" | "success" | "error";

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

export default function ForgotPasswordClient({ user, postJobCta }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setMessage(body.message ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(body.message ?? "If that email has an account, a password reset link is on its way.");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7", color: "#1A1A1A" }}>
      <Header zIndex={50} user={user} postJobCta={postJobCta} />

      <main className="max-w-md mx-auto px-6 py-16">
        {status === "success" ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-6">🍜</p>
            <h1 className="text-2xl font-semibold mb-3" style={{ color: "#1A1A1A" }}>
              Check your email
            </h1>
            <p className="text-base" style={{ color: "#6B6560" }}>{message}</p>
            <p className="text-sm mt-4" style={{ color: "#9B9690" }}>
              Open the link on the same browser and device you requested it from — it won&apos;t work
              elsewhere.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <h1 className="text-3xl font-semibold mb-2" style={{ color: "#1A1A1A" }}>
                Forgot your password?
              </h1>
              <p className="text-base" style={{ color: "#6B6560" }}>
                Enter your email and we&apos;ll send you a link to reset it.
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

              {status === "error" && (
                <p className="text-sm -mt-2" style={{ color: "#C8501A" }}>
                  {message}
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
                {status === "loading" ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
