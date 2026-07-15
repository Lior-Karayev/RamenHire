import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Register Your Company",
  description:
    "Create a free public profile for your bootstrapped, profitable company on RamenHire. Manually reviewed before going live.",
  path: "/companies/register",
});

export default function RegisterPage() {
  return <RegisterClient />;
}
