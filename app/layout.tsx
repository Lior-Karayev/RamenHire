import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ramenhire.com"),
  title: {
    default: "RamenHire — Jobs at Bootstrapped, Profitable Startups",
    template: "%s | RamenHire",
  },
  description:
    "Find remote jobs at bootstrapped, self-funded, profitable startups. No VC pressure, no layoff roulette. Browse verified bootstrapped companies hiring engineers, designers, marketers, and more.",
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
    title: "RamenHire — Jobs at Bootstrapped, Profitable Startups",
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
    title: "RamenHire — Jobs at Bootstrapped, Profitable Startups",
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
    {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: "Growth Marketing Manager",
      description:
        "Payhip is a profitable, bootstrapped startup powering 150,000+ entrepreneurs to sell digital products online. Looking for a growth marketer to identify high-impact opportunities and drive organic and paid acquisition.",
      hiringOrganization: { "@type": "Organization", name: "Payhip" },
      jobLocationType: "TELECOMMUTE",
      applicantLocationRequirements: { "@type": "Country", name: "Worldwide" },
      employmentType: "FULL_TIME",
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "USD",
        value: { "@type": "QuantitativeValue", minValue: 75000, maxValue: 99000, unitText: "YEAR" },
      },
      url: "https://weworkremotely.com/remote-jobs/payhip-growth-marketing-manager",
      directApply: true,
      datePosted: "2026-07-03",
      validThrough: "2026-10-01",
    },
    {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: "Head of Product",
      description:
        "Gruntwork is a profitable, bootstrapped DevOps company with no outside investors. Globally recognized for open source tools like Terragrunt used by thousands of companies from startups to Fortune 500s.",
      hiringOrganization: { "@type": "Organization", name: "Gruntwork" },
      jobLocationType: "TELECOMMUTE",
      applicantLocationRequirements: { "@type": "Country", name: "Worldwide" },
      employmentType: "FULL_TIME",
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "USD",
        value: { "@type": "QuantitativeValue", minValue: 150000, maxValue: 180000, unitText: "YEAR" },
      },
      url: "https://jobs.ashbyhq.com/gruntwork/c216e88e-2580-447d-9ea7-665ef00b15ea",
      directApply: true,
      datePosted: "2026-07-03",
      validThrough: "2026-10-01",
    },
    {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: "Customer Onboarding & Support Specialist",
      description:
        "Gymflow is a founder-led, bootstrapped SaaS platform for gym and fitness studio owners. Small, focused team of 11 where your impact is immediate and visible.",
      hiringOrganization: { "@type": "Organization", name: "Gymflow" },
      jobLocationType: "TELECOMMUTE",
      applicantLocationRequirements: { "@type": "Country", name: "South Africa" },
      employmentType: "FULL_TIME",
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "USD",
        value: { "@type": "QuantitativeValue", minValue: 45000, maxValue: 65000, unitText: "YEAR" },
      },
      url: "https://weworkremotely.com/remote-jobs/gymflow-customer-onboarding-support-specialist-remote-south-africa",
      directApply: true,
      datePosted: "2026-07-03",
      validThrough: "2026-10-01",
    },
    {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: "Senior Software Engineer",
      description:
        "Aha! is a self-funded, profitable, 100% remote product development company used by 700,000+ builders worldwide. They champion the Bootstrap Movement and have never taken outside funding.",
      hiringOrganization: { "@type": "Organization", name: "Aha!" },
      jobLocationType: "TELECOMMUTE",
      applicantLocationRequirements: { "@type": "Country", name: "Worldwide" },
      employmentType: "FULL_TIME",
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "USD",
        value: { "@type": "QuantitativeValue", minValue: 130000, maxValue: 160000, unitText: "YEAR" },
      },
      url: "https://www.aha.io/company/careers/current-openings",
      directApply: true,
      datePosted: "2026-07-03",
      validThrough: "2026-10-01",
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
