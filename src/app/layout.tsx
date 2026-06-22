import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE } from "@/lib/site";
import "./globals.css";

/*
 * NOTE: robots is set to NOINDEX during pre-sales. This is an unlaunched
 * placeholder shell — we do not want it indexed yet. Flip `index`/`follow`
 * to true (and update robots.ts) when Collie's creative is in and we launch.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — The Last Homesites in Island Moorings`,
    template: `%s · ${SITE.shortName}`,
  },
  description:
    "The final 21 marina-front homesites in Island Moorings — Port Aransas' original waterfront community, established 1960. Join the Founders' List for first look, first pricing, and first choice.",
  applicationName: SITE.name,
  keywords: [
    "Island Moorings",
    "Port Aransas luxury homes",
    "waterfront residences",
    "Texas coast real estate",
    "luxury new construction",
    "pre-sales waterfront homes",
  ],
  openGraph: {
    title: SITE.name,
    description:
      "The final 21 marina-front homesites in Island Moorings, Port Aransas. Join the Founders' List.",
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: "The final 21 marina-front homesites in Island Moorings, Port Aransas.",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap"
        />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
