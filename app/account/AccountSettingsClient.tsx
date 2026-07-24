"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INPUT_CLS =
  "w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors appearance-none";
const INPUT_STYLE = {
  borderColor: "#E5E0D8",
  backgroundColor: "#FFFFFF",
  color: "#1A1A1A",
};

type Props = {
  contactEmail: string;
};

export default function AccountSettingsClient({ contactEmail }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState(contactEmail);
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");
  const [emailError, setEmailError] = useState("");

  const [deleteMode, setDeleteMode] = useState<"idle" | "confirm" | "loading">("idle");
  const [deleteError, setDeleteError] = useState("");

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailStatus("loading");
    setEmailError("");
    try {
      const res = await fetch("/api/account/contact-email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_email: email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setEmailStatus("error");
        setEmailError(body.message ?? "Something went wrong. Please try again.");
        return;
      }
      setEmailStatus("saved");
    } catch {
      setEmailStatus("error");
      setEmailError("Something went wrong. Please try again.");
    }
  }

  async function requestDeletion() {
    setDeleteMode("loading");
    setDeleteError("");
    try {
      const res = await fetch("/api/account/delete-request", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setDeleteError(body.message ?? "Something went wrong. Please try again.");
        setDeleteMode("confirm");
        return;
      }
      router.refresh();
    } catch {
      setDeleteError("Something went wrong. Please try again.");
      setDeleteMode("confirm");
    }
  }

  return (
    <div
      className="p-6 rounded-lg border mt-6"
      style={{ borderColor: "#E5E0D8", backgroundColor: "#FFFFFF" }}
    >
      <h2 className="text-base font-semibold mb-4" style={{ color: "#1A1A1A" }}>
        Account Settings
      </h2>

      <form onSubmit={saveEmail} className="flex flex-col gap-2 mb-8">
        <label className="block text-sm font-medium" style={{ color: "#1A1A1A" }}>
          Contact email
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailStatus("idle");
            }}
            className={INPUT_CLS}
            style={INPUT_STYLE}
          />
          <button
            type="submit"
            disabled={emailStatus === "loading"}
            className="px-4 py-2 rounded-lg text-sm font-medium shrink-0"
            style={{ backgroundColor: "#C8501A", color: "#FAF9F7" }}
          >
            {emailStatus === "loading" ? "Saving…" : "Save"}
          </button>
        </div>
        {emailStatus === "saved" && (
          <p className="text-sm" style={{ color: "#5C7A5C" }}>Contact email updated.</p>
        )}
        {emailStatus === "error" && (
          <p className="text-sm" style={{ color: "#C8501A" }}>{emailError}</p>
        )}
      </form>

      <div style={{ borderTop: "1px solid #E5E0D8" }} className="pt-6">
        <h3 className="text-sm font-semibold mb-2" style={{ color: "#1A1A1A" }}>
          Delete account
        </h3>
        <p className="text-sm mb-3" style={{ color: "#6B6560" }}>
          Requests removal of your company profile and listings. There&apos;s a 90-day grace
          period before anything is permanently deleted — email{" "}
          <a href="mailto:hello@ramenhire.com" style={{ color: "#C8501A" }}>hello@ramenhire.com</a>{" "}
          within that window if you change your mind.
        </p>

        {deleteMode === "idle" && (
          <button
            type="button"
            onClick={() => setDeleteMode("confirm")}
            className="text-sm font-medium"
            style={{ color: "#C8501A" }}
          >
            Request account deletion
          </button>
        )}

        {(deleteMode === "confirm" || deleteMode === "loading") && (
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "#1A1A1A" }}>Are you sure?</span>
            <button
              type="button"
              disabled={deleteMode === "loading"}
              onClick={requestDeletion}
              className="text-sm font-medium px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: "#C8501A", color: "#FAF9F7" }}
            >
              {deleteMode === "loading" ? "Requesting…" : "Yes, delete my account"}
            </button>
            <button
              type="button"
              disabled={deleteMode === "loading"}
              onClick={() => setDeleteMode("idle")}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border"
              style={{ borderColor: "#E5E0D8", color: "#6B6560" }}
            >
              Cancel
            </button>
          </div>
        )}
        {deleteError && (
          <p className="text-sm mt-2" style={{ color: "#C8501A" }}>{deleteError}</p>
        )}
      </div>
    </div>
  );
}
