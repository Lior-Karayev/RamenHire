import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import { buildPageMetadata } from "@/lib/metadata";
import { getCurrentUser } from "@/lib/auth";
import { getPostJobCta } from "@/lib/postJobCta";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description:
    "Get in touch with RamenHire — questions about jobs, hiring, or anything else.",
  path: "/contact",
});

export default async function ContactPage() {
  const user = await getCurrentUser();
  const postJobCta = await getPostJobCta(user);
  return <ContactClient user={user} postJobCta={postJobCta} />;
}
