import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Register Your Company",
  description:
    "Create a free public profile for your bootstrapped, profitable company on RamenHire. Manually reviewed before going live.",
  alternates: {
    canonical: "https://www.ramenhire.com/companies/register",
  },
  openGraph: {
    title: "Register Your Company | RamenHire",
    description:
      "Create a free public profile for your bootstrapped, profitable company on RamenHire. Manually reviewed before going live.",
    url: "https://www.ramenhire.com/companies/register",
  },
  twitter: {
    title: "Register Your Company | RamenHire",
    description:
      "Create a free public profile for your bootstrapped, profitable company on RamenHire. Manually reviewed before going live.",
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
