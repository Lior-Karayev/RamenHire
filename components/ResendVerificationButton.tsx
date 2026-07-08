"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "sent" | "error";

export default function ResendVerificationButton({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleClick() {
    setStatus("loading");
    try {
      const res = await fetch("/api/companies/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="text-sm mb-4" style={{ color: "#5C7A5C" }}>
        A new verification email is on its way — check your inbox.
      </p>
    );
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        className="inline-flex items-center px-5 py-3 rounded-lg text-sm font-medium"
        style={{
          backgroundColor: status === "loading" ? "#D4845A" : "#C8501A",
          color: "#FAF9F7",
          cursor: status === "loading" ? "not-allowed" : "pointer",
        }}
      >
        {status === "loading" ? "Sending…" : "Resend verification email"}
      </button>
      {status === "error" && (
        <p className="text-sm mt-2" style={{ color: "#C8501A" }}>
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
