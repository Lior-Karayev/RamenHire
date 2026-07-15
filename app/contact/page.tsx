import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description:
    "Get in touch with RamenHire — questions about jobs, hiring, or anything else.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactClient />;
}
