import type { Metadata } from "next";
import PostJobClient from "./PostJobClient";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Post a Job",
  description:
    "List your open role on RamenHire and reach candidates who specifically want to work at bootstrapped, profitable startups. Free during early access.",
  path: "/post-job",
});

export default function PostJobPage() {
  return <PostJobClient />;
}
