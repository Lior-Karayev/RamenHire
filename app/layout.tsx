import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ramenhire.com"),
  title: {
    default: "Remote Jobs at Bootstrapped, Profitable Startups | RamenHire",
    template: "%s | RamenHire",
  },
  description:
    "RamenHire — where company funding philosophy is part of the hiring criteria. Find remote jobs at bootstrapped, profitable startups. No VC pressure, no layoff roulette. Browse jobs at self-funded companies hiring engineers, designers, marketers, and more.",
  keywords: [
    "bootstrapped startup jobs",
    "remote jobs profitable startups",
    "self-funded startup careers",
    "indie startup jobs",
    "no VC startup jobs",
    "calm company jobs",
    "remote work bootstrapped",
    "bootstrapped companies hiring",
  ],
  authors: [{ name: "RamenHire" }],
  creator: "RamenHire",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    siteName: "RamenHire",
    title: "Remote Jobs at Bootstrapped, Profitable Startups | RamenHire",
    description:
      "Find jobs at calm, self-funded companies. No VC pressure, no layoff roulette. Just profitable startups hiring great people.",
    url: "https://www.ramenhire.com",
    locale: "en_US",
    images: [
      {
        url: "https://www.ramenhire.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "RamenHire — Jobs at Bootstrapped, Profitable Startups",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Remote Jobs at Bootstrapped, Profitable Startups | RamenHire",
    description:
      "Find jobs at calm, self-funded companies. No VC pressure, no layoff roulette. Just profitable startups hiring great people.",
    creator: "@ramenhire",
    images: ["https://www.ramenhire.com/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  alternates: {
    canonical: "https://ramenhire.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "RamenHire",
      url: "https://ramenhire.com",
      description: "Job board exclusively for bootstrapped, self-funded, profitable startups.",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://ramenhire.com#jobs",
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1X6XVB58KC"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1X6XVB58KC');
          `}
        </Script>
      </body>
    </html>
  );
}
