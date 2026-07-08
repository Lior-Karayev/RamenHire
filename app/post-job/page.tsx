import type { Metadata } from "next";
import PostJobClient from "./PostJobClient";

export const metadata: Metadata = {
  title: "Post a Job",
  description:
    "List your open role on RamenHire and reach candidates who specifically want to work at bootstrapped, profitable startups. Free during early access.",
  alternates: {
    canonical: "https://www.ramenhire.com/post-job",
  },
  openGraph: {
    title: "Post a Job | RamenHire",
    description:
      "List your open role on RamenHire and reach candidates who specifically want to work at bootstrapped, profitable startups. Free during early access.",
    url: "https://www.ramenhire.com/post-job",
  },
  twitter: {
    title: "Post a Job | RamenHire",
    description:
      "List your open role on RamenHire and reach candidates who specifically want to work at bootstrapped, profitable startups. Free during early access.",
  },
};

export default function PostJobPage() {
  return <PostJobClient />;
}
