import type { Metadata } from "next";

const SITE_URL = "https://www.ramenhire.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Next.js does not deep-merge `openGraph`/`twitter` between a layout and a page —
 * a page-level object completely replaces the layout's, silently dropping any
 * field (card, creator, type, siteName, locale, images) it doesn't redeclare.
 * Route metadata must go through this helper so those defaults stay in sync.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  ogTitle,
  image,
}: {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
  image?: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = ogTitle ?? `${title} | RamenHire`;
  const ogImage = image ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "RamenHire",
      locale: "en_US",
      title: fullTitle,
      description,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      creator: "@L_Build",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}
